#!/usr/bin/env node
/* spike.mjs — does the Claude Agent SDK actually run a non-Claude model, for
 * real, through OpenRouter? One real tool-using turn (Read, Bash, Edit) per
 * model, then a resume turn that has to remember what changed.
 *
 *   node Servex/ext/openrouter/spike.mjs [model ...]
 *
 * With no arguments it runs the three models readme.md names: one cheap
 * OpenAI model, one cheap DeepSeek model, and the newest Gemini Pro on
 * OpenRouter's public model list. Pass your own model ids to try others.
 *
 * Each model gets its own fresh scratch directory (one fixture file) so a
 * model's edit can never collide with another's. Results land one JSON line
 * per model in spike.jsonl, next to this file's own task dir, plus a short
 * table on stdout.
 *
 * SAFETY: every model is capped at ~$0.25 by `maxTurns` (a looping model
 * cannot run forever), a wall-clock timeout per turn (a stuck model cannot
 * hang forever either), AND a check between turns — real cost only settles
 * once a turn is over (review.md findings 2-3: there is no live, trustworthy
 * cost signal DURING a turn to abort on), so turn 1's real cost is checked
 * against the cap before turn 2 (the resume) is even started. Real cost —
 * OpenRouter's own dollar figure, not the SDK's wrong guess (readme.md point
 * 3) — comes from `real_turn_cost()`, which is why models are deliberately
 * run one at a time, never in parallel: a shared key's usage total can't
 * tell two concurrent turns apart. */
import { query } from "@anthropic-ai/claude-agent-sdk";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env_for, has_key, key_usage, real_turn_cost, read_key, KEY_PATH, disallowed_tools_for } from "./provider.js";

const DEFAULT_MODELS = [
	"openai/gpt-6-luna",            // cheap
	"deepseek/deepseek-v4.1-flash", // cheap
	"google/gemini-3.1-pro-preview" // strong — newest non-preview Gemini Pro wasn't out yet on OpenRouter's list as of 2026-09-30
];

const SPIKE_JSONL = path.join(fileURLToPath(new URL(".", import.meta.url)),
	"../../../public/framework/ai/2026-09-30/openrouter-harness/spike.jsonl");

const TURN_TIMEOUT_MS = 90_000;   // a stuck model can't hang forever
const MAX_TURNS = 6;              // a looping model can't burn money forever
const COST_CAP_USD = 0.25;        // per model, across both its turns

if (!has_key()){
	console.error(`no key at ${KEY_PATH}`);
	process.exit(2);
}

const models = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_MODELS;
const key = read_key();

/* One query() turn, fully drained. Returns everything the brief asks to
 * measure: which tools were called and whether each one errored, whether any
 * streaming partial text arrived, the session id (for the resume turn), the
 * final answer text, the SDK's own (unreliable) cost guess, wall time, and
 * any error. `resume` continues a previous turn's session instead of
 * starting fresh — same env, same cwd, required by the SDK for a resume. */
async function run_turn({ model, cwd, prompt, resume }){
	const started = Date.now();
	const aborter = new AbortController();
	const timer = setTimeout(() => aborter.abort(), TURN_TIMEOUT_MS);
	const tool_calls = [];       // { name, ok }
	const by_id = new Map();     // tool_use_id -> the tool_calls entry, filled in as its result arrives
	let partial = false, session_id = null, assistant_message_id = null, result_text = null,
		cost_sdk = 0, is_error = false, error_text = null;
	try {
		const stream = query({
			prompt,
			options: {
				model, cwd,
				env: { ...process.env, ...env_for("openrouter") },
				permissionMode: "bypassPermissions",
				allowDangerouslySkipPermissions: true,
				includePartialMessages: true,
				maxTurns: MAX_TURNS,
				abortController: aborter,
				// GEMINI TOOL-SCHEMA GAP (provider.js) — ArtifactData 400s on Gemini before any tool call
				...(disallowed_tools_for(model).length ? { disallowedTools: disallowed_tools_for(model) } : {}),
				...(resume ? { resume } : {})
			}
		});
		for await (const message of stream){
			if (message.session_id) session_id = message.session_id;
			if (message.type === "stream_event") partial = true;
			else if (message.type === "assistant"){
				assistant_message_id = message.message?.id ?? assistant_message_id;
				for (const block of message.message?.content ?? []){
					if (block.type === "tool_use"){
						const entry = { name: block.name, ok: null };
						tool_calls.push(entry);
						by_id.set(block.id, entry);
					}
				}
			} else if (message.type === "user"){
				for (const block of Array.isArray(message.message?.content) ? message.message.content : []){
					if (block.type === "tool_result"){
						const entry = by_id.get(block.tool_use_id);
						if (entry) entry.ok = !block.is_error;
					}
				}
			} else if (message.type === "result"){
				is_error = !!message.is_error;
				result_text = message.result ?? null;
				cost_sdk = message.total_cost_usd ?? 0;
				if (is_error) error_text = message.subtype ?? "error";
			}
		}
	} catch (e){
		is_error = true;
		error_text = String(e?.message || e);
	} finally {
		clearTimeout(timer);
	}
	return { session_id, assistant_message_id, tool_calls, partial, result_text,
		cost_sdk, is_error, error_text, duration_ms: Date.now() - started };
}

async function spike_one(model){
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "openrouter-spike-"));
	const fixture = path.join(dir, "notes.txt");
	fs.writeFileSync(fixture, "the sky is red today\n");

	let usage_baseline = await key_usage(key).catch(() => null);

	const turn1 = await run_turn({
		model, cwd: dir,
		prompt: "Read notes.txt in this directory. Then run the shell command `echo checked` with"
			+ " your Bash tool. Then use your Edit tool to change the word \"red\" in notes.txt to"
			+ " \"blue\". When you are done, reply with one short sentence confirming it."
	});

	const edited = fs.existsSync(fixture) ? fs.readFileSync(fixture, "utf8") : null;
	const edit_landed = edited != null && edited.includes("blue") && !edited.includes("red");

	/* real_turn_cost() (provider.js): tries the exact per-generation figure by
	 * turn1's own assistant message id first, polling over ~10-20s for billing
	 * to settle, then falls back to a before/after key-total diff. */
	const r1 = await real_turn_cost({ key, message_id: turn1.assistant_message_id, usage_before: usage_baseline });
	const cost1 = r1?.cost ?? null;
	if (r1?.usage_now != null) usage_baseline = r1.usage_now;

	/* ENFORCE THE CAP between turns (see the file header): there is no live cost
	 * signal to abort turn 1 mid-stream, but turn 1's real cost IS known before
	 * turn 2 starts, so a turn 1 that alone already blew the cap skips the resume
	 * turn rather than spending more. */
	const over_cap_already = cost1 != null && cost1 > COST_CAP_USD;

	let turn2 = { result_text: null, is_error: true,
		error_text: over_cap_already
			? `turn 1 alone cost $${cost1.toFixed(4)}, over the $${COST_CAP_USD} cap — resume turn skipped`
			: "no session id from turn 1 (can't resume)" };
	let cost2 = null;
	if (turn1.session_id && !over_cap_already){
		turn2 = await run_turn({
			model, cwd: dir, resume: turn1.session_id,
			prompt: "In one short sentence: what word did you just change in notes.txt, and what did you change it to?"
		});
		const r2 = await real_turn_cost({ key, message_id: turn2.assistant_message_id, usage_before: usage_baseline });
		cost2 = r2?.cost ?? null;
	}

	const real_cost_total = cost1 != null ? cost1 + (cost2 ?? 0) : null;

	const row = {
		at: new Date().toISOString(), model,
		turn1: { tool_calls: turn1.tool_calls, partial_messages: turn1.partial, edit_landed,
			is_error: turn1.is_error, error: turn1.error_text, duration_ms: turn1.duration_ms,
			cost_sdk_usd: turn1.cost_sdk, real_cost_usd: cost1, cost_source: r1?.source ?? null },
		resume: { answer: turn2.result_text, is_error: turn2.is_error, error: turn2.error_text,
			duration_ms: turn2.duration_ms ?? null, cost_sdk_usd: turn2.cost_sdk ?? 0, real_cost_usd: cost2,
			skipped_over_cap: over_cap_already },
		real_cost_total_usd: real_cost_total,
		over_cap: real_cost_total != null && real_cost_total > COST_CAP_USD
	};

	fs.rmSync(dir, { recursive: true, force: true });
	return row;
}

const rows = [];
for (const model of models){
	console.log(`\n--- ${model} ---`);
	let row;
	try { row = await spike_one(model); }
	catch (e){ row = { at: new Date().toISOString(), model, fatal: String(e?.message || e) }; }
	rows.push(row);
	fs.mkdirSync(path.dirname(SPIKE_JSONL), { recursive: true });
	fs.appendFileSync(SPIKE_JSONL, JSON.stringify(row) + "\n");
	console.log(JSON.stringify(row, null, 2));
}

console.log("\n" + "=".repeat(72));
console.log("model".padEnd(32), "tools", "stream", "edit", "resume ok", "$real");
for (const r of rows){
	if (r.fatal){ console.log(r.model.padEnd(32), "FATAL:", r.fatal); continue; }
	console.log(
		r.model.padEnd(32),
		String(r.turn1.tool_calls.length).padEnd(5),
		String(r.turn1.partial_messages).padEnd(6),
		String(r.turn1.edit_landed).padEnd(4),
		String(!r.resume.is_error).padEnd(9),
		r.real_cost_total_usd != null ? `$${r.real_cost_total_usd.toFixed(4)}` : "unknown"
	);
}
console.log(`\nFull rows appended to ${path.relative(process.cwd(), SPIKE_JSONL)}`);

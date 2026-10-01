#!/usr/bin/env node
/* websearch.mjs — does WebSearch/WebFetch on a proxied OpenRouter minion ever reach Anthropic, and
 * who pays for WebFetch's own summary call?
 *
 * WHY (public/framework/ai/2026-09-30/openrouter-harness/web-search/requirements.md): WebFetch
 * doesn't just download a page — the Claude CLI summarizes what it fetched with a SEPARATE small
 * model call, picked from `ANTHROPIC_SMALL_FAST_MODEL` / `ANTHROPIC_DEFAULT_HAIKU_MODEL`, which
 * default to a `claude-haiku` id. `env_for("openrouter")` (provider.js) already blanks
 * `ANTHROPIC_API_KEY` and `CLAUDE_CODE_OAUTH_TOKEN` so the CLI can't fall back to the owner's real
 * Anthropic login — but the CLI ALSO reads a stored login from `CLAUDE_CONFIG_DIR`, so blanking the
 * env vars alone doesn't prove nothing reaches Anthropic. This script gives the child an EMPTY,
 * throwaway config dir too, so no Anthropic credential exists anywhere in its world — if anything
 * still needs one, it fails loudly instead of silently billing the owner's real account.
 *
 * Built on spike.mjs's direct `query()` pattern (not a Servex spawn, so this script controls the
 * child's whole env — a spawned agent only gets what Agents.js already decides to pass it, which is
 * exactly the thing being checked here) — ONE turn per model, because the only question is what
 * tools get called and what they cost, not multi-turn behavior.
 *
 *   node Servex/ext/openrouter/evals/websearch.mjs [model ...]
 *
 * Every assistant message id seen in the turn — not just the last one — is looked up against
 * OpenRouter's own `/v1/generation`, which answers the real question: how many separate paid
 * generations did this ONE turn actually produce, and under which model id each one ran. A hidden
 * second generation under a `claude-*` id is the exact leak this script exists to catch.
 *
 * KNOWN HOLE IN THAT PROOF (task-mastermind-openrouter, after the first reply): WebSearch and
 * WebFetch each make their OWN request INSIDE the tool — the search call itself, and WebFetch's
 * summary call — and neither one surfaces as an assistant message in the SDK stream, so the
 * `generations` list above can only ever find what the main turn loop produced, never those two.
 * "no claude-* generation" proved nothing reached Anthropic; it did NOT prove nothing was billed
 * at all. Closing that hole needs a number the SDK stream can't hide anything from: the key's own
 * total spend, before the turn and after it. `usage_diff` below is that number; if it is bigger
 * than the sum of every generation this script DID find, the difference is exactly what the
 * hidden calls cost, found or not. `api_activity()` then tries to say WHICH model/plugin billed
 * it, best-effort (the endpoint and its shape aren't confirmed yet — this never throws).
 *
 * Results: one line per model in websearch.jsonl, next to this task's own dir.
 */
import { query } from "@anthropic-ai/claude-agent-sdk";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env_for, has_key, read_key, KEY_PATH, disallowed_tools_for, key_usage } from "../provider.js";

const DEFAULT_MODELS = ["deepseek/deepseek-v4.1-flash", "openai/gpt-6-luna"];
const KNOWN_URL = "https://openrouter.ai/"; // stable, small, has an obvious <title>
const OUT_JSONL = path.join(fileURLToPath(new URL(".", import.meta.url)),
	"../../../../public/framework/ai/2026-09-30/openrouter-harness/web-search/websearch.jsonl");

const TURN_TIMEOUT_MS = 90_000;
const MAX_TURNS = 4;

if (!has_key()){ console.error(`no key at ${KEY_PATH}`); process.exit(2); }
const key = read_key();

/* The per-generation lookup (provider.js's `generation_cost` only reads `total_cost`; this script
 * needs `model` too, so it reads the same endpoint directly rather than extending that export for
 * one extra field only this script uses). Never throws — a generation that hasn't settled yet, or
 * one OpenRouter never created (the leak this script is checking for might mean there's nothing to
 * find), just reads as "unknown", not a crash. */
async function generation_info(id){
	for (let i = 0; i < 6; i++){
		try {
			const res = await fetch(`https://openrouter.ai/api/v1/generation?id=${encodeURIComponent(id)}`,
				{ headers: { Authorization: `Bearer ${key}` } });
			if (res.ok){
				const body = await res.json();
				if (body?.data) return { model: body.data.model ?? null, cost: body.data.total_cost ?? null };
			}
		} catch {}
		await new Promise(r => setTimeout(r, 3000));
	}
	return { model: null, cost: null };
}

/* Best-effort: ask OpenRouter which model+plugin billed the key in a time window, for the calls
 * `generations` (above) can't find because they never showed up as an assistant message id. The
 * exact endpoint/shape isn't confirmed — OpenRouter's activity export may live at a different
 * path or need different params — so this NEVER throws; a failure just means "couldn't confirm
 * which model", not "nothing happened" (that's what usage_diff is for). Narrowed to entries whose
 * own timestamp falls inside [since, since + windowMs], generously padded for clock skew. */
async function api_activity(since, windowMs = 5 * 60_000){
	try {
		const res = await fetch("https://openrouter.ai/api/v1/activity", { headers: { Authorization: `Bearer ${key}` } });
		if (!res.ok) return { ok: false, status: res.status, entries: [] };
		const body = await res.json();
		const rows = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
		const windowStart = since - 60_000, windowEnd = since + windowMs;
		const entries = rows.filter(r => {
			const t = Date.parse(r.created_at ?? r.timestamp ?? r.date ?? "");
			return Number.isFinite(t) && t >= windowStart && t <= windowEnd;
		}).map(r => ({ model: r.model ?? r.model_permaslug ?? null, cost: r.usage ?? r.cost ?? r.total_cost ?? null,
			provider: r.provider_name ?? r.provider ?? null, plugin: r.plugin ?? r.byok ?? null }));
		return { ok: true, entries };
	} catch (e){
		return { ok: false, error: String(e?.message || e), entries: [] };
	}
}

/* One turn, every assistant message id captured (not just the last — WebFetch's own summary call
 * can surface as its own assistant block in the same stream), every tool call and whether it
 * errored, and the full text of any error the SDK itself reports. `env` is the child's WHOLE
 * environment, built by the caller — this function adds nothing to it, so the caller's credential
 * blanking is the only thing in effect. */
async function run_turn({ model, cwd, prompt, env }){
	const started = Date.now();
	const aborter = new AbortController();
	const timer = setTimeout(() => aborter.abort(), TURN_TIMEOUT_MS);
	const tool_calls = [];
	const message_ids = [];
	let result_text = null, is_error = false, error_text = null, cost_sdk = 0;
	try {
		const stream = query({
			prompt,
			options: {
				model, cwd, env,
				permissionMode: "bypassPermissions",
				allowDangerouslySkipPermissions: true,
				includePartialMessages: true,
				maxTurns: MAX_TURNS,
				abortController: aborter,
				...(disallowed_tools_for(model).length ? { disallowedTools: disallowed_tools_for(model) } : {})
			}
		});
		for await (const message of stream){
			if (message.type === "assistant"){
				if (message.message?.id && !message_ids.includes(message.message.id)) message_ids.push(message.message.id);
				for (const block of message.message?.content ?? []){
					if (block.type === "tool_use") tool_calls.push({ name: block.name, input_preview: JSON.stringify(block.input ?? {}).slice(0, 160) });
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
	return { message_ids, tool_calls, result_text, is_error, error_text, cost_sdk, duration_ms: Date.now() - started };
}

async function run_one(model){
	const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "openrouter-websearch-"));
	// THE PROOF (requirements.md item 3): blank every env var the CLI could read an Anthropic
	// credential from, AND point it at a fresh, EMPTY config dir, so no stored login exists either.
	// Anything that still needs Anthropic access now fails loudly instead of silently succeeding
	// off the owner's real account.
	const configDir = fs.mkdtempSync(path.join(os.tmpdir(), "openrouter-websearch-config-"));
	const env = { ...process.env, ...env_for("openrouter"), CLAUDE_CONFIG_DIR: configDir };

	const prompt = `Search the web for today's date and one real news headline from this week. `
		+ `Then fetch ${KNOWN_URL} and quote its page title back to me. Use your WebSearch tool for `
		+ `the first part and your WebFetch tool for the second — don't skip either.`;

	// THE USAGE-DIFF PROOF (closes the hole the first reply missed): the key's own total spend,
	// read right before the turn starts and again after everything (including the generation
	// lookups below) has had time to settle. Nothing inside WebSearch/WebFetch can hide from this
	// number, even the calls that never show up as an assistant message id.
	const usage_before = await key_usage(key);
	const turnStartedAt = Date.now();

	const turn = await run_turn({ model, cwd, prompt, env });

	const generations = [];
	for (const id of turn.message_ids) generations.push({ message_id: id, ...(await generation_info(id)) });

	await new Promise(r => setTimeout(r, 5000)); // let billing settle before the "after" read
	const usage_after = await key_usage(key);
	const usage_diff = usage_after - usage_before;
	const sum_found_generations = generations.reduce((sum, g) => sum + (g.cost ?? 0), 0);
	const hidden_cost = +(usage_diff - sum_found_generations).toFixed(6);
	const activity = await api_activity(turnStartedAt);

	fs.rmSync(cwd, { recursive: true, force: true });
	fs.rmSync(configDir, { recursive: true, force: true });

	const row = {
		at: new Date().toISOString(), model,
		tool_calls: turn.tool_calls,
		used_websearch: turn.tool_calls.some(t => t.name === "WebSearch"),
		used_webfetch: turn.tool_calls.some(t => t.name === "WebFetch"),
		is_error: turn.is_error, error: turn.error_text,
		result_preview: turn.result_text?.slice(0, 300) ?? null,
		duration_ms: turn.duration_ms, cost_sdk_usd: turn.cost_sdk,
		generations, // every generation this ONE turn produced, with its real model id and cost —
		// more than one entry, or any entry whose model starts with "claude", is the leak this
		// script exists to catch.
		claude_generation_found: generations.some(g => String(g.model ?? "").startsWith("anthropic/") || String(g.model ?? "").startsWith("claude")),
		// The usage-diff proof: if hidden_cost is meaningfully > 0, something billed the key that
		// never showed up as an assistant message (WebSearch's own call, WebFetch's summary call,
		// or an OpenRouter plugin) — that number IS the hidden cost, found or not.
		usage_before, usage_after, usage_diff, sum_found_generations, hidden_cost,
		activity, // best-effort: which model/plugin billed it, when hidden_cost says something did
	};
	fs.mkdirSync(path.dirname(OUT_JSONL), { recursive: true });
	fs.appendFileSync(OUT_JSONL, JSON.stringify(row) + "\n");
	return row;
}

async function main(){
	const models = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_MODELS;
	const rows = [];
	for (const model of models){
		console.log(`\n--- ${model} ---`);
		let row;
		try { row = await run_one(model); }
		catch (e){ row = { at: new Date().toISOString(), model, fatal: String(e?.message || e) }; }
		rows.push(row);
		console.log(JSON.stringify(row, null, 2));
	}
	console.log("\n" + "=".repeat(72));
	console.log("model".padEnd(32), "search", "fetch", "generations", "claude leak?", "hidden $");
	for (const r of rows){
		if (r.fatal){ console.log(r.model.padEnd(32), "FATAL:", r.fatal); continue; }
		console.log(r.model.padEnd(32), String(r.used_websearch).padEnd(7), String(r.used_webfetch).padEnd(6),
			String(r.generations.length).padEnd(12), (r.claude_generation_found ? "YES — see generations[]" : "no").padEnd(13),
			r.hidden_cost);
	}
	console.log(`\nFull rows appended to ${path.relative(process.cwd(), OUT_JSONL)}`);
}

main().catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; });

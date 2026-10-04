#!/usr/bin/env node
// Server/session-cost.mjs — the dollar cost of ONE Claude Code session, read straight
// from its own transcript (`.claude/projects/<folder>/<session-id>.jsonl`).
//
// This is a DIFFERENT, separate system from `Server/task-cost.mjs` (Server/doc/task-cost.md):
// task-cost reads a Servex agent's own running `total_cost_usd` from its agent log —
// one number per agent, no per-prompt detail. This script reads the raw transcript
// instead, because that is the only place PER-PROMPT token counts exist (input, output,
// cache read, cache write, per assistant turn). Don't merge the two; they answer
// different questions and task-cost.mjs is already working — this task doesn't touch it.
//
// usage:
//   node Server/session-cost.mjs <session-id>             print the JSON result (testing)
//   node Server/session-cost.mjs --append <session-id>    compute it, append a {"cost":{...}}
//                                                          line to TODAY's page.jsonl for this
//                                                          session if one exists; quiet no-op otherwise
//   node Server/session-cost.mjs --append-stdin            same as --append, reading
//                                                          {"session_id": "..."} as JSON from stdin
//                                                          (the Stop hook's own payload shape) —
//                                                          never throws, always exits 0
import { readFileSync, existsSync, readdirSync, writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");

// $ per 1,000,000 tokens, in/out. From the owner's own brief (2026-10-02,
// public/framework/ai/2026-10-02/session-costs/minion-build/requirements.md) — no
// pricing table existed in this repo before this file.
// Cache reads run about 0.1x the input price, cache writes about 1.25x — these two
// multipliers are ESTIMATES (the real ratio varies slightly by model); the closest
// documented numbers are good enough for a figure the readme already calls an estimate.
export const DEFAULT_MODEL = "claude-sonnet-5";
export const PRICES = {
	"claude-sonnet-5":  { in: 2,  out: 10 },
	"claude-opus-5":    { in: 5,  out: 25 },
	"claude-opus-5-5":  { in: 4,  out: 20 },
	"claude-haiku-4-5": { in: 1,  out: 5  },
	"claude-fable-5":   { in: 10, out: 50 },
	"claude-fable-5-1": { in: 10, out: 50 },
};
for (const p of Object.values(PRICES)) { p.cache_read = p.in * 0.1; p.cache_write = p.in * 1.25; }

const r4 = n => Math.round(n * 10000) / 10000;

// An unknown model name falls back to the default's price and is listed in the
// result's `unknown_models` — never thrown, this is an estimate, not a hard failure.
function price_for(model, unknown_models){
	if (PRICES[model]) return PRICES[model];
	unknown_models.add(model);
	return PRICES[DEFAULT_MODEL];
}

const lines_of = file => existsSync(file)
	? readFileSync(file, "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(l => l.trim())
		.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)
	: [];

// Read one Claude Code session transcript and sum its cost, per prompt and in total.
// Every `assistant` line's `message.usage` is grouped under the nearest EARLIER real
// `user` line — same prompt-boundary rule ai/sessions/doc/decisions.md already documents
// for VS-Code-vs-CLI tagging: a sidechain line, or one whose `turnOrigin` is
// "task_notification" (the harness telling itself a background task finished), is not a
// real prompt boundary and is skipped when looking for "the nearest earlier user line".
export function cost_of_transcript(path){
	const unknown_models = new Set();
	const groups = [];                 // in file order: { at, usd, input, output, cache_read, cache_write, model }
	let current = null;
	const group_for = at => {
		if (!current || current.at !== at) { current = { at, usd: 0, input: 0, output: 0, cache_read: 0, cache_write: 0, model: null }; groups.push(current); }
		return current;
	};

	for (const o of lines_of(path)){
		if (o.type === "user" && !o.isSidechain && o.turnOrigin !== "task_notification"){
			group_for(o.timestamp ?? "unknown");
			continue;
		}
		if (o.type !== "assistant") continue;
		const usage = o.message?.usage;
		if (!usage) continue;
		const g = current ?? group_for("unknown");
		const model = o.message?.model ?? g.model ?? DEFAULT_MODEL;
		const price = price_for(model, unknown_models);
		const input = usage.input_tokens || 0, output = usage.output_tokens || 0;
		const cache_read = usage.cache_read_input_tokens || 0, cache_write = usage.cache_creation_input_tokens || 0;
		g.usd += (input * price.in + output * price.out + cache_read * price.cache_read + cache_write * price.cache_write) / 1e6;
		g.input += input; g.output += output; g.cache_read += cache_read; g.cache_write += cache_write;
		g.model = model;
	}

	const by_prompt = groups.filter(g => g.input || g.output || g.cache_read || g.cache_write)
		.map(g => ({ at: g.at, usd: r4(g.usd), input: g.input, output: g.output, cache_read: g.cache_read, cache_write: g.cache_write, model: g.model }));
	const total_usd = r4(by_prompt.reduce((n, g) => n + g.usd, 0));
	return { total_usd, by_prompt, unknown_models: [...unknown_models] };
}

// The one most useful string for a tool_use block's own `input` — ai/sessions'
// "what was it doing" table (page.js) shows this as the row's own detail, and
// the waste flags below group Read calls by it. Never throws on an unfamiliar
// tool's input shape (2026-10-03 brief, trace_of_transcript) — anything not
// named here just falls back to the tool's own name again.
function target_of(name, input){
	input = input || {};
	if (name === "Read" || name === "Edit" || name === "Write" || name === "NotebookEdit") return input.file_path || name;
	if (name === "Bash") return typeof input.command === "string" ? input.command.slice(0, 60) : name;
	if (name === "Grep") return input.pattern || name;
	if (name === "Glob") return input.path || name;
	if (name === "Agent" || name === "Task") return typeof input.prompt === "string" ? input.prompt.slice(0, 60) : name;
	return name;
}

// The per-tool-call trace behind ai/sessions' "cost-over-time chart" +
// "what was it doing" table (2026-10-03 brief,
// public/framework/ai/2026-10-03/session-trace/requirements.md). A DIFFERENT
// shape from `cost_of_transcript()` above, read ALONGSIDE it, not instead of
// it: that function already groups every assistant turn's $ under its nearest
// earlier real `user` line — this one needs that SAME grouping (the $ only
// exists per turn, never per individual tool call) plus every individual
// `tool_use` block's own timestamp and target, which `cost_of_transcript`
// throws away. Rather than re-deriving the $ a second time (a second price
// table walk, a second chance to drift from `cost_of_transcript`'s own
// numbers), this calls `cost_of_transcript(path)` once as a black box and
// re-reads the file a second time ONLY to re-find each tool_use block and the
// same turn-boundary rule (a real, non-sidechain, non-task_notification `user`
// line starts a new turn) — the one piece `cost_of_transcript` computes
// internally but doesn't expose. `cost_of_transcript` itself is untouched.
export function trace_of_transcript(path){
	const cost = cost_of_transcript(path);
	const turn_usd = new Map(cost.by_prompt.map(g => [g.at, g.usd]));
	const turn_model = new Map(cost.by_prompt.map(g => [g.at, g.model]));

	const calls = [];
	let current_at = "unknown";
	for (const o of lines_of(path)){
		if (o.type === "user" && !o.isSidechain && o.turnOrigin !== "task_notification"){
			current_at = o.timestamp ?? "unknown";
			continue;
		}
		if (o.type !== "assistant") continue;
		const blocks = o.message?.content;
		if (!Array.isArray(blocks)) continue;
		for (const b of blocks){
			if (b.type !== "tool_use") continue;
			calls.push({
				at: o.timestamp ?? current_at,
				tool: b.name,
				target: target_of(b.name, b.input),
				usd_of_turn: turn_usd.get(current_at) ?? 0,
				model: turn_model.get(current_at) ?? null,
				input: b.input ?? null,   // kept raw — the waste flags (chunked reads, polling) need offset/limit/command, not just `target`'s derived string
				turn_at: current_at,      // the OWNING turn's own key — lets a reader dedupe "3 calls, same turn" without risking two different turns that happen to cost the same `usd_of_turn`
			});
		}
	}
	const turns = cost.by_prompt.map(g => ({ at: g.at, usd: g.usd }));
	return { calls, turns };
}

// Find a session's transcript by id. Search EVERY `c--Code-lew42-*` project folder, not
// just the main checkout's own (`c--Code-lew42-monorepo`) — a worktree session's own
// files live under a differently-named folder, keyed by its own path. This is
// ai/sessions/doc/decisions.md's own noted open gap ("only one project's session files
// are scanned"); this script is the right place to fix it, since it already needs to
// open every folder to find one session id.
export function find_transcript(session_id){
	const base = join(homedir(), ".claude", "projects");
	let dirs;
	try { dirs = readdirSync(base, { withFileTypes: true }); } catch { return null; }
	for (const d of dirs){
		if (!d.isDirectory() || !d.name.startsWith("c--Code-lew42-")) continue;
		const f = join(base, d.name, session_id + ".jsonl");
		if (existsSync(f)) return f;
	}
	return null;
}

function pad2(n){ return String(n).padStart(2, "0"); }

// TODAY's date folder only, as the brief names it:
// public/framework/ai/<Y>/<M>/<D>/*-<first 8 hex of session-id>/page.jsonl
export function find_page_jsonl(session_id, root = ROOT){
	const id8 = session_id.slice(0, 8);
	const now = new Date();
	const dir = join(root, "public", "framework", "ai", String(now.getFullYear()), pad2(now.getMonth() + 1), pad2(now.getDate()));
	if (!existsSync(dir)) return null;
	let entries;
	try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return null; }
	for (const e of entries){
		if (!e.isDirectory() || !e.name.endsWith("-" + id8)) continue;
		const f = join(dir, e.name, "page.jsonl");
		if (existsSync(f)) return f;
	}
	return null;
}

// Compute + append one {"cost":{...}} line to the session's own page.jsonl, if one
// already exists for today. Quiet (stderr note, exit 0) when there is no transcript or
// no page.jsonl yet — same convention as task-cost.mjs's "unknown agent" case.
export function append_cost(session_id, root = ROOT){
	const transcript = find_transcript(session_id);
	if (!transcript) { console.error(`session-cost: no transcript found for session ${session_id}`); return null; }
	const result = cost_of_transcript(transcript);

	const page = find_page_jsonl(session_id, root);
	if (!page) { console.error(`session-cost: no page.jsonl for session ${session_id.slice(0, 8)} today — skipping (quiet)`); return result; }

	const last = result.by_prompt.at(-1);
	const by_model = {};
	for (const p of result.by_prompt) by_model[p.model] = r4((by_model[p.model] || 0) + p.usd);

	// `last_prompt_input`/`last_prompt_output` are extra, additive fields beyond the brief's own
	// minimum shape — the Sessions detail page (ai/sessions/page.js) shows a compact per-prompt
	// row with token counts, which needs them; harmless to any reader that only looks at
	// `total_usd`/`last_prompt_usd`/`by_model`.
	const tmpdir_path = mkdtempSync(join(tmpdir(), "session-cost-"));
	const tmp = join(tmpdir_path, "line.json");
	writeFileSync(tmp, JSON.stringify([{ cost: {
		total_usd: result.total_usd, last_prompt_usd: last ? last.usd : 0,
		last_prompt_input: last ? last.input : 0, last_prompt_output: last ? last.output : 0,
		by_model, source: "claude", at: "NOW",
	} }]));
	execFileSync(process.execPath, [join(root, ".claude", "hooks", "append.mjs"), page, tmp], { stdio: "pipe", windowsHide: true });
	return result;
}

// ---- CLI ----
const is_main = (() => {
	try { return import.meta.url === `file:///${process.argv[1].replaceAll("\\", "/").replace(/^\//, "")}`; } catch { return false; }
})();

if (is_main){
	const args = process.argv.slice(2);
	if (args[0] === "--append-stdin"){
		// The Stop hook's own payload: never let a failure here block the turn.
		try {
			let raw = "";
			process.stdin.setEncoding("utf8");
			for await (const chunk of process.stdin) raw += chunk;
			const payload = JSON.parse(raw);
			if (payload?.session_id) append_cost(payload.session_id);
			else console.error("session-cost --append-stdin: payload had no session_id");
		} catch (e) { console.error("session-cost --append-stdin: " + (e?.message || e)); }
		process.exit(0);
	} else if (args[0] === "--append"){
		const id = args[1];
		if (!id) { console.error("usage: node Server/session-cost.mjs --append <session-id>"); process.exit(2); }
		try { append_cost(id); } catch (e) { console.error("session-cost --append: " + (e?.message || e)); }
		process.exit(0);
	} else if (args[0] === "--trace"){
		// `--trace <id>`: print trace_of_transcript() as JSON, for testing —
		// same shape as the bare `<session-id>` mode below, just the other function.
		const id = args[1];
		if (!id) { console.error("usage: node Server/session-cost.mjs --trace <session-id>"); process.exit(2); }
		const transcript = find_transcript(id);
		if (!transcript) { console.error(`session-cost: no transcript found for session ${id}`); process.exit(1); }
		console.log(JSON.stringify(trace_of_transcript(transcript), null, 2));
	} else if (args[0] === "--trace-file"){
		// `--trace-file <id> <out-path>`: write trace_of_transcript() to a file —
		// the ai/sessions detail page (page.js) fetches this as `trace.json`
		// beside its own session folder; a browser page can't read the raw
		// transcript itself (no filesystem access), same reason sessions.json/
		// transcripts/<id>.json already exist as written-by-hand snapshots.
		const id = args[1], out = args[2];
		if (!id || !out) { console.error("usage: node Server/session-cost.mjs --trace-file <session-id> <out-path>"); process.exit(2); }
		const transcript = find_transcript(id);
		if (!transcript) { console.error(`session-cost: no transcript found for session ${id}`); process.exit(1); }
		mkdirSync(dirname(out), { recursive: true });
		writeFileSync(out, JSON.stringify(trace_of_transcript(transcript)));
		console.error(`session-cost: wrote ${out}`);
	} else {
		const id = args[0];
		if (!id) { console.error("usage: node Server/session-cost.mjs <session-id> | --append <session-id> | --append-stdin | --trace <session-id> | --trace-file <session-id> <out-path>"); process.exit(2); }
		const transcript = find_transcript(id);
		if (!transcript) { console.error(`session-cost: no transcript found for session ${id}`); process.exit(1); }
		console.log(JSON.stringify(cost_of_transcript(transcript), null, 2));
	}
}

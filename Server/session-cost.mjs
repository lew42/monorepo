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
import { readFileSync, existsSync, readdirSync, writeFileSync, mkdtempSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");

// $ per 1,000,000 tokens, in/out. From the owner's own brief (2026-10-02,
// public/framework/ai/2026-10-02/session-costs/minion-build/requirements.md) — no
// pricing table existed in this repo before this file.
//
// ⚠ FIXED 2026-10-04 (token-accounting): cache_write was `in * 1.25` (the 5-minute-cache
// multiplier) — WRONG for this machine, and the real accounting mistake the owner asked
// this task to find. Claude Code agents here run with the 1-HOUR prompt-cache TTL (see
// this session's own environment note), whose write price is `in * 2`, not `in * 1.25`.
// Proved against 3 real Servex agent logs, not assumed: for every `result` line in
// `agent-task-mastermind-models-page.jsonl`, `agent-clarity-models-page.jsonl` and
// `agent-reviewer-models-page.jsonl`, the SDK's own billed `cost` (the ground truth
// Anthropic actually charged, read straight off the API response — see Agents.js:1561)
// matches `(input*in + output*out + cache_read*in*0.1 + cache_write*in*2) / 1e6` to the
// LAST DECIMAL, every single turn — e.g. one turn: cost=0.1862686, usage
// {input:8, output:1200, cache_read:739663, cache_write:6580} → with *2 the formula gives
// exactly 0.1862686; with the old *1.25 it gives 0.1763986, 5.3% low. The *0.1 cache-read
// multiplier was already correct (same exact-match test) — only cache_write was wrong.
// This table is the ONE place any script in this repo prices a token (session-cost.mjs,
// week-cost.mjs, spend-tree.mjs all import it) — fixing it here fixes every reader at once,
// per CLAUDE.md law 6: no second copy of a price table to go stale separately.
export const DEFAULT_MODEL = "claude-sonnet-5";
export const PRICES = {
	"claude-sonnet-5":  { in: 2,  out: 10 },
	"claude-opus-5":    { in: 5,  out: 25 },
	"claude-opus-5-5":  { in: 4,  out: 20 },
	"claude-haiku-4-5": { in: 1,  out: 5  },
	"claude-fable-5":   { in: 10, out: 50 },
	"claude-fable-5-1": { in: 10, out: 50 },
};
for (const p of Object.values(PRICES)) { p.cache_read = p.in * 0.1; p.cache_write = p.in * 2; }

const r4 = n => Math.round(n * 10000) / 10000;

// An unknown model name falls back to the default's price and is listed in the
// result's `unknown_models` — never thrown, this is an estimate, not a hard failure.
// Exported: the one function every other script should call to price a call, instead of
// reading PRICES directly and re-deriving the same fallback-and-report logic a second time.
export function price_for(model, unknown_models){
	if (PRICES[model]) return PRICES[model];
	unknown_models?.add(model);
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
	// `usd_in`/`usd_out`/`usd_cache_read`/`usd_cache_write` are the SAME `usd` total, split by
	// which kind of token earned it — the per-call breakdown the token-accounting task asked
	// for ("precisely... their cache costs"), computed once here (never re-derived elsewhere).
	const groups = [];                 // in file order: { at, usd, usd_in, usd_out, usd_cache_read, usd_cache_write, input, output, cache_read, cache_write, model }
	let current = null;
	const group_for = at => {
		if (!current || current.at !== at) { current = { at, usd: 0, usd_in: 0, usd_out: 0, usd_cache_read: 0, usd_cache_write: 0, input: 0, output: 0, cache_read: 0, cache_write: 0, model: null }; groups.push(current); }
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
		const usd_in = input * price.in / 1e6, usd_out = output * price.out / 1e6;
		const usd_cache_read = cache_read * price.cache_read / 1e6, usd_cache_write = cache_write * price.cache_write / 1e6;
		g.usd += usd_in + usd_out + usd_cache_read + usd_cache_write;
		g.usd_in += usd_in; g.usd_out += usd_out; g.usd_cache_read += usd_cache_read; g.usd_cache_write += usd_cache_write;
		g.input += input; g.output += output; g.cache_read += cache_read; g.cache_write += cache_write;
		g.model = model;
	}

	const by_prompt = groups.filter(g => g.input || g.output || g.cache_read || g.cache_write)
		.map(g => ({ at: g.at, usd: r4(g.usd), input: g.input, output: g.output, cache_read: g.cache_read, cache_write: g.cache_write, model: g.model,
			usd_breakdown: { in: r4(g.usd_in), out: r4(g.usd_out), cache_read: r4(g.usd_cache_read), cache_write: r4(g.usd_cache_write) } }));
	const total_usd = r4(by_prompt.reduce((n, g) => n + g.usd, 0));
	// The SAME four numbers, summed across every prompt — the session's own total breakdown,
	// plus the one figure the brief named explicitly: what share of the $ came from cache reads.
	const usd_breakdown = by_prompt.reduce((n, g) => ({
		in: n.in + g.usd_breakdown.in, out: n.out + g.usd_breakdown.out,
		cache_read: n.cache_read + g.usd_breakdown.cache_read, cache_write: n.cache_write + g.usd_breakdown.cache_write,
	}), { in: 0, out: 0, cache_read: 0, cache_write: 0 });
	for (const k of Object.keys(usd_breakdown)) usd_breakdown[k] = r4(usd_breakdown[k]);
	const cache_read_pct = total_usd ? r4(usd_breakdown.cache_read / total_usd * 100) : 0;
	// The raw token counts behind `usd_breakdown` — review finding, 2026-10-04: the brief asked
	// for "input / cache write / cache read / output tokens AND $ for each", and the $ split
	// alone left the token counts out.
	const token_totals = by_prompt.reduce((n, g) => ({
		input: n.input + g.input, output: n.output + g.output,
		cache_read: n.cache_read + g.cache_read, cache_write: n.cache_write + g.cache_write,
	}), { input: 0, output: 0, cache_read: 0, cache_write: 0 });
	return { total_usd, usd_breakdown, cache_read_pct, token_totals, by_prompt, unknown_models: [...unknown_models] };
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
//
// ⚠ FIXED 2026-10-07 (token-accounting round 2): the comment above claimed this already
// scanned every worktree folder, but the match was CASE-SENSITIVE (`startsWith("c--Code-
// lew42-")`, lowercase `c`), while the Claude CLI names a worktree's own project folder
// with an UPPERCASE `C` (`C--Code-lew42-worktrees-<slug>...`). Checked live on this
// machine: of 145 real `*lew42*` project folders under `~/.claude/projects`, this match
// let through exactly ONE — the main checkout itself (`c--Code-lew42-monorepo`, lowercase
// by luck). Every worktree session (which is most multi-file work — the sub-mastermind
// skill routes it there by default) silently found no transcript at all, so `session-
// cost.mjs`, `task-cost.mjs` and `spend-tree.mjs` all fell back to the agent log's own
// running total for those agents — the same number mistake 2 of the 2026-10-04 decisions
// entry already proved undercounts by 20-60%+ whenever it can't read the transcript. This
// is the likely cause of the week's own total reading low: a large share of real spend,
// from worktree-run work, was never priced off the transcript at all. Fixed with a
// case-insensitive test; no other change needed, since the file-existence check right
// after it was already correct.
export function find_transcript(session_id){
	const base = join(homedir(), ".claude", "projects");
	let dirs;
	try { dirs = readdirSync(base, { withFileTypes: true }); } catch { return null; }
	for (const d of dirs){
		if (!d.isDirectory() || !/^c--code-lew42-/i.test(d.name)) continue;
		const f = join(base, d.name, session_id + ".jsonl");
		if (existsSync(f)) return f;
	}
	return null;
}

function pad2(n){ return String(n).padStart(2, "0"); }

// ⚠ FIXED 2026-10-04 (vscode-session-cost — the owner's own report: a VS Code tab he'd been
// in "a very long conversation" with showed only $5.32). This used to look ONLY under TODAY's
// date folder — correct the day a session's page is first created, but every VS Code tab that
// is still open past midnight has its page under an EARLIER day's folder
// (public/framework/ai/<Y>/<M>/<D>/..., the day prompt-relay.mjs first wrote it), and every
// Stop hook after midnight silently found nothing there and no-op'd. Checked live: session
// 60d9def6's page stalled at total_usd $29.12 while its real transcript (this same script's
// own cost_of_transcript) already priced out to $110.07 — an $80+ undercount, growing every
// day the tab stays open. Fixed by searching EVERY `<Y>/<M>/<D>/` folder for the session's own
// `*-<id8>` dir, the identical pattern `ai/sessions/page.js`'s own `session_page_dir_index()`
// already uses client-side (CLAUDE.md law 6: one rule for "which folder is this session's
// page", not two). A session's page folder is created once and never renamed, so there is
// normally exactly one match; if more than one somehow exists (the hook's own tmp marker file
// got cleared mid-session and a second folder was created), the one with the MOST RECENT
// modification time wins — it has to be the folder every later hook call has actually been
// writing to.
export function find_page_jsonl(session_id, root = ROOT){
	const id8 = session_id.slice(0, 8);
	const ai = join(root, "public", "framework", "ai");
	let years;
	try { years = readdirSync(ai, { withFileTypes: true }); } catch { return null; }
	const matches = [];
	for (const y of years){
		if (!y.isDirectory() || !/^\d{4}$/.test(y.name)) continue;
		const yDir = join(ai, y.name);
		let months;
		try { months = readdirSync(yDir, { withFileTypes: true }); } catch { continue; }
		for (const m of months){
			if (!m.isDirectory() || !/^\d{2}$/.test(m.name)) continue;
			const mDir = join(yDir, m.name);
			let days;
			try { days = readdirSync(mDir, { withFileTypes: true }); } catch { continue; }
			for (const d of days){
				if (!d.isDirectory() || !/^\d{2}$/.test(d.name)) continue;
				const dDir = join(mDir, d.name);
				let entries;
				try { entries = readdirSync(dDir, { withFileTypes: true }); } catch { continue; }
				for (const e of entries){
					if (!e.isDirectory() || !e.name.endsWith("-" + id8)) continue;
					const f = join(dDir, e.name, "page.jsonl");
					if (existsSync(f)) matches.push(f);
				}
			}
		}
	}
	if (!matches.length) return null;
	if (matches.length === 1) return matches[0];
	matches.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
	return matches[0];
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
	// `usd_breakdown`/`cache_read_pct` (token-accounting, 2026-10-04) are the same, additive:
	// the session's whole-run $ split by token kind, and the one figure the owner asked for by
	// name — what share of the $ is cache reads. `last_prompt_usd_breakdown` is the same split
	// for just the newest prompt, matching `last_prompt_usd`'s own "just this turn" grain.
	const tmpdir_path = mkdtempSync(join(tmpdir(), "session-cost-"));
	const tmp = join(tmpdir_path, "line.json");
	writeFileSync(tmp, JSON.stringify([{ cost: {
		total_usd: result.total_usd, last_prompt_usd: last ? last.usd : 0,
		last_prompt_input: last ? last.input : 0, last_prompt_output: last ? last.output : 0,
		usd_breakdown: result.usd_breakdown, cache_read_pct: result.cache_read_pct, token_totals: result.token_totals,
		last_prompt_usd_breakdown: last ? last.usd_breakdown : null,
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

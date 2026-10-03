#!/usr/bin/env node
// sessions.mjs — one snapshot of every Claude session that has an id, for the
// Sessions tab (public/framework/ai/sessions/). Run by hand to refresh:
//
//     node public/framework/ai/2026-10-02/panel2-sessions/sessions.mjs
//
// WHY A SNAPSHOT, NOT A LIVE ROUTE: the Sessions tab asked mastermind-servex-9
// for a real `GET /api/sessions` route (Servex/agents inbox note, 2026-10-02);
// no reply had landed when this was built, and this task's own fence is
// `public/framework/ai/` only — it cannot add a route under `Server/`. A browser
// also cannot read a local `.jsonl` file by itself, so SOME node process has to
// do this scan; a one-shot script writing a file the page polls is the smallest
// thing that works today (CLAUDE.md law 1). The page ALSO polls Servex's real
// `GET /api/agents` directly for live state on the Servex rows — only the
// VS Code/CLI rows depend on this file being re-run to go stale. See
// doc/decisions.md (sessions/) for the fuller record and what a real route
// would fix.
//
// WHAT IT WRITES:
//   public/framework/ai/sessions/sessions.json          — one row per session (the list)
//   public/framework/ai/sessions/transcripts/<id>.json  — one VS Code/CLI session's
//     own prompts, in order (Servex rows get no transcript file yet — see above;
//     the route this asked for would carry it instead of a second file).
//
// THE VS CODE VS CLI HEURISTIC: every session's own user-type lines carry a
// `turnOrigin` field — "human" when a person typed it (a real interactive
// VS Code tab), "sdk" when a program sent it (a Servex-spawned agent, or a
// standalone `claude -p` run). A Servex-spawned agent already has a known
// `session_id` in Servex's own agent list, so by the time this scan reaches a
// session jsonl file at all, it is NOT one of those — "sdk" there means a
// real standalone CLI run, not a minion. Checked against two real examples
// before writing this (a known interactive VS Code tab vs. a known
// Servex-spawned agent's own session file) — see doc/decisions.md.

import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SERVEX = process.env.SERVEX_BASE ?? "http://localhost:80";
const PROJECT_DIR = join(homedir(), ".claude", "projects", "c--Code-lew42-monorepo");
// How far back to look for a VS Code/CLI session — a floor on PERFORMANCE
// (scanning 1,768 files on this machine, most of them a week old, would be
// slow for no benefit: a "live sessions" list that is actually live), not on
// meaning. Override with `--hours=48` for a wider look.
const HOURS = Number(process.argv.find(a => a.startsWith("--hours="))?.split("=")[1]) || 24;
const MAX_PROMPTS = 50;   // per session, newest kept — a transcript file, not the whole file

// This file lives at public/framework/ai/2026-10-02/panel2-sessions/sessions.mjs —
// two levels up is public/framework/ai/, where the real tab folder sits.
const HERE = dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = join(HERE, "..", "..", "sessions");     // public/framework/ai/sessions/
const OUT_FILE = join(SESSIONS_DIR, "sessions.json");
const TRANSCRIPTS_DIR = join(SESSIONS_DIR, "transcripts");

async function servex_agents(){
	try {
		const res = await fetch(SERVEX + "/api/agents");
		if (!res.ok) return [];
		const list = await res.json();
		return Array.isArray(list) ? list : [];
	} catch { return []; }
}

function first_line(text, max = 200){
	return String(text ?? "").trim().split("\n")[0].slice(0, max);
}

// A "user" line's `message.content` is a plain string, or an array of blocks
// (`[{type:"text", text:"…"}]`) — a TOOL RESULT also arrives as a "user" line
// in this format, with no text block at all, and is skipped: it is the
// harness talking to itself, not a prompt.
function user_text(message){
	const c = message?.content;
	if (typeof c === "string") return c;
	if (Array.isArray(c)) return c.find(b => b?.type === "text")?.text ?? null;
	return null;
}

// One session file, read once, kept to what this page needs: every real
// (non-sidechain) user prompt, the last model identity seen, and the cwd —
// never the sub-agent/tool-result noise, which is most of a big file.
function scan_session_file(path){
	const text = readFileSync(path, "utf8");
	const prompts = [];
	let last_activity = null, model = null, cwd = null;
	for (const line of text.split("\n")){
		if (!line) continue;
		let obj;
		try { obj = JSON.parse(line); } catch { continue; }
		if (obj.timestamp) last_activity = obj.timestamp;
		if (obj.cwd) cwd = obj.cwd;
		// ⚠ `turnOrigin: "task_notification"` is the harness telling ITSELF a
		// background task finished — it carries real text (so `user_text()`
		// alone can't filter it) but nobody asked it and it proves nothing
		// about whether a human is driving this session. Found live: the known
		// VS Code session's own LAST "user" line was one of these, which first
		// tagged a real interactive tab "cli" — fixed by excluding it here
		// rather than trusting whichever line happens to be last.
		if (obj.type === "user" && !obj.isSidechain && obj.turnOrigin !== "task_notification"){
			const text = user_text(obj.message);
			if (text) prompts.push({ at: obj.timestamp, text, turn_origin: obj.turnOrigin ?? null });
		}
		if (obj.type === "attachment" && obj.attachment?.type === "model"){
			model = obj.attachment.identity?.modelId ?? model;
		}
	}
	return { last_activity, model, cwd, prompts: prompts.slice(-MAX_PROMPTS) };
}

function vscode_or_cli_rows(known_ids, cutoff){
	let names;
	try { names = readdirSync(PROJECT_DIR); } catch { return []; }
	const rows = [];
	mkdirSync(TRANSCRIPTS_DIR, { recursive: true });

	for (const name of names){
		if (!name.endsWith(".jsonl")) continue;
		const id = name.slice(0, -".jsonl".length);
		if (known_ids.has(id)) continue;   // already a Servex row — don't show it twice

		const full = join(PROJECT_DIR, name);
		let st;
		try { st = statSync(full); } catch { continue; }
		if (!st.isFile() || st.mtimeMs < cutoff) continue;

		const info = scan_session_file(full);
		if (!info.last_activity || !info.prompts.length) continue;   // nothing a reader could open

		const last = info.prompts.at(-1);
		rows.push({
			id,
			source: last.turn_origin === "human" ? "vscode" : "cli",
			session_id: id,
			// VS Code writes no tab title into the transcript — the cwd's own folder
			// name is the closest real stand-in (readme.md names this limitation).
			tab_title: info.cwd ? info.cwd.split(/[\\/]/).filter(Boolean).pop() : null,
			model: info.model,
			state: (Date.now() - Date.parse(info.last_activity)) < 5 * 60 * 1000 ? "active" : "idle",
			last_prompt_first_line: first_line(last.text),
			last_activity: info.last_activity,
			cost: null,   // not in a plain transcript file — Servex rows carry it instead
		});

		writeFileSync(join(TRANSCRIPTS_DIR, id + ".json"),
			JSON.stringify({ session_id: id, cwd: info.cwd, prompts: info.prompts.map(p => ({ at: p.at, text: p.text })) }, null, 2));
	}
	return rows;
}

const agents = await servex_agents();
const known_ids = new Set(agents.map(a => a.session_id).filter(Boolean));

const servex_rows = agents.filter(a => a.session_id).map(a => ({
	id: a.id,
	source: "servex",
	session_id: a.session_id,
	tab_title: a.id,
	model: a.model,
	state: a.state,
	// `GET /api/agents` carries no transcript — this is the field the Servex
	// route this task asked for (doc/decisions.md) would fill in.
	last_prompt_first_line: null,
	last_activity: a.started_at ?? null,
	cost: typeof a.cost === "number" ? a.cost : null,
}));

const cutoff = Date.now() - HOURS * 3600 * 1000;
const rows = [...servex_rows, ...vscode_or_cli_rows(known_ids, cutoff)]
	.sort((a, b) => Date.parse(b.last_activity ?? 0) - Date.parse(a.last_activity ?? 0));

mkdirSync(SESSIONS_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify({ generated_at: new Date().toISOString(), hours: HOURS, rows }, null, 2));

console.log(`wrote ${rows.length} rows (${servex_rows.length} servex, ${rows.length - servex_rows.length} vscode/cli) to ${OUT_FILE}`);

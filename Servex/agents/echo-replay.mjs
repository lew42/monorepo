#!/usr/bin/env node
/* echo-replay.mjs — deliverable 4/5's "replay path": given a PAST session_id, read that
 * session's own real prompt+reply pairs, in order, straight off Claude Code's own transcript
 * file (never copied into a second file — "reading them from the transcript file in place").
 *
 * This is the data half only. Feeding each pair, one at a time, to a FRESH echo agent (never a
 * resumed/forked one — cheaper, and proves the live mechanism works stone cold, per the brief)
 * is driven from OUTSIDE this file: spawn a plain `echo`-role agent with `Echo.js`'s own
 * `echo.md` as its system prompt, restricted to `mcp__servex__refine_step`, then call
 * `Echo.heard()`/`heard_reply()` (or, from outside the Servex process entirely, the exact same
 * shape over `POST /log/echo`) for each pair in order, waiting for one prompt's `done` step
 * before sending the next. `public/framework/ai/2026-10-02/prompt-refine/minion-echo/task.jsonl`
 * has the worked example for session 361c4d18-e878-4c04-9537-444e847e13d5 (deliverable 6's
 * first test).
 *
 * THE TRANSCRIPT PATH, same convention `public/framework/ai/2026-10-02/panel2-sessions/
 * sessions.mjs` already uses and proved against this exact machine: Claude Code keeps one
 * `<session_id>.jsonl` per session under `~/.claude/projects/<project-slug>/`. The slug for
 * this repo's own MAIN checkout (where the owner's own interactive sessions run — a worktree
 * gets its own, different slug, so this only ever finds a session that ran in the main tree)
 * is hard-coded below, exactly like sessions.mjs's own `PROJECT_DIR` — pass `{project}` to
 * override it for a session that ran somewhere else.
 *
 * usage: node Servex/agents/echo-replay.mjs <session_id> [count]
 *   prints the last `count` (default 15) prompt+reply pairs as JSON, in order — the same
 *   shape `pairs()` returns, so this file doubles as its own smoke test. */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_PROJECT = "c--Code-lew42-monorepo";

// Same filter sessions.mjs's own `scan_session_file`/`user_text` use, for the same reason:
// a tool-result message also arrives shaped like a "user" line, and `turnOrigin:
// "task_notification"` is the harness telling itself a background task finished — neither is
// something the owner typed.
function user_text(message){
	const c = message?.content;
	if (typeof c === "string") return c;
	if (Array.isArray(c)) return c.find(b => b?.type === "text")?.text ?? null;
	return null;
}

// Same filter reply-relay.mjs's own `last_assistant_text` uses: a sidechain is a sub-agent's
// own turn mixed into the same file, never what the owner actually read.
function assistant_text(message){
	const blocks = Array.isArray(message?.content) ? message.content : [];
	const texts = blocks.filter(b => b?.type === "text" && typeof b.text === "string" && b.text.trim());
	return texts.length ? texts.map(t => t.text.trim()).join("\n\n") : null;
}

/* Every real prompt, in order, each with the text of the LAST assistant reply that landed
 * before the NEXT prompt (or before the end of the file) — `null` if the turn never spoke
 * (ran only tools). Returns ALL of them; `pairs()` below slices to the last `count`. */
function scan(path){
	const lines = readFileSync(path, "utf8").split("\n");
	const all = [];
	let current = null;   // { prompt: {at, text}, reply: {at, text} | null }
	for (const line of lines){
		if (!line) continue;
		let obj;
		try { obj = JSON.parse(line); } catch { continue; }
		if (obj.type === "user" && !obj.isSidechain && obj.turnOrigin !== "task_notification"){
			const text = user_text(obj.message);
			if (!text) continue;
			current = { prompt: { at: obj.timestamp, text }, reply: null };
			all.push(current);
			continue;
		}
		if (obj.type === "assistant" && !obj.isSidechain && current){
			const text = assistant_text(obj.message);
			if (text) current.reply = { at: obj.timestamp, text };   // keeps the LAST one if a turn speaks more than once
		}
	}
	return all;
}

/* The public function. `count` (default 15) is "the last N prompts" — deliverable 5/6's own
 * phrasing — not N lines of the raw file, so a long session with mostly tool-only turns still
 * gets N real, spoken prompts. */
export function pairs(session_id, { project = DEFAULT_PROJECT, count = 15 } = {}){
	const path = join(homedir(), ".claude", "projects", project, `${session_id}.jsonl`);
	const all = scan(path);
	return all.slice(-count);
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("echo-replay.mjs")){
	const [, , session_id, countArg] = process.argv;
	if (!session_id){ console.error("usage: node Servex/agents/echo-replay.mjs <session_id> [count]"); process.exit(2); }
	const rows = pairs(session_id, { count: countArg ? Number(countArg) : 15 });
	console.log(JSON.stringify(rows, null, 2));
}

/* DIRECTORY MASTERMIND — a fresh mastermind for one folder, started from its plain files.
 *
 * `ask_directory({dir, question, session?})` spawns a FRESH agent (role
 * `directory-mastermind`) whose first message is the same, byte for byte, every
 * time it is opened on the same folder: "You're a mastermind working in <dir>.",
 * then CLAUDE.md, the readme chain from the repo root down to <dir>, and the
 * role's two skills in full. The question goes in as the SECOND message, so
 * the first turn is identical every time and the prompt cache can reuse it.
 *
 *   opening(dir)                       the first message: a pure function of the files on disk
 *   question(text)                     the second message: the question, plus "change nothing"
 *   dir_of(input)                      a repo path or a site path -> "public/framework/core/Page"
 *   ask(host, {dir, question, session, parent})   spawn or reuse, send, return {agent, dir} at once
 *   directory_tools(host)              the MCP tool, wired by one line in Servex.js
 *
 * It is NOT `ask_expert` (experts.js): an expert FORKS a saved checkpoint and
 * answers once; this starts fresh from the readmes every time and is kept for
 * follow-ups within one voice session. doc/directory.md says when to use which.
 *
 * Plain files only (the owner, 2026-09-29): nothing Servex-specific goes into
 * `opening()`, so a harness for another model or provider can call it as is. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { first_prompt } from "./readme-chain.js";
import { place } from "../home.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, "../..");

/* The role's own skills, loaded in full. The rest of .claude/skills/ is listed by path. */
export const SKILLS = ["sub-mastermind", "page"];
export const IDLE_MS = 10 * 60 * 1000;
const read = abs => { try { return fs.readFileSync(abs, "utf8").replace(/\r\n/g, "\n").trimEnd(); } catch { return null; } };

/* A folder, written either way, -> its repo path with forward slashes and no
 * trailing slash. A leading "/" means a SITE path: `/framework/core/Page/` is
 * served from `public/framework/core/Page`. Anything else is repo-relative.
 * Throws when the folder does not exist, naming what it looked for. */
export function dir_of(input){
	let d = String(input ?? "").trim().replace(/\\/g, "/");
	if (!d) throw new Error("ask_directory needs a `dir`: a repo path (public/framework/core/Page) or a site path (/framework/core/Page/).");
	if (path.isAbsolute(d) && d.toLowerCase().startsWith(REPO.replace(/\\/g, "/").toLowerCase())) d = d.slice(REPO.length);
	else if (d.startsWith("/")) d = "public" + d;
	d = d.replace(/^\/+|\/+$/g, "");
	const abs = path.join(REPO, d);
	/* Refuse a folder outside the repo (voice-fixes review item 5), the same check
	 * `Sessions.folder()` makes: `dir: "../.."` must not open a mastermind on it. */
	const inside = !path.relative(REPO, abs).startsWith("..");
	if (!inside || !fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) throw new Error(`No folder ${d || "."} in the repo (from "${input}").`);
	return d;
}

/* CLAUDE.md, or AGENTS.md when a repo has only that. */
function instructions(){
	for (const name of ["CLAUDE.md", "AGENTS.md"]){
		const text = read(path.join(REPO, name));
		if (text != null) return { name, text };
	}
	return null;
}

/* A skill file's front matter `description`, cut to its first sentence. */
function summary(text){
	const d = text.match(/^description:\s*(.*)$/m)?.[1] ?? "";
	return (d.match(/^.*?[.!?](\s|$)/)?.[0] ?? d).trim().slice(0, 160);
}

/* OPENING — the first message, for this folder. A pure function of the files:
 * no clock, no agent id, no session id, no Servex state. Two calls with the same
 * files on disk return the same string, which is what the prompt cache needs. */
export function opening(dir){
	dir = dir_of(dir);
	const parts = [`You're a mastermind working in ${dir}.`];

	const rules = instructions();
	if (rules) parts.push(`## ${rules.name} (the project's rules)\n\n${rules.text}`);

	parts.push(`## The readmes\n\n${first_prompt(dir)}`);

	const skills_dir = path.join(REPO, ".claude/skills");
	const loaded = SKILLS.map(s => ({ s, text: read(path.join(skills_dir, s, "SKILL.md")) })).filter(x => x.text != null);
	parts.push(`## Your skills\n\nYour role's skills are ${loaded.map(x => `\`${x.s}\``).join(" and ")}. Their full text follows, so treat them as loaded.`);
	for (const { s, text } of loaded) parts.push(`### .claude/skills/${s}/SKILL.md\n\n${text}`);

	let others = [];
	try { others = fs.readdirSync(skills_dir).filter(s => !SKILLS.includes(s)).sort(); } catch {}
	const listed = others.map(s => ({ s, text: read(path.join(skills_dir, s, "SKILL.md")) })).filter(x => x.text != null);
	if (listed.length) parts.push("### Other skills\n\nNot loaded. Read the file when its moment comes:\n\n"
		+ listed.map(x => `- \`.claude/skills/${x.s}/SKILL.md\`: ${summary(x.text)}`).join("\n"));

	parts.push("The question comes in the next message. For now, reply only: READY.");
	return parts.join("\n\n") + "\n";
}

/* QUESTION — the second message. A question changes nothing; a readme that
 * misled or was silent is named, so a task can fix it later. The parent only
 * sees the first 300 characters of the last message (Agents.wake_parent), so
 * the answer leads. */
export function question(text){
	return `Question: ${String(text).trim()}\n\n`
		+ "This is a question, not a task. Answer from the readmes above and the code; open files with Read, Grep"
		+ " and Glob as you need them. Change no files. Cite the readme or file each point comes from, by path.\n\n"
		+ "The asker sees the first 300 characters of your last message first, so open it with the answer in one"
		+ " plain sentence, then the detail. End with one line that starts `Docs:` and names any readme that was"
		+ " wrong or missing something you needed, so a task can fix it (or `Docs: fine`).";
}

/* ---- who is asking what: session|dir -> agent id, in memory plus a small json ---- */

const FILE = () => place("directory-sessions.json");
const key = (session, dir) => `${session}|${dir}`;
let map = null;
function sessions(){
	if (map) return map;
	try { map = new Map(Object.entries(JSON.parse(fs.readFileSync(FILE(), "utf8")).rows ?? {})); }
	catch { map = new Map(); }
	return map;
}
function remember(session, dir, row){
	sessions().set(key(session, dir), row);
	try { fs.writeFileSync(FILE(), JSON.stringify({ note: "ask_directory: which agent answers which voice session's questions about which folder. Servex/agents/directory.js.", rows: Object.fromEntries(sessions()) }, null, "\t") + "\n"); } catch {}
}

/* The agent this session already has for this folder: the live one, or, after an idle stop
 * or a Servex restart, the SAME one reopened by its saved session (`host.wake()`), so a
 * follow-up 15 minutes later still remembers the first question (review item 3). */
function reusable(host, session, dir){
	if (!session) return null;
	const row = sessions().get(key(session, dir));
	if (!row) return null;
	const agent = host.live?.get(row.agent);
	if (agent && agent.state !== "stopped") return agent;
	if (!row.session_id || typeof host.wake !== "function") return null;
	try { const woke = host.wake(row.agent); return typeof woke?.idle === "function" ? woke : null; } catch { return null; }
}

/* At most MAX_PER_SESSION live directory masterminds per voice session: a talk about six
 * folders must not hold six manager-tier agents. The oldest idle one is stopped first;
 * its saved session reopens it if it is asked again (review item 12). */
export const MAX_PER_SESSION = 2;
function make_room(host, session, keep){
	if (!session) return;
	const live = [...sessions().entries()].filter(([k]) => k.startsWith(session + "|"))
		.map(([, row]) => ({ row, agent: host.live?.get(row.agent) }))
		.filter(x => x.agent && x.agent.state !== "stopped" && x.agent !== keep);
	while (live.length >= MAX_PER_SESSION){
		const idle = live.filter(x => x.agent.state !== "working").sort((a, b) => Date.parse(a.row.at) - Date.parse(b.row.at));
		if (!idle.length) return;   // all busy: go over rather than cut one off mid-answer
		try { idle[0].agent.stop(); } catch {}
		live.splice(live.indexOf(idle[0]), 1);
	}
}

/* IDLE STOP — ten minutes with no message in or out, then stop. The session
 * file stays, so `claude --resume <session_id>` still reopens it. Any event the
 * agent emits (a message to it, its own reply) restarts the clock. */
function watch_idle(agent, ms = IDLE_MS){
	if (agent.idle_watch || typeof agent.emit !== "function") return;   // a gate stand-in has no emit
	const reset = () => {
		clearTimeout(agent.idle_watch);
		agent.idle_watch = setTimeout(() => {
			if (agent.state === "stopped") return;
			if (agent.state === "working") return reset();
			agent.stop();
		}, ms);
		agent.idle_watch.unref?.();
	};
	const emit = agent.emit.bind(agent);
	agent.emit = entry => { if (entry?.type !== "result" || !entry.stopped) reset(); return emit(entry); };
	reset();
}

/* ASK — reuse this session's agent for this folder, else spawn a fresh one
 * with `opening(dir)`; then send the question as its own message. Returns at
 * once. The answer reaches `parent` as the child's ordinary wake message.
 *
 * ⚠ The opening is a turn of its own (the agent replies READY), and every turn
 * end wakes the parent (Agents.wake_parent). So the spawn NAMES the parent (the
 * registry and the lineage know who asked), but the live agent's `parent` is
 * cleared until that first turn is over; then it is set back and the question
 * sent. Questions on one agent go through one chain, so a follow-up never
 * overtakes the question before it.
 *
 * `urgent: true` (review item 1): Servex's spawn gate never holds a question the
 * owner is waiting on, so `spawn()` returns a real agent, never a queued stand-in.
 * `permission_mode: "plan"` (item 12): a question changes nothing, and plan mode
 * refuses Bash writes too, not only Edit, Write and NotebookEdit. */
export function ask(host, { dir, question: q, session, parent = null, idle_ms = IDLE_MS, cwd = REPO } = {}){
	if (!q || !String(q).trim()) throw new Error("ask_directory needs a `question`.");
	dir = dir_of(dir);
	let agent = reusable(host, session, dir);
	const reused = !!agent;
	if (agent) make_room(host, session, agent);
	else {
		make_room(host, session, null);
		agent = host.spawn({
			role: "directory-mastermind",
			name: dir.split("/").pop(),
			cwd,
			parent,
			urgent: true,
			permission_mode: "plan",
			prompt: opening(dir),
			/* `system` makes Agents.spawn send `prompt` as-is: no id line, no skill-load
			 * preamble, no readme chain of its own, so the first message stays identical. */
			system: { type: "preset", preset: "claude_code" },
			/* No project settings: CLAUDE.md and the skills arrive as plain text in
			 * opening(), not through Claude Code's own loaders (twice would be waste). */
			setting_sources: [],
			/* A question changes nothing — the file-writing tools are refused outright. */
			sdk: { disallowedTools: ["Edit", "Write", "NotebookEdit"] }
		});
		if (typeof agent?.idle !== "function") throw new Error(`ask_directory: Servex did not start the agent (${agent?.state ?? "no agent"}); ask again in a minute.`);
		agent.parent = null;   // the READY turn wakes nobody
		agent.asking = agent.idle();
	}
	watch_idle(agent, idle_ms);
	agent.asking = (agent.asking ?? Promise.resolve()).then(() => {
		if (agent.state === "stopped") return;
		agent.parent = parent;
		host.register?.(agent);
		agent.send(question(q), { from: parent ?? undefined });
		return agent.idle();
	}).catch(() => {});
	if (session) remember(session, dir, { agent: agent.id, session_id: agent.session_id, at: new Date().toISOString() });
	return { agent: agent.id, dir, reused, session_id: agent.session_id };
}

/* ---- the MCP tool (one line in Servex.js wires it) ---- */

export function directory_tools(host){
	const inputSchema = { type: "object", required: ["dir", "question"], properties: {
		dir: { type: "string", description: "The folder: a repo path (`public/framework/core/Page`, `Servex/agents`) or a site path (`/framework/core/Page/`)." },
		question: { type: "string", description: "The question, in full." },
		session: { type: "string", description: "The voice session's id (`v-…`, the same id Session.start() returns). A second question on the same folder in the same session goes to the same agent, reopened from its saved session if it stopped. At most 2 are live per session." },
		parent: { type: "string", description: "Who gets the answer. Defaults to you (the caller)." }
	} };
	return [{
		name: "ask_directory",
		description: "Ask a FRESH mastermind about one folder. It starts from plain files only (CLAUDE.md, the readmes from the"
			+ " root down to the folder, its two skills) with the same first message every time, so the cache is shared;"
			+ " the question is its second message. Returns at once with {agent, dir}; the answer arrives as that agent's"
			+ " message to you. Questions change no files. Not `ask_expert`, which forks a saved checkpoint of one module.",
		inputSchema, schema: inputSchema,
		handler: (args = {}, ctx = {}) => JSON.stringify(ask(host, { ...args, parent: args.parent ?? ctx.caller ?? null }))
	}];
}

/* CLI: node Servex/agents/directory.js opening public/framework/core/Page */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const [verb, dir] = process.argv.slice(2);
	if (verb === "opening" && dir) process.stdout.write(opening(dir));
	else console.log("usage: node Servex/agents/directory.js opening <dir>");
}

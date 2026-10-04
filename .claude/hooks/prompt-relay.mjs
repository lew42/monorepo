import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* prompt-relay.mjs — the UserPromptSubmit hook (2026-09-19).
 *
 * Claude Code runs this on every prompt the owner submits, in every session, and hands it
 * JSON on stdin: { session_id, prompt, cwd, hook_event_name }. Plain text this script prints
 * to stdout on exit 0 is added to the model's context for that turn — that is how the
 * "identity refresh" below reaches the assistant with no file for it to remember to read.
 *
 * Two jobs, for two different readers:
 *
 * 1. THE OWNER'S OWN interactive session only — never a minion or mastermind's (minion-echo,
 *    2026-10-02, storage redirect: "a session is a page",
 *    public/framework/ai/2026-09-30/proposal-flow/page-item-design.md). The prompt becomes one
 *    `page_add` item on that session's own public/framework/ai/sessions/<session_id>/page.jsonl
 *    — never a second, shared daily file (the old .claude/prompts/<date>.jsonl is retired: text
 *    is never stored twice). This is the owner's "my words should be transcribed in real time."
 *
 * 2. ASSISTANT sessions only — the live relay. A session becomes "the assistant" the moment
 *    it loads the `assistant` skill (marked by ledger.mjs's Skill branch, one line) or types
 *    the literal /assistant command (marked here, since the Skill event for that same prompt
 *    fires later in the same turn — too late for THIS prompt to see it). For a marked session,
 *    every real prompt (not empty, not a /slash command) is:
 *      - appended to the mastermind's inbox, the same `chat` shape say.mjs's `relay` writes,
 *        with `via: "assistant-hook"` so the log shows the hook did it, not a human step;
 *      - appended to the V3 board as the owner's own card — the same shape say.mjs's `heard`
 *        writes by hand today — so the words are on the owner's screen the instant they submit,
 *        before any model has answered. This replaces `heard`; see .claude/skills/every-prompt/SKILL.md.
 *    Then a 3-line identity refresh prints to stdout, on every prompt, per the owner's own
 *    request that the assistant "refreshes its understanding of who it is" each time.
 *
 * Never throws, never blocks the prompt (no {"decision":"block"} here — this hook only ever
 * adds context or does nothing), exits 0, and stays cheap: no walk of all of public/ like
 * ledger.mjs's — just a handful of directory reads under public/framework/ai/.
 *
 * `run()`/`now()` below are a hand copy of the same-named pieces of
 * .claude/skills/every-prompt/say.mjs, not an import — see task.jsonl decision
 * "reuse-say-copy-not-import" at ai/2026-09-19/prompt-relay/: say.mjs is a CLI entry point
 * whose module body dispatches on process.argv and ends in a bare file read, so importing it
 * into this hook's process risks running that dispatch against the HOOK's own argv. Ten lines,
 * kept in sync by hand if say.mjs's shape ever changes.
 *
 * `LEDGER_ROOT` — the same env var ledger.mjs already honours — relocates the repo root for
 * tests. Both the mastermind-inbox lookup and the V3 board file live under
 * `<root>/public/framework/ai/`, so one override moves both into a scratch tree; see decision
 * "board-path-test-override". Nothing in normal operation sets it. */

const root = path.resolve(process.env.LEDGER_ROOT || path.join(fileURLToPath(import.meta.url), "../../.."));
const AI = path.join(root, "public/framework/ai");
const BOARD = path.join(AI, "v/3/board.jsonl");

const now = () => {
	const d = new Date(), off = -d.getTimezoneOffset(), p = n => String(Math.abs(n)).padStart(2, "0");
	return new Date(d.getTime() + off * 60000).toISOString().slice(0, 19) + (off < 0 ? "-" : "+") + p(Math.trunc(off / 60)) + ":" + p(off % 60);
};

const read = file => fs.readFileSync(file, "utf8").split("\n").flatMap(l => {
	try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; }
});

// Same newline-safety as ledger.mjs's append(): a log the Write tool made has no trailing
// newline, so appending straight on top would glue two JSON objects onto one line.
const append = (file, entry) => {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	let existing = "";
	try { existing = fs.readFileSync(file, "utf8"); } catch {}
	const lead = existing.length && existing.at(-1) !== "\n" ? "\n" : "";
	fs.appendFileSync(file, lead + JSON.stringify(entry) + "\n");
};

// See the big comment above: the whole test is "did Servex start this process" — the owner's
// own interactive session (typed in a terminal or VS Code, never through Servex) has no
// SERVEX_MCP env var at all, which is exactly the session the echo assistant (minion-echo,
// 2026-10-02) exists for. A minion or mastermind's own "reading its brief" is not a prompt to
// refine — it's already-structured requirements, not something the owner typed out loud —
// so this is the gate on both the page write below and the "refined: ..." context line.
// Copied from `reply-relay.mjs`'s own same-named helper, not imported — see that file's doc
// comment on why these two hooks hand-copy small pieces instead.
const started_by_servex = () => Boolean(process.env.SERVEX_MCP);

const SERVEX = () => `http://127.0.0.1:${process.env.SERVEX_PORT || 8090}`;

/* STORAGE REDIRECT (the owner via vscode-mastermind, 2026-10-02, "a session is a page" —
 * public/framework/ai/2026-09-30/proposal-flow/page-item-design.md — THREE corrections landed
 * on the exact path while this was being built; this is the final one, logged in full in this
 * task's task.jsonl): every owner session gets ONE page, a sibling of that day's task dirs and
 * cards, inside the EXISTING year/month/day tree (the same tree `public/framework/ai/2026/09/
 * 25/<slug>/page.jsonl` already uses) — never its own "sessions/" folder (that's only a TAB
 * VIEW, a listing across days, not a storage location) and never the old shared daily file
 * (.claude/prompts/<date>.jsonl, retired: text is never stored twice). Writing a page line is
 * still done BY THIS HOOK, by path, never by an agent generating a tool call with the text as
 * an argument — it just reuses the exact tool `Servex/agents/page_tools.js` already validates
 * and appends through (`page_add`), over Servex's own loopback-only `/mcp` door, which answers
 * a plain JSON-RPC POST from any local process, agent or not (`Servex/MCP.js`'s `post()` — no
 * `?as=` still works, it just means `ctx.caller` is null). `as=owner`/`as=assistant` below are
 * who gets stamped as `by` on the item, not a Servex agent registration.
 *
 * `slug` is a human name for what this session IS ("vscode-mastermind", "minion-echo") — this
 * hook has no way to know that from `session_id` alone, so it defaults to the generic "session"
 * until something with more context (a mastermind, a card, `new-task`) renames the folder; see
 * this task's task.jsonl, decision "generic-slug-default". The day and slug, once picked, are
 * cached in a per-session marker so every later prompt in the SAME session (even across
 * midnight) keeps landing in the SAME folder — the day is "when this session started", not
 * "today". */
const session_marker_file = sid => path.join(os.tmpdir(), `claude-session-page-${String(sid).replace(/[^\w-]/g, "_")}`);
function session_page_url(session_id, { day } = {}){
	const marker = session_marker_file(session_id);
	let use_day, slug;
	try {
		const cached = JSON.parse(fs.readFileSync(marker, "utf8"));
		if (cached?.day && cached?.slug){ use_day = cached.day; slug = cached.slug; }
	} catch {}
	if (!use_day){
		use_day = day || now().slice(0, 10);
		slug = "session";
		try { fs.writeFileSync(marker, JSON.stringify({ day: use_day, slug })); } catch {}
	}
	return `/framework/ai/${use_day.replaceAll("-", "/")}/${slug}-${session_id.slice(0, 8)}/`;
}

async function mcp_call(name, args, as){
	try {
		const res = await fetch(`${SERVEX()}/mcp?as=${encodeURIComponent(as)}`, {
			method: "POST", headers: { "content-type": "application/json" },
			body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
			signal: AbortSignal.timeout(4000),
		});
		const body = await res.json();
		const text = body?.result?.content?.[0]?.text;
		return text ? JSON.parse(text) : null;
	} catch { return null; }   // Servex down or restarting — this prompt just isn't stored this time
}

// Tell Servex a new item landed on this session's page — never the text itself, which is
// already sitting on disk; Servex reads it back by `item_id` when it's ready.
const notify_echo = async (type, session_id, page, item_id) => {
	try {
		await fetch(`${SERVEX()}/log/echo`, {
			method: "POST", headers: { "content-type": "application/json" },
			body: JSON.stringify({ type, session_id, page, item_id }),
			signal: AbortSignal.timeout(1500),
		});
	} catch {}
};

// THE VS CODE / CLI PATH (point 2 of minion-echo's brief, the owner via vscode-mastermind,
// 2026-10-02): a session that is NOT a Servex mastermind has no "wake the parent when a turn
// ends" mechanism to lean on, so it has to be told some other way, and the one place every
// session's own next turn already reads free text is THIS hook's own stdout. Before printing
// the identity-refresh block below, check this session's OWN page.jsonl for a `content/<id>`
// line carrying `done: true` that hasn't been shown yet, and say so in one line — no tool
// call, no polling. A tiny marker file (one per session) remembers the last item id shown.
const echo_marker = sid => path.join(os.tmpdir(), `claude-echo-seen-${String(sid).replace(/[^\w-]/g, "_")}`);
function echo_context_line(session_id){
	const page_url = session_page_url(session_id);   // reads the cached {day, slug} marker, writes nothing new
	const file = path.join(root, "public", page_url.replace(/^\/+/, ""), "page.jsonl");
	let lines;
	try { lines = read(file); } catch { return null; }
	let seen = null;
	try { seen = fs.readFileSync(echo_marker(session_id), "utf8").trim() || null; } catch {}
	for (let i = lines.length - 1; i >= 0; i--){
		const at = lines[i].at;
		if (typeof at !== "string" || !at.startsWith("content/") || !lines[i].done) continue;
		const id = at.slice("content/".length);
		if (id === seen) return null;   // already told them about this one
		try { fs.writeFileSync(echo_marker(session_id), id); } catch {}
		const asks = lines[i].asks?.length ?? 0, flags = lines[i].flags_count ?? 0;
		return `refined: ${session_page_url(session_id)} #${id} — ${asks} ask${asks === 1 ? "" : "s"}, ${flags} flag${flags === 1 ? "" : "s"}.`;
	}
	return null;
}

// The newest unlanded ai/<date>/mastermind-*/task.jsonl — copied from say.mjs's run().
function mastermind_inbox() {
	let days;
	try { days = fs.readdirSync(AI).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse(); } catch { return null; }
	for (const day of days) {
		let slugs;
		try { slugs = fs.readdirSync(path.join(AI, day)).filter(s => s.startsWith("mastermind-")).sort().reverse(); } catch { continue; }
		for (const slug of slugs) {
			const file = path.join(AI, day, slug, "task.jsonl");
			if (!fs.existsSync(file)) continue;
			const state = Object.assign({}, ...read(file).filter(e => e.assign).map(e => e.assign));
			if (!state.landed_at) return file;
		}
	}
	return null;
}

// The same marker ledger.mjs's Skill branch writes on `tool_input.skill === "assistant"`.
// A mastermind session never calls that skill, so it is structurally never marked — see
// decision "mastermind-never-marked".
const marker = sid => path.join(os.tmpdir(), `claude-assistant-${String(sid).replace(/[^\w-]/g, "_")}`);
const mark_assistant = sid => { try { fs.writeFileSync(marker(sid), ""); } catch {} };
const is_assistant = sid => { try { return fs.existsSync(marker(sid)); } catch { return false; } };

// A best-effort heuristic, not a scanner: common key/token shapes, checked line by line so a
// multi-line paste with one bad line still withholds the whole prompt rather than half-logging it.
const SECRET_PATTERNS = [
	/-----BEGIN[ A-Z]*PRIVATE KEY-----/,
	/\b(AKIA|ASIA)[0-9A-Z]{16}\b/, // AWS access key id
	/\bsk-(ant-|proj-)?[A-Za-z0-9_-]{16,}\b/, // Anthropic / OpenAI style secret keys
	/\bgh[pousr]_[A-Za-z0-9]{20,}\b/, // GitHub tokens
	/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, // Slack tokens
	/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/, // JWT
	/\b(api[_-]?key|secret|token|password|passwd)\b\s*[:=]\s*["']?[A-Za-z0-9_\-/+]{12,}/i, // "key: <blob>"
];
const looks_like_secret = text => String(text).split(/\r?\n/).some(line => SECRET_PATTERNS.some(re => re.test(line)));
const WITHHELD = "[withheld: looked like a secret]";

const is_slash = text => /^\s*\//.test(text);

const stdin = () => new Promise(resolve => {
	if (process.stdin.isTTY) return resolve("");
	let s = "";
	process.stdin.setEncoding("utf8");
	process.stdin.on("data", d => s += d);
	process.stdin.on("end", () => resolve(s));
	process.stdin.on("error", () => resolve(""));
});

const run = async () => {
	let input = {};
	try { input = JSON.parse(await stdin()) || {}; } catch {}
	const session_id = input.session_id;
	const prompt = typeof input.prompt === "string" ? input.prompt : "";
	if (!session_id) return;

	// The Skill(assistant) PostToolUse event that also marks this session fires LATER in this
	// same turn — too late for the /assistant prompt itself to see it, so mark here too.
	if (/^\s*\/(assistant|every-prompt)\b/i.test(prompt)) mark_assistant(session_id);   // the skill was renamed every-prompt on 2026-09-19; both names mark

	const assistant = is_assistant(session_id);
	const trimmed = prompt.trim();
	const secret = trimmed && looks_like_secret(prompt);
	const safe_text = secret ? WITHHELD : prompt;

	// 1. THE OWNER'S OWN interactive session only (never a minion or mastermind's — their
	//    transcripts are archived a different way, the parent task's "Session records" note):
	//    the prompt becomes one item on that session's own page, public/framework/ai/sessions/
	//    <session_id>/page.jsonl, via the SAME validated tool a live tab would use (page_add,
	//    Servex/agents/page_tools.js) — never a second file, per the storage redirect above.
	const owner_interactive = trimmed && !started_by_servex();
	let page_url = null, prompt_item_id = null;
	if (owner_interactive) {
		page_url = session_page_url(session_id);
		const out = await mcp_call("page_add", { path: page_url, item: { type: "Prompt", text: safe_text, redacted: secret || undefined } }, "owner");
		prompt_item_id = out?.ok ? out.id : null;
	}

	// 1b. Tell Servex where this item landed, never the text itself, so the per-session echo
	//     assistant (Servex/agents/Echo.js) can read it from the page in place when it's
	//     ready. Skipped for a withheld secret (nothing worth refining survived the redaction)
	//     and for a /slash command (how the tool was driven, not something the owner said).
	if (owner_interactive && prompt_item_id && !secret && !is_slash(trimmed)) {
		await notify_echo("prompt", session_id, page_url, prompt_item_id);
	}

	// 2. Assistant sessions only: relay to the mastermind + show on the owner's screen.
	//    Skip empty prompts and /slash commands (the /assistant trigger itself included) —
	//    those are not something the owner said, they are how the tool was driven.
	if (assistant && trimmed && !is_slash(trimmed)) {
		try {
			const inbox = mastermind_inbox();
			if (inbox) append(inbox, { chat: { at: now(), from: "owner", via: "assistant-hook", session_id, msg: safe_text } });
		} catch {}
		try {
			append(BOARD, {
				card: { at: now(), id: "o-" + now().slice(11, 19).replaceAll(":", ""), author: "owner", session: session_id, title: safe_text.slice(0, 90), text: safe_text },
			});
		} catch {}
	}

	// 3. Assistant sessions only: the identity refresh, every prompt, so the model never has
	//    to remember what it is or that this hook already did the relay it might otherwise redo.
	if (assistant) {
		console.log([
			// ⚠ The assistant skill tells the assistant to look for this exact prefix: its presence
			//   means THIS hook already echoed and relayed the prompt, so `heard` must be skipped.
			"prompt-relay: this prompt was already echoed to the owner's log and relayed to the mastermind's inbox.",
			"You are the assistant: a fast front desk for the mastermind, not a builder. Read no code; decide nothing that is the mastermind's to decide.",
			'Run this first, always: node .claude/skills/every-prompt/say.mjs say "<your answer, one sentence>" "<one to three more sentences>"',
			"Your words were already relayed to the mastermind and shown on the owner's screen by this hook -- do not call heard or relay again, just answer with say.",
		].join("\n"));
	}

	// 4. The owner's own interactive session, no polling: if the echo assistant finished
	//    refining an EARLIER prompt since this session's last turn, say so in one line — the
	//    "VS Code mastermind" path (minion-echo, 2026-10-02): a session Servex isn't hosting has
	//    no "wake the parent" mechanism to lean on, so this hook's own stdout (added to this
	//    turn's context on exit 0) is the cheapest way to tell it without a tool call.
	if (owner_interactive) {
		try {
			const line = echo_context_line(session_id);
			if (line) console.log(line);
		} catch {}
	}
};

try { await run(); } catch {}
process.exit(0);

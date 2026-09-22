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
 * 1. EVERY session — a private transcript. Append the prompt, verbatim, to
 *    .claude/prompts/<day>.jsonl (git-ignored, outside public/ so it never reaches the LAN
 *    and never touches a served page's cache). This is the owner's "my words should be
 *    transcribed in real time" — one greppable file per day, author always "owner" (that is
 *    who types into Claude Code; an agent's own turns are not prompts).
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
const PROMPTS_DIR = path.join(root, ".claude/prompts");

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
	let lead = "";
	try { const b = fs.readFileSync(file); if (b.length && b.at(-1) !== 10) lead = "\n"; } catch {}
	fs.appendFileSync(file, lead + JSON.stringify(entry) + "\n");
};

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

	// 1. Every session: the private transcript.
	if (trimmed) {
		try {
			const day = now().slice(0, 10);
			append(path.join(PROMPTS_DIR, `${day}.jsonl`), {
				prompt: { at: now(), session_id, author: "owner", text: safe_text },
			});
		} catch {}
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
};

try { await run(); } catch {}
process.exit(0);

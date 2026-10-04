import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* reply-relay.mjs — the Stop hook that logs the owner's side of the chat too (2026-10-02).
 *
 * `prompt-relay.mjs` (the UserPromptSubmit hook) already writes every prompt the owner types
 * into an INTERACTIVE Claude Code session, verbatim, onto that session's own page — a sibling
 * of that day's task dirs and cards, inside the existing year/month/day tree
 * (public/framework/ai/2026/09/25/<slug>/page.jsonl is the same tree an ordinary dated page
 * already uses) — "a session is a page", public/framework/ai/2026-09-30/proposal-flow/
 * page-item-design.md (three corrections landed on the exact path; see minion-echo's
 * task.jsonl for all of them). This hook is the other half: when that same session's turn
 * ENDS, find the assistant's own final reply in the transcript Claude Code already wrote, and
 * add it as a sibling item on the SAME page, so a prompt and its reply pair up by order and
 * time (originally deliverable 6; storage retargeted 2026-10-02).
 *
 * WHOSE sessions does this run for? Claude Code fires the Stop hook for every session that ends
 * a turn — the owner's own interactive one, AND a Servex-spawned minion's (this very file was
 * built by one). Only the owner's matters here: a minion's "reply" is its own work, already
 * reported on its task card, not something that belongs beside the owner's own words.
 *
 * THE TEST, and why it is NOT the brief's first idea: the brief's own suggestion was "does
 * today's `.claude/prompts/<day>.jsonl` already hold an `author: 'owner'` line for this
 * session_id" (on the theory that `prompt-relay.mjs` only logs that for an interactive session, a
 * minion's one-shot launch never firing `UserPromptSubmit`). Tried by hand, on THIS very session
 * (a minion), before trusting it: today's file already held exactly such a line for this minion's
 * own session_id — Servex launches a minion with its whole brief as an ordinary first prompt, so
 * `UserPromptSubmit` DOES fire, and `prompt-relay.mjs` DOES stamp it "owner" (that hook only ever
 * asks "who types into Claude Code", never "is this really the human"). That heuristic would have
 * logged this minion's own replies as if they were the owner's.
 *
 * The signal used instead: `process.env.SERVEX_MCP`. `Servex/agents/Agents.js` sets it ONLY on
 * the environment of a process IT spawns (`env: { ...process.env, SERVEX_MCP: url, … }`) — the
 * owner's own interactive session is started by hand, outside Servex, and never has it (the
 * project's `.mcp.json` reaches Servex over a fixed `servex.localhost` hostname instead, which
 * every session can use without this variable). A Stop hook's own process inherits whatever
 * environment the `claude` process it is hooking was started with, so this single env var read
 * says, cheaply and correctly, "was THIS session started by Servex" — the actual question —
 * rather than guessing from a log line that answers a different one.
 *
 * Never throws, never blocks the stop (no `{"decision":"block"}`, no stdout at all — unlike
 * `prompt-relay.mjs`'s identity-refresh text, there is nothing useful to print back INTO a turn
 * that has already ended), exits 0.
 *
 * `now()`/`append()`/the secret-redaction list below are a hand copy of
 * `prompt-relay.mjs`'s own same-named pieces, not an import — that file's own comment explains
 * why (its module body ends in a bare top-level `run()` + `process.exit(0)`, so importing it
 * would run THAT dispatch against THIS hook's stdin). Ten-odd lines, kept in sync by hand if
 * `prompt-relay.mjs`'s shape ever changes. */

const root = path.resolve(process.env.LEDGER_ROOT || path.join(fileURLToPath(import.meta.url), "../../.."));
const SERVEX = () => `http://127.0.0.1:${process.env.SERVEX_PORT || 8090}`;

const now = () => {
	const d = new Date(), off = -d.getTimezoneOffset(), p = n => String(Math.abs(n)).padStart(2, "0");
	return new Date(d.getTime() + off * 60000).toISOString().slice(0, 19) + (off < 0 ? "-" : "+") + p(Math.trunc(off / 60)) + ":" + p(off % 60);
};

// STORAGE REDIRECT (minion-echo, 2026-10-02, "a session is a page" — see prompt-relay.mjs's
// own identical copy of this comment, with the full reasoning): the reply becomes one item on
// the SAME session page prompt-relay.mjs already writes the prompt onto — public/framework/ai/
// <YYYY-MM-DD>/sessions/<slug>-<first 8 of the session uuid>/page.jsonl, filed by the day the
// session STARTED, never a second file. Copied here, not imported — this module's own top
// comment explains why every small piece here is a hand copy.
//
// This hook, unlike prompt-relay.mjs, DOES get `transcript_path` — so on the first reply for a
// session with no cached marker yet, it reads the transcript's own FIRST line for the real
// start day, rather than guessing "today" (prompt-relay.mjs's own fallback, used only if ITS
// hook happens to run first and nothing has cached a day yet).
const session_marker_file = sid => path.join(os.tmpdir(), `claude-session-page-${String(sid).replace(/[^\w-]/g, "_")}`);
function transcript_start_day(transcript_path){
	try {
		const first = fs.readFileSync(transcript_path, "utf8").split("\n").find(l => l.trim());
		return JSON.parse(first)?.timestamp?.slice(0, 10) ?? null;
	} catch { return null; }
}
function session_page_url(session_id, { transcript_path } = {}){
	const marker = session_marker_file(session_id);
	let use_day, slug;
	try {
		const cached = JSON.parse(fs.readFileSync(marker, "utf8"));
		if (cached?.day && cached?.slug){ use_day = cached.day; slug = cached.slug; }
	} catch {}
	if (!use_day){
		use_day = transcript_start_day(transcript_path) || now().slice(0, 10);
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
	} catch { return null; }
}

// Tell Servex where the reply landed — never the text itself.
const notify_echo = async (type, session_id, page, item_id) => {
	try {
		await fetch(`${SERVEX()}/log/echo`, {
			method: "POST", headers: { "content-type": "application/json" },
			body: JSON.stringify({ type, session_id, page, item_id }),
			signal: AbortSignal.timeout(1500),
		});
	} catch {}
};

// Same best-effort secret scrub prompt-relay.mjs applies to the owner's own prompts — the
// assistant's reply can just as easily echo back a pasted key, and it lands in the same file.
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

const stdin = () => new Promise(resolve => {
	if (process.stdin.isTTY) return resolve("");
	let s = "";
	process.stdin.setEncoding("utf8");
	process.stdin.on("data", d => s += d);
	process.stdin.on("end", () => resolve(s));
	process.stdin.on("error", () => resolve(""));
});

// See the big comment above: the whole test is "did Servex start this process".
const started_by_servex = () => Boolean(process.env.SERVEX_MCP);

// The LAST assistant text message in the transcript — never a sidechain (a sub-agent's own turn,
// mixed into the same file), because that is not the reply the owner read at the end of THEIR
// turn. A message can carry more than one text block (rare); they join in order.
function last_assistant_text(transcript_path) {
	let lines;
	try { lines = fs.readFileSync(transcript_path, "utf8").split("\n"); } catch { return null; }
	for (let i = lines.length - 1; i >= 0; i--) {
		const line = lines[i].trim();
		if (!line) continue;
		let entry;
		try { entry = JSON.parse(line); } catch { continue; }
		if (entry.isSidechain) continue;
		if (entry.type !== "assistant" || !Array.isArray(entry.message?.content)) continue;
		const texts = entry.message.content.filter(c => c.type === "text" && typeof c.text === "string" && c.text.trim());
		if (texts.length) return texts.map(t => t.text.trim()).join("\n\n");
	}
	return null;
}

const run = async () => {
	let input = {};
	try { input = JSON.parse(await stdin()) || {}; } catch {}
	const session_id = input.session_id;
	const transcript_path = input.transcript_path;
	if (!session_id || !transcript_path) return;

	if (started_by_servex()) return;   // a Servex agent/minion, not the owner's own interactive session — skip

	const text = last_assistant_text(transcript_path);
	if (!text) return;   // nothing to log — e.g. a turn that only ran tools and never spoke

	const secret = looks_like_secret(text);
	const safe_text = secret ? WITHHELD : text;
	const page_url = session_page_url(session_id, { transcript_path });
	const out = await mcp_call("page_add", { path: page_url, item: { type: "Reply", text: safe_text, redacted: secret || undefined } }, "assistant");
	const item_id = out?.ok ? out.id : null;

	// Tell Servex where this reply landed (minion-echo, 2026-10-02): the per-session echo
	// assistant reads the text back from the page in place when it is ready, so the
	// assistant's own reply never has to travel through a tool call argument either.
	if (item_id && !secret) await notify_echo("reply", session_id, page_url, item_id);
};

try { await run(); } catch {}
process.exit(0);

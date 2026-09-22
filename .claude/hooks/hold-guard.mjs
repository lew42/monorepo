import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { peek, add } from "../../Server/hold.mjs";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");

/* THE HOLD GUARD (2026-09-19) — the sibling of syntax-guard.mjs and health-guard.mjs that
 * catches the trap named in Server/doc/watch.md's last section: an agent takes the reload
 * hold (`Server/hold.mjs on "<who> — <what>"`), goes away for a few minutes doing something
 * else, and the hold's own deliberate self-expiry (5 minutes by default — see hold.mjs's own
 * header) lapses it with nothing telling anyone. The agent's next write then goes out UNHELD
 * and the owner's live site can 404 for real, which is exactly what happened tonight
 * (public/framework/ai/2026-09-19/hold-guard/requirements.md tells the story).
 *
 * The self-expiry itself is correct and stays untouched — a hold that could never lapse would
 * be worse (it could stick forever and block every reload). The fix is only to notice, at the
 * moment it matters (the next write), that THIS agent's own hold has lapsed since it was taken,
 * and act: renew it silently and say so once, rather than let the agent find out from a 404.
 *
 * Two halves, because the CLI (`node Server/hold.mjs on …`) runs as a plain Bash command, not
 * an Edit/Write/NotebookEdit — the only place this repo can see "who just took a hold" is a
 * PostToolUse hook on the Bash tool, which is NOT wired in .claude/settings.json today (adding
 * that wiring is the owner's call — see Server/doc/watch.md and this task's landing report for
 * the exact line). Until it is wired, `record()` below simply never runs, and `check()` — which
 * IS reachable today, imported by ledger.mjs exactly like syntax-guard.mjs and health-guard.mjs
 * — always finds no record for the writing agent and does nothing. That is the safe default:
 * no record of ever holding is treated exactly like never having held, never like a lapse.
 *
 * record(command, agent_key) — call this from a PostToolUse hook on the Bash tool. Recognises
 *   `node Server/hold.mjs on "<who> — <what>"` and `... off <who>` in the command string and
 *   remembers, per agent, which `who` it is currently responsible for. The record lives in the
 *   OS temp dir — cheap, per-machine, outside public/, exactly like health-guard.mjs's own
 *   per-agent state (never git-committed, never read by anything else).
 *
 * check(file, agent_key) — call this on every Edit/Write/NotebookEdit, same signature as
 *   health_guard. Does nothing unless: (a) the file is under public/ — only a site write can
 *   ever 404 for a reader; (b) this agent has a recorded `who` it took and has not deliberately
 *   released. Given both, it asks hold.mjs's own `peek()` for the TRUTH on disk right now:
 *     - that `who` is listed and not expired  → still genuinely held → do nothing (outcome 3).
 *     - that `who` is missing or expired      → lapsed → renew it (`add()`, same `who`/`what`,
 *       same TTL hold.mjs would use on its own) and print ONE line the agent cannot miss.
 *   Renewing, not warning, because an agent still writing plainly still wants the hold — the
 *   decision this task's task.jsonl records, and its stated alternative: an agent that finished
 *   and forgot to release would then hold the lock indefinitely through some unrelated later
 *   write. That risk already exists today without this hook (a forgotten hold sits until its
 *   own 5-minute TTL regardless), and a hold list a stray write can renew but never can EXTEND
 *   past the next legitimate gap is a smaller risk than a live-site 404 — renewal only ever
 *   happens on a write that already carries this agent's own recorded `who`, never a stranger's.
 *
 * Never throws; both functions are wrapped, matching every other hook in this directory. */

function state_path(agent_key){
	return path.join(os.tmpdir(), `claude-hold-${String(agent_key).replace(/[^\w-]/g, "_")}.json`);
}

function read_state(p){
	try {
		const s = JSON.parse(fs.readFileSync(p, "utf8"));
		return { who: s.who || null, what: s.what || "", released: !!s.released };
	} catch { return { who: null, what: "", released: false }; }
}

function write_state(p, state){
	try { fs.writeFileSync(p, JSON.stringify(state)); } catch {}
}

// null outside the repo, forward slashes — same rule ledger.mjs's own rel() uses.
function rel(file){
	const r = path.relative(root, path.resolve(file));
	return !r || r.startsWith("..") || path.isAbsolute(r) ? null : r.split(path.sep).join("/");
}

// A best-effort read of the CLI's own `on "<who> — <what>"` / `off <who>` shape (hold.mjs's cli()
// parses the identical em-dash separator). A command this doesn't recognise is simply ignored —
// this function only ever ADDS information, never removes a record some other match already set.
export function record(command, agent_key){
	try {
		if (!command || !agent_key || !/hold\.mjs/.test(command)) return;
		const sp = state_path(agent_key);

		const on = command.match(/hold\.mjs\s+on\s+"([^"]+)"/);
		if (on) {
			const raw = on[1];
			const sep = raw.indexOf(" — ");   // em dash, same separator hold.mjs's own cli() splits on
			const who = (sep === -1 ? raw : raw.slice(0, sep)).trim();
			const what = (sep === -1 ? "" : raw.slice(sep + 3)).trim();
			if (who) write_state(sp, { who, what, released: false });
			return;
		}

		const off = command.match(/hold\.mjs\s+off\b/);
		if (off) {
			const rec = read_state(sp);
			if (rec.who) write_state(sp, { ...rec, released: true });   // a deliberate release, not a lapse
		}
	} catch {}
}

export default function check(file, agent_key){
	try {
		if (!file || !agent_key) return;
		const r = rel(file);
		if (!r || !r.startsWith("public/")) return;   // only a site file can ever 404 for a reader

		const sp = state_path(agent_key);
		const rec = read_state(sp);
		if (!rec.who || rec.released) return;   // never took a hold, or let it go on purpose — outcome 2

		const mine = peek().find(h => h.who === rec.who);
		if (mine && !mine.expired) return;   // genuinely still held — outcome 3, do nothing

		// Lapsed: pruned off the list already, or still listed but past `until` — outcome 1.
		const state = add(rec.who, rec.what);
		const fresh = state.holders.find(h => h.who === rec.who);
		const secs = fresh ? Math.round((fresh.until - Date.now()) / 1000) : 0;
		console.log(JSON.stringify({
			decision: "block",
			reason: `RELOAD HOLD RENEWED: your hold "${rec.who}" had lapsed (Server/hold.mjs's own 5-minute self-expiry) before this write to ${r} went out — it has been silently re-taken for another ${secs}s so this write queues instead of reloading. If this batch is actually finished, release it now: node Server/hold.mjs off "${rec.who}"`,
		}));
	} catch {}
}

// ── CLI (the missing PostToolUse-on-Bash half — see the header) ───────────
const is_main = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (is_main) main();

async function main(){
	let raw = "";
	try {
		process.stdin.setEncoding("utf8");
		for await (const chunk of process.stdin) raw += chunk;
	} catch {}
	try {
		const input = JSON.parse(raw || "{}");
		if (input.tool_name === "Bash") record(input.tool_input?.command, input.agent_id || input.session_id);
	} catch {}
	process.exit(0);
}

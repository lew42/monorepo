import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(import.meta.url), "../../..");

/* THE HEALTH GUARD (2026-09-19) — the sibling of syntax-guard.mjs that catches the
 * mistakes `node --check` cannot: a file that PARSES fine but breaks a page at
 * runtime (a wrong import path, a null the page never expected, a class the
 * page.js constructor collides with). `Server/health.mjs` is the watcher that
 * finds these — headless-loading the pages a change could affect and writing
 * what it saw to `public/framework/ai/health/<date>.jsonl`. This file is the
 * other half: at an agent's NEXT write, it checks whether anything IT wrote
 * earlier just came back broken, and if so, says so at once, in the one
 * channel an agent cannot miss (a PostToolUse "block" fed straight back to it).
 *
 * Why this can't just watch every finding for every file: an agent needs to
 * hear about ITS OWN breakage, not a sibling's — five agents can be editing
 * the site at once. So a tiny per-agent file in the OS temp dir remembers
 * which files this agent has written and when; this function only reports an
 * error whose `at` is NEWER than that agent's own write to that file, and
 * only once per (file, error) pair ever.
 *
 * It lives in its own file, imported inside a try in ledger.mjs, exactly like
 * syntax-guard.mjs — a mistake HERE can never take the ledger hook down with
 * it. Never throws; does at most one small file read (the log's last 64KB,
 * no Playwright) and one small file read+write (this agent's own state) — well
 * under the ~50ms budget the brief asks for. */
const TAIL_BYTES = 64 * 1024;
const MAX_REPORTED = 200;   // this agent's own "already told you" list, capped so the state file never grows

const pad2 = n => String(n).padStart(2, "0");
function local_date(d = new Date()){ return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }

// null outside the repo — same rule ledger.mjs's own rel() uses.
function rel(file){
	const r = path.relative(root, path.resolve(file));
	return !r || r.startsWith("..") || path.isAbsolute(r) ? null : r.split(path.sep).join("/");
}

function state_path(agent_key){
	return path.join(os.tmpdir(), `claude-health-${String(agent_key).replace(/[^\w-]/g, "_")}.json`);
}

function read_state(p){
	try {
		const s = JSON.parse(fs.readFileSync(p, "utf8"));
		return { files: s.files && typeof s.files === "object" ? s.files : {}, reported: Array.isArray(s.reported) ? s.reported : [] };
	} catch { return { files: {}, reported: [] }; }
}

function write_state(p, state){
	if (state.reported.length > MAX_REPORTED) state.reported = state.reported.slice(-MAX_REPORTED);
	try { fs.writeFileSync(p, JSON.stringify(state)); } catch {}
}

// Only the tail — a day file can grow to 2MB, and this must cost ~nothing.
function tail_findings(day_file){
	let stat; try { stat = fs.statSync(day_file); } catch { return []; }
	if (!stat.size) return [];
	const start = Math.max(0, stat.size - TAIL_BYTES);
	let buf;
	try {
		const fd = fs.openSync(day_file, "r");
		buf = Buffer.alloc(stat.size - start);
		fs.readSync(fd, buf, 0, buf.length, start);
		fs.closeSync(fd);
	} catch { return []; }
	const out = [];
	for (const line of buf.toString("utf8").split("\n")){
		if (!line.trim()) continue;
		try { const e = JSON.parse(line); if (e.error) out.push(e.error); } catch {}   // a torn first line (we started mid-line) just fails to parse — fine, it's dropped
	}
	return out;
}

/**
 * file — the path this agent just wrote (Edit/Write's `file_path`).
 * agent_key — `agent_id ?? session_id`, whichever ledger.mjs already resolved this event to.
 */
export default function health_guard(file, agent_key){
	try {
		if (!file || !agent_key) return;
		const r = rel(file);
		if (!r) return;

		const sp = state_path(agent_key);
		const state = read_state(sp);
		const now = Date.now();

		const day_file = path.join(root, "public", "framework", "ai", "health", `${local_date()}.jsonl`);
		const findings = tail_findings(day_file);

		// This agent's own previously-written files, oldest write time each —
		// only an error strictly AFTER that write is "you broke it", never one
		// from before the agent ever touched the file.
		for (const [written_file, written_at] of Object.entries(state.files)){
			const written_ms = Date.parse(written_at);
			if (!Number.isFinite(written_ms)) continue;

			for (const err of findings){
				const touched = err.files?.includes(written_file) || err.file === written_file;
				if (!touched) continue;
				const err_ms = Date.parse(err.at);
				if (!Number.isFinite(err_ms) || err_ms <= written_ms) continue;

				const key = `${err.at}|${written_file}|${err.url}`;
				if (state.reported.includes(key)) continue;

				/* ⚠ HAS THE FILE BEEN FIXED SINCE? A finding is evidence about the file as
				   it stood at `err.at`, not about the file now. Blocking without this check
				   has misfired twice: 2026-09-19 it refused a write citing a 404 fixed 700
				   seconds earlier, and 2026-09-21 it refused one citing a `go_timeline is
				   not defined` from 17:33:59 that a 17:42:01 edit had already resolved — the
				   page was healthy on all four entry points when the block landed 42 minutes
				   later. A guard that refuses work on stale evidence teaches agents to ignore
				   it, which is worse than no guard.

				   Deliberately an mtime comparison, not a re-fetch: a hook runs inside the
				   agent's write and must not do network I/O it could hang on. If the newer
				   write ALSO broke the page, the watcher logs a new finding with a newer
				   `at`, and that one blocks — so this can only drop evidence that is
				   genuinely out of date, never evidence that still stands. The key is still
				   recorded, so a stale finding cannot come back and nag on the next write. */
				let fixed_since = false;
				try { fixed_since = fs.statSync(written_file).mtimeMs > err_ms; } catch {}
				if (fixed_since) {
					state.reported.push(key);
					write_state(sp, state);
					continue;
				}

				state.reported.push(key);
				write_state(sp, { ...state, files: { ...state.files, [r]: new Date(now).toISOString() } });

				const secs = Math.max(0, Math.round((now - err_ms) / 1000));
				console.log(JSON.stringify({
					decision: "block",
					reason: `HEALTH CHECK: you broke ${err.url} ${secs}s ago editing ${written_file} — ${err.kind}: ${err.text} Fix it before anything else, then check ${err.url} again.`,
				}));
				return;   // one finding at a time — the next write reports the next one, if any
			}
		}

		state.files[r] = new Date(now).toISOString();
		write_state(sp, state);
	} catch {}
}

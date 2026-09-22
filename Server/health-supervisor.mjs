/* `node Server/health-supervisor.mjs` — keeps Server/health.mjs alive, the
 * same way `server.js` at the repo root keeps the dev server alive: fork it
 * as a child, notice when it dies, and bring it straight back.
 *
 * WHY THIS EXISTS (health-revive, 2026-09-19): health.mjs was found dead —
 * its own lock file named a pid that no longer existed, and nothing had ever
 * restarted it. A watcher nobody restarts is worse than no watcher, because
 * everyone believes the pages are covered. This file is the fix: it is the
 * one thing that must itself stay running for the safety net to mean
 * anything, so it is deliberately as small and boring as the job allows.
 *
 * WHY A SEPARATE FILE, NOT A CHANGE TO server.js's OWN SUPERVISOR: two
 * reasons, one about the task and one about the design.
 *   (1) This task's fence does not allow editing Server/server.js.
 *   (2) Even without that fence, sharing a process would be wrong: health.mjs's
 *       own top comment promises "kill THIS process any time and nothing else
 *       even notices" — bolting its supervision onto the dev server's own
 *       supervisor would make the health watcher's fate depend on the dev
 *       server's, which is exactly the coupling that promise rules out.
 * The MECHANISM is reused on purpose, not reinvented: fork the real work as a
 * child (`spawn_child` below mirrors `server.js`'s `spawn_live`), restart it
 * the moment it exits, treat a crash within its own first second as "never
 * really up" so a broken tree backs off instead of crash-looping, bound every
 * kill by a deadline with a hard `taskkill` escalation so nothing can ever
 * wedge, and run a periodic watchdog backstop in case some path above ever
 * fails to notice on its own. Full pattern, and the outage that motivated the
 * bounded-kill half of it: Server/doc/watch.md.
 *
 * WHAT THIS FILE DELIBERATELY DROPS FROM THAT PATTERN: server.js's supervisor
 * boot-tests a CANDIDATE on a spare port before ever touching the live child,
 * because swapping in a server that throws at boot would otherwise take the
 * whole site down. health.mjs opens no port and serves nobody — the worst a
 * bad restart can do is leave the watcher briefly not watching, which the
 * watchdog below already catches — so there is nothing to boot-test against,
 * and adding that whole dance here would be exactly the over-building the
 * project's "less is more" rule warns against.
 *
 * THE HEARTBEAT — the actual fix for "a stale lock file that nobody reads."
 * Every HEARTBEAT_MS this writes public/framework/ai/health/heartbeat.json:
 * this supervisor's own pid, the current child's pid, how many times it has
 * restarted the child, and (on a restart) why the last one died. It is a
 * `.json` file on purpose — both this repo's dev-server watcher (Server/watch.js)
 * and health.mjs's own watcher explicitly ignore `.json` writes, so a
 * heartbeat can never feed back into a check of itself. Two pages read it
 * live, both already somewhere a reader lands (the brief's "reachable"
 * requirement): this task's own page.js, and public/framework/ai/health/page.js.
 *
 * HOW IT SURVIVES THE END OF THE TASK THAT STARTED IT: started detached (see
 * this task's own task.jsonl for the exact command), so it is not a child of
 * any particular terminal or CLI session — closing the shell that launched it
 * does not touch it. It keeps running until something sends it SIGTERM/SIGINT
 * by its own pid, or the machine restarts. To stop it on purpose: read the
 * pid from the heartbeat file's `supervisor_pid` and kill that pid — killing
 * only the child (`child_pid`) just gets it restarted, which is correct: that
 * is the whole point of a supervisor.
 *
 * WATCHING health.mjs ITSELF (health-quiet, 2026-09-19): before this, a fix
 * saved to health.mjs sat inert until someone killed the running child by
 * hand — the exact trap that left a correct fix for two noisy rules unable
 * to take effect, because killing that child needed a permission this
 * session did not have. Same shape as server.js's own Server/ watch, scaled
 * down to the one file this process actually cares about: an `MtimeFilter`
 * (server.js's own fix for "a plain file READ fires a Windows 'change' event
 * too" — Server/doc/watch.md) plus a 500ms debounce (server.js's own number),
 * `node --check` before ever touching the live child (a file that doesn't
 * even PARSE must never take down a working watcher), and no boot-test dance
 * beyond that — the reasoning two paragraphs up (nothing to boot-test against)
 * still holds. A file that parses but throws at RUN time still can't leave two
 * children running or the watcher dark: the exit handler already treats any
 * child exit as "gone, respawn," so a deliberate cycle rides that same path.
 * ⚠ THIS WATCH ITSELF CANNOT UPGRADE A SUPERVISOR ALREADY RUNNING — same as
 * server.js's own "saving server.js does not upgrade a supervisor already
 * running" warning. Whoever is running right now started before this code
 * existed and has no way to know to watch for it; it takes effect only after
 * this supervisor process itself is restarted once by hand.
 */
import { fork, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MtimeFilter from "./MtimeFilter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const HEALTH_SCRIPT = path.join(__dirname, "health.mjs");
const HEARTBEAT_PATH = path.join(ROOT, "public", "framework", "ai", "health", "heartbeat.json");

// Same default as health.mjs's own — decision health-watch-target in this
// task's task.jsonl. Set once here so it shows up in `ps`/Task Manager
// command lines too, not just as an invisible fallback inside health.mjs.
const HEALTH_BASE = process.env.HEALTH_BASE || "http://localhost:80";

const HEARTBEAT_MS = 10_000;      // how often the heartbeat file is refreshed while a child is up
const BOOT_GRACE_MS = 1500;       // dying before this counts as "never really up" — same idea as server.js's BOOT_GRACE_MS
const KILL_DEADLINE_MS = 3000;    // same bounded-kill deadline as server.js's supervisor
const WATCHDOG_MS = 5000;         // backstop: boot one if nothing is alive and nothing is scheduled
const BACKOFF_START_MS = 2000;
const BACKOFF_MAX_MS = 30_000;

let child = null;
let restarts = 0;
let backoff = BACKOFF_START_MS;
let shutting_down = false;
let scheduled = false;   // a respawn timer is pending — the watchdog must not double-book it
let reload_reason = null;   // set just before a deliberate cycle so the exit handler can tell it apart from a real crash

function write_heartbeat(extra = {}){
	try {
		fs.mkdirSync(path.dirname(HEARTBEAT_PATH), { recursive: true });
		fs.writeFileSync(HEARTBEAT_PATH, JSON.stringify({
			at: new Date().toISOString(),
			supervisor_pid: process.pid,
			child_pid: child?.pid ?? null,
			health_base: HEALTH_BASE,
			restarts,
			...extra,
		}, null, "\t"));
	} catch (e) { console.error("[health-supervisor] could not write heartbeat:", e?.message || e); }
}

/* Bounded kill — an `exit` event is the fast path, a hard `taskkill /T /F` by
 * the real pid is the escalation if the child (or anything it spawned, such
 * as its own Chromium) is still there past the deadline. Copied from
 * server.js's own kill_and_wait() on purpose: it is exactly what closed the
 * "never wedge" gap in that file, and the same failure mode (a wait that
 * never resolves) applies here just as much. */
function kill_and_wait(c, deadline_ms = KILL_DEADLINE_MS){
	return new Promise(resolve => {
		if (!c || c.exitCode !== null || c.signalCode !== null) return resolve();
		let done = false;
		const finish = () => { if (done) return; done = true; clearTimeout(timer); resolve(); };
		c.once("exit", finish);
		try { c.kill(); } catch {}
		const timer = setTimeout(() => {
			if (done) return;
			try { spawnSync("taskkill", ["/PID", String(c.pid), "/T", "/F"]); } catch {}
			setTimeout(finish, 300);
		}, deadline_ms);
	});
}

function spawn_child(){
	scheduled = false;
	const started_at = Date.now();
	const c = fork(HEALTH_SCRIPT, [], {
		stdio: "inherit",
		cwd: ROOT,
		env: { ...process.env, HEALTH_BASE },
	});
	child = c;
	write_heartbeat();

	c.on("exit", (code, signal) => {
		if (shutting_down) return;
		if (child !== c) return;   // this exact child was already retired deliberately
		child = null;
		const uptime_ms = Date.now() - started_at;
		restarts++;

		if (reload_reason){
			// A deliberate cycle (health.mjs itself changed, parses clean) — not a
			// crash, so no backoff and none of the "exited almost immediately"
			// framing below, even if the file happened to change right after boot.
			const reason = reload_reason;
			reload_reason = null;
			backoff = BACKOFF_START_MS;
			console.log(`[health-supervisor] cycled health.mjs after ${reason} changed (was up ${uptime_ms}ms) — restarting now with the new code.`);
			write_heartbeat({ last_exit: { at: new Date().toISOString(), code, signal, uptime_ms, reason: "file-watch-reload: " + reason } });
			scheduled = true;
			setTimeout(spawn_child, 0);
			return;
		}

		if (uptime_ms < BOOT_GRACE_MS){
			// Never really up — back off instead of crash-looping a tree that
			// can't run at all (Playwright missing, a broken import, etc.).
			backoff = Math.min(backoff * 2, BACKOFF_MAX_MS);
			console.error(`[health-supervisor] health.mjs exited almost immediately (code ${code}, signal ${signal}, ${uptime_ms}ms) — retrying in ${backoff}ms.`);
		} else {
			// It had genuinely been running and then died — treat this as a
			// fresh crash, not a loop, and come straight back.
			backoff = BACKOFF_START_MS;
			console.error(`[health-supervisor] health.mjs exited after ${uptime_ms}ms (code ${code}, signal ${signal}) — restarting now.`);
		}

		write_heartbeat({ last_exit: { at: new Date().toISOString(), code, signal, uptime_ms } });
		scheduled = true;
		setTimeout(spawn_child, uptime_ms < BOOT_GRACE_MS ? backoff : 0);
	});
}

// Watchdog backstop — the same spirit as server.js's own: should rarely ever
// fire (spawn_child() always sets `child` synchronously, and every exit path
// above schedules its own respawn), but it exists so the watcher can never
// stay silently dead just because one code path forgot to recover.
setInterval(() => {
	if (shutting_down || child || scheduled) return;
	console.error("[health-supervisor] no live health.mjs and nothing scheduled — booting one now.");
	spawn_child();
}, WATCHDOG_MS).unref();

setInterval(() => { if (child) write_heartbeat(); }, HEARTBEAT_MS).unref();

/* ── watch health.mjs itself, cycle the child when it really changes ─────
 * Same shape as server.js's own Server/ watch (Server/doc/watch.md): an
 * MtimeFilter so a plain read (this repo's own `rg`, an editor's syntax
 * check, Windows last-access tracking) never looks like an edit, then a
 * 500ms debounce so a save made of several quick writes cycles the child
 * once, not once per write. `node --check` runs before anything is killed —
 * a file that does not even parse must leave the working child alone. */
const health_filter = new MtimeFilter();
let health_debounce = null;

function queue_reload(){
	clearTimeout(health_debounce);
	health_debounce = setTimeout(reload_for_change, 500);
}

function reload_for_change(){
	if (shutting_down) return;
	const check = spawnSync(process.execPath, ["--check", HEALTH_SCRIPT], { encoding: "utf8" });
	if (check.status !== 0) {
		console.error(`[health-supervisor] health.mjs — syntax error, NOT cycling (the old, still-parsing code keeps running):\n${check.stderr}`);
		return;
	}
	if (!child) return;   // nothing running yet — spawn_child()/the watchdog already bring one up with today's code on disk
	console.log("[health-supervisor] health.mjs changed and parses — cycling the child to pick up the new rules.");
	reload_reason = "health.mjs";
	kill_and_wait(child).catch(() => {});   // the exit handler above does the actual respawn once it sees the exit
}

// ⚠ Watches the DIRECTORY, not `fs.watch(HEALTH_SCRIPT, ...)` directly (found
// broken, safe-rollout 2026-09-21: a single-path fs.watch handle on Windows
// binds to that file's identity, and an editor that writes atomically —
// temp file, then rename over the target, the same pattern this repo's own
// tools use elsewhere — replaces that identity, silently orphaning the old
// handle. A health.mjs fix sat on disk for 15+ minutes with zero cycles
// before this was caught. A directory watch, filtered to this one filename
// (the same shape server.js's own Server/ watch already uses), survives a
// rename because it's watching the FOLDER entry, not one file's handle.
const HEALTH_DIR_WATCH = path.dirname(HEALTH_SCRIPT);
const health_watcher = fs.watch(HEALTH_DIR_WATCH, { persistent: true }, (event, name) => {
	if (!name) return;
	const file = path.join(HEALTH_DIR_WATCH, name);
	if (file !== HEALTH_SCRIPT) return;
	if (event === "rename") { health_filter.remember(HEALTH_SCRIPT); queue_reload(); return; }
	health_filter.passes(HEALTH_SCRIPT, ok => { if (ok) queue_reload(); });
});
health_watcher.on("error", err => console.error("[health-supervisor] health.mjs watch error:", err));

function shutdown(signal){
	if (shutting_down) return;
	shutting_down = true;
	console.log(`[health-supervisor] ${signal} — stopping (this also stops health.mjs; it will not restart itself once this process is gone).`);
	try { health_watcher.close(); } catch {}
	clearTimeout(health_debounce);
	try { fs.unlinkSync(HEARTBEAT_PATH); } catch {}
	kill_and_wait(child).then(() => process.exit(0));
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

console.log(`[health-supervisor] starting (pid ${process.pid}) — watching over health.mjs, checking against ${HEALTH_BASE}, heartbeat every ${HEARTBEAT_MS}ms at public/framework/ai/health/heartbeat.json`);
spawn_child();

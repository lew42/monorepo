/* `node server.js` — same command as always. Two modes:
 *
 *   NO_SUPERVISE=1 node server.js   — runs Server/run.js bare, in-process, exactly
 *                                     like this file used to (see Server/run.js).
 *   node server.js                  — the default: THIS process becomes a small
 *                                     supervisor. It forks Server/run.js as a child
 *                                     (your terminal's log is unchanged — the child's
 *                                     stdio is inherited) and restarts that child
 *                                     whenever Server/ or server.js itself really
 *                                     changes, so an edit under Server/ never again
 *                                     needs you to Ctrl+C and retype the command.
 *
 * Why not `node --watch`? It restarts on every file ACCESS too, not just a write —
 * the exact trap fixed in Server/watch.js (reading a file bumps its access time,
 * and on Windows that alone fires a "change" event). `node --watch` would restart
 * the server every time it served itself a page. This file reuses the very same
 * fix, MtimeFilter, so a read here does not restart either. Decision and the two
 * rejected alternatives: Server/doc/watch.md.
 *
 * PORT and every other env var reach the child unchanged — `fork()` inherits
 * process.env by default; ../public and Server.js's own paths are resolved off
 * `cwd`, so the child keeps this process's working directory too.
 *
 * ── WHY THIS FILE ALSO BOOT-TESTS BEFORE IT SWAPS ───────────────────────────
 * 2026-09-19: a `Server/` file that PARSED but THREW AT BOOT was saved into this
 * tree. The supervisor above (all this file used to be) killed the healthy child
 * and started the broken one — the live site went down — and then, when the fix
 * arrived, `restart()` waited forever for an "exit" event from a child that was
 * ALREADY dead, so it never came back up on its own. Four minutes down.
 * `node --check` (below) proves a file PARSES; it says nothing about whether the
 * code THROWS the moment it actually runs. Full incident:
 * public/framework/ai/2026-09-19/incident-site-down/.
 *
 * The fix has two parts, both below: (1) BOOT-TEST FIRST — before the live child
 * is ever touched, a CANDIDATE child boots on a spare port with BOOT_TEST=1 (a
 * flag a few side-effecting plugins honour, so a candidate never rebuilds
 * directory.json or touches the reload-hold lock — see restart() below, and the
 * one-line guards in Server/plugins/Directory.js and
 * Server/plugins/SocketServer/LiveReload.js). Only a
 * REAL HTTP 200 from the candidate promotes it — the live child is only ever
 * killed once we already know the new code boots. On any failure the live child
 * is never touched, and `.server-boot-failed.json` is written at the repo root so
 * an agent (or the owner) can see WHY without the site being up.
 * (2) NEVER WAIT FOREVER — every kill below is bounded by a deadline (kill_and_wait)
 * and a periodic watchdog boots a live child back up if one goes missing and
 * nothing is already in flight to replace it — the exact class of wedge that
 * took the site down a second time on the same day. */
import { fork, spawnSync } from "child_process";
import fs from "fs";
import net from "net";
import os from "os";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// SUPERVISOR_REPO_ROOT is TEST-ONLY, never set in normal use — same shape as
// Server/plugins/AILogs.js's AI_LOGS_DIR or Server/hold.mjs's RELOAD_HOLD_TTL_MS:
// a proof run develops and runs this exact file from outside the repo (its own
// task dir's scratch copy, before the one proven write into server.js itself)
// and needs to point "repo root" somewhere other than its own folder.
const __dirname = process.env.SUPERVISOR_REPO_ROOT ? path.resolve(process.env.SUPERVISOR_REPO_ROOT) : path.dirname(fileURLToPath(import.meta.url));
const RUN = path.join(__dirname, "Server", "run.js");
const BOOT_FAILED_FILE = path.join(__dirname, ".server-boot-failed.json");
// A dynamic import, not a static one, ONLY because SUPERVISOR_REPO_ROOT (above)
// means "this file's own folder" and "the repo root" can differ during a proof
// run — a static `import ... from "./Server/MtimeFilter.js"` resolves against
// THIS file's URL no matter what __dirname is computed to, so it would reach
// for a Server/ folder beside the scratch copy instead of the real one. In its
// one true home (server.js at the repo root) __dirname IS this file's own
// folder, so this resolves to the exact same module either way.
const { default: MtimeFilter } = await import(pathToFileURL(path.join(__dirname, "Server", "MtimeFilter.js")).href);

// How long a candidate gets to answer a real 200 before it's called a failure,
// and how long a kill gets before it's escalated — both overridable for a proof
// run so it doesn't have to sit through the real deadline for real (same shape
// as Server/hold.mjs's own RELOAD_HOLD_TTL_MS override).
const BOOT_TEST_DEADLINE_MS = Number(process.env.BOOT_TEST_DEADLINE_MS) || 8000;
const KILL_DEADLINE_MS = Number(process.env.SUPERVISOR_KILL_DEADLINE_MS) || 3000;
// A child that exits within this long of its OWN spawn never really booted —
// see spawn_live()'s exit handler.
const BOOT_GRACE_MS = 1000;
// Backstop only — the exit handlers below are what normally bring a child back;
// this just guarantees the port can never stay silently empty for good.
const WATCHDOG_INTERVAL_MS = 3000;

if (process.env.NO_SUPERVISE) {
	await import("./Server/run.js");
} else {
	supervise();
}

function supervise(){
	console.log("[supervisor] starting — NO_SUPERVISE=1 to run the server bare.");

	let live = null;          // the child actually serving the real PORT
	let shutting_down = false;
	let busy = false;          // a boot-test (or the promote/swap that follows a pass) is in flight
	let swapping = false;      // inside the brief gap between killing the old live child and the new one existing
	let awaiting_fix = false;  // the tree is known broken with no live child to protect — wait for a CHANGE, not a timer
	let generation = 0;        // bumped every restart() call, so a superseded boot test can tell it was cancelled
	let current_candidate = null;   // the in-flight candidate, if any — shutdown() and a superseding restart() both need it

	/* ── one entry point, real or test ───────────────────────────────────────
	 * TEST-ONLY, never set in normal use: a proof run points TEST_EXTRA_MODULE
	 * at a scratch file under its own task dir (never a real Server/ file — see
	 * public/framework/ai/2026-09-19/server-boot-test/requirements.md, "Prove")
	 * and this writes a two-line wrapper to the OS temp dir that imports that
	 * scratch module before the real Server/run.js, so a proof can make the
	 * CHILD's own boot throw or hang without ever touching a real file this
	 * task isn't fenced to touch. Nothing about this runs unless the env var is
	 * set, and the wrapper is never part of the repo. */
	function entry_for_this_boot(){
		if (!process.env.TEST_EXTRA_MODULE) return RUN;
		const wrapper = path.join(os.tmpdir(), "lew42-server-boot-test-entry.mjs");
		const scratch_url = pathToFileURL(path.resolve(process.env.TEST_EXTRA_MODULE)).href;
		const run_url = pathToFileURL(RUN).href;
		fs.writeFileSync(wrapper, `import ${JSON.stringify(scratch_url)};\nawait import(${JSON.stringify(run_url)});\n`);
		return wrapper;
	}

	/* ── bounded kill — the whole fix for "never wedge" ──────────────────────
	 * Always resolves within KILL_DEADLINE_MS (+ a few hundred ms), whatever
	 * happens: an `exit` event is the fast path, a hard `taskkill /T /F` by the
	 * real Windows PID is the escalation if the child (or a grandchild it spawned)
	 * is still there past the deadline. Nothing here can ever wait forever — that
	 * is the exact bug that kept the site down on 2026-09-19. */
	function kill_and_wait(child, deadline_ms = KILL_DEADLINE_MS){
		return new Promise(resolve => {
			if (!child || child.exitCode !== null || child.signalCode !== null) return resolve();
			let done = false;
			const finish = () => { if (done) return; done = true; clearTimeout(timer); resolve(); };
			child.once("exit", finish);
			try { child.kill(); } catch {}
			const timer = setTimeout(() => {
				if (done) return;
				try { spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"]); } catch {}
				setTimeout(finish, 300);   // give the OS a beat to actually reap it, then move on regardless
			}, deadline_ms);
		});
	}

	function clear_boot_failed(){
		try { fs.unlinkSync(BOOT_FAILED_FILE); } catch {}
	}

	function write_boot_failed(files, error){
		try {
			fs.writeFileSync(BOOT_FAILED_FILE, JSON.stringify({
				at: new Date().toISOString(),
				files: files.map(f => path.relative(__dirname, f)),
				error,
			}, null, "\t"));
		} catch (e) { console.error("[supervisor] could not write .server-boot-failed.json:", e?.message || e); }
	}

	/* ── the live child ───────────────────────────────────────────────────── */

	function spawn_live(){
		const child = fork(entry_for_this_boot(), [], { stdio: "inherit", cwd: __dirname, env: { ...process.env } });
		live = child;
		const started_at = Date.now();

		child.on("exit", (code, signal) => {
			if (shutting_down) return;
			if (live !== child) return;   // this exact child was already retired deliberately — not ours to react to
			live = null;

			if (Date.now() - started_at < BOOT_GRACE_MS) {
				// It never really booted — respawning on a timer would just crash-loop
				// (the exact "must not spin" case: a cold start into a broken tree).
				// Say so once, then wait for a real CHANGE to try again, not a clock.
				if (!awaiting_fix) console.error(`[supervisor] the server did not boot (code ${code}, signal ${signal}) — it will stay down until the next change under Server/. See .server-boot-failed.json if this came from a boot test, or fix the file that changed.`);
				awaiting_fix = true;
				return;
			}

			// It HAD booted and then died (killed, crashed at runtime) — the tree was
			// known good a moment ago, so bring it straight back.
			console.error(`[supervisor] the live server exited (code ${code}, signal ${signal}) — restarting.`);
			spawn_live();
		});
	}

	// Backstop for the one case nothing else covers: nothing alive, nothing in
	// flight to replace it, and the tree isn't known-broken (that case waits for
	// a change on purpose, see above) — a few seconds of silence and this just
	// boots one. Should rarely ever actually fire; it exists so the port can
	// never stay silently empty because one code path forgot to recover.
	setInterval(() => {
		if (shutting_down || live || busy || swapping || awaiting_fix) return;
		console.error("[supervisor] no live server and nothing in progress — booting one.");
		spawn_live();
	}, WATCHDOG_INTERVAL_MS).unref();

	spawn_live();   // cold start — direct, no boot test: there is nothing healthy yet to protect

	/* ── watching Server/, server.js, and (test-only) one extra dir ──────────
	 * Same mtime-checked filter as watch.js — a read under Server/ (an `rg`, a
	 * `cat`, an editor's syntax check) must not restart the server, any more
	 * than it should reload a tab. Two separate watch handles, not one recursive
	 * watch on the repo root — the root also holds public/, already covered by
	 * its own handle in watch.js; doubling that up is the exact duplication
	 * doc/spin.md measured a core burning over. */
	const filter = new MtimeFilter();
	let pending = new Set();
	let debounce = null;

	function queue(file){
		pending.add(file);
		clearTimeout(debounce);
		debounce = setTimeout(restart, 500);
	}

	function on_event(event, file){
		if (!file.endsWith(".js") || file.includes("node_modules")) return;
		const kind = event === "rename" ? "rename" : "change";
		if (kind === "rename") {
			filter.remember(file);
			queue(file);
		} else {
			filter.passes(file, ok => { if (ok) queue(file); });
		}
	}

	const watchers = [];
	const SERVER_DIR = path.join(__dirname, "Server");
	watchers.push(fs.watch(SERVER_DIR, { recursive: true, persistent: true }, (event, name) => {
		if (!name) return;
		on_event(event, path.join(SERVER_DIR, name));
	}));
	const SELF = path.join(__dirname, "server.js");
	watchers.push(fs.watch(SELF, { persistent: true }, event => on_event(event, SELF)));

	// TEST-ONLY: a proof run's own scratch dir, named by an env var never set in
	// normal use — see public/framework/ai/2026-09-19/server-boot-test/requirements.md.
	if (process.env.TEST_EXTRA_WATCH_DIR) {
		const EXTRA_DIR = path.resolve(__dirname, process.env.TEST_EXTRA_WATCH_DIR);
		console.log(`[supervisor] TEST_EXTRA_WATCH_DIR set — also watching ${EXTRA_DIR} (test-only).`);
		watchers.push(fs.watch(EXTRA_DIR, { recursive: true, persistent: true }, (event, name) => {
			if (!name) return;
			on_event(event, path.join(EXTRA_DIR, name));
		}));
	}

	watchers.forEach(w => w.on("error", err => console.error("[supervisor] watch error:", err)));

	/* ── boot-test, then swap — the heart of the fix ─────────────────────────
	 * Called once per debounced batch of changes. A change that lands WHILE a
	 * boot test is already running cancels it (kills that candidate) and starts
	 * a fresh one on the new file set — "mid-test changes restart the test." */
	async function restart(){
		const files = [...pending];
		pending.clear();

		// node --check every changed file BEFORE touching anything else — a syntax
		// error must never even reach a candidate; it just doesn't restart.
		for (const file of files) {
			if (!fs.existsSync(file)) continue;   // deleted — nothing to check, nothing to block on
			const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
			if (result.status !== 0) {
				console.error(`[supervisor] ${path.relative(__dirname, file)} — syntax error, not restarting:\n${result.stderr}`);
				return;
			}
		}

		// A change landing WHILE a candidate is still being tested cancels that
		// test instead of running two at once — "mid-test changes restart the
		// test." The stale candidate's own wait_for_boot() sees it exit (we just
		// killed it) and quietly gives up once it notices `generation` moved on.
		if (current_candidate) {
			const stale = current_candidate;
			current_candidate = null;
			await kill_and_wait(stale);
		}

		const my_gen = ++generation;
		busy = true;
		awaiting_fix = false;   // a syntax-clean attempt is underway; give it a real chance before saying "broken" again

		const port = await free_port().catch(e => { console.error("[supervisor] could not find a free port for the boot test:", e?.message || e); return null; });
		if (port == null) { busy = false; return; }
		if (my_gen !== generation) { busy = false; return; }   // superseded before we even got a port

		const candidate = fork(entry_for_this_boot(), [], {
			stdio: ["ignore", "pipe", "pipe", "ipc"], cwd: __dirname,
			env: { ...process.env, PORT: String(port), BOOT_TEST: "1" },
		});
		current_candidate = candidate;
		const tail = [];
		const capture = d => { for (const line of String(d).split("\n")) if (line.trim()) { tail.push(line); if (tail.length > 40) tail.shift(); } };
		candidate.stdout?.on("data", capture);
		candidate.stderr?.on("data", capture);

		const result = await wait_for_boot(candidate, port, BOOT_TEST_DEADLINE_MS);
		if (current_candidate === candidate) current_candidate = null;
		await kill_and_wait(candidate);

		if (my_gen !== generation) return;   // superseded mid-wait — the newer restart() call owns the outcome now
		busy = false;

		if (!result.ok) {
			console.error(`[supervisor] BOOT TEST FAILED (${result.reason}) — live server left running untouched.\n` +
				"----- candidate's last output -----\n" + (tail.join("\n") || "(nothing captured)") + "\n-----------------------------------");
			write_boot_failed(files, result.reason);
			if (!live) awaiting_fix = true;   // nothing healthy to fall back on either — wait for the next change, don't spin
			return;
		}

		clear_boot_failed();
		const files_desc = files.length ? files.map(f => path.relative(__dirname, f)).join(", ") : "(startup)";
		console.log(`[supervisor] candidate on ${port} booted — swapping in: ${files_desc}`);
		const swap_started = Date.now();
		swapping = true;
		const old = live;
		live = null;
		if (old) await kill_and_wait(old);
		spawn_live();
		swapping = false;
		// This is the handoff time (old killed, new forked) — not proof the new
		// one has finished booting yet; that's what a poller sees, not this log.
		console.log(`[supervisor] swap handoff took ${Date.now() - swap_started}ms — new child forked, booting now.`);
	}

	function shutdown(signal){
		if (shutting_down) return;
		shutting_down = true;
		console.log(`[supervisor] ${signal} — stopping.`);
		watchers.forEach(w => w.close());
		clearTimeout(debounce);
		const hard_deadline = setTimeout(() => process.exit(0), KILL_DEADLINE_MS + 1000).unref();
		Promise.all([kill_and_wait(live), kill_and_wait(current_candidate)]).then(() => { clearTimeout(hard_deadline); process.exit(0); });
	}

	process.on("SIGINT", () => shutdown("SIGINT"));
	process.on("SIGTERM", () => shutdown("SIGTERM"));
}

/* ── small helpers, no state of their own ──────────────────────────────────── */

function free_port(){
	return new Promise((resolve, reject) => {
		const srv = net.createServer();
		srv.unref();
		srv.on("error", reject);
		srv.listen(0, "127.0.0.1", () => {
			const { port } = srv.address();
			srv.close(() => resolve(port));
		});
	});
}

/* Polls for a real HTTP 200 from the candidate's own "/", racing its `exit` —
 * a crashed candidate fails at once, it never sits out the whole deadline. */
function wait_for_boot(child, port, deadline_ms){
	return new Promise(resolve => {
		let settled = false;
		const finish = result => { if (settled) return; settled = true; child.removeListener("exit", on_exit); clearTimeout(deadline_timer); resolve(result); };
		const on_exit = (code, signal) => finish({ ok: false, reason: `exited before answering (code ${code}, signal ${signal})` });
		child.once("exit", on_exit);

		const deadline_timer = setTimeout(() => finish({ ok: false, reason: `no HTTP 200 within ${deadline_ms}ms` }), deadline_ms);

		(async function poll(){
			while (!settled) {
				try {
					const res = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1000) });
					if (res.status === 200) return finish({ ok: true });
				} catch {}
				await new Promise(r => setTimeout(r, 200));
			}
		})();
	});
}

/* node Servex/closeout.test.mjs — the proof that closing a task leaves nothing behind (2026-11-04). Rerun it any time; it needs
 * global Playwright (npm i -g playwright) and takes one to two minutes. Every artifact it makes is its own and is removed at the end.
 *
 * It opens a task (a temp task log, an unused Servex port, a temp SERVEX_HOME so nothing touches the live Servex), then starts REAL things under it:
 * an http server and a Chromium inside a real git worktree, and a node server inside a leftover folder git does not list (the docs-gate / usage-stale
 * case). It calls Lifecycle.closeout() and asserts from the OS process list, `git worktree list` and the disk that none remain, and that the one
 * `task end` line names what was closed. Then: (1) an unmerged worktree is reported as LEFT, ok=false; (2) a parent killed hard cannot leave its
 * browser (the watchdog closes it); (3) a chrome left running with no watchdog (started detached) is found by the sweep's launcher-gone rule; (4) machine-written
 * logs do not block a pool return but a new .jsonl does. Doc: Servex/doc/processes.md. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const id = Math.random().toString(36).slice(2, 8);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "closeout-test-"));
const task = path.join(tmp, "task"); fs.mkdirSync(task);
Object.assign(process.env, { SERVEX_HOME: path.join(tmp, "home"), SERVEX_PORT: "18999", LEW_TASK: task, LEW_AGENT: "closeout-test" });

const { default: Lifecycle, main_repo } = await import("./Lifecycle.js");
const { default: Pool } = await import("./Pool.js");
const { DEV_BRANCH } = await import("../Server/dev-branch.mjs");
const MAIN = main_repo(), WT_ROOT = path.join(path.dirname(MAIN), "worktrees");
const git = (...a) => execFileSync("git", ["-C", MAIN, ...a], { encoding: "utf8", windowsHide: true }).trim();
const slash = p => p.split(path.sep).join("/");
const wt_listed = p => git("worktree", "list", "--porcelain").split("\n").some(l => l.startsWith("worktree ") && l.slice(9).toLowerCase() === slash(p).toLowerCase());
const pid_alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
const wait = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000) { const end = Date.now() + ms; while (Date.now() < end) { if (await fn()) return true; await wait(250); } return false; }

/* debris of an earlier run that died before its cleanup is removed first */
for (const l of git("worktree", "list", "--porcelain").split("\n")) if (l.startsWith("worktree ") && /[\\/]closeout-test-/.test(l)) {
	const p = l.slice(9), br = path.basename(p);
	try { git("worktree", "remove", "--force", p); } catch {}
	try { fs.rmSync(p, { recursive: true, force: true }); git("worktree", "prune"); git("branch", "-D", br); } catch {}
}

const made = { pids: new Set(), worktrees: [], folders: [], branches: [] };
let passed = 0;
const ok = (name) => { passed++; console.log(`PASS  ${name}`); };

function start(mode, cwd, extra = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [path.join(HERE, "closeout.fixture.mjs"), mode, id], { cwd, env: { ...process.env, ...extra }, stdio: ["ignore", "pipe", "inherit"], windowsHide: true });
		made.pids.add(child.pid);
		let out = "";
		child.stdout.on("data", d => { out += d; const m = out.match(/READY (\d+)(?: (\d+))?/); if (m) { if (m[2]) made.pids.add(+m[2]); resolve({ pid: +m[1], chrome: m[2] ? +m[2] : null }); } });
		child.on("exit", c => reject(new Error(`${mode} fixture exited early (${c})`)));
		setTimeout(() => reject(new Error(`${mode} fixture not ready in 40 s`)), 40000).unref();
	});
}
function new_worktree(name, { commit = false } = {}) {
	const p = path.join(WT_ROOT, name), br = name;
	git("worktree", "add", "-q", "-b", br, p, DEV_BRANCH);
	made.worktrees.push(p); made.branches.push(br);
	if (commit) {
		fs.writeFileSync(path.join(p, "unmerged.txt"), "x");
		for (const args of [["add", "unmerged.txt"], ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "closeout test commit"]]) {
			const g = spawnSync("git", ["-C", p, ...args], { encoding: "utf8", windowsHide: true });
			if (g.status !== 0) throw new Error(`git ${args[0]} failed in ${p}: ${g.stderr || g.stdout}`);
		}
	}
	return p;
}
const assign_wt = (p) => fs.appendFileSync(path.join(task, "task.jsonl"), JSON.stringify({ assign: { worktree: p } }) + "\n");

try {
	console.log(`closeout test ${id}: task ${task}`);

	/* 1. the happy path: server + browser in a real worktree, a server in a folder git does not list */
	const wt = new_worktree(`closeout-test-${id}`);
	const residue = path.join(WT_ROOT, `closeout-residue-${id}`); fs.mkdirSync(residue, { recursive: true }); fs.writeFileSync(path.join(residue, "log.txt"), "x"); made.folders.push(residue);
	assign_wt(wt); assign_wt(residue);
	const srv = await start("server", wt), brw = await start("browser", wt), res = await start("server", residue);
	for (const p of [srv.pid, brw.pid, brw.chrome, res.pid]) assert.ok(pid_alive(p), `pid ${p} should be running before the close`);
	assert.ok(wt_listed(wt) && fs.existsSync(wt) && fs.existsSync(residue));
	ok(`started: server ${srv.pid}, browser ${brw.pid} (chrome ${brw.chrome}), residue server ${res.pid}, worktree ${path.basename(wt)}, folder ${path.basename(residue)}`);

	const lc = new Lifecycle();
	const r = await lc.closeout(task, { why: "test close" });
	console.log("  closed:", r.closed.map(c => `${c.kind} ${c.id}`).join(", "), "| left:", JSON.stringify(r.left));
	if (!r.ok) {   // show who still runs, so a failure explains itself
		const ps = spawnSync("powershell", ["-NoProfile", "-Command", `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match '${id}' } | Select ProcessId,ParentProcessId,Name | Format-Table -Auto | Out-String`], { encoding: "utf8", windowsHide: true });
		console.log("  processes still naming this test:", ps.stdout.trim() || "(none)");
	}
	assert.equal(r.ok, true, `closeout must report ok, left=${JSON.stringify(r.left)}`);
	assert.deepEqual(r.left, []);
	for (const kind of ["server", "browser", "worktree"]) assert.ok(r.closed.some(c => c.kind === kind), `closed should list a ${kind}`);
	ok("closeout() returned ok=true with nothing left");

	assert.ok(await until(() => ![srv.pid, brw.pid, brw.chrome, res.pid].some(pid_alive), 15000), "server, browser, chrome and residue server must all be gone from the OS process list");
	ok("no started process is left in the OS process list");
	assert.ok(!wt_listed(wt), "git worktree list must not show the worktree"); assert.ok(!fs.existsSync(wt), "the worktree folder must be gone from disk");
	ok("worktree is gone from `git worktree list` AND from disk");
	assert.ok(!fs.existsSync(residue), "the leftover folder must be gone from disk"); ok("the leftover folder git does not list is gone from disk (moved aside, not deleted)");
	const aside = path.join(path.dirname(WT_ROOT), "moved-aside", "worktree-residue");
	const moved = fs.existsSync(aside) ? fs.readdirSync(aside).filter(n => n.startsWith(`closeout-residue-${id}`)) : [];
	assert.equal(moved.length, 1, "the leftover folder should sit in moved-aside"); made.folders.push(path.join(aside, moved[0]));
	const lines = fs.readFileSync(path.join(process.env.SERVEX_HOME, "logs", "lifecycle.jsonl"), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
	const end = lines.filter(l => l.kind === "task" && l.event === "end");
	assert.equal(end.length, 1, "exactly one task end line"); assert.ok(end[0].closed.length >= 4 && end[0].left.length === 0);
	ok(`one "task end" line: ${end[0].why}`);

	/* 2. something that cannot be closed is reported, never claimed */
	const wt2 = new_worktree(`closeout-test-${id}-unmerged`, { commit: true }); assign_wt(wt2);
	const r2 = await new Lifecycle().closeout(task, { why: "test close 2" });
	assert.equal(r2.ok, false); assert.ok(r2.left.some(l => l.kind === "worktree" && /merge/.test(l.why)), JSON.stringify(r2.left));
	assert.ok(wt_listed(wt2) && fs.existsSync(wt2), "an unmerged worktree must be kept");
	ok(`an unmerged worktree is kept and reported: ${r2.left[0].why}`);

	/* 3. the parent dies hard: the watchdog closes the browser */
	const a = await start("browser", tmp);
	assert.ok(pid_alive(a.chrome)); spawnSync("taskkill", ["/PID", String(a.pid), "/F"], { windowsHide: true });
	assert.ok(await until(() => !pid_alive(a.pid), 5000), "launcher should be dead");
	assert.ok(await until(() => !pid_alive(a.chrome), 12000), "the watchdog must close chrome after its launcher is killed");
	ok(`launcher ${a.pid} killed hard; the watchdog closed chrome ${a.chrome}`);

	/* 4. no watchdog: chrome survives the kill, then the sweep's launcher-gone rule closes it */
	const b = await start("orphan", tmp);
	spawnSync("taskkill", ["/PID", String(b.pid), "/F"], { windowsHide: true });
	assert.ok(await until(() => !pid_alive(b.pid), 5000)); await wait(3000);
	assert.ok(pid_alive(b.chrome), "without the watchdog chrome is orphaned (that is the failure the sweep must catch)");
	const lc2 = new Lifecycle(); const plan = await lc2.sweep({ dry: true });
	const row = plan.close.find(x => x.kind === "browser" && x.pid === b.chrome);
	assert.ok(row, "the sweep must plan to close the orphaned browser"); assert.match(row.why, /launcher/);
	await lc2.close(row, row.why);
	assert.ok(await until(() => !pid_alive(b.chrome), 10000), "chrome must be gone after the sweep closes it");
	ok(`orphaned chrome ${b.chrome} found by the sweep (${row.why}) and closed`);

	/* 5. machine-written files never block a return; real work does */
	assert.equal(Pool.generated({ file: "public/framework/ai/session-links.jsonl", code: "M" }), true);
	assert.equal(Pool.generated({ file: "public/framework/ai/task-moves.jsonl", code: "M" }), true);
	assert.equal(Pool.generated({ file: "public/framework/ai/new-notes.jsonl", code: "??" }), false);
	assert.equal(Pool.generated({ file: "Servex/Pool.js", code: "M" }), false);
	ok("Pool.generated: modified logs are machine-written; a new .jsonl and source files are real work");
	/* 6. a worktree an agent still works in is kept (removing it would leave the agent in a gutted checkout); once the agent stops it is removed */
	const { default: Worktrees } = await import("./Worktrees.js");
	const wt3 = new_worktree(`closeout-test-${id}-held`);
	const live = new Map([["held-agent", { id: "held-agent", state: "working", cwd: wt3 }]]);
	const wts = new Worktrees({ main: MAIN, servex: { lifecycle: new Lifecycle(), agents: { live } } });
	const k = await wts.close_now(wt3);
	assert.equal(k.ok, false); assert.match(k.why, /held-agent/); assert.ok(wt_listed(wt3) && fs.existsSync(wt3), "a worktree with an agent inside must be kept");
	live.get("held-agent").state = "stopped";
	const k2 = await wts.close_now(wt3);
	assert.equal(k2.ok, true, JSON.stringify(k2)); assert.ok(!wt_listed(wt3) && !fs.existsSync(wt3), "removed from git and disk once the agent stopped");
	ok(`a worktree with a working agent inside is kept (${k.why.slice(0, 40)}...), then removed from git and disk once it stops`);

	// an unreadable process list: the close says so and why, and the sweep writes no "found gone" line for a process it simply could not see
	const blind = new Lifecycle();
	blind.processes_async = async function(){ this.process_error = "powershell.exe: ENOENT test"; return new Map(); };
	await blind.record({ kind: "server", id: "blind-check", pid: process.pid, event: "start" });
	const sw = await blind.sweep({ dry: true });
	assert.equal(sw.gone.length, 0, "an unreadable list must not mark live processes gone");
	const r3 = await blind.closeout(task, { why: "blind close" });
	assert.equal(r3.ok, false);
	assert.match(r3.left.find(x => x.kind === "process-list")?.why ?? "", /ENOENT test/, "the failure names its cause");
	await blind.record({ kind: "server", id: "blind-check", event: "end", why: "test over" });
	ok("an unreadable process list is reported with its cause, and marks nothing gone");


	console.log(`\nALL ${passed} CHECKS PASSED`);
} catch (e) {
	console.error(`\nFAIL after ${passed} passing check(s): ${e.stack || e}`);
	process.exitCode = 1;
} finally {
	for (const pid of made.pids) if (pid_alive(pid)) spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true });
	await wait(1500);
	for (const p of made.worktrees) try { if (wt_listed(p)) git("worktree", "remove", "--force", p); } catch {}
	try { git("worktree", "prune"); } catch {}
	for (const b of made.branches) try { git("branch", "-D", b); } catch {}
	for (const f of made.folders) try { fs.rmSync(f, { recursive: true, force: true }); } catch {}
	const aside_dir = path.join(path.dirname(WT_ROOT), "moved-aside", "worktree-residue");
	try { for (const n of fs.readdirSync(aside_dir)) if (n.startsWith(`closeout-residue-${id}`)) fs.rmSync(path.join(aside_dir, n), { recursive: true, force: true }); } catch {}
	for (const p of made.worktrees) try { fs.rmSync(p, { recursive: true, force: true }); } catch {}
	try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
	const left = [...made.pids].filter(pid_alive), listed = made.worktrees.filter(wt_listed);
	console.log(`cleanup: ${left.length} test process(es) still running, ${listed.length} test worktree(s) still listed`);
	if (left.length || listed.length) process.exitCode = 1;
}

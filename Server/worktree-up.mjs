/* `node Server/worktree-up.mjs <name>` — one command that gives an agent a
 * private copy of the site to break, wired to a free port of its own, so a
 * change to a page the owner is looking at never has to touch the live tree
 * to be tried out.
 *
 * WHY THIS EXISTS (safe-rollout, 2026-09-21): the mastermind hand-edited a
 * live page.js at 11:14, threw `a.attr is not a function`, and the owner saw
 * a blank dashboard. The fix for THAT is process, not code — build in a
 * worktree, smoke-test it on its own server, merge only once it's clean. This
 * script is the "build in a worktree" half made into one command instead of a
 * paragraph of git incantations nobody will get right under pressure.
 *
 * WHAT IT DOES, in order:
 *   1. `git worktree add -b worktree/<name> <sibling-dir> HEAD` — a second
 *      working copy of this exact repo, off whatever branch is checked out
 *      right now, living OUTSIDE this repo entirely (a sibling of monorepo/,
 *      never under public/ or Server/) so neither this repo's dev-server
 *      watcher nor the health watcher ever sees its files.
 *   2. Ask the OS for a free port (bind to port 0, read back what it picked,
 *      close — the exact trick server.js's own free_port() uses for its boot
 *      tests) instead of guessing a number that might already be taken.
 *   3. `node server.js` inside that new worktree, with PORT set to the free
 *      port, detached so it outlives this script.
 *   4. Poll the new server for a real HTTP 200 before declaring success —
 *      the same "don't trust a fork() call, trust a response" rule
 *      server.js's own wait_for_boot() uses.
 *   5. Record { name, path, branch, port, pid } in `.worktrees.json` at the
 *      repo root (git-ignored, alongside `.reload-hold.json` — this machine's
 *      own running state, nothing worth committing) so worktree-down.mjs can
 *      find it again by name alone.
 *
 * Only `git worktree add` and `git worktree remove` (in the sibling script)
 * ever touch git here — no stash, no reset, no checkout --, no commit. See
 * this task's own requirements.md for why that line is drawn so hard. */
import { execFileSync, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { refuse_links_into_main } from "./junction-guard.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = path.join(ROOT, ".worktrees.json");
const WORKTREES_ROOT = path.resolve(ROOT, "..", "worktrees");

const name = process.argv[2];
// `--task <dir>` (or LEW_TASK): the task this worktree is for. Its task.jsonl gets
// {worktree, branch}, so on-landing.mjs can find and tear down this worktree (lifecycle, 2026-09-29).
const task_arg = process.argv.includes("--task") ? process.argv[process.argv.indexOf("--task") + 1] : process.env.LEW_TASK;
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
	console.error("usage: node Server/worktree-up.mjs <name>   (lowercase letters, digits, hyphens — becomes branch worktree/<name>)");
	process.exit(1);
}

/* The registry is shared by every worktree-up / worktree-down running at once. Reading it once at
 * start and writing the whole object back at the end lost entries (2026-10-01: two boots launched
 * together each wrote its own stale copy, and qf-4 vanished twice). So a write re-reads the file
 * and changes only this worktree's entry, and a file that does not parse is refused, never
 * silently treated as empty and overwritten. */
function read_registry(){
	let text;
	try { text = fs.readFileSync(REGISTRY, "utf8"); } catch { return {}; }
	try { return JSON.parse(text.replace(/^\uFEFF/, "")); }
	catch (e) { console.error(`worktree-up: ${REGISTRY} does not parse (${e.message}) — fix it by hand; refusing to overwrite it.`); process.exit(1); }
}
function write_registry(entry_name, entry){
	const reg = read_registry();
	if (entry) reg[entry_name] = entry; else delete reg[entry_name];
	if (!Object.keys(reg).length) { try { fs.unlinkSync(REGISTRY); } catch {} return; }
	fs.writeFileSync(REGISTRY, JSON.stringify(reg, null, "\t"));
}

const registry = read_registry();
if (registry[name]) {
	console.error(`worktree-up: "${name}" is already up — path ${registry[name].path}, port ${registry[name].port}. Run worktree-down.mjs ${name} first, or pick a different name.`);
	process.exit(1);
}

const target = path.join(WORKTREES_ROOT, name);
if (fs.existsSync(target)) {
	console.error(`worktree-up: ${target} already exists on disk but isn't in the registry — remove it by hand (or with \`git worktree remove\`) before retrying.`);
	process.exit(1);
}

const branch = `worktree/${name}`;

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

function wait_for_boot(port, deadline_ms = 15000){
	return new Promise(resolve => {
		let settled = false;
		const finish = ok => { if (settled) return; settled = true; clearTimeout(timer); resolve(ok); };
		const timer = setTimeout(() => finish(false), deadline_ms);
		(async function poll(){
			while (!settled) {
				try {
					const res = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1000) });
					if (res.status === 200) return finish(true);
				} catch {}
				await new Promise(r => setTimeout(r, 300));
			}
		})();
	});
}

fs.mkdirSync(WORKTREES_ROOT, { recursive: true });

console.log(`worktree-up: creating ${target} on branch ${branch} off HEAD…`);
try {
	execFileSync("git", ["worktree", "add", "-b", branch, target, "HEAD"], { cwd: ROOT, stdio: "inherit", windowsHide: true });
} catch (e) {
	console.error("worktree-up: `git worktree add` failed — nothing else was touched.");
	process.exit(1);
}

/* Sweep every worktree for links into the main checkout (Server/junction-check.mjs) while npm ci
   runs, and print its warning after. It never fails the up: it only tells you. */
const junction_check = new Promise(resolve => {
	let out = "";
	const c = spawn(process.execPath, [path.join(ROOT, "Server", "junction-check.mjs")], { cwd: ROOT, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
	c.stdout.on("data", d => out += d); c.stderr.on("data", d => out += d);
	c.on("error", () => resolve(null));
	c.on("exit", code => resolve({ code, out }));
});

/* `node_modules` IS NOT IN THE WORKTREE. `git worktree add` checks out tracked
   files only, and `node_modules` is gitignored, so the fresh tree's
   `node server.js` dies on `Cannot find package 'express'` unless something
   installs it first.

   A JUNCTION WAS TRIED FIRST AND COST THE MAIN CHECKOUT ITS node_modules
   (2026-09-22, ~15:05): `fs.symlinkSync(..., "junction")` here made
   `worktree/<name>/node_modules` a junction pointing back at the main
   checkout's `node_modules` — and `git worktree remove` follows a junction
   like any other directory and deletes through it, so tearing down ONE
   worktree emptied the MAIN tree's `node_modules` (68 packages gone; the live
   site kept running only because express was already loaded into memory).
   `npm ci` instead: it needs no network for packages already in the local
   npm cache from the main checkout's own install, and it cannot ever reach
   back and delete the main tree's copy. Measured 5s for these 68 packages. */
/* GUARD (2026-09-29): npm ci empties node_modules first. If this tree's node_modules (or anything
   in it) were a link into the main checkout, that would empty the MAIN tree's copy. Refuse. */
try { refuse_links_into_main(target, "npm ci"); }
catch (e) { console.error(e.message); process.exit(1); }

console.log("worktree-up: running npm ci in the worktree…");
try {
	/* `shell: true` — without it, `npm.cmd` throws `spawnSync npm.cmd EINVAL` on
	   Windows even called by its exact .cmd name: Node's CVE-2024-27980 guard
	   refuses to exec a .cmd/.bat directly and needs a shell in between
	   (found live, worktree-proof 2026-09-22 — npm never even started, so
	   node_modules was never created and the server then died on
	   `Cannot find package 'express'`). */
	execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["ci"], { cwd: target, stdio: "inherit", shell: true, windowsHide: true });
} catch (e) {
	console.error("worktree-up: `npm ci` failed — the server will probably fail to boot.");
}

const jc = await junction_check;
if (jc?.code === 1) console.warn(`worktree-up: WARNING — some worktree holds a link into the main checkout (not this one's fault; the up goes on):\n${jc.out.trim()}`);

const port = await free_port();
/* The log lives OUTSIDE the worktree, beside the registry — never inside
   `target` (see worktree-down.mjs for why: a file inside the worktree makes
   `git status --porcelain` non-empty forever, which is the bug that stopped
   worktree-down.mjs from ever being able to remove what this script made). */
const LOGS_ROOT = path.join(ROOT, ".worktree-logs");
fs.mkdirSync(LOGS_ROOT, { recursive: true });
const log_path = path.join(LOGS_ROOT, `${name}.log`);
fs.closeSync(fs.openSync(log_path, "a"));   // just make the file: a handle held open here makes cmd's own >> redirect fail (sharing violation), and the server then never starts

console.log(`worktree-up: booting node server.js in ${target} on PORT ${port}…`);
/* ⚠ Launched through PowerShell so the server gets a HIDDEN console that its children
 * inherit. A `detached` node with `windowsHide` has NO console, and then every child it
 * forks (run.js, boot-test candidates, claude turns, hooks) opens a VISIBLE window — the
 * 2026-09-22 node-window storm on the owner's desktop. */
/* ⚠ Start-Process must NOT get -RedirectStandardOutput/-RedirectStandardError: with a redirect it
 * cannot use ShellExecute, ignores -WindowStyle and the child gets a fresh console (a conhost per
 * launch, 2026-09-24). So the redirect happens inside a cmd wrapper instead, and Start-Process
 * stays a plain hidden launch. (-NoNewWindow is no way out: the child keeps the launcher's stdout
 * pipe, so spawnSync below would wait until the server exits.) The pid is cmd's; taskkill /T takes the tree. */
const cmdline = `/d /c ""${process.execPath}" server.js >>"${log_path}" 2>>"${log_path}.err""`;
const ps = `$env:PORT='${port}'; $p = Start-Process -FilePath $env:ComSpec -ArgumentList '${cmdline.replaceAll("'", "''")}' -WorkingDirectory '${target.replaceAll("'", "''")}' -WindowStyle Hidden -PassThru; $p.Id`;
const started = spawnSync("powershell.exe", ["-NoProfile", "-Command", ps], { encoding: "utf8", windowsHide: true });
if (started.stderr?.trim()) console.error("worktree-up: launcher said:", started.stderr.trim());
const child = { pid: Number(String(started.stdout).trim()) || null };

const ok = await wait_for_boot(port);
if (!ok) {
	console.error(`worktree-up: server did not answer HTTP 200 within 15s — see ${log_path}. The worktree and its (probably dead) server are left in place; run worktree-down.mjs ${name} to clean up.`);
	write_registry(name, { name, path: target, branch, port, pid: child.pid, log: log_path, created_at: new Date().toISOString(), booted: false });
	process.exit(1);
}

write_registry(name, { name, path: target, branch, port, pid: child.pid, log: log_path, created_at: new Date().toISOString(), booted: true });

/* THE CREATION LOG (lifecycle, 2026-09-29): one start line in Servex's lifecycle.jsonl, and the
 * task's own log learns its worktree. Never fails the up. Servex/Lifecycle.js. */
try {
	const lc = await import("../Servex/Lifecycle.js");
	if (task_arg) {
		const dir = path.isAbsolute(task_arg) ? task_arg : path.join(ROOT, task_arg);
		fs.mkdirSync(dir, { recursive: true });
		fs.appendFileSync(path.join(dir, "task.jsonl"), JSON.stringify({ assign: { worktree: target, branch } }) + "\n");
	}
	await lc.record({ kind: "worktree", id: name, path: target, port, pid: child.pid, owner_task: task_arg ? lc.task_key(task_arg) : null, owner_agent: process.env.LEW_AGENT || null, event: "start" });
} catch {}

/* Servex is optional, always — a worktree must work with it stopped, so this
   stays silent and succeeds either way. When it answers, it learns the name
   and port so `<name>.localhost` reaches this worktree through the
   proxy with no restart (PortRegistry.pin, live-shared with ReverseProxy). */
let proxy_url = null;
try {
	const r = await fetch(`http://127.0.0.1:${process.env.SERVEX_PORT || 8090}/api/projects`, {
		method: "POST", headers: { "content-type": "application/json" },
		body: JSON.stringify({ name, path: target, port }),
		signal: AbortSignal.timeout(2000),
	});
	if (r.ok) proxy_url = `http://${name}.localhost/`;
} catch {}

console.log("");
console.log(`worktree-up: ready.`);
console.log(`  url    http://localhost:${port}/`);
if (proxy_url) console.log(`  proxy  ${proxy_url}`);
console.log(`  edit   ${target}`);
console.log(`  branch ${branch}`);
console.log(`  down   node Server/worktree-down.mjs ${name}`);

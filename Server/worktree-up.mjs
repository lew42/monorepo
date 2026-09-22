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
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = path.join(ROOT, ".worktrees.json");
const WORKTREES_ROOT = path.resolve(ROOT, "..", "worktrees");

const name = process.argv[2];
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
	console.error("usage: node Server/worktree-up.mjs <name>   (lowercase letters, digits, hyphens — becomes branch worktree/<name>)");
	process.exit(1);
}

function read_registry(){
	try { return JSON.parse(fs.readFileSync(REGISTRY, "utf8")); } catch { return {}; }
}
function write_registry(reg){
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
	execFileSync("git", ["worktree", "add", "-b", branch, target, "HEAD"], { cwd: ROOT, stdio: "inherit" });
} catch (e) {
	console.error("worktree-up: `git worktree add` failed — nothing else was touched.");
	process.exit(1);
}

/* `node_modules` IS NOT IN THE WORKTREE (found by running this, 2026-09-21 — the
   author could not execute anything, so it shipped untested). `git worktree add`
   checks out tracked files only, and `node_modules` is gitignored, so the fresh
   tree's `node server.js` dies on `Cannot find package 'express'` and the boot
   wait times out with a worktree left behind.

   A junction, not a copy and not `npm install`: the main repo's modules are
   already correct for this exact commit, a copy would be ~thousands of files per
   worktree, and an install needs the network. `fs.symlinkSync(..., "junction")`
   is the Windows form that needs no elevation; on a POSIX host the same call
   falls back to a normal directory symlink. If it fails we say so and carry on —
   the server will then fail its own way, with its real error in the log. */
const modules_src = path.join(ROOT, "node_modules");
const modules_dst = path.join(target, "node_modules");
if (fs.existsSync(modules_src) && !fs.existsSync(modules_dst)) {
	try {
		fs.symlinkSync(modules_src, modules_dst, "junction");
		console.log("worktree-up: linked node_modules from the main checkout.");
	} catch (e) {
		console.error(`worktree-up: could not link node_modules (${e.code ?? e.message}) — the server will probably fail to boot.`);
	}
}

const port = await free_port();
const log_path = path.join(target, ".worktree-server.log");
const log_fd = fs.openSync(log_path, "a");

console.log(`worktree-up: booting node server.js in ${target} on PORT ${port}…`);
const child = spawn(process.execPath, ["server.js"], {
	cwd: target,
	env: { ...process.env, PORT: String(port) },
	detached: true,
	stdio: ["ignore", log_fd, log_fd],
});
child.unref();

const ok = await wait_for_boot(port);
if (!ok) {
	console.error(`worktree-up: server did not answer HTTP 200 within 15s — see ${log_path}. The worktree and its (probably dead) server are left in place; run worktree-down.mjs ${name} to clean up.`);
	registry[name] = { name, path: target, branch, port, pid: child.pid, created_at: new Date().toISOString(), booted: false };
	write_registry(registry);
	process.exit(1);
}

registry[name] = { name, path: target, branch, port, pid: child.pid, created_at: new Date().toISOString(), booted: true };
write_registry(registry);

console.log("");
console.log(`worktree-up: ready.`);
console.log(`  url    http://localhost:${port}/`);
console.log(`  edit   ${target}`);
console.log(`  branch ${branch}`);
console.log(`  down   node Server/worktree-down.mjs ${name}`);

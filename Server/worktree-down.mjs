/* `node Server/worktree-down.mjs <name>` — the teardown half of worktree-up.mjs:
 * stop that worktree's private server, and remove the worktree if doing so
 * would not throw away anything.
 *
 * Never `git stash`, `checkout --`, `reset`, `restore`, `add`, commit or
 * push — the only git this file runs is `git worktree remove`, and only once
 * `git status --porcelain` inside that worktree comes back empty. A dirty
 * worktree keeps its files and its branch (`worktree/<name>`) on disk; this
 * script says so and stops, rather than guess whether the owner wants it. */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY = path.join(ROOT, ".worktrees.json");

const name = process.argv[2];
if (!name) {
	console.error("usage: node Server/worktree-down.mjs <name>");
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
const entry = registry[name];
if (!entry) {
	console.error(`worktree-down: "${name}" is not in ${REGISTRY} — nothing recorded to tear down. If a worktree exists on disk anyway, remove it by hand with \`git worktree remove\`.`);
	process.exit(1);
}

// Bounded, PID-only kill (never by name or port pattern — CLAUDE.md's own
// never-list) — the worktree's server.js is itself a small supervisor that
// forks Server/run.js as a child, so a plain kill of the top pid can leave
// the grandchild running; `taskkill /T /F` takes the whole tree at once.
if (entry.pid) {
	console.log(`worktree-down: stopping server pid ${entry.pid}…`);
	const result = spawnSync("taskkill", ["/PID", String(entry.pid), "/T", "/F"], { encoding: "utf8", windowsHide: true });
	if (result.status !== 0 && !/not found/i.test(result.stdout || "")) {
		console.log(`worktree-down: taskkill said: ${(result.stdout || result.stderr || "").trim()}`);
	}
}

// Servex is optional, always — stays silent and succeeds whether or not it's
// answering. Removes the name from the proxy's map the same instant it stops.
try {
	await fetch(`http://127.0.0.1:${process.env.SERVEX_PORT || 8090}/api/projects/${encodeURIComponent(name)}`, {
		method: "DELETE", signal: AbortSignal.timeout(2000),
	});
} catch {}

// The directory itself is already gone (removed by hand, or its disk cleaned up some other
// way) — worktree-sweep.mjs hits this whenever a registered worktree's dir vanished. There is
// nothing dirty to protect, so skip straight to clearing git's own record of it (`worktree
// remove` when it still lists the path, else `prune` for the leftover admin files) and the
// registry entry, rather than the "could not read git status" refusal below, which would
// otherwise leave a dead entry in .worktrees.json forever.
if (!fs.existsSync(entry.path)) {
	console.log(`worktree-down: ${entry.path} no longer exists on disk — clearing its record only.`);
	try { execFileSync("git", ["worktree", "remove", "--force", entry.path], { cwd: ROOT, windowsHide: true }); } catch {}
	try { execFileSync("git", ["worktree", "prune"], { cwd: ROOT, windowsHide: true }); } catch {}
	try { execFileSync("git", ["branch", "-D", entry.branch], { cwd: ROOT, windowsHide: true }); }
	catch (e) { console.error(`worktree-down: could not delete branch ${entry.branch} — remove it by hand (\`git branch -D ${entry.branch}\`).`); }
	if (entry.log) { try { fs.unlinkSync(entry.log); } catch {} }
	delete registry[name];
	write_registry(registry);
	console.log(`worktree-down: done.`);
	process.exit(0);
}

let status = "";
try {
	status = execFileSync("git", ["-C", entry.path, "status", "--porcelain"], { encoding: "utf8", windowsHide: true });
} catch (e) {
	console.error(`worktree-down: could not read git status for ${entry.path} (${e.message}) — leaving the worktree in place. Remove the registry entry by hand if it's actually gone.`);
	process.exit(1);
}

if (status.trim()) {
	console.log(`worktree-down: ${entry.path} has uncommitted changes — NOT removing it, so nothing is discarded:`);
	console.log(status.trim().split("\n").map(l => "    " + l).join("\n"));
	console.log(`worktree-down: server stopped. The worktree and its branch (${entry.branch}) are left on disk at ${entry.path} — remove them yourself once you've dealt with those changes (\`git -C ${ROOT} worktree remove ${entry.path}\` once it's clean).`);
	delete registry[name];
	write_registry(registry);
	process.exit(0);
}

try {
	execFileSync("git", ["worktree", "remove", entry.path], { cwd: ROOT, stdio: "inherit", windowsHide: true });
	console.log(`worktree-down: removed ${entry.path}.`);
} catch (e) {
	console.error(`worktree-down: \`git worktree remove\` failed — the worktree is left in place at ${entry.path}. Server is already stopped.`);
	delete registry[name];
	write_registry(registry);
	process.exit(1);
}

// `git worktree remove` never deletes the branch it was on — do that here,
// now that the worktree using it is gone, so worktree-up.mjs can reuse the
// same name later without `-B`.
try {
	execFileSync("git", ["branch", "-D", entry.branch], { cwd: ROOT, stdio: "inherit", windowsHide: true });
} catch (e) {
	console.error(`worktree-down: could not delete branch ${entry.branch} — remove it by hand (\`git branch -D ${entry.branch}\`).`);
}

if (entry.log) { try { fs.unlinkSync(entry.log); } catch {} }

delete registry[name];
write_registry(registry);
console.log(`worktree-down: done.`);

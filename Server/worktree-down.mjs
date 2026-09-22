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
	const result = spawnSync("taskkill", ["/PID", String(entry.pid), "/T", "/F"], { encoding: "utf8" });
	if (result.status !== 0 && !/not found/i.test(result.stdout || "")) {
		console.log(`worktree-down: taskkill said: ${(result.stdout || result.stderr || "").trim()}`);
	}
}

let status = "";
try {
	status = execFileSync("git", ["-C", entry.path, "status", "--porcelain"], { encoding: "utf8" });
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
	execFileSync("git", ["worktree", "remove", entry.path], { cwd: ROOT, stdio: "inherit" });
	console.log(`worktree-down: removed ${entry.path}.`);
} catch (e) {
	console.error(`worktree-down: \`git worktree remove\` failed — the worktree is left in place at ${entry.path}. Server is already stopped.`);
	delete registry[name];
	write_registry(registry);
	process.exit(1);
}

delete registry[name];
write_registry(registry);
console.log(`worktree-down: done. Branch ${entry.branch} still exists (worktree removal doesn't delete branches) — nothing else to clean up.`);

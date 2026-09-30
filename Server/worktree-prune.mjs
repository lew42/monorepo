/* `node Server/worktree-prune.mjs [--dry]` — removes every git worktree that is finished with:
 *   1. its branch is fully merged into michael/dev (`git merge-base --is-ancestor`);
 *   2. no Servex agent that is idle, working or queued has its cwd inside it (GET :8090/agents);
 *   3. it is not a pool slot (.worktree-pool.json: the Pool removes its own) and not the main tree;
 *   4. nothing in it but its dev server's own logs (page.jsonl, files.jsonl, the clarity flags),
 *      which are put back to HEAD inside THAT worktree first. Any other change → skip, named.
 * Its dev server and health watcher are stopped (worktree-down.mjs for a registered one; any node
 * process whose command line names the worktree otherwise), then `git worktree remove` (never
 * --force) and `git branch -d` (only a merged branch). One line per worktree: pruned / skip: why.
 * Why (node-reliability, 2026-09-30): 76 worktrees had piled up, 52 already merged; pruned 38.
 * Every spawn sets windowsHide. */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// the MAIN repo (its registry, pool file and worktree list), even when this copy runs from a worktree
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAIN = path.resolve(HERE, execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: HERE, encoding: "utf8", windowsHide: true }).trim(), "..").replace(/\\/g, "/");
const DRY = process.argv.includes("--dry");
const BASE = "michael/dev";
const slash = s => String(s || "").replace(/\\/g, "/").toLowerCase();
const git = (cwd, ...a) => spawnSync("git", ["-C", cwd, ...a], { encoding: "utf8", windowsHide: true });
const LOG = f => /(^|\/)(page|files)\.jsonl$/.test(f) || f === ".claude/skills/clarity/flags.jsonl";

let agents = [];
try { const r = await fetch(`http://127.0.0.1:${process.env.SERVEX_PORT || 8090}/agents`); const j = await r.json(); agents = j.agents || j; }
catch { console.error("worktree-prune: Servex is not answering, so no agent can be ruled out — nothing pruned."); process.exit(1); }
// a spawn still waiting at the gate is not in /agents yet: its cwd is in spawn-queue.json
const home = process.env.SERVEX_HOME || path.join(process.env.LOCALAPPDATA || "", "lew42", "servex");
let queued = []; try { queued = JSON.parse(fs.readFileSync(path.join(home, "spawn-queue.json"), "utf8")).map(e => slash(e.spec?.cwd)); } catch {}
const live = queued.concat(agents.filter(a => ["idle", "working", "queued", "starting"].includes(a.state)).map(a => slash(a.cwd))).filter(Boolean);
const read = f => { try { return JSON.parse(fs.readFileSync(path.join(MAIN, f), "utf8")); } catch { return {}; } };
const registry = read(".worktrees.json"), pool = new Set((read(".worktree-pool.json").slots || []).map(s => slash(s.path)));

const trees = git(MAIN, "worktree", "list", "--porcelain").stdout.split(/\r?\n\r?\n/).filter(Boolean)
	.map(b => ({ path: /^worktree (.*)$/m.exec(b)?.[1], branch: /^branch refs\/heads\/(.*)$/m.exec(b)?.[1], locked: /^locked/m.test(b) }));
let pruned = 0;
for (const w of trees.slice(1)) {
	const name = path.basename(w.path), p = slash(w.path);
	const status = () => git(w.path, "status", "--porcelain").stdout.split(/\r?\n/).filter(Boolean).map(l => ({ x: l.slice(0, 2), f: l.slice(3).replace(/^"|"$/g, "") }));
	let why = null;
	if (!w.branch) why = "no branch (detached)";
	else if (w.locked) why = "locked";
	else if (pool.has(p)) why = "a pool slot (the Pool removes its own)";
	else if (git(MAIN, "merge-base", "--is-ancestor", w.branch, BASE).status !== 0) why = `branch not merged into ${BASE}`;
	else if (live.some(c => c.startsWith(p))) why = "a live agent works there";
	else if (!fs.existsSync(w.path)) why = "missing on disk (run git worktree prune)";
	else { const other = status().filter(s => !LOG(s.f)); if (other.length) why = `${other.length} changed file(s), e.g. ${other[0].f}`; }
	if (why) { console.log(`skip   ${name}: ${why}`); continue; }
	if (DRY) { console.log(`would  ${name}`); continue; }
	for (const s of status()) {   // only the server's logs are left, and only inside this worktree
		if (s.x === "??") fs.rmSync(path.join(w.path, s.f), { force: true, recursive: true });
		else git(w.path, "checkout", "--", s.f);
	}
	if (registry[name]) spawnSync(process.execPath, [path.join(MAIN, "Server", "worktree-down.mjs"), name], { cwd: MAIN, encoding: "utf8", windowsHide: true });
	else stop_node_in(w.path);
	if (fs.existsSync(w.path)) { const r = git(MAIN, "worktree", "remove", w.path); if (r.status !== 0) { console.log(`FAILED ${name}: ${(r.stderr || r.stdout).trim().split("\n").pop()}`); continue; } }
	git(MAIN, "branch", "-d", w.branch);
	pruned++; console.log(`pruned ${name}`);
}
git(MAIN, "worktree", "prune");
console.log(`${DRY ? "dry run" : `${pruned} pruned`}; ${trees.length - 1 - (DRY ? 0 : pruned)} worktree(s) remain`);

/* A worktree started by hand (not in .worktrees.json) may still run a dev server or health.mjs. */
function stop_node_in(dir){
	const needle = dir.replace(/\//g, "\\").toLowerCase();
	let rows = [];
	try { rows = JSON.parse(execFileSync("powershell", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Select ProcessId,CommandLine | ConvertTo-Json"], { encoding: "utf8", windowsHide: true })); } catch {}
	for (const r of [].concat(rows || [])) if (String(r.CommandLine || "").toLowerCase().includes(needle))
		spawnSync("taskkill", ["/PID", String(r.ProcessId), "/T", "/F"], { windowsHide: true });
}

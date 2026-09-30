/* `node Server/worktree-prune.mjs [--dry] [--only <name>]` — removes every git worktree that is finished with:
 *   1. its branch is fully merged into michael/dev (`git merge-base --is-ancestor`);
 *   2. no Servex agent that is idle, working or queued has its cwd inside it (GET :8090/agents);
 *   3. it is not a pool slot (.worktree-pool.json: the Pool removes its own) and not the main tree;
 *   4. nothing in it but its dev server's own logs (page.jsonl, files.jsonl, the clarity flags),
 *      which are put back to HEAD inside THAT worktree first. Any other change → skip, named.
 * Its dev server and health watcher are stopped (worktree-down.mjs for a registered one; any node
 * process whose command line names the worktree otherwise), then `git worktree remove` (never
 * --force) and `git branch -d` (only a merged branch). One line per worktree: pruned / skip: why.
 * It never stops a server in the MAIN tree: :3104 is Servex's, and :8137 is on the keep list
 * (the owner's phone; a hand-started server there is not a leftover).
 * Why (node-reliability, 2026-09-30): 76 worktrees had piled up, 52 already merged; pruned 38.
 * Uncommitted work (anything but those logs) or a branch with commits outside michael/dev is
 * never deleted, only named; salvage (Pool.salvage, by hand) is the one path that may move it.
 * `--only <name>` looks at that one worktree (the pool-taken proof, 2026-09-30).
 * Every spawn sets windowsHide. */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// the MAIN repo (its registry, pool file and worktree list), even when this copy runs from a worktree
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAIN = path.resolve(HERE, execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: HERE, encoding: "utf8", windowsHide: true }).trim(), "..").replace(/\\/g, "/");
const DRY = process.argv.includes("--dry");
const ONLY = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
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
	if (ONLY && name !== ONLY) continue;
	const status = () => git(w.path, "status", "--porcelain", "--untracked-files=all").stdout.split(/\r?\n/).filter(Boolean).map(l => ({ x: l.slice(0, 2), f: l.slice(3).replace(/^"|"$/g, "") }));
	let why = null;
	if (!fs.existsSync(w.path)) why = "missing on disk (its entry is cleared by the git worktree prune at the end)";
	else if (!w.branch) why = "no branch (detached)";
	else if (w.locked) why = "locked";
	else if (pool.has(p)) why = "a pool slot (the Pool removes its own)";
	else if (git(MAIN, "merge-base", "--is-ancestor", w.branch, BASE).status !== 0) why = `branch not merged into ${BASE}`;
	else if (live.some(c => c === p || c.startsWith(p + "/"))) why = "a live agent works there";
	else { const other = status().filter(s => !LOG(s.f)); if (other.length) why = `${other.length} changed file(s), e.g. ${other[0].f}`; }
	if (why) { console.log(`skip   ${name}: ${why}`); continue; }
	if (DRY) { console.log(`would  ${name}`); continue; }
	// stop its server FIRST: a running one writes its logs again right after they are put back (pool-taken, 2026-09-30)
	if (registry[name]) spawnSync(process.execPath, [path.join(MAIN, "Server", "worktree-down.mjs"), name], { cwd: MAIN, encoding: "utf8", windowsHide: true });
	stop_node_in(w.path, name);
	for (const s of status()) {   // only the server's logs are left, and only inside this worktree
		if (s.x === "??") fs.rmSync(path.join(w.path, s.f), { force: true, recursive: true });
		else git(w.path, "checkout", "--", s.f);
	}
	if (fs.existsSync(w.path)) { const r = git(MAIN, "worktree", "remove", w.path); if (r.status !== 0) { console.log(`FAILED ${name}: ${(r.stderr || r.stdout).trim().split("\n").pop()}`); continue; } }
	const b = git(MAIN, "branch", "-d", w.branch);
	pruned++; console.log(`pruned ${name}${b.status ? `  (branch ${w.branch} kept: ${(b.stderr || b.stdout).trim().split("\n")[0]})` : ""}`);
}
git(MAIN, "worktree", "prune");
console.log(`${DRY ? "dry run" : `${pruned} pruned`}; ${trees.length - 1 - (DRY ? 0 : pruned)} worktree(s) remain`);

/* Anything still running in the worktree: a dev server, health.mjs, and the cmd wrapper worktree-up
 * starts, whose command line is a bare `node server.js` that names only its log (.worktree-logs\<name>.log).
 * Missing the wrapper left it restarting run.js, which wrote the logs again (pool-taken, 2026-09-30).
 * The wrapper goes first: its /T takes its children with it. */
function stop_node_in(dir, name){
	const needle = dir.replace(/\//g, "\\").toLowerCase() + "\\";   // "…\foo\" never matches a sibling "…\foo-2\"
	const log = (".worktree-logs\\" + name + ".log").toLowerCase();  // "…\foo.log" never matches "…\foo-2.log"
	let rows = [];
	try { rows = JSON.parse(execFileSync("powershell", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='node.exe' OR Name='cmd.exe'\" | Select ProcessId,Name,CommandLine | ConvertTo-Json"], { encoding: "utf8", windowsHide: true })); } catch {}
	const mine = [].concat(rows || []).filter(r => { const c = String(r.CommandLine || "").toLowerCase(); return c.includes(needle) || c.includes(log); });
	mine.sort((a, b) => (b.Name === "cmd.exe") - (a.Name === "cmd.exe"));
	for (const r of mine) spawnSync("taskkill", ["/PID", String(r.ProcessId), "/T", "/F"], { windowsHide: true });
}

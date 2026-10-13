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
 * `--salvage` (2026-10-13, worktree-cleanup): a merged worktree skipped ONLY for changed files is not
 *   skipped: every change (but the server logs above) is committed on ITS OWN branch as
 *   "salvage(<name>): working tree at prune, <date>", then the worktree is removed and the branch
 *   kept. Never --force, never a clean or a stash; a file over 50 MB is skipped, named. With --dry it
 *   prints what each commit would hold. `--manifest <file>` writes old path -> branch -> commit as
 *   JSON; `git worktree add <path> <branch>` brings any one back.
 * `--idle-hours <n>`: skip a worktree whose last commit or any changed file is newer than n hours, so
 *   a timer can run this without racing an agent that writes there from another cwd.
 * A detached worktree whose HEAD is already in michael/dev counts as merged (wt-task-folders).
 * A worktree named like a pool slot (qf-1..9) is the Pool's (recycle_orphans), never this script's.
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
const SALVAGE = process.argv.includes("--salvage");
const MANIFEST = process.argv.includes("--manifest") ? process.argv[process.argv.indexOf("--manifest") + 1] : null;
const POOL_NAME = new RegExp(`^${process.env.SERVEX_POOL_PREFIX || "qf"}-\\d+$`);
const BIG = 50 << 20, pad = n => String(n).padStart(2, "0"), d = new Date();
const DAY = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const IDLE_H = process.argv.includes("--idle-hours") ? Number(process.argv[process.argv.indexOf("--idle-hours") + 1]) : 0;
const manifest = [];
const slash = s => String(s || "").replace(/\\/g, "/").toLowerCase();
const git = (cwd, ...a) => spawnSync("git", ["-C", cwd, ...a], { encoding: "utf8", windowsHide: true, maxBuffer: 64 << 20 });
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
	let why = null, keep = null;   // keep: the changed files a --salvage commit holds
	const head = fs.existsSync(w.path) ? git(w.path, "rev-parse", "HEAD").stdout.trim() : "";
	if (!fs.existsSync(w.path)) why = "missing on disk (its entry is cleared by the git worktree prune at the end)";
	else if (w.locked) why = "locked";
	else if (pool.has(p)) why = "a pool slot (the Pool removes its own)";
	else if (POOL_NAME.test(name)) why = "named like a pool slot: the Pool recycles it (recycle_orphans)";
	else if (git(MAIN, "merge-base", "--is-ancestor", w.branch || head, BASE).status !== 0) why = w.branch ? `branch not merged into ${BASE}` : `detached at ${head.slice(0, 9)}, not in ${BASE}`;
	else if (live.some(c => c === p || c.startsWith(p + "/"))) why = "a live agent works there";
	else if (IDLE_H && last_touch(w.path, status()) > Date.now() - IDLE_H * 3600e3) why = `touched in the last ${IDLE_H} h`;
	else {
		const other = status().filter(s => !LOG(s.f));
		const big = other.find(s => { try { return fs.statSync(path.join(w.path, s.f)).size > BIG; } catch { return false; } });
		if (other.length && SALVAGE && !big) keep = other;
		else if (other.length) why = big ? `${big.f} is over 50 MB: salvage it by hand` : `${other.length} changed file(s), e.g. ${other[0].f}`;
	}
	if (why) { console.log(`skip   ${name}: ${why}`); continue; }
	const branch = w.branch || `salvage/${name}-${DAY}`, msg = `salvage(${name}): working tree at prune, ${DAY}`;
	if (DRY) {
		console.log(keep ? `salvage ${name}: ${keep.length} file(s) -> one commit on ${branch}, e.g. ${keep.slice(0, 3).map(s => s.f).join(", ")}` : `would  ${name}`);
		if (keep) manifest.push({ name, path: w.path, branch, commit: null, files: keep.map(s => s.x.trim() + " " + s.f) });
		continue;
	}
	// stop its server FIRST: a running one writes its logs again right after they are put back (pool-taken, 2026-09-30)
	if (registry[name]) spawnSync(process.execPath, [path.join(MAIN, "Server", "worktree-down.mjs"), name], { cwd: MAIN, encoding: "utf8", windowsHide: true });
	stop_node_in(w.path, name);
	for (const s of status().filter(s => LOG(s.f))) {   // the server's logs, only inside this worktree
		if (s.x === "??") fs.rmSync(path.join(w.path, s.f), { force: true, recursive: true });
		else git(w.path, "checkout", "--", s.f);
	}
	let commit = null;
	if (keep) {   // everything else is committed on the worktree's own branch, never thrown away
		const step = (...a) => { const r = git(w.path, ...a); if (r.status !== 0) throw new Error(`git ${a[0]}: ${(r.stderr || r.stdout).trim().split("\n")[0]}`); return r.stdout; };
		try {
			if (!w.branch) step("switch", "-c", branch);
			step("add", "-A"); step("commit", "-q", "-m", msg);
			commit = step("rev-parse", "HEAD").trim();
		} catch (e) { console.log(`FAILED ${name}: salvage stopped at ${e.message}; nothing removed`); continue; }
		manifest.push({ name, path: w.path, branch, commit, files: keep.map(s => s.x.trim() + " " + s.f), restore: `git worktree add ${w.path} ${branch}` });
	}
	if (status().length) { console.log(`FAILED ${name}: still changed (${status()[0].f}); nothing removed`); continue; }
	if (fs.existsSync(w.path)) { const r = git(MAIN, "worktree", "remove", w.path); if (r.status !== 0) { console.log(`FAILED ${name}: ${(r.stderr || r.stdout).trim().split("\n").pop()}`); continue; } }
	// a salvage/* branch is a record, never deleted (pool.md), even once its head is merged
	const b = !w.branch ? { status: 1, stdout: "detached, no branch" } : commit ? { status: 1, stdout: `salvaged as ${commit.slice(0, 9)}` }
		: w.branch.startsWith("salvage/") ? { status: 1, stdout: "a salvage branch is kept" } : git(MAIN, "branch", "-d", w.branch);
	pruned++; console.log(`${commit ? "salvaged" : "pruned"} ${name}${b.status ? `  (branch ${branch} kept: ${(b.stderr || b.stdout).trim().split("\n")[0]})` : ""}`);
}
git(MAIN, "worktree", "prune");
if (MANIFEST && manifest.length) { fs.mkdirSync(path.dirname(path.resolve(MANIFEST)), { recursive: true }); fs.writeFileSync(MANIFEST, JSON.stringify({ at: new Date().toISOString(), dry: DRY, base: BASE, worktrees: manifest }, null, "\t") + "\n"); console.log(`manifest: ${MANIFEST} (${manifest.length})`); }
console.log(`${DRY ? "dry run" : `${pruned} pruned`}; ${trees.length - 1 - (DRY ? 0 : pruned)} worktree(s) remain`);

/* The newest of its HEAD commit and its changed files, in ms. */
function last_touch(dir, changed){
	let t = Number(git(dir, "log", "-1", "--format=%ct").stdout.trim()) * 1000 || 0;
	for (const s of changed) { try { t = Math.max(t, fs.statSync(path.join(dir, s.f)).mtimeMs); } catch {} }
	return t;
}

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

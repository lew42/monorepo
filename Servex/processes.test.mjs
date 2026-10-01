/* The process monitor's sorting, on made-up rows (no PowerShell, no Servex):
 *   node Servex/processes.test.mjs
 * Rows are [pid, ppid, name, mb, cpu_s, born, cmd]. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Processes, { task_key } from "./Processes.js";
import { decide as decide_game } from "./Games.js";

let pass = 0;
const ok = (cond, what) => { assert.ok(cond, what); pass++; };

const GIT = "C:\\Program Files\\Git\\usr\\bin\\";
const me = process.pid;
const task = { dir: "C:/Code/lew42/monorepo/public/framework/ai/2026-09-30/process-monitor" };
const agents = new Map([
	["task-mastermind-x", { id: "task-mastermind-x", state: "working", claude_pid: 100, task }],
	["minion-x", { id: "minion-x", state: "idle", parent: "task-mastermind-x", session_id: "11111111-2222-3333-4444-555555555555" }],
	["assistant-fast", { id: "assistant-fast", state: "idle", claude_pid: 300 }],
	["minion-lost", { id: "minion-lost", state: "working", claude_pid: 999, task }]
]);
const p = new Processes({ reaping: false, servex: { agents: { live: agents } } });
p.detached = () => [500];

const rows = [
	[me, 1, "node.exe", 200, 1, 1000, "node Servex/index.js"],
	[100, me, "claude.exe", 300, 1, 2000, "claude.exe --output-format stream-json"],
	[101, 100, "bash.exe", 6, 0, 2100, "bash -c source /c/Users/x/.claude/shell-snapshots/s.sh"],
	[200, me, "claude.exe", 250, 1, 2000, "claude.exe --session-id 11111111-2222-3333-4444-555555555555"],
	[300, me, "claude.exe", 150, 1, 2000, "claude.exe"],
	[400, 77, "claude.exe", 180, 1, 900, "c:\\Users\\x\\.vscode\\claude.exe"],   // a VS Code session: parent 77 is gone
	[401, 400, "bash.exe", 6, 0, 950, "bash -c source shell-snapshots"],
	[402, 9999, "tail.exe", 5, 0, 960, GIT + "tail.exe -f /c/Users/x/AppData/Local/Temp/claude/out"],   // exec'd: Windows parent gone, Git's parent is 401
	[500, 88, "cmd.exe", 5, 0, 800, "cmd /c node server.js"],
	[501, 500, "node.exe", 60, 5, 810, "node server.js"],
	[600, 55, "tail.exe", 5, 0, 700, GIT + "tail.exe -F c:/Code/lew42/monorepo/page.jsonl"],   // an orphan
	[601, 56, "grep.exe", 5, 0, 700, GIT + "grep.exe --line-buffered prompt"],                 // its partner, Git's parent gone too
	[602, 57, "node.exe", 50, 0, 700, "node C:\\Code\\lew42\\worktrees\\qf-4\\Server\\run.js"], // ours, parent gone, not a waiter
	[700, 1, "chrome.exe", 400, 9, 100, "chrome.exe"],
	[701, 1, "tail.exe", 5, 0, 100, "C:\\cygwin\\bin\\tail.exe -f C:\\other.log"]              // the owner's own: never ours
];
const msys = [[10, 1, 401], [11, 10, 402], [20, 18, 600], [21, 19, 601]];   // Git: 402's parent is 401; 600/601's parents are gone

p.take({ rows, msys });
const s = p.now, by = key => s.groups.find(g => g.key === key), of = pid => s.groups.find(g => g.pids.includes(pid))?.key;

ok(task_key(task.dir) === "2026-09-30/process-monitor", "task_key cuts at ai/");
ok(of(100) === "task 2026-09-30/process-monitor" && of(101) === of(100), "an agent's claude.exe and its bash count for its task");
ok(of(200) === of(100), "a minion with no task counts for its parent's, found by its session id");
ok(agents.get("minion-x").claude_pid === 200, "the pid learned from the session id is kept on the agent");
ok(of(300) === "front desk", "the front desk is its own group");
ok(of(me) === "servex", "Servex itself");
ok(of(400) === "session 400" && of(401) === "session 400", "a VS Code Claude session and its shell");
ok(of(402) === "session 400", "a Git Bash tool whose Windows parent is gone stays with its session through Git's own tree");
ok(of(500) === "dev servers" && of(501) === "dev servers", "a detached dev server and its child");
ok(of(600) === "orphans" && of(601) === "orphans", "a tail|grep whose parents are gone is an orphan");
ok(of(602) === "dev servers", "a parentless node of ours is shown, never called an orphan");
ok(!of(700) && !of(701), "chrome and a stranger's tail are not ours");
ok(s.orphans.map(o => o.pid).sort().join() === "600,601", "the orphan list");
ok(by("task 2026-09-30/process-monitor").mb === 556, "a task's RAM is the sum of its processes");
ok(s.ours.mb + s.other.mb === rows.reduce((t, r) => t + r[3], 0), "ours + other = everything");
ok(s.running.find(r => r.id === "minion-lost").lost === true, "a working agent with no live process is flagged lost");
ok(s.running.find(r => r.id === "task-mastermind-x").pid === 100 && !s.running.find(r => r.id === "task-mastermind-x").lost, "a working agent with its process");

// CPU: a second sample 10 s later, 2 s more CPU on chrome
p.last_at = Date.now() - 10000;
p.take({ rows: rows.map(r => r[0] === 700 ? [...r.slice(0, 4), r[4] + 2, ...r.slice(5)] : r), msys });
ok(p.procs.get(700).cpu === Math.round(1000 * 2 / 10 / p.cores) / 10, "CPU % is of the whole machine");

// reaping: only the waiters, only after the idle time, never the node
const killed = [];
const real = process.kill;
process.kill = pid => { killed.push(pid); };
try {
	p.reaping = true; p.reap_after_ms = 60000;
	for (const q of p.procs.values()) q.idle_since = Date.now() - 120000;
	p.reap();
} finally { process.kill = real; }
ok(killed.sort().join() === "600,601", "reaps the idle orphaned waiters and nothing else");
ok(p.reaped.length === 2 && p.reaped[0].ok, "each reap is recorded");

ok(p.history.length === 2 && typeof p.history[1].ours_mb === "number", "an hour of points is kept");
ok(/Ours .* GB/.test(p.line()), "one line for system_health");
console.log(`processes.test: ${pass} checks pass`);

// ── worktree clean-up: what counts as log noise, and forgetting a project ──
const { noise, default: Worktrees } = await import("./Worktrees.js");
const n = (code, path) => noise({ code, path });
ok(n(" M", "public/files.jsonl") && n(" M", ".claude/skills/clarity/flags.jsonl") && n("??", "public/framework/ai/2026/09/25/x/page.jsonl"), "logs anywhere are noise");
ok(n("??", "public/framework/ai/2026-09-25/x/shot.png") && !n("??", "public/framework/ai/2026-09-30/x/plan.md"), "a new screenshot under ai/ is noise; a new plan.md is not");
ok(!n(" M", "Server/layout-check.mjs") && !n("??", "undefined/a.png") && !n(" M", "public/framework/ai2/ai2.css"), "code is never noise");
ok(!n(" D", "public/files.jsonl") && !n("R ", "a.jsonl -> b.jsonl"), "a deletion or a rename is never noise");
const sx = { projects: [{ name: "gone-wt" }, { name: "monorepo" }], processes: new Map([["gone-wt", {}]]), ports: { ports: { "gone-wt": 3150, monorepo: 3104 }, save(){ this.saved = true; } } };
new Worktrees({ servex: sx }).forget("gone-wt");
ok(sx.projects.length === 1 && !sx.processes.has("gone-wt") && !("gone-wt" in sx.ports.ports) && sx.ports.saved, "a removed worktree's project, runner and port are forgotten");

// quiet_min: logs/HEAD's mtime lies when git gc touches it without appending — the LAST LINE's own
// timestamp is what counts. A fixture under a temp dir: logs/HEAD written (so its mtime is "now")
// but its last entry is 3 days old.
{
	const os = await import("node:os");
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "quiet-min-"));
	const gitdir = path.join(tmp, "worktrees", "fixture-wt");
	fs.mkdirSync(path.join(gitdir, "logs"), { recursive: true });
	const threeDaysAgo = Math.round(Date.now() / 1000) - 3 * 86400;
	fs.writeFileSync(path.join(gitdir, "logs", "HEAD"),
		`0000000000000000000000000000000000000000 1111111111111111111111111111111111111111 Someone <someone@example.com> ${threeDaysAgo} -0500\tcommit: old work\n`);
	fs.writeFileSync(path.join(gitdir, "HEAD"), "1111111111111111111111111111111111111111\n");
	fs.writeFileSync(path.join(gitdir, "index"), "fake index\n");
	// HEAD and index are old too, so only logs/HEAD's (mis-set) mtime would make this look fresh
	const old = new Date(Date.now() - 3 * 86400000);
	fs.utimesSync(path.join(gitdir, "HEAD"), old, old);
	fs.utimesSync(path.join(gitdir, "index"), old, old);
	const quiet = new Worktrees({ servex: sx });
	quiet.common = tmp;
	const min = quiet.quiet_min({ name: "fixture-wt" });
	ok(min !== null && min >= 3 * 24 * 60 - 5, "logs/HEAD touched now but last entry 3 days old still counts as quiet");
	fs.rmSync(tmp, { recursive: true, force: true });
}

// ask 1 (process-monitor, the RAM squeeze): stop_idle() stops a landed task's worktree server
// through Servex's own stop path, and never touches a qf-* pool slot.
{
	const norm2 = p => path.resolve(String(p)).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
	const landed_path = path.resolve("C:/Code/lew42/worktrees/landed-wt");
	const sx2 = {
		commands: [],
		processes: new Map([["landed-wt", { status: "online" }], ["qf-9", { status: "online" }]]),
		command: async (name, verb) => { sx2.commands.push({ name, verb }); },
		agents: { live: new Map() },   // no live agent anywhere: nothing is "actively working there right now"
		lifecycle: { open: () => [], close: async () => {} },
		log: { append: async () => ({ ok: true }) }
	};
	const wtr = new Worktrees({ servex: sx2 });
	const tasksMap = new Map([[norm2(landed_path), { key: "x/landed", landed: true, paused: false, agent: null, worktree: landed_path }]]);
	const items = [
		{ name: "landed-wt", path: landed_path, branch: "worktree/landed-wt", state: "open", why: "its branch holds unmerged commits" },
		{ name: "qf-9", path: path.resolve("C:/Code/lew42/worktrees/qf-9"), branch: "worktree/qf-9", state: "pool", why: "the quick-fix pool recycles it" }
	];
	const stopped = await wtr.stop_idle(items, tasksMap);
	ok(stopped === 1 && sx2.commands.length === 1 && sx2.commands[0].name === "landed-wt" && sx2.commands[0].verb === "stop",
		"a landed task's worktree server is stopped, through Servex's own stop path (command(name, \"stop\"))");
	ok(!sx2.commands.some(c => c.name === "qf-9"), "a qf-* pool slot's server is never touched, taken or not");
}
console.log(`processes.test (with worktrees): ${pass} checks pass`);

// ── idle: stale VS Code sessions (ask 3), and the games rule (ask 4) ──────
{
	// a session group is STALE once every member (the claude.exe plus any
	// child shell) has used no CPU for `stale_h` hours; `idle_since` is set
	// directly here rather than waited for, since it only moves forward once
	// a process stops being busy (see `take()`'s own comment on the field).
	const p2 = new Processes({ reaping: false, stale_h: 2, servex: { agents: { live: new Map() } } });
	const rows2 = [
		[me, 1, "node.exe", 50, 0, 1000, "node x"],                                       // Servex itself, for sort()'s own bookkeeping
		[900, 77, "claude.exe", 200, 1, 500, "c:\\Users\\x\\.vscode\\claude.exe"],          // idle 3 h below: stale
		[901, 55, "claude.exe", 200, 1, 500, "c:\\Users\\x\\.vscode\\claude.exe"]           // idle 1 h below: not stale
	];
	p2.take({ rows: rows2 });
	p2.procs.get(900).idle_since = Date.now() - 3 * 3600000;
	p2.procs.get(901).idle_since = Date.now() - 1 * 3600000;
	p2.now = p2.sort(Date.now());
	const by2 = key => p2.now.groups.find(g => g.key === key);
	ok(by2("session 900")?.stale === true, "a session idle 3 h is stale");
	ok(by2("session 901")?.stale === false, "a session idle 1 h is not stale");
	ok(p2.now.sessions.n === 2 && p2.now.sessions.stale === 1, "sessions{} counts n and stale, top level");
	ok(/VS Code conversation.*idle over 2 h/.test(p2.line()), "line() gets one clause naming the stale ones");
}

// the game rule, `decide()` from Games.js — pure, no PowerShell, no Servex:
// ALL three must hold (idle past the threshold, RAM tight, a listed game
// actually running), tested at the exact edges the brief names.
{
	const running = [{ pid: 4242, name: "StarCraft.exe" }];
	const cfg = { idle_min: 30, tight_mb: 6144 };
	ok(decide_game({ idle_min: 31, free_mb: 4000, running }, cfg)?.pid === 4242, "closes when idle > 30 min AND RAM is tight AND a game runs");
	ok(decide_game({ idle_min: 29, free_mb: 4000, running }, cfg) === null, "never at idle 29 (the owner's exact edge: not yet past 30)");
	ok(decide_game({ idle_min: 31, free_mb: 8000, running }, cfg) === null, "never with 8 GB free (RAM not tight)");
	ok(decide_game({ idle_min: 31, free_mb: 4000, running: [] }, cfg) === null, "never with no listed game running");
}
console.log(`processes.test (idle: stale sessions + games): ${pass} checks pass`);

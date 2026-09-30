/* The process monitor's sorting, on made-up rows (no PowerShell, no Servex):
 *   node Servex/processes.test.mjs
 * Rows are [pid, ppid, name, mb, cpu_s, born, cmd]. */
import assert from "node:assert/strict";
import Processes, { task_key } from "./Processes.js";

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
ok(n("??", "public/framework/ai/2026-09-25/x/shot.png"), "a new file under ai/ (a screenshot, a card folder) is noise");
ok(!n(" M", "Server/layout-check.mjs") && !n("??", "undefined/a.png") && !n(" M", "public/framework/ai2/ai2.css"), "code is never noise");
ok(!n(" D", "public/files.jsonl") && !n("R ", "a.jsonl -> b.jsonl"), "a deletion or a rename is never noise");
const sx = { projects: [{ name: "gone-wt" }, { name: "monorepo" }], processes: new Map([["gone-wt", {}]]), ports: { ports: { "gone-wt": 3150, monorepo: 3104 }, save(){ this.saved = true; } } };
new Worktrees({ servex: sx }).forget("gone-wt");
ok(sx.projects.length === 1 && !sx.processes.has("gone-wt") && !("gone-wt" in sx.ports.ports) && sx.ports.saved, "a removed worktree's project, runner and port are forgotten");
console.log(`processes.test (with worktrees): ${pass} checks pass`);

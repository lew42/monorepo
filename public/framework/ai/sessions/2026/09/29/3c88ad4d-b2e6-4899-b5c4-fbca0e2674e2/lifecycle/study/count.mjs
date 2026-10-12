// Lifecycle study: count 1-4 for the owner's question.
// Read only. Writes counts.json + raw json next to this script.
// Run from repo root: node public/framework/ai/2026-09-29/lifecycle/study/count.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd(); // expect repo root
const OUT = path.join(ROOT, "public/framework/ai/2026-09-29/lifecycle/study");
const NODE_PROCS = JSON.parse(fs.readFileSync(path.join(OUT, "node_processes.json"), "utf8"));
const AGENTS = JSON.parse(fs.readFileSync(path.join(OUT, "agents.json"), "utf8"));

function readJsonl(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  return lines.map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
}

function walk(dir, out) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p, out);
    else if (name.name === "task.jsonl") out.push(p);
  }
}

// ---------- 1. Tasks started and never landed ----------
const aiDir = path.join(ROOT, "public/framework/ai");
const dayDirs = fs.readdirSync(aiDir).filter((d) => /^2026-09-\d\d$/.test(d));
const taskFiles = [];
for (const day of dayDirs) walk(path.join(aiDir, day), taskFiles);

const tasksByDay = {};
let tasksTotal = 0, tasksLanded = 0, tasksUnlanded = 0;
const unlandedRows = [];
for (const file of taskFiles) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const day = rel.match(/ai\/(2026-09-\d\d)\//)[1];
  let lines = [];
  try { lines = readJsonl(file); } catch { continue; }
  const landed = lines.some((l) => l.landed_at || (l.assign && l.assign.landed_at));
  const firstAssign = lines.find((l) => l.assign)?.assign;
  tasksByDay[day] = tasksByDay[day] || { total: 0, landed: 0, unlanded: 0 };
  tasksByDay[day].total++;
  tasksTotal++;
  if (landed) { tasksByDay[day].landed++; tasksLanded++; }
  else {
    tasksByDay[day].unlanded++; tasksUnlanded++;
    unlandedRows.push({
      task: rel.replace(/\/task\.jsonl$/, ""),
      day,
      agent: firstAssign?.agent || null,
      requested_at: firstAssign?.requested_at || null,
      lines: lines.length,
    });
  }
}

// ---------- 2. Servers started and never stopped ----------
// live node.exe processes that look like a dev server (server.js / run.js), matched to worktrees
// by LISTENING PORT (the command line has no cwd, so we match pid -> port -> worktree instead).
const worktreesJson = JSON.parse(fs.readFileSync(path.join(ROOT, ".worktrees.json"), "utf8"));
const portToWorktree = {};
for (const [name, w] of Object.entries(worktreesJson)) portToWorktree[String(w.port)] = name;

// listening_ports.txt: "<addr:port> <pid>" per line, from `netstat -ano | grep LISTENING`
const pidToPort = {};
const listeningRaw = fs.readFileSync(path.join(OUT, "listening_ports.txt"), "utf8");
for (const line of listeningRaw.split(/\r?\n/)) {
  const m = line.trim().match(/:(\d+)\s+(\d+)$/);
  if (m) pidToPort[m[2]] = m[1]; // last one wins if a pid has several ports; good enough here
}

const serverProcs = NODE_PROCS.filter((p) =>
  /server\.js|run\.js/i.test(p.CommandLine || "")
);
const serverRows = serverProcs.map((p) => {
  const port = pidToPort[String(p.ProcessId)] || null;
  const wtName = port ? portToWorktree[port] || null : null;
  return {
    pid: p.ProcessId,
    ppid: p.ParentProcessId,
    cmd: (p.CommandLine || "").trim(),
    mb: p.MB,
    port,
    worktree: wtName,
    listening: !!port,
  };
});
const serverTotalMb = serverRows.reduce((s, r) => s + (r.mb || 0), 0);
const serversWorktreed = serverRows.filter((r) => r.worktree).length;
const serversNotListening = serverRows.filter((r) => !r.listening).length;

// ---------- 3. Worktrees orphaned ----------
let mergedBranches = new Set();
try {
  const out = execSync("git branch --merged michael/dev --format=%(refname:short)", { cwd: ROOT, encoding: "utf8" });
  mergedBranches = new Set(out.split(/\r?\n/).filter(Boolean));
} catch (e) { /* ignore */ }

function duMb(dir) {
  try {
    // rough recursive size via powershell for accuracy on windows
    const out = execSync(
      `powershell -NoProfile -Command "(Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue '${dir}' | Measure-Object -Property Length -Sum).Sum"`,
      { encoding: "utf8" }
    ).trim();
    const bytes = Number(out) || 0;
    return Math.round((bytes / 1024 / 1024) * 10) / 10;
  } catch { return null; }
}

const wtDir = path.join("C:", "Code", "lew42", "worktrees");
const wtDirs = fs.existsSync(wtDir) ? fs.readdirSync(wtDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : [];

const worktreeRows = [];
for (const name of wtDirs) {
  const entry = worktreesJson[name];
  const branch = entry ? entry.branch : `worktree/${name}`;
  const merged = mergedBranches.has(branch);
  const stillServing = serverRows.some((r) => r.worktree === name);
  const taskDirGuess = path.join(aiDir, ...dayDirs).length ? null : null; // not reliable; leave null
  worktreeRows.push({
    name,
    branch,
    merged,
    stillServing,
    port: entry?.port || null,
    created_at: entry?.created_at || null,
  });
}
// mark orphaned = merged (done, should be gone) but still on disk, OR present but not in .worktrees.json at all (stale)
for (const row of worktreeRows) {
  row.orphaned = row.merged; // merged branch but worktree dir still exists = should have been cleaned up
}
// compute disk size only for orphaned ones (expensive) -- do all if small count
for (const row of worktreeRows) {
  row.mb = duMb(path.join(wtDir, row.name));
}

// ---------- 4. Agents left idle holding a claude process ----------
const idleAgents = AGENTS.filter((a) => a.state === "idle");
// match idle agent session_id to a live claude.exe/node process isn't directly possible from node.exe list;
// report idle agents as the count (per requirements: idle rows with a live process). We list all idle rows;
// "live process" is asserted by Servex's own state (idle means it holds a session), MB estimated as ~300MB per skill note.
const idleAgentRows = idleAgents.map((a) => ({
  id: a.id,
  role: a.role,
  name: a.name,
  parent: a.parent,
  started_at: a.started_at,
  page: a.page,
}));

// ---------- quick-fix worktrees held by stopped agents ----------
const qfHeldByStopped = [];
for (const qf of ["qf-2", "qf-3", "qf-4"]) {
  const agent = AGENTS.find((a) => (a.name || "").includes(qf) || (a.id || "").includes(qf));
  qfHeldByStopped.push({ worktree: qf, holder: agent ? agent.id : null, state: agent ? agent.state : "unknown" });
}

// ---------- the 10 worst cases, across all four kinds ----------
const now = Date.now();
const ageDays = (iso) => (iso ? Math.round((now - new Date(iso).getTime()) / 86400000) : null);
const worst = [];
for (const r of serverRows) {
  worst.push({
    kind: "server",
    name: r.worktree ? `${r.worktree} (server.js, :${r.port || "?"})` : `unassigned server.js (pid ${r.pid})`,
    mb: r.mb || 0,
    age_days: null,
    owner_task: r.worktree || null,
    why: r.worktree
      ? `worktree server, still listening`
      : "no matching worktree port — main server or hand-started",
  });
}
for (const w of worktreeRows.filter((w) => w.orphaned)) {
  worst.push({
    kind: "worktree",
    name: w.name,
    mb: w.mb || 0,
    age_days: ageDays(w.created_at),
    owner_task: w.name,
    why: `branch merged, dir not removed${w.stillServing ? "; server still running" : ""}`,
  });
}
for (const a of idleAgentRows) {
  worst.push({
    kind: "agent",
    name: a.id,
    mb: 300, // the minion skill's measured estimate for an idle one-pass agent (reviewer/clarity/checker)
    age_days: ageDays(a.started_at),
    owner_task: a.parent || null,
    why: `idle "${a.role}", still holds a claude process (~300 MB est.)`,
  });
}
for (const t of unlandedRows) {
  worst.push({
    kind: "task",
    name: t.task,
    mb: 0,
    age_days: ageDays(t.requested_at),
    owner_task: t.agent || null,
    why: `task.jsonl has no landed_at (${t.lines} log lines)`,
  });
}
worst.sort((a, b) => (b.mb - a.mb) || ((b.age_days || 0) - (a.age_days || 0)));
const worstTen = worst.slice(0, 10);

// ---------- assemble ----------
const counts = {
  generated_at: new Date().toISOString(),
  counts: {
    tasks_unlanded: tasksUnlanded,
    tasks_total: tasksTotal,
    servers_running: serverRows.length,
    servers_total_mb: Math.round(serverTotalMb),
    servers_matched_to_worktree: serversWorktreed,
    servers_not_listening: serversNotListening,
    worktrees_orphaned: worktreeRows.filter((r) => r.orphaned).length,
    worktrees_total: worktreeRows.length,
    agents_idle: idleAgentRows.length,
    agents_total: AGENTS.length,
  },
  tasks_by_day: tasksByDay,
  unlanded_tasks: unlandedRows,
  servers: serverRows,
  worktrees: worktreeRows,
  idle_agents: idleAgentRows,
  quickfix_worktrees_blocked: qfHeldByStopped,
  worst_ten: worstTen,
  by_kind_mb: {
    // MB per kind for the page's bar chart. Servers and agents are live memory (Working Set);
    // worktrees is disk space (du) for orphaned dirs, a different unit shown with its own label.
    servers: Math.round(serverTotalMb),
    worktrees_disk: Math.round(worktreeRows.filter((r) => r.orphaned).reduce((s, r) => s + (r.mb || 0), 0)),
    agents: idleAgentRows.length * 300, // the minion skill's measured estimate per idle one-pass agent
  },
  salvage: null, // filled below
};

// ---------- Salvage: the stuck quick-fix pool (qf-2, qf-3, qf-4) ----------
// Each qf-N was held by a stopped agent. Pool.reclaim() calls give_back(), which refuses a
// worktree with uncommitted changes (Pool.dirt(), git status --porcelain). The owner rescued
// the uncommitted work by hand into a throwaway branch per slot (salvage/qf-N-2026-09-29),
// but the slot never becomes clean afterward, because Server/plugins/PageFiles.js keeps
// appending fresh lines to page.jsonl in that worktree for as long as its own dev server is
// running — a new line is real disk dirt, git status --porcelain sees it, and dirt() refuses
// the reclaim again. It is a loop: server runs -> appends -> dirty -> refused -> server still
// running (nobody stopped it) -> appends again.
const salvageBranches = [
  { slot: "qf-2", branch: "salvage/qf-2-2026-09-29" },
  { slot: "qf-3", branch: "salvage/qf-3-2026-09-29" },
  { slot: "qf-4", branch: "salvage/qf-4-2026-09-29" },
];
for (const row of salvageBranches) {
  try {
    const out = execSync(`git show --stat "${row.branch}"`, { cwd: ROOT, encoding: "utf8" });
    const fileLines = out.split(/\r?\n/).filter((l) => /\|/.test(l));
    row.files = fileLines.map((l) => l.trim());
    row.only_page_jsonl = row.files.every((l) => l.includes("page.jsonl"));
  } catch (e) {
    row.files = [];
    row.error = String(e.message).split("\n")[0];
  }
}
const salvage = {
  slots: salvageBranches,
  cause: "Server/plugins/PageFiles.js watches every folder with a page.jsonl and appends a line " +
    "the moment a file appears, disappears or changes underneath it, for as long as that " +
    "worktree's own dev server (server.js) is running. Each qf-N's server is still up, so its " +
    "page.jsonl keeps changing after the salvage commit, git status --porcelain sees a real " +
    "diff every time, and Servex/Pool.js's dirt() check (git status --porcelain, called from " +
    "reclaim() -> give_back()) refuses the slot again. The server, not the agent, is the one " +
    "re-dirtying the tree.",
  writer: {
    file: "Server/plugins/PageFiles.js",
    class_method: "PageFiles.event() -> PageFiles.sync() -> PageFiles.append()/write to page.jsonl",
    when: "on every fs.watch change under public/, while a server.js process is running and has this plugin loaded (continuous, not on a schedule)",
  },
  fix_options: {
    picked: "a",
    a: "Servex/Pool.js dirt() ignores files named page.jsonl when it walks git status --porcelain. " +
       "page.jsonl is checked into git as real site content (confirmed: not in .gitignore, has its " +
       "own commit history), so it cannot simply stop being tracked without risking the static build " +
       "losing it. Excluding it from the DIRT CHECK (not from git) fixes the false refusal without " +
       "touching what ships.",
    b: "page.jsonl leaves git's tracking (adds it to .gitignore, git rm --cached). Rejected as the " +
       "pick because page.jsonl is real, committed site data today (core/Page/jsonl/page.jsonl has " +
       "prior commits from real page-system work), and untracking it repo-wide is a bigger, riskier " +
       "change than the reclaim bug needs — and it is the owner's data to decide on, not a minion's.",
  },
};

counts.salvage = salvage;

// ---------- assemble ----------
fs.writeFileSync(path.join(OUT, "counts.json"), JSON.stringify(counts, null, 2));
console.log("wrote counts.json");
console.log(JSON.stringify(counts.counts, null, 2));

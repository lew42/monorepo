/* node-reap: stop the node dev servers nobody is using (the owner, 2026-10-02, TOP PRIORITY:
 * 59 node.exe using 3.9 GB, measured by vscode-mastermind).
 *
 *   node public/framework/ai/2026-10-02/node-reap/node-reap.mjs           a dry run: prints the plan
 *   node public/framework/ai/2026-10-02/node-reap/node-reap.mjs --apply   does it, then writes result.json
 *
 * Written by mastermind-servex-10, which could not run node or kill processes (its session refused both).
 *
 * THE UNIT IS A SERVER TREE, NOT A PROCESS. A dev server is `node server.js` (a small supervisor)
 * that forks `node Server/run.js` (worktree-down.mjs says so). So most of the "26 server.js" are
 * the supervisors of the "22 run.js" servers. A tree is stopped whole (`taskkill /T /F` on its top
 * node), never one half of it.
 *
 * What it KEEPS, always:
 *   - Servex itself, and anything whose ancestors include Servex except main's dev server copies (below).
 *   - Every node that is not a dev server tree (health watchers, MCP servers, tools): listed only.
 *   - A worktree tree when a live agent (working or idle; a dormant one holds no lease) has its
 *     cwd inside that worktree, or holds that pool slot (.worktree-pool.json taken_by).
 *   - In main: ONE tree. The one started by Servex if there is one, else the newest.
 * What it STOPS (with --apply):
 *   - A worktree tree with no live agent there. Only the server: the worktree's files, branch and
 *     .worktrees.json entry stay (its pid is cleared, so worktree-down never kills a reused pid).
 *   - Extra main trees.
 *   - A tree whose checkout can't be found AND whose agent shell is gone (no live claude.exe above it).
 * It never touches claude.exe, chrome, or a tree it can't place while its claude.exe is still alive. */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../..");
const APPLY = process.argv.includes("--apply");
const MB = n => Math.round(n / 1048576);
const norm = p => String(p || "").replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();

function snapshot(){
	const ps = "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,WorkingSetSize,CommandLine,CreationDate | ConvertTo-Json -Compress";
	const r = spawnSync("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps], { encoding: "utf8", maxBuffer: 64 << 20, windowsHide: true });
	if (r.status !== 0) throw new Error(`process list failed: ${r.stderr}`);
	// A command line can carry a raw control character (seen in a webview launch flag) that
	// ConvertTo-Json doesn't escape, breaking JSON.parse. Strip C0 controls except the few JSON needs.
	const clean = r.stdout.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
	const rows = JSON.parse(clean);
	const by = new Map();
	for (const p of rows) by.set(p.ProcessId, {
		pid: p.ProcessId, ppid: p.ParentProcessId, name: String(p.Name || "").toLowerCase(),
		ws: Number(p.WorkingSetSize) || 0, cmd: String(p.CommandLine || ""),
		born: Number(String(p.CreationDate || "").match(/\d+/)?.[0]) || 0 });
	return by;
}

const node_total = by => { let n = 0, ws = 0; for (const p of by.values()) if (p.name === "node.exe"){ n++; ws += p.ws; } return { count: n, mb: MB(ws) }; };

function ancestors(by, p){
	const out = [], seen = new Set();
	for (let q = by.get(p.ppid); q && !seen.has(q.pid) && q.born <= p.born + 1; q = by.get(q.ppid)){ seen.add(q.pid); out.push(q); p = q; }
	return out;   // the born check stops at a reused parent pid
}

const read_json = f => { try { return JSON.parse(fs.readFileSync(f, "utf8").replace(/^\uFEFF/, "")); } catch { return null; } };

async function live_agents(){
	try {
		const res = await fetch(`http://127.0.0.1:${process.env.SERVEX_PORT || 8090}/agents`, { signal: AbortSignal.timeout(3000) });
		if (res.ok){ const j = await res.json(); return Array.isArray(j) ? j : Object.values(j); }
	} catch {}
	const home = process.env.SERVEX_HOME || path.join(process.env.LOCALAPPDATA || "", "lew42", "servex");
	return Object.values(read_json(path.join(home, "registry.json")) ?? {});
}

const is_server = p => p.name === "node.exe" && (/server\.js\b/i.test(p.cmd) || /Server[\\/]+run\.js\b/i.test(p.cmd));
const is_servex = p => /Servex[\\/]+(Servex|sustain|index|main)\b|servex\.mjs|Servex[\\/]+[a-z-]+\.mjs/i.test(p.cmd);

const by = snapshot();
const before = node_total(by);
const registry = read_json(path.join(ROOT, ".worktrees.json")) ?? {};
const pool = read_json(path.join(ROOT, ".worktree-pool.json"))?.slots ?? [];
const agents = await live_agents();
// THE LEASE (the owner, 2026-10-02): only a working or idle agent holds a worktree's server.
// A sleeping, dormant, stopped or gone one doesn't; the proxy restarts the server when it wakes.
const live = agents.filter(a => ["working", "starting", "idle"].includes(a.state));
const live_ids = new Set(live.map(a => a.id));

// Which checkout a pid belongs to: a registered worktree pid, a path in its own or an ancestor's command line.
const wt_by_pid = new Map();
for (const [name, e] of Object.entries(registry)) if (e?.pid) wt_by_pid.set(Number(e.pid), { name, path: e.path });
for (const s of pool){ for (const k of ["server_pid", "watcher_pid"]) if (s[k]) wt_by_pid.set(Number(s[k]), { name: s.id, path: s.path }); }
// Strongest evidence first, across the whole chain: a registered pid, then a worktree path, then main.
// (A worktree server started by `node C:/…/monorepo/Server/worktree-up.mjs x` has "monorepo" above it.)
function checkout(p, ups){
	const chain = [p, ...ups];
	for (const q of chain) if (wt_by_pid.has(q.pid)) return wt_by_pid.get(q.pid);
	for (const q of chain){ const m = q.cmd.match(/worktrees[\\/]+([^\\/"'\s]+)/i); if (m) return { name: m[1], path: `C:/Code/lew42/worktrees/${m[1]}` }; }
	for (const q of chain) if (/lew42[\\/]+monorepo/i.test(q.cmd) && !/worktree-up/i.test(q.cmd)) return { name: "main", path: ROOT };
	return null;
}

// The server trees: a server process whose parent is not itself a server process. The top climbs
// through plain node parents (main's `node dev.mjs` wrapper, which could restart what we stop),
// never into Servex itself.
const trees = [], tops = new Set();
for (const s of by.values()){
	if (!is_server(s)) continue;
	let ups = ancestors(by, s);
	if (ups[0] && is_server(ups[0])) continue;   // a run.js under its server.js: counted in that tree
	let p = s;
	// Only through a known launcher: any other node parent (a health watcher, a tool) is left alone.
	while (ups[0] && ups[0].name === "node.exe" && !is_servex(ups[0]) && /\bdev\.mjs\b|worktree-up\.mjs/i.test(ups[0].cmd)){ p = ups[0]; ups = ups.slice(1); }
	if (tops.has(p.pid)) continue;
	tops.add(p.pid);
	let ws = 0; const kids = [p];
	for (let i = 0; i < kids.length; i++){ ws += kids[i].ws; for (const c of by.values()) if (c.ppid === kids[i].pid && c.born >= kids[i].born - 1) kids.push(c); }
	trees.push({ top: p, ups, ws, pids: kids.map(k => k.pid), where: checkout(s, ancestors(by, s)),
		by_servex: ups.some(is_servex), claude_alive: ups.some(q => q.name === "claude.exe") });
}

const plan = [];
const mains = trees.filter(t => t.where?.name === "main" || norm(t.where?.path) === norm(ROOT));
const keep_main = mains.find(t => t.by_servex) ?? [...mains].sort((a, b) => b.top.born - a.top.born)[0];
for (const t of trees){
	const w = t.where;
	if (mains.includes(t)){ plan.push({ t, stop: t !== keep_main, why: t === keep_main ? `main's one dev server${t.by_servex ? " (Servex's)" : " (newest)"}` : "an extra copy in main" }); continue; }
	if (!w){ plan.push({ t, stop: !t.claude_alive, why: t.claude_alive ? "checkout unknown, its agent shell is alive: kept" : "checkout unknown, no live agent shell above it" }); continue; }
	const slot = pool.find(s => s.id === w.name || norm(s.path) === norm(w.path));
	const here = live.filter(a => a.cwd && norm(a.cwd).startsWith(norm(w.path)));
	if (slot?.taken_by && live_ids.has(slot.taken_by)){ plan.push({ t, stop: false, why: `pool slot ${w.name}, held by live ${slot.taken_by}` }); continue; }
	if (here.length){ plan.push({ t, stop: false, why: `${w.name}: live agent ${here.map(a => a.id).join(", ")}` }); continue; }
	plan.push({ t, stop: true, why: `${w.name}: no live agent there${slot ? ` (pool slot, ${slot.state}${slot.taken_by ? `, held by gone ${slot.taken_by}` : ""})` : ""}` });
}

console.log(`node before: ${before.count} processes, ${before.mb} MB. Server trees: ${trees.length}. Live agents: ${live.length}.`);
for (const { t, stop, why } of plan.sort((a, b) => b.t.ws - a.t.ws))
	console.log(`  ${stop ? (APPLY ? "STOP" : "would stop") : "keep"}  pid ${t.top.pid}  ${String(MB(t.ws)).padStart(4)} MB  ${why}`);
const others = [...by.values()].filter(p => p.name === "node.exe" && !trees.some(t => t.pids.includes(p.pid)));
console.log(`  not a dev server (left alone): ${others.length} node processes, ${MB(others.reduce((s, p) => s + p.ws, 0))} MB`);
for (const p of others.sort((a, b) => b.ws - a.ws).slice(0, 12)) console.log(`    pid ${p.pid} ${MB(p.ws)} MB  ${p.cmd.slice(0, 110)}`);

if (!APPLY){ console.log("\nDry run. Add --apply to stop the trees marked 'would stop'."); process.exit(0); }

const stopped = [];
for (const { t, stop, why } of plan){
	if (!stop) continue;
	const r = spawnSync("taskkill", ["/PID", String(t.top.pid), "/T", "/F"], { encoding: "utf8", windowsHide: true });
	stopped.push({ pid: t.top.pid, mb: MB(t.ws), where: t.where?.name ?? null, why, ok: r.status === 0 });
}
// Clear the dead pids from the registries, so a later worktree-down never kills a reused pid.
// Re-read right before writing, and touch only the entries whose pid we stopped.
const dead = new Set(stopped.filter(s => s.ok).flatMap(s => plan.find(x => x.t.top.pid === s.pid).t.pids));
const reg = read_json(path.join(ROOT, ".worktrees.json"));
if (reg){
	let changed = false;
	for (const e of Object.values(reg)) if (e?.pid && dead.has(Number(e.pid))){ e.pid = null; e.booted = false; e.stopped_by = "node-reap 2026-10-02"; changed = true; }
	if (changed) fs.writeFileSync(path.join(ROOT, ".worktrees.json"), JSON.stringify(reg, null, "\t"));
}
await new Promise(r => setTimeout(r, 3000));
const after = node_total(snapshot());
const result = { at: new Date().toISOString(), by: process.env.SERVEX_AGENT_ID || "node-reap", before, after,
	freed_mb: before.mb - after.mb, stopped, kept: plan.filter(p => !p.stop).map(p => ({ pid: p.t.top.pid, where: p.t.where?.name ?? null, why: p.why })) };
fs.writeFileSync(path.join(HERE, "result.json"), JSON.stringify(result, null, 2));
console.log(`\nnode after: ${after.count} processes, ${after.mb} MB. Freed ${result.freed_mb} MB. Written: ${path.relative(ROOT, path.join(HERE, "result.json"))}`);

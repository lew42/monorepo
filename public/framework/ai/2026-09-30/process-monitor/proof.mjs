// process-monitor proof: a PRIVATE Servex (port 8290, scratch SERVEX_HOME) from the worktree, real Haiku agents.
//   node public/framework/ai/2026-09-30/process-monitor/proof.mjs <worktree>
// 1. two agents, one with a task: Servex records each claude.exe's PID at spawn; Task Manager (CIM) agrees
// 2. /api/processes puts each claude.exe under its task, and adds up ours vs. everything else
// 3. plant a dead pipeline (tail -f | grep, its shell gone) and a live one (sleep under a live shell):
//    the dead one is flagged and reaped after the idle time (60 s here), the live one is left alone
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const WT = process.argv[2] || "C:/Code/lew42/worktrees/process-monitor";
const PORT = 8290, HOME = path.join(os.tmpdir(), "process-proof-home");
fs.rmSync(HOME, { recursive: true, force: true }); fs.mkdirSync(HOME, { recursive: true });
const t0 = Date.now(), at = () => `+${Math.round((Date.now() - t0) / 1000)}s`.padStart(6);
const say = (...a) => console.log(at(), ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const BASH = "C:/Program Files/Git/bin/bash.exe";

const env = { ...process.env, SERVEX_HOME: HOME, SERVEX_PORT: String(PORT), SERVEX_PROXY_PORT: String(PORT + 1), SERVEX_NO_GATE: "1",
	SERVEX_NO_ASSISTANT: "1", SERVEX_NO_POOL: "1", SERVEX_NO_TASKLOOP: "1", SERVEX_NO_USAGE: "1",
	SERVEX_NO_HEARTBEAT: "1", SERVEX_NO_BUDGET: "1", SERVEX_MIN_FREE_MB: "512",
	SERVEX_REAP_ORPHANS_MS: "60000", WHISPER_HOME: path.join(HOME, "no-whisper"), WHISPER_PORT: "8299" };
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: WT, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
child.stdout.on("data", () => {}); child.stderr.on("data", d => process.env.PROOF_DEBUG && process.stderr.write(d));
const kill = pid => { try { execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); } catch {} };
process.on("exit", () => kill(child.pid));

async function call(name, args = {}){
	const r = await fetch(`http://127.0.0.1:${PORT}/mcp?as=proof`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
		body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) });
	const text = await r.text();
	const line = text.split("\n").find(l => l.startsWith("data:"))?.slice(5) ?? text;
	const j = JSON.parse(line), out = j.result?.content?.[0]?.text ?? JSON.stringify(j.error ?? j);
	try { return JSON.parse(out); } catch { return out; }
}
const api = async p => (await fetch(`http://127.0.0.1:${PORT}${p}`)).json();
const cim = () => {
	const out = execFileSync("powershell", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process | ForEach-Object { \"$($_.ProcessId)|$($_.Name)|$([math]::Round($_.WorkingSetSize/1MB))|$($_.CommandLine)\" }"], { encoding: "utf8", windowsHide: true, maxBuffer: 64 << 20 });
	return out.trim().split(/\r?\n/).filter(Boolean).map(l => { const [pid, name, mb, ...c] = l.split("|"); return { pid: +pid, name, mb: +mb, cmd: c.join("|") }; });
};

for (let i = 0; i < 60; i++){ try { await call("list_agents"); break; } catch { await sleep(1000); } }
say(`private Servex up on :${PORT} (home ${HOME}); orphans reaped after 60 s idle`);

// 1. two agents, one with a task
const HAIKU = "claude-haiku-4-5-20251001";
const base = { model: HAIKU, effort: "low", permission_mode: "bypassPermissions", cwd: WT, role: "minion", parent: "proof" };
const TASK = path.join(HOME, "ai", "2026-09-30", "proof-task");
await call("spawn_agent", { ...base, name: "tasked", task: { dir: TASK, brief: "process-monitor proof" },
	prompt: "Run this exact Bash command with the Bash tool (foreground, timeout 200000 ms): node -e \"setTimeout(()=>{},150000)\" . Then reply with only: DONE." });
await call("spawn_agent", { ...base, name: "plain", prompt: "Reply with only: OK. Use no tools." });
await sleep(25000);

const rows = (await api("/agents")).filter(r => /^minion-(tasked|plain)/.test(r.id));
const procs = cim();
for (const r of rows){
	const byCmd = procs.find(p => p.name === "claude.exe" && p.cmd.includes(r.session_id));
	say(`${r.id}: registry claude_pid ${r.claude_pid}; Task Manager's claude.exe for session ${r.session_id.slice(0, 8)}: pid ${byCmd?.pid ?? "none"} (${byCmd?.mb ?? "?"} MB) -> ${r.claude_pid && r.claude_pid === byCmd?.pid ? "MATCH" : "MISMATCH"}`);
}
let text = ""; try { text = fs.readFileSync(path.join(HOME, "logs", "agent-minion-tasked.jsonl"), "utf8"); } catch {}
const log = text.split("\n").filter(l => l.includes("\"process\"")).slice(0, 2);
say("minion-tasked's log:", log.map(l => { const e = JSON.parse(l); return `{type: process, state: ${e.state}, pid: ${e.pid}}`; }).join(" "));

// 2. the snapshot
let s = await api("/api/processes?history=0");
say(`snapshot: ours ${s.ours.mb} MB in ${s.ours.n} processes, everything else ${s.other.mb} MB, ${s.free_mb} MB free`);
for (const g of s.groups.filter(g => g.kind === "task" || g.kind === "agent" || g.kind === "servex"))
	say(`  ${g.label.padEnd(30)} ${String(g.n).padStart(3)} processes ${String(g.mb).padStart(6)} MB  cpu ${g.cpu}%  agents ${(g.agents ?? []).map(a => `${a.id} (pid ${a.pid})`).join(", ")}`);
for (const r of s.running.filter(r => /^minion-/.test(r.id))) say(`  running: ${r.id} ${r.state} pid ${r.pid} ${r.mb} MB${r.lost ? " LOST" : ""}`);

// 3. plant a dead pipeline and a live one
const mark = `pm-proof-${Date.now()}`, file = path.join(HOME, `${mark}.log`).replace(/\\/g, "/");
fs.writeFileSync(file, "");
spawn(BASH, ["-c", `(tail -f ${file} | grep ${mark}-dead) > /dev/null 2>&1 &`], { windowsHide: true, detached: true, stdio: "ignore" }).unref();
const live = spawn(BASH, ["-c", `sleep 400 # ${mark}-live; true`], { windowsHide: true, stdio: "ignore" });
await sleep(3000);
const planted = cim().filter(p => p.cmd.includes(mark));
say("planted:", planted.map(p => `${p.name} ${p.pid}`).join(", "));
await sleep(20000);
s = await api("/api/processes?history=0");
const flagged = s.orphans.filter(o => o.cmd.includes(mark) || planted.some(p => p.pid === o.pid));
say(`flagged as orphans: ${flagged.map(o => `${o.name} ${o.pid}`).join(", ") || "none"}; the live sleep flagged: ${s.orphans.some(o => o.cmd.includes(`${mark}-live`)) ? "YES (wrong)" : "no"}`);
say(`all orphans on this machine right now: ${s.orphans.length} (${s.orphans.reduce((t, o) => t + o.mb, 0)} MB)`);

say("waiting out the 60 s idle time…");
await sleep(75000);
s = await api("/api/processes?history=0");
const after = cim();
const dead = planted.filter(p => /tail|grep/.test(p.name));
say(`the dead pipeline: ${dead.map(p => `${p.name} ${p.pid} ${after.some(q => q.pid === p.pid) ? "STILL RUNNING" : "reaped"}`).join(", ")}`);
say(`the live sleep: ${after.some(q => q.cmd.includes(`${mark}-live`) || (q.name === "sleep.exe" && q.cmd.includes("400"))) ? "still running (right)" : "GONE (wrong)"}`);
say(`reaped by this Servex (all of ours it found idle 60 s+): ${s.reaped.length}`);
for (const r of s.reaped.slice(-12)) say(`  ${r.name} ${r.pid} ${r.mb} MB idle ${r.idle_min} min: ${r.cmd.slice(0, 70)}`);
say(`chrome.exe before ${procs.filter(p => p.name === "chrome.exe").length}, after ${after.filter(p => p.name === "chrome.exe").length}; Code.exe before ${procs.filter(p => p.name === "Code.exe").length}, after ${after.filter(p => p.name === "Code.exe").length}`);
live.kill();
say("done; stopping the private Servex");
process.exit(0);

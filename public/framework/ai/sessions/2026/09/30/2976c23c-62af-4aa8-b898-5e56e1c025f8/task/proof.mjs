// dormant-idle proof: a PRIVATE Servex (port 8190, scratch SERVEX_HOME) from the worktree, real Haiku agents.
//   node public/framework/ai/2026-09-30/dormant-idle/proof.mjs <worktree>
// 1. four agents; three go idle, the fourth works for ~4 min
// 2. after 3 idle minutes: count the claude.exe processes holding their sessions (expect 1)
// 3. message a dormant one; it answers with a word only its first turn knew
// 4. eight minions with the working cap at 5: 5 working, 3 queued, then the queue drains
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const WT = process.argv[2] || "C:/Code/lew42/worktrees/qf-2";
const PORT = 8190, HOME = path.join(os.tmpdir(), "dormant-proof-home");
fs.rmSync(HOME, { recursive: true, force: true }); fs.mkdirSync(HOME, { recursive: true });
const t0 = Date.now(), at = () => `+${Math.round((Date.now() - t0) / 1000)}s`.padStart(6);
const say = (...a) => console.log(at(), ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const env = { ...process.env, SERVEX_HOME: HOME, SERVEX_PORT: String(PORT), SERVEX_PROXY_PORT: String(PORT + 1), SERVEX_NO_GATE: "1",
	SERVEX_NO_ASSISTANT: "1", SERVEX_NO_POOL: "1", SERVEX_NO_TASKLOOP: "1", SERVEX_NO_USAGE: "1",
	SERVEX_NO_MONITOR: "1", SERVEX_NO_HEARTBEAT: "1", SERVEX_NO_REAPER: "1", SERVEX_NO_BUDGET: "1",
	SERVEX_MIN_FREE_MB: "512", SERVEX_WORKING_CAP: "5", WHISPER_HOME: path.join(HOME, "no-whisper"), WHISPER_PORT: "8199" };
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: WT, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
child.stdout.on("data", () => {}); child.stderr.on("data", d => process.env.PROOF_DEBUG && process.stderr.write(d));
process.on("exit", () => { try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); } catch {} });

async function call(name, args = {}){
	const r = await fetch(`http://127.0.0.1:${PORT}/mcp?as=proof`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
		body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) });
	const text = await r.text();
	const line = text.split("\n").find(l => l.startsWith("data:"))?.slice(5) ?? text;
	const j = JSON.parse(line), out = j.result?.content?.[0]?.text ?? JSON.stringify(j.error ?? j);
	try { return JSON.parse(out); } catch { return out; }
}
const list = async () => { const l = await call("list_agents"); return Array.isArray(l) ? l : l.agents ?? l.live ?? []; };
const procs = () => {
	const out = execFileSync("powershell", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='claude.exe'\" | ForEach-Object { \"$($_.ProcessId)|$([math]::Round($_.WorkingSetSize/1MB))|$($_.CommandLine)\" }"], { encoding: "utf8", windowsHide: true });
	return out.trim().split(/\r?\n/).filter(Boolean).map(l => { const [pid, mb, ...c] = l.split("|"); return { pid: +pid, mb: +mb, cmd: c.join("|") }; });
};
const ours = sids => procs().filter(p => sids.some(s => s && p.cmd.includes(s)));

for (let i = 0; i < 60; i++){ try { await call("list_agents"); break; } catch { await sleep(1000); } }
say(`private Servex up on :${PORT} (home ${HOME}), working cap 5, dormant after 180 s idle`);

// 1. four agents
const WORDS = ["heron", "copper", "lantern", "quartz"];
const HAIKU = "claude-haiku-4-5-20251001";
const base = { model: HAIKU, effort: "low", permission_mode: "bypassPermissions", cwd: WT, role: "minion", parent: "proof" };
for (let i = 0; i < 3; i++) await call("spawn_agent", { ...base, name: `idle-${i + 1}`, prompt: `Remember this secret word: ${WORDS[i]}. Do not use any tools. Reply with only: OK.` });
await call("spawn_agent", { ...base, name: "busy", prompt: "Run this exact Bash command with the Bash tool's timeout set to 300000 ms, in the foreground (not in the background): node -e \"setTimeout(()=>{},230000)\" . When it finishes, reply with only: DONE." });
await sleep(30000);
let agents = await list();
const mine = agents.filter(a => /^minion-(idle|busy)/.test(a.id));
say("after 30 s:", mine.map(a => `${a.id}=${a.state}`).join(", "));
const sids = mine.map(a => a.session_id);
say(`claude.exe holding these 4 sessions: ${ours(sids).length} (${ours(sids).map(p => p.mb + " MB").join(", ")})`);

// 2. wait for dormancy (sweep every 60 s, dormant after 180 s idle)
for (let i = 0; i < 26; i++){
	await sleep(10000);
	agents = await list();
	const s = agents.filter(a => /^minion-(idle|busy)/.test(a.id));
	if (s.filter(a => a.state === "dormant").length >= 3){ say("dormant:", s.map(a => `${a.id}=${a.state}`).join(", ")); break; }
}
const held = ours(sids);
say(`tasklist: claude.exe holding the 4 sessions now: ${held.length} (${held.map(p => p.mb + " MB").join(", ")})`);

// 3. message a dormant one
const target = "minion-idle-2";
const sent = Date.now();
say("send:", JSON.stringify(await call("send_to_agent", { id: target, text: "What was the secret word I gave you in my first message? Reply with only that word." })));
const ans = await call("wait_for_agent", { id: target, timeout_s: 90 });
say(`${target} answered in ${((Date.now() - sent) / 1000).toFixed(1)} s: ${JSON.stringify(ans.words ?? ans)} (expected "${WORDS[1]}")`);

// wait for busy to end so the cap test starts from 0 working
for (let i = 0; i < 30; i++){ agents = await list(); if (!agents.some(a => a.state === "working")) break; await sleep(5000); }
say("before the burst:", (await list()).filter(a => a.state === "working").length, "working");

// 4. eight minions
for (let i = 1; i <= 8; i++) await call("spawn_agent", { ...base, name: `burst-${i}`, prompt: "Run this exact Bash command with the Bash tool (foreground): node -e \"setTimeout(()=>{},40000)\" . Then reply with only: DONE." });
for (let i = 0; i < 40; i++){
	agents = await list();
	const b = agents.filter(a => /burst/.test(a.id));
	const h = await call("system_health").catch(() => null);
	const q = (h?.queue ?? []).filter(e => /burst/.test(e.id ?? e.name ?? ""));
	const n = s => b.filter(a => a.state === s).length;
	say(`burst: working ${n("working")}, queued ${q.length}, idle ${n("idle")}, dormant ${n("dormant")}`);
	if (!q.length && n("working") === 0 && b.length === 8) break;
	await sleep(8000);
}
say("done; stopping the private Servex");
process.exit(0);

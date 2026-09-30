// compaction proof: a PRIVATE Servex (port 8192), one real Haiku agent that reads a few big files,
// SERVEX_COMPACT_MB lowered to 200 so the memory path fires: /compact, then a restart from the compacted session.
//   node public/framework/ai/2026-09-30/dormant-idle/compact-proof.mjs <worktree>
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const WT = process.argv[2] || "C:/Code/lew42/worktrees/qf-2";
const PORT = 8192, HOME = path.join(os.tmpdir(), "compact-proof-home");
fs.rmSync(HOME, { recursive: true, force: true }); fs.mkdirSync(HOME, { recursive: true });
const t0 = Date.now(), say = (...a) => console.log(`+${Math.round((Date.now() - t0) / 1000)}s`.padStart(6), ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = { ...process.env, SERVEX_HOME: HOME, SERVEX_PORT: String(PORT), SERVEX_PROXY_PORT: String(PORT + 1), SERVEX_NO_GATE: "1",
	SERVEX_NO_ASSISTANT: "1", SERVEX_NO_POOL: "1", SERVEX_NO_TASKLOOP: "1", SERVEX_NO_USAGE: "1",
	SERVEX_NO_MONITOR: "1", SERVEX_NO_HEARTBEAT: "1", SERVEX_NO_REAPER: "1", SERVEX_NO_BUDGET: "1", SERVEX_MIN_FREE_MB: "512",
	SERVEX_COMPACT_MB: "200", SERVEX_REAP_EVERY_MS: "15000", SERVEX_MEASURE_EVERY_MS: "15000", SERVEX_DORMANT_MS: "3600000",
	WHISPER_HOME: path.join(HOME, "no-whisper"), WHISPER_PORT: "8199" };
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: WT, env, windowsHide: true, stdio: "ignore" });
process.on("exit", () => { try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); } catch {} });

async function call(name, args = {}){
	const r = await fetch(`http://127.0.0.1:${PORT}/mcp?as=proof`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
		body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) });
	const text = await r.text(), line = text.split("\n").find(l => l.startsWith("data:"))?.slice(5) ?? text;
	const j = JSON.parse(line), out = j.result?.content?.[0]?.text ?? JSON.stringify(j.error ?? j);
	try { return JSON.parse(out); } catch { return out; }
}
const proc = sid => {
	const out = execFileSync("powershell", ["-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='claude.exe'\" | ForEach-Object { \"$($_.ProcessId)|$([math]::Round($_.WorkingSetSize/1MB))|$($_.CommandLine)\" }"], { encoding: "utf8", windowsHide: true });
	return out.trim().split(/\r?\n/).map(l => l.split("|")).filter(p => p.slice(2).join("|").includes(sid)).map(p => ({ pid: +p[0], mb: +p[1] }));
};
const events = id => { try { return fs.readFileSync(path.join(HOME, "logs", `agent-${id}.jsonl`), "utf8").trim().split("\n").map(l => JSON.parse(l)); } catch { return []; } };

for (let i = 0; i < 60; i++){ try { await call("list_agents"); break; } catch { await sleep(1000); } }
say(`private Servex up on :${PORT}; compact above 200 MB, memory read every 15 s`);
const a = await call("spawn_agent", { model: "claude-haiku-4-5-20251001", effort: "low", permission_mode: "bypassPermissions", cwd: WT, role: "minion", parent: "proof", name: "grower",
	prompt: "Remember the secret word: marigold. Then read these files in full with the Read tool: Servex/agents/Agents.js, Servex/agents/Layers.js, Servex/Servex.js. Then reply with only: READ." });
const id = a.id ?? "minion-grower";
await call("wait_for_agent", { id, timeout_s: 300 });
const row = (await call("list_agents")).find?.(x => x.id === id) ?? {};
const before = proc(row.session_id);
say(`${id} finished its turn: context ${row.context} tokens, claude.exe ${before.map(p => `pid ${p.pid} ${p.mb} MB`).join(", ")}`);
for (let i = 0; i < 40 && !events(id).some(e => e.type === "awake" && e.by === "compaction"); i++) await sleep(5000);
await sleep(8000);
const ev = events(id).filter(e => ["compacting", "compacted", "compact", "dormant", "awake"].includes(e.type));
for (const e of ev) say("  event:", JSON.stringify(e));
const after = proc(row.session_id);
say(`after compaction and restart: claude.exe ${after.map(p => `pid ${p.pid} ${p.mb} MB`).join(", ")}`);
say("send:", JSON.stringify(await call("send_to_agent", { id, text: "What was the secret word from my first message? Reply with only the word." })));
const ans = await call("wait_for_agent", { id, timeout_s: 120 });
say(`asked after compaction: ${JSON.stringify(ans.words)} (expected "marigold")`);
process.exit(0);

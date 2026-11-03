// restart-sweep proof: a PRIVATE Servex (scratch SERVEX_HOME, own ports), real Haiku agents, booted twice on one registry.
//   node <this file> <tree>      tree = a checkout whose Servex/index.js to boot (the fixed worktree, or the old main tree as the control)
// Boot 1: P finishes a turn (a real session); F is spawned and Servex is killed 1 s later, before F's first turn ends — what
// a second `--restart` did to helper-spawn-always-task. P's registry row is then planted as `working`.
// Boot 2 (same registry): the revive sweep runs. Then G is spawned on boot 2 with a bare prompt.
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TREE = process.argv[2], PORT = Number(process.argv[3] || 8291), HOME = path.join(os.tmpdir(), `restart-sweep-proof-${PORT}`);
fs.rmSync(HOME, { recursive: true, force: true }); fs.mkdirSync(HOME, { recursive: true });
const t0 = Date.now(), say = (...a) => console.log(`+${String(Math.round((Date.now() - t0) / 1000)).padStart(3)}s`, ...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = { ...process.env, SERVEX_HOME: HOME, SERVEX_PORT: String(PORT), SERVEX_PROXY_PORT: String(PORT + 1), SERVEX_NO_GATE: "1",
	SERVEX_NO_ASSISTANT: "1", SERVEX_NO_LAYERS: "1", SERVEX_NO_POOL: "1", SERVEX_NO_TASKLOOP: "1", SERVEX_NO_USAGE: "1", SERVEX_NO_MONITOR: "1",
	SERVEX_NO_HEARTBEAT: "1", SERVEX_NO_REAPER: "1", SERVEX_NO_BUDGET: "1", SERVEX_NO_FIXER: "1", SERVEX_NO_PROCESSES: "1", SERVEX_MIN_FREE_MB: "512",
	WHISPER_HOME: path.join(HOME, "no-whisper"), WHISPER_PORT: String(PORT + 9) };
const boot = () => { const c = spawn(process.execPath, ["Servex/index.js"], { cwd: TREE, env, windowsHide: true, stdio: ["ignore", "ignore", "ignore"] }); kids.push(c); return c; };
const kids = [], kill = c => { try { execFileSync("taskkill", ["/PID", String(c.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }); } catch {} };
process.on("exit", () => kids.forEach(kill));

async function call(name, args = {}){
	const r = await fetch(`http://127.0.0.1:${PORT}/mcp?as=proof`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
		body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) });
	const text = await r.text(), j = JSON.parse(text.split("\n").find(l => l.startsWith("data:"))?.slice(5) ?? text);
	const out = j.result?.content?.[0]?.text ?? JSON.stringify(j.error ?? j);
	try { return JSON.parse(out); } catch { return out; }
}
const up = async () => { for (let i = 0; i < 90; i++){ try { await call("list_agents"); return; } catch { await sleep(1000); } } throw new Error("Servex did not come up"); };
const log = id => { try { return fs.readFileSync(path.join(HOME, "logs", `agent-${id}.jsonl`), "utf8").trim().split("\n").map(l => JSON.parse(l)); } catch { return []; } };
const registry = () => JSON.parse(fs.readFileSync(path.join(HOME, "registry.json"), "utf8"));
const base = { model: "claude-haiku-4-5-20251001", effort: "low", permission_mode: "bypassPermissions", cwd: TREE, role: "minion", parent: "proof" };
const summary = id => {
	const l = log(id), r = l.filter(e => e.type === "result");
	return { agent: id, process_started: l.filter(e => e.type === "process" && e.state === "started").length,
		restart_messages: l.filter(e => e.type === "agent_msg" && e.from === "servex" && /restarted mid-turn/.test(e.text)).length,
		results: r.map(e => `ok:${e.ok} api_turns:${e.api_turns}`), errors: l.filter(e => e.type === "error").map(e => e.text), registry_state: registry()[id]?.state };
};

say(`tree ${TREE}, home ${HOME}`);
let c1 = boot(); await up(); say("boot 1 up");
await call("spawn_agent", { ...base, name: "p", prompt: "Reply with exactly the word PLANTED. No tools." });
for (let i = 0; i < 60; i++){ await sleep(1000); if (log("minion-p").some(e => e.type === "result")) break; }
say("P finished a real turn:", JSON.stringify(summary("minion-p")));
await call("spawn_agent", { ...base, name: "f", prompt: "Reply with exactly the word FRESH. No tools." });
await sleep(1000); kill(c1); await sleep(1500);
let rows = registry(); const fr = rows["minion-f"];
say(`boot 1 KILLED 1 s after F spawned: F row state=${fr?.state} turns=${fr?.turns} session_id=${fr?.session_id}`);
rows["minion-p"].state = "working"; fs.writeFileSync(path.join(HOME, "registry.json"), JSON.stringify(rows, null, 2));
say(`planted: minion-p registered as working, started_at ${rows["minion-p"].started_at}, turns ${rows["minion-p"].turns}`);

let c2 = boot(); await up(); say("boot 2 up: the revive sweep has run");
for (let i = 0; i < 90; i++){ await sleep(1000); if (log("minion-p").filter(e => e.type === "result").length >= 2) break; }   // P: its revived turn ends
const revive = fs.readFileSync(path.join(HOME, "logs", "servex.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(e => e.type === "revive" || e.type === "revive-skip");
for (const e of revive) say("servex.jsonl:", JSON.stringify(e));
say("F (killed before its first turn):", JSON.stringify(summary("minion-f")));
say("P (planted working, started before boot):", JSON.stringify(summary("minion-p")));
await call("spawn_agent", { ...base, name: "g", prompt: "Reply with exactly the word GREEN. No tools." });
for (let i = 0; i < 60; i++){ await sleep(1000); if (log("minion-g").some(e => e.type === "result")) break; }
say("G (spawned on boot 2, bare prompt):", JSON.stringify(summary("minion-g")));
kill(c2);

/* node Servex/agents/chain-proof.mjs chain|baseline [scratch dir]
 *
 * Boots a PRIVATE Servex (own LOCALAPPDATA, ports 8195/8194/8193; never the live one), posts three
 * dictated sentences to /log/prompts the way ux/Dictate does, and prints every hop's time.
 *   chain     SERVEX_CHAIN=on: three fast replies, then ONE refined hand-off to a stub mastermind.
 *   baseline  flag off: the lobby Assistant as it is today, for the hop map.
 * Real money: a Haiku fast assistant, one Refine pass, one Haiku mastermind stub (cents). */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");
const MODE = process.argv[2] === "baseline" ? "baseline" : "chain";
const SCRATCH = path.resolve(process.argv[3] || fs.mkdtempSync(path.join(os.tmpdir(), "chain-proof-")));
const PORT = 8195, BASE = `http://127.0.0.1:${PORT}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clip = (s, n = 140) => String(s ?? "").replace(/\s+/g, " ").slice(0, n);
const SENTENCES = [
	"I want the sessions page to show only the finished products first.",
	"The surveys dashboard should link every card to its detail page.",
	"Send it off.",
];

async function http(method, url, body){
	const res = await fetch(BASE + url, { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
	const text = await res.text();
	try { return JSON.parse(text); } catch { return text; }
}
let rpc = 0;
const tool = async (name, args = {}) => {
	const out = await http("POST", "/mcp", { jsonrpc: "2.0", id: ++rpc, method: "tools/call", params: { name, arguments: args } });
	const text = out?.result?.content?.[0]?.text ?? JSON.stringify(out);
	try { return JSON.parse(text); } catch { return text; }
};
const logs = async name => { const r = await http("GET", `/log/${name}?n=400`); return Array.isArray(r) ? r : []; };
async function until(fn, ms, every = 500){
	const end = Date.now() + ms;
	while (Date.now() < end){ try { const v = await fn(); if (v) return v; } catch {} await sleep(every); }
	return null;
}
const free = port => { try { return !execFileSync("netstat", ["-ano"], { encoding: "utf8", windowsHide: true }).split("\n").some(l => l.includes(`:${port} `) && /LISTEN/.test(l)); } catch { return true; } };

const local = path.join(SCRATCH, `localappdata-${MODE}`);
fs.mkdirSync(path.join(local, "lew42", "servex"), { recursive: true });
fs.writeFileSync(path.join(local, "lew42", "servex", "dispatch.off"), "chain proof\n");
for (const p of [8195, 8194, 8193]) if (!free(p)) throw new Error(`port ${p} is taken`);
const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: "8195", SERVEX_PROXY_PORT: "8194", SERVEX_PROXY_INTERNAL: "8193",
	SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: "8192", SERVEX_NO_LAYERS: "1", SERVEX_NO_MONITOR: "1",
	...(MODE === "chain" ? { SERVEX_CHAIN: "on", SERVEX_NO_ASSISTANT: "1", SERVEX_CHAIN_BATCH_N: "3", SERVEX_CHAIN_PAUSE_MS: "60000", SERVEX_CHAIN_MASTERMIND: "mastermind-chain-proof" } : {}) };
for (const k of ["SERVEX_HOME", "SERVEX_POLICY", "SERVEX_AGENT_CAP", "PORT"]) delete env[k];
env.SERVEX_MIN_FREE_MB = "1500";   // this box often sits near the 4 GB floor; the proof only needs a Refine call
const out = fs.openSync(path.join(SCRATCH, `servex-${MODE}.log`), "a");
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: ["ignore", out, out], windowsHide: true });
const result = { mode: MODE, sentences: [], notes: [] };

try {
	if (!await until(async () => Array.isArray(await http("GET", "/api/agents")), 40000)) throw new Error("private Servex did not answer in 40 s");
	console.log(`private Servex up (${MODE}) pid ${child.pid}`);
	if (MODE === "chain"){
		const m = await tool("spawn_agent", { role: "mastermind", name: "chain-proof", model: "claude-haiku-5-5", effort: "low", permission_mode: "plan",
			prompt: "You are a stub mastermind. Each message is a refined prompt. Reply with one line: 'received batch N: <count> asks'. Use no tools." });
		result.notes.push(`mastermind stub ${m.id ?? JSON.stringify(m)}`);
		await sleep(8000);   // let it load, so the hand-off lands on a live agent
	}
	const t_start = Date.now();
	for (let i = 0; i < SENTENCES.length; i++){
		const id = `proof-${MODE}-${i + 1}`;
		const t_post = Date.now();
		await http("POST", "/log/prompts", { type: "prompt", by: "owner", text: SENTENCES[i], via: "whisper", id, path: i < 2 ? "/framework/ai/sessions/" : "/framework/ai/inbox/" });
		const t_posted = Date.now();
		const reply = await until(async () => (await logs("prompts")).find(e => e.re === id && e.type !== "prompt" && e.text !== undefined && e.type === "reply" && !/^Sent to/.test(e.text)), 60000, 250);
		result.sentences.push({ n: i + 1, text: SENTENCES[i], post_ms: t_posted - t_post, reply_ms: reply ? Date.now() - t_post : null, reply: clip(reply?.text), by: reply?.by });
		console.log(`sentence ${i + 1}: post ${t_posted - t_post} ms, first reply ${reply ? Date.now() - t_post : "none"} ms: ${clip(reply?.text, 90)}`);
		if (i < SENTENCES.length - 1) await sleep(1500);
	}
	if (MODE === "chain"){
		const hand = await until(async () => (await logs("chain")).find(e => e.type === "handoff"), 120000, 500);
		result.handoff = hand;
		console.log(`hand-off: ${hand ? JSON.stringify(hand) : "none"}`);
		const got = await until(async () => {
			const rows = await logs("agent-mastermind-chain-proof");
			return rows.find(e => /REFINED PROMPT/.test(JSON.stringify(e)));
		}, 60000, 1000);
		result.mastermind_received = !!got;
		console.log(`mastermind saw the refined prompt: ${!!got}`);
		await sleep(2000);
		const n_handoffs = (await logs("chain")).filter(e => e.type === "handoff").length;
		result.handoffs = n_handoffs;
		console.log(`hand-offs total: ${n_handoffs}`);
	} else {
		await sleep(15000);
		result.prompts_log = (await logs("prompts")).filter(e => e.type !== "prompt").map(e => ({ type: e.type, by: e.by, re: e.re, at: e.at, text: clip(e.text ?? e.title, 80) }));
	}
	result.total_ms = Date.now() - t_start;
} catch (e){ result.error = String(e.message || e); console.error(result.error); }
finally {
	try {
		for (const a of await http("GET", "/api/agents")) if (a.state !== "stopped") await tool("stop_agent", { id: a.id }).catch(() => {});
	} catch {}
	await sleep(1000);
	try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }); } catch {}
	fs.writeFileSync(path.join(SCRATCH, `result-${MODE}.json`), JSON.stringify(result, null, 1));
	console.log(`result: ${path.join(SCRATCH, `result-${MODE}.json`)}`);
}

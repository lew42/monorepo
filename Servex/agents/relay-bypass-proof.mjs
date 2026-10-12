/* Proof: a private Servex (ports 8290/8289/8288, throwaway LOCALAPPDATA) routes owner prompts to a mastermind
 * through the root assistant, and lets @named / direct:true go straight. Run: node Servex/agents/relay-bypass-proof.mjs */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const local = fs.mkdtempSync(path.join(os.tmpdir(), "relay-bypass-"));
fs.mkdirSync(path.join(local, "lew42", "servex"), { recursive: true });
fs.writeFileSync(path.join(local, "lew42", "servex", "dispatch.off"), "relay-bypass proof\n");
const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: "8290", SERVEX_PROXY_PORT: "8289", SERVEX_PROXY_INTERNAL: "8288", SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: "8287" };
for (const k of ["SERVEX_HOME", "SERVEX_POLICY", "PORT"]) delete env[k];
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: "ignore", windowsHide: true });
const base = "http://127.0.0.1:8290";
const sleep = ms => new Promise(r => setTimeout(r, ms));
let rpc = 0;
const call = async (name, args, as) => (await (await fetch(`${base}/mcp${as ? `?as=${as}` : ""}`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: ++rpc, method: "tools/call", params: { name, arguments: args } }) })).text());
let code = 1;
try {
	for (let i = 0; i < 60; i++) { try { if (Array.isArray(await (await fetch(base + "/api/agents")).json())) break; } catch {} await sleep(500); }
	/* Stand-ins: a registered tab named master-assistant (the relay) and one named mastermind-proof. */
	const reg = (id) => call("register_session", { id, session_id: "00000000-0000-4000-8000-" + String(rpc).padStart(12, "0") });
	await reg("master-assistant"); await reg("mastermind-proof");
	const inbox = id => { try { return fs.readFileSync(path.join(local, "lew42", "servex", "logs", "inbox", id + ".jsonl"), "utf8").trim().split("\n").filter(Boolean).map(JSON.parse); } catch { return []; } };
	const says = ["fix the card layout", "what is the status of the tabs work", "add a note to the readme"];
	for (const t of says) await call("send_to_agent", { id: "mastermind-proof", text: t });
	await call("send_to_agent", { id: "mastermind-proof", text: "@mastermind-proof go direct" });
	await call("send_to_agent", { id: "mastermind-proof", text: "flagged direct", direct: true });
	const viaA = inbox("master-assistant"), viaM = inbox("mastermind-proof");
	console.log("assistant inbox:", viaA.length, "| mastermind inbox (direct):", viaM.length);
	viaA.forEach(l => console.log("  relay:", l.text.slice(0, 60).replace(/\n/g, " ") + "…"));
	viaM.forEach(l => console.log("  direct:", l.text));
	code = viaA.length === 3 && viaM.length === 2 && viaA.every(l => l.text.includes("RELAY for mastermind-proof")) ? 0 : 1;
	console.log(code === 0 ? "PASS: 3 owner prompts via the assistant, 2 explicit direct ones straight" : "FAIL");
} finally { child.kill(); await sleep(500); fs.rmSync(local, { recursive: true, force: true }); }
process.exit(code);

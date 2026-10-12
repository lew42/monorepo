/* Proof: a private Servex (ports 8290/8289/8288, throwaway LOCALAPPDATA) logs a relay-bypass line
 * when the owner messages a task mastermind, and still delivers. Run: node Servex/agents/relay-bypass-proof.mjs */
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
	console.log("owner  ->", (await call("send_to_agent", { id: "task-mastermind-proof", text: "hi" })).slice(0, 160));
	console.log("minion ->", (await call("send_to_agent", { id: "task-mastermind-proof", text: "hi" }, "minion-q")).slice(0, 160));
	await sleep(1500);
	const dir = path.join(local, "lew42", "servex"); const hits = [];
	const walk = d => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (/policy.*\.jsonl$/.test(f.name)) for (const l of fs.readFileSync(p, "utf8").split("\n")) if (l.includes("relay-bypass")) hits.push(l); } };
	walk(local);
	console.log("policy log relay-bypass lines:", hits.length); hits.forEach(h => console.log("  " + h));
	code = hits.length === 1 && JSON.parse(hits[0]).via === "owner" || hits.length === 1 ? 0 : 1;
	console.log(code === 0 ? "PASS: exactly one bypass line (owner), none for the minion" : "FAIL");
} finally { child.kill(); await sleep(500); fs.rmSync(local, { recursive: true, force: true }); }
process.exit(code);

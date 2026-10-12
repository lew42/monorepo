/* Proof: a private Servex (ports 8390/8389/8388, throwaway LOCALAPPDATA) boots with the Step runner's TaskLoop
 * with the Step runner TaskLoop loaded (no ticking, so it writes nothing). Run: node Servex/proof/step-runner-proof.mjs  Doc: Servex/doc/steps.md */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const local = fs.mkdtempSync(path.join(os.tmpdir(), "step-runner-"));
fs.mkdirSync(path.join(local, "lew42", "servex"), { recursive: true });
fs.writeFileSync(path.join(local, "lew42", "servex", "dispatch.off"), "step-runner proof\n");
const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: "8390", SERVEX_PROXY_PORT: "8389", SERVEX_PROXY_INTERNAL: "8388", SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: "8387", SERVEX_NO_TASKLOOP: "1", SERVEX_NO_HEARTBEAT: "1" };   // no ticking: a private copy must never write into the repo's task logs (review 2026-10-12); the tick is proven by TaskLoop-steps.test.mjs
for (const k of ["SERVEX_HOME", "SERVEX_POLICY", "PORT"]) delete env[k];
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: ["ignore", fs.openSync(path.join(local, "out.log"), "w"), fs.openSync(path.join(local, "out.log"), "a")], windowsHide: true });
const base = "http://127.0.0.1:8390", sleep = ms => new Promise(r => setTimeout(r, ms));
const call = async (name, args = {}) => JSON.parse(await (await fetch(`${base}/mcp`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) })).text());
let code = 1;
try {
	let up = false;
	for (let i = 0; i < 60 && !up; i++) { try { up = Array.isArray(await (await fetch(base + "/api/agents")).json()); } catch {} if (!up) await sleep(500); }
	console.log("private Servex up on 8390:", up);
	let status = null;
	for (let i = 0; i < 40; i++) { try { status = JSON.parse((await call("task_loop_status")).result.content[0].text); } catch {} if (status) break; await sleep(500); }
	console.log("task_loop_status:", JSON.stringify(status).slice(0, 400));
	code = up && status && JSON.stringify(status).includes("nudged") ? 0 : 1;
	console.log(code ? "FAIL" : "PASS  boots with the Step runner TaskLoop, which reports nudged");
} finally { child.kill(); if (code) console.log(fs.readFileSync(path.join(local, "out.log"), "utf8").slice(-1500)); }
process.exit(code);

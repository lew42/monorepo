/* node .../whisper-proof.mjs [scratch] — a PRIVATE Servex (ports 8190/8189/8188) starts its own whisper on :8187,
 * the script kills whisper-server, and shows GET /api/whisper noticing the crash and Servex bringing it back. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const SCRATCH = path.resolve(process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), "whisper-proof-")));
const BASE = "http://127.0.0.1:8190", sleep = ms => new Promise(r => setTimeout(r, ms));
const t0 = Date.now(), say = s => console.log(`[${String(Date.now() - t0).padStart(6)}ms] ${s}`);
const get = async u => { try { return await (await fetch(BASE + u)).json(); } catch { return null; } };
const local = path.join(SCRATCH, "localappdata");
fs.mkdirSync(path.join(local, "lew42", "servex"), { recursive: true });
fs.writeFileSync(path.join(local, "lew42", "servex", "dispatch.off"), "whisper proof\n");
const home = path.join(process.env.LOCALAPPDATA, "lew42", "whisper");
const env = { ...process.env, LOCALAPPDATA: local, WHISPER_HOME: home, WHISPER_PORT: "8187", SERVEX_PORT: "8190", SERVEX_PROXY_PORT: "8189", SERVEX_PROXY_INTERNAL: "8188", SERVEX_NO_GATE: "1" };
for (const k of ["SERVEX_HOME", "NO_WHISPER", "SERVEX_NO_ASSISTANT", "SERVEX_NO_LAYERS", "SERVEX_NO_MONITOR", "PORT"]) delete env[k];
const log = fs.openSync(path.join(SCRATCH, "servex.log"), "a");
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: ["ignore", log, log], windowsHide: true });
const kill = () => { try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }); } catch {} };
process.on("exit", kill);
const until = async (fn, ms) => { const end = Date.now() + ms; while (Date.now() < end){ const v = await fn(); if (v) return v; await sleep(500); } return null; };
try {
	const up = await until(async () => (await get("/api/whisper"))?.status === "online" && await get("/api/whisper"), 90000);
	say("first: " + JSON.stringify(up));
	// Whisper -> raw: time a recorded clip through whisper, then the words through /api/voice onto a session page.
	const clip = path.join(REPO, "public/framework/ai/sessions/2026/09/22/whisper-servex/whisper-servex/clip.wav");
	for (let i = 1; i <= 2; i++){
		const form = new FormData(); form.append("file", new Blob([fs.readFileSync(clip)]), "clip.wav"); form.append("response_format", "json");
		const tw = Date.now(); const heard = (await (await fetch("http://127.0.0.1:8187/inference", { method: "POST", body: form })).json()).text ?? "";
		const tr = Date.now(); const session = "00000000-0000-4000-8000-000000000042";
		const r = await (await fetch(BASE + "/api/voice", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ session, prompt: "whisper" + i, text: heard.trim() || "(nothing heard)", final: true, source: "whisper-proof" }) })).json();
		say(`clip ${i}: whisper ${tr - tw} ms (${(fs.statSync(clip).size / 32000).toFixed(1)} s of audio), then /api/voice ok=${r.ok} in ${Date.now() - tr} ms; heard: ${heard.trim().slice(0, 70)}`);
	}
	const pid = execFileSync("powershell", ["-NoProfile", "-Command", "(Get-NetTCPConnection -LocalPort 8187 -State Listen).OwningProcess"], { encoding: "utf8" }).trim();
	say("killing whisper-server pid " + pid);
	execFileSync("taskkill", ["/PID", pid, "/F"], { stdio: "ignore" });
	const t_kill = Date.now();
	const seen = await until(async () => { const w = await get("/api/whisper"); return w && w.crashes >= 1 && w.status === "online" && w; }, 90000);
	say(`back after ${Date.now() - t_kill} ms: ` + JSON.stringify(seen));
	const ok = await fetch("http://127.0.0.1:8187/").then(r => r.status).catch(e => String(e));
	say("whisper answers on 8187: " + ok);
} finally { kill(); }

/* node public/framework/ai/2026-10-12/voice-to-session-page/proof.mjs [scratch]
 * Boots a PRIVATE Servex from this checkout (ports 8190/8189/8188, no whisper),
 * plays a dictation into it the way the browser does (/api/voice partials, then
 * /api/refine), and prints when each stage landed on the session's page.jsonl.
 * Prints the session id so a headless shot can open /framework/ai/sessions/<id>/. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const SCRATCH = path.resolve(process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), "voice-proof-")));
const BASE = "http://127.0.0.1:8190";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const t0 = Date.now(), at = () => Date.now() - t0;
const say = s => console.log(`[${String(at()).padStart(6)}ms] ${s}`);
const post = async (u, b) => (await fetch(BASE + u, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) })).json();

const local = path.join(SCRATCH, "localappdata");
fs.mkdirSync(path.join(local, "lew42", "servex"), { recursive: true });
fs.writeFileSync(path.join(local, "lew42", "servex", "dispatch.off"), "voice proof\n");
const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: "8190", SERVEX_PROXY_PORT: "8189", SERVEX_PROXY_INTERNAL: "8188", SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: "8187" };
for (const k of ["SERVEX_HOME", "SERVEX_NO_ASSISTANT", "SERVEX_NO_LAYERS", "SERVEX_NO_MONITOR", "PORT"]) delete env[k];
const log = fs.openSync(path.join(SCRATCH, "servex.log"), "a");
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: ["ignore", log, log], windowsHide: true });
const kill = () => { try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }); } catch {} };
process.on("exit", kill);

try {
	let up = false; for (let i = 0; i < 60 && !up; i++){ try { up = Array.isArray(await (await fetch(BASE + "/api/agents")).json()); } catch {} if (!up) await sleep(500); } if (!up) throw new Error("Servex did not come up; see servex.log");
	say("private Servex up");
	const session = randomUUID(), prompt = "p" + Date.now().toString(36);
	console.log("SESSION", session);
	const words = "so I want the voice to show up on the session page um as I talk and then I want it cleaned up into points and a finished prompt".split(" ");
	let text = "";
	for (let i = 0; i < words.length; i += 4){
		text = words.slice(0, i + 4).join(" ");
		const r = await post("/api/voice", { session, prompt, text, source: "proof" });
		say(`partial ${i / 4 + 1}: ${r.ok ? "ok" : r.why}`);
		await sleep(150);
	}
	const t_final = at();
	await post("/api/voice", { session, prompt, text, final: true, source: "proof" });
	say("final raw posted");
	const t_ref = at();
	const r = await post("/api/refine", { text, session, prompt });
	say(`/api/refine returned (${at() - t_ref} ms) ok=${r.ok ?? "?"}`);
	await sleep(20000);   // clarity + annotator finish after refine returns
	const AI = path.join(REPO, "public/framework/ai/sessions");
	let page = null;
	(function walk(d){ for (const e of fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : []){ const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === "page.jsonl" && p.includes("session-" + session.slice(0, 8))) page = p; } })(AI);
	say("page: " + page);
	if (page) for (const l of fs.readFileSync(page, "utf8").split("\n").filter(Boolean)){ const o = JSON.parse(l); console.log(JSON.stringify(o).slice(0, 260)); }
	console.log("PAGE", page);
} finally { kill(); }

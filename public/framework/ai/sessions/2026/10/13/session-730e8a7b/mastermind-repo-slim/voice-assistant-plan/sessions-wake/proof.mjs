/* Proof (voice-assistant-plan/sessions-wake): on a PRIVATE Servex with SERVEX_SESSION_ASSISTANT=voice, three owner sentences
 * make the voice assistant write at most three {place} lines, every `re` an owner line's `at`; no assistant chat reply appears.
 * Ports 8392/8391/8390 (proxy, internal), a throwaway LOCALAPPDATA, dispatch off. Run from the tree under test:
 *   node public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/sessions-wake/proof.mjs
 * Costs a few cents (one low-effort voice-assistant agent). Writes one session file under /framework/ux/Dictate/ai/ in that tree. */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../".repeat(11));
const base = "http://127.0.0.1:8392";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const post = async (url, body) => (await fetch(base + url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json();
const get = async url => (await fetch(base + url)).json();

const local = fs.mkdtempSync(path.join(os.tmpdir(), "voice-wake-"));
const home = path.join(local, "lew42", "servex"); fs.mkdirSync(home, { recursive: true });
fs.writeFileSync(path.join(home, "dispatch.off"), "voice-wake proof\n");
const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: "8392", SERVEX_PROXY_PORT: "8391", SERVEX_PROXY_INTERNAL: "8390", SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: "8387",
	SERVEX_NO_POOL: "1", SERVEX_NO_FIXER: "1", SERVEX_REAPER_DRY: "1", SERVEX_SESSION_ASSISTANT: "voice", SERVEX_SESSION_BACKEND: "claude" };
for (const k of ["SERVEX_HOME", "SERVEX_POLICY", "PORT", "SERVEX_OPENROUTER_PAUSED"]) delete env[k];
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: "ignore", windowsHide: true });
const out = { repo: REPO };
let file = null;
try {
	for (let i = 0; i < 80; i++){ try { if (Array.isArray(await get("/api/agents"))) break; } catch {} await sleep(500); }
	const s = await post("/api/session/new", { path: "/framework/ux/Dictate/", host: "proof.localhost", fresh: true });
	out.session = s.session; file = path.join(REPO, "public", s.file);
	const sentences = ["Proof run. I want the inbox rail to be narrower on phones.", "Also the refine button is hidden under the footer.", "Separate thing: the models page needs a cost column."];
	for (const text of sentences){ await post("/api/session/say", { session: s.session, text, via: "text" }); await sleep(9000); }
	const read = () => fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
	for (let i = 0; i < 90; i++){   // wait for the placements
		await sleep(1000);
		if (read().filter(l => l.place).length >= 3) break;
	}
	await sleep(3000);
	const lines = read();
	const owner = lines.filter(l => l.chat?.from?.kind === "owner").map(l => l.chat.at);
	const places = lines.filter(l => l.place).map(l => l.place);
	out.owner = owner.length; out.places = places;
	out.agents = (await get("/api/agents")).filter(a => /voice-assistant|session-/.test(a.id ?? "")).map(a => ({ id: a.id, role: a.role, model: a.model, state: a.state }));
	out.assistant_chat = lines.filter(l => l.chat?.from?.kind === "assistant").length;
	out.pass = owner.length === 3 && places.length >= 1 && places.length <= 3 && places.every(p => owner.includes(p.re))
		&& out.agents.some(a => a.role === "voice-assistant") && !out.agents.some(a => a.role === "session-fast") && out.assistant_chat === 0;
} finally { child.kill(); await sleep(800); try { fs.rmSync(local, { recursive: true, force: true }); } catch {} }
console.log(JSON.stringify(out, null, 1));
console.log(out.pass ? "PASS" : "FAIL");
console.log("session file:", file);
process.exit(out.pass ? 0 : 1);

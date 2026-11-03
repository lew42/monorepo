/* node measure.mjs <label> [env KEY=VAL ...] — boots a PRIVATE Servex (ports 8195/8194/8193, own LOCALAPPDATA), opens a voice session
 * the way the drawer does, says ONE spoken sentence (via voice, floor done, quiet 3 s), and stamps every hop from the session
 * file + /api/agents. Prints a table; writes result-<label>.json beside this file. Real money: a Sonnet fast + a Sonnet smart (cents). */
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { spawn, execFileSync } from "node:child_process"; import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../../../../../../../../..");
const LABEL = process.argv[2] || "run"; const extra = Object.fromEntries(process.argv.slice(3).map(a => a.split("=")));
const PORT = 8195, BASE = `http://127.0.0.1:${PORT}`, sleep = ms => new Promise(r => setTimeout(r, ms));
const http = async (m, u, b) => { const r = await fetch(BASE + u, { method: m, headers: { "content-type": "application/json" }, body: b === undefined ? undefined : JSON.stringify(b) }); const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };
const local = fs.mkdtempSync(path.join(os.tmpdir(), "fr-"));
fs.mkdirSync(path.join(local, "lew42", "servex"), { recursive: true });
fs.writeFileSync(path.join(local, "lew42", "servex", "dispatch.off"), "first-reply measure\n");
const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: "8195", SERVEX_PROXY_PORT: "8194", SERVEX_PROXY_INTERNAL: "8193", SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: "8192", SERVEX_NO_ASSISTANT: "1", SERVEX_NO_POOL: "1", SERVEX_NO_USAGE: "1", SERVEX_NO_HEARTBEAT: "1", SERVEX_NO_MONITOR: "1", SERVEX_MIN_FREE_MB: "1500", ...extra };
for (const k of ["SERVEX_HOME", "SERVEX_POLICY", "SERVEX_AGENT_CAP", "PORT"]) delete env[k];
const out = fs.openSync(path.join(local, "servex.log"), "a");
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: ["ignore", out, out], windowsHide: true });
const T = {}, mark = (k, t = Date.now()) => { if (!(k in T)) T[k] = t; };
let file;
try {
	for (let i = 0; i < 80; i++){ try { if (Array.isArray(await http("GET", "/api/agents"))) break; } catch {} await sleep(500); }
	await sleep(2000);
	const n = await http("POST", "/api/session/new", { path: "/framework/", fresh: true });
	if (!n.file) throw new Error(JSON.stringify(n)); file = path.join(REPO, "public", n.file); console.log("session", n.session, n.file);
	if (extra.PREWARM) { /* nothing: the fix does it on new */ }
	await sleep(Number(extra.WARM_MS || 0)); // gap between drawer open and first sentence (pre-warm window)
	const seen = new Set(); let t_say;
	const poll = async () => {
		const ags = await http("GET", "/api/agents"); const mine = Array.isArray(ags) ? ags.filter(a => a.name === n.session) : [];
		for (const a of mine) { mark(`agent_${a.role}_listed`); if (a.state && a.state !== "starting") mark(`agent_${a.role}_${a.state}`); }
		if (fs.existsSync(file)) for (const l of fs.readFileSync(file, "utf8").split("\n").filter(Boolean)) { if (seen.has(l)) continue; seen.add(l); const j = JSON.parse(l); const k = Object.keys(j)[0]; const f = j.chat?.from; mark(`line_${k}${f ? "_" + f.kind + (f.id ? ":" + f.id : "") : ""}`); }
	};
	const iv = setInterval(() => poll().catch(() => {}), 150);
	t_say = Date.now(); const r = await http("POST", "/api/session/say", { session: n.session, path: "/framework/", text: "Can you tell me which page lists all the sessions?", via: "voice", floor: "done", quiet_ms: 3000 });
	T.say_returned = Date.now();
	const end = Date.now() + 90000;
	while (Date.now() < end && !Object.keys(T).some(k => /line_chat_assistant/.test(k))) await sleep(100);
	await sleep(1500); clearInterval(iv);
	for (const role of ["fast"]) { const rows = await http("GET", `/log/agent-session-${role}-${n.session}?n=60`); if (Array.isArray(rows)) { const ev = rows.map(r => ({ t: Date.parse(r.at) - t_say, k: r.type ?? Object.keys(r).filter(x => x !== "at")[0] })).filter(r => r.t > -9000); console.log(role, "log:", JSON.stringify(ev.slice(0, 14))); } else console.log("no log", String(rows).slice(0, 100)); }
	const rel = Object.fromEntries(Object.entries(T).map(([k, v]) => [k, v - t_say]).sort((a, b) => a[1] - b[1]));
	console.log(LABEL, JSON.stringify(rel, null, 1)); fs.writeFileSync(path.join(HERE, `result-${LABEL}.json`), JSON.stringify({ label: LABEL, extra, rel, ags: await http("GET", "/api/agents").catch(() => null) }, null, 1));
} catch (e) { console.error(e); }
finally {
	try { for (const a of await http("GET", "/api/agents")) if (a.state !== "stopped") await http("POST", "/mcp", { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "stop_agent", arguments: { id: a.id } } }).catch(() => {}); } catch {}
	await sleep(500); try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }); } catch {}
	if (file) { try { console.log(fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => l.slice(0, 160)).join("\n")); } catch {} }
}

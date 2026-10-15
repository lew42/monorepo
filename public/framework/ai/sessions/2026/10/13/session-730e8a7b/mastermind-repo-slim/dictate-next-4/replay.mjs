/* node replay.mjs <label> [REPO=<dir>] — private Servex (ports 8185/8184/8183) from REPO; 8 spoken sentences (7 "Smart assistant, …" + 1 statement),
 * each via /api/session/say. Prints per sentence: fast replies, smart first-reply ms; at the end the smart agent's context tokens + cost and every `task-mastermind` spawned. */
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { spawn, execFileSync } from "node:child_process"; import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const LABEL = process.argv[2] || "run"; const extra = Object.fromEntries(process.argv.slice(3).map(a => a.split("=")));
const REPO = path.resolve(extra.REPO || HERE, extra.REPO ? "." : "../../../../../../../../../..");
const PORT = 8185, BASE = `http://127.0.0.1:${PORT}`, sleep = ms => new Promise(r => setTimeout(r, ms));
const http = async (m, u, b) => { const r = await fetch(BASE + u, { method: m, headers: { "content-type": "application/json" }, body: b === undefined ? undefined : JSON.stringify(b) }); const t = await r.text(); try { return JSON.parse(t); } catch { return t; } };
const SENT = ["Smart assistant, which page lists all the sessions?", "Smart assistant, what does the Dictate sheet do on a phone?", "Smart assistant, where is the fast assistant's prompt?",
 "Smart assistant, how many bubbles does the half sheet show?", "The sheet should show every bubble in order.", "Smart assistant, is there a page for the inbox?", "Smart assistant, what is a voice session?", "Smart assistant, which file holds the Dictate widget?"];
const local = fs.mkdtempSync(path.join(os.tmpdir(), "rp-"));
fs.mkdirSync(path.join(local, "lew42", "servex"), { recursive: true });
const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: String(PORT), SERVEX_PROXY_PORT: "8184", SERVEX_PROXY_INTERNAL: "8183", SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: "8182", SERVEX_NO_ASSISTANT: "1", SERVEX_NO_POOL: "1", SERVEX_NO_USAGE: "1", SERVEX_NO_HEARTBEAT: "1", SERVEX_NO_MONITOR: "1", SERVEX_MIN_FREE_MB: "1500" };
for (const k of ["SERVEX_HOME", "SERVEX_POLICY", "SERVEX_AGENT_CAP", "PORT"]) delete env[k];
const out = fs.openSync(path.join(local, "servex.log"), "a");
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: ["ignore", out, out], windowsHide: true });
const lines = f => fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];
const rows = [];
try {
	for (let i = 0; i < 80; i++){ try { if (Array.isArray(await http("GET", "/api/agents"))) break; } catch {} await sleep(500); }
	await sleep(2000);
	const n = await http("POST", "/api/session/new", { path: "/framework/", fresh: true });
	const file = path.join(REPO, "public", n.file); console.log("session", n.session);
	for (const text of SENT){
		const before = lines(file).length, t0 = Date.now();
		await http("POST", "/api/session/say", { session: n.session, path: "/framework/", text, via: "voice", floor: "done", quiet_ms: 3000 });
		let smart = null;
		while (Date.now() - t0 < 120000 && smart == null){ await sleep(120); if (lines(file).slice(before).some(l => l.chat?.from?.id === "smart")) smart = Date.now() - t0; }
		await sleep(10000); // past the fast reply's 8 s wait
		const got = lines(file).slice(before);
		rows.push({ text, smart_ms: smart, fast_replies: got.filter(l => l.chat?.from?.id === "fast").length, fast_skips: got.filter(l => l.skip).length });
		console.log(JSON.stringify(rows.at(-1)));
	}
	const ags = await http("GET", "/api/agents");
	const smart = ags.find(a => a.role === "session-smart"), fast = ags.find(a => a.role === "session-fast");
	const tasks = ags.filter(a => /task-mastermind/.test(a.role));
	const res = { label: LABEL, rows, fast_total: rows.reduce((a, r) => a + r.fast_replies, 0), smart_context: smart?.context, smart_cost: smart?.cost, fast_cost: fast?.cost, task_masterminds: tasks.length };
	console.log(JSON.stringify(res)); fs.writeFileSync(path.join(HERE, `replay-${LABEL}.json`), JSON.stringify(res, null, 1));
} catch (e) { console.error(e); }
finally {
	try { for (const a of await http("GET", "/api/agents")) if (a.state !== "stopped") await http("POST", "/mcp", { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "stop_agent", arguments: { id: a.id } } }).catch(() => {}); } catch {}
	await sleep(500); try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }); } catch {}
}

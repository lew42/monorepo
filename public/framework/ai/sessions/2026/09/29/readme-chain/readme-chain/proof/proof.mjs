/* node public/framework/ai/2026-09-29/readme-chain/proof/proof.mjs
 *
 * THE README CHAIN, PROVED against a PRIVATE Servex booted from this checkout
 * in a child process: its own LOCALAPPDATA (a fresh scratch folder), its own
 * ports (8196 dashboard, 8195 proxy, 8194 internal proxy, no gate, no whisper,
 * dispatch paused, no fast assistant / master assistant / mastermind-servex —
 * this proof needs exactly one agent), so nothing it does reaches the live
 * Servex on 8090 or port 80.
 *
 * It spawns ONE cheap agent (Haiku, low effort) bound to a real directory —
 * `spawn_agent({role: "minion", page: "/framework/ux/Dictate/", prompt: "..."})`
 * — the PAGE-bound path, not `task: {dir}`: `task.dir` also opens (writes)
 * that agent's own task.jsonl AT that same directory (`Agents.js`'s
 * `open_task()`), and `public/framework/ux/Dictate` is a real, live module —
 * this proof must never write a stray file into it, even transiently. `page`
 * gets the identical readme-chain treatment (`directory_of()` in Agents.js
 * maps a page path onto its matching repo dir) with no file written anywhere.
 *
 * It reads that agent's OWN first-turn log line (`agent_msg`, `first: true`,
 * written by `Agent.start()` before the SDK even answers) to see exactly what
 * its first message contained: the readme chain, prepended by `Agents.spawn()`
 * (Servex/agents/Agents.js), built by `first_prompt()`
 * (Servex/agents/readme-chain.js). It never has to wait for or judge the
 * model's own reply — the thing being proved is what the agent received, not
 * what it said back — so this is a ~30-second, near-zero-cost proof (one
 * Haiku turn, stopped as soon as it answers).
 *
 * Writes this transcript to proof.md beside this file and exits. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../../../../..");
const SCRATCH = fs.mkdtempSync(path.join(os.tmpdir(), "readme-chain-proof-"));
const PORT = 8196, PROXY = 8195, INTERNAL = 8194, WHISPER = 8193;
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(HERE, "proof.md");
const DIR = "public/framework/ux/Dictate";

const sleep = ms => new Promise(r => setTimeout(r, ms));
const t0 = Date.now(), secs = () => Math.round((Date.now() - t0) / 1000);
const say = text => console.log(`[${String(secs()).padStart(4)}s] ${text}`);

function free(port){
	try { return !execFileSync("netstat", ["-ano"], { encoding: "utf8", windowsHide: true }).split("\n").some(l => l.includes(`:${port} `) && /LISTEN/.test(l)); }
	catch { return true; }
}

async function http(method, url, body){
	const res = await fetch(BASE + url, { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
	const text = await res.text();
	try { return JSON.parse(text); } catch { return text; }
}
const get = url => http("GET", url);
const post = (url, body) => http("POST", url, body);
let rpc = 0;
async function tool(name, args = {}){
	const out = await post("/mcp", { jsonrpc: "2.0", id: ++rpc, method: "tools/call", params: { name, arguments: args } });
	const text = out?.result?.content?.[0]?.text ?? JSON.stringify(out);
	try { return JSON.parse(text); } catch { return text; }
}
async function until(fn, ms, every = 1000){
	const end = Date.now() + ms;
	while (Date.now() < end){
		try { const v = await fn(); if (v) return v; } catch {}
		await sleep(every);
	}
	return null;
}

let child = null;
async function boot(){
	for (const p of [PORT, PROXY, INTERNAL]) if (!free(p)) throw new Error(`port ${p} is already taken; is another proof or Servex already using it?`);
	const local = path.join(SCRATCH, "localappdata");
	fs.mkdirSync(path.join(local, "lew42", "servex"), { recursive: true });
	fs.writeFileSync(path.join(local, "lew42", "servex", "dispatch.off"), "readme-chain proof\n");
	const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: String(PORT), SERVEX_PROXY_PORT: String(PROXY),
		SERVEX_PROXY_INTERNAL: String(INTERNAL), SERVEX_NO_GATE: "1", NO_WHISPER: "1", WHISPER_PORT: String(WHISPER),
		SERVEX_NO_ASSISTANT: "1" };
	for (const k of ["SERVEX_HOME", "SERVEX_NO_LAYERS", "SERVEX_MONITOR", "SERVEX_POLICY", "PORT"]) delete env[k];
	const log = fs.openSync(path.join(SCRATCH, "servex-child.log"), "a");
	child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: ["ignore", log, log], windowsHide: true });
	say(`private Servex pid ${child.pid}, port ${PORT}, LOCALAPPDATA ${local}`);
	const up = await until(async () => Array.isArray(await get("/api/agents")), 30000, 500);
	if (!up) throw new Error(`the private Servex did not answer on :${PORT} within 30 s; see ${path.join(SCRATCH, "servex-child.log")}`);
}

async function shutdown(){
	if (!child) return;
	try {
		const live = await get("/api/agents");
		for (const a of Array.isArray(live) ? live : []) if (a.state !== "stopped") await tool("stop_agent", { id: a.id }).catch(() => {});
	} catch {}
	await sleep(1000);
	try { execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true }); } catch {}
	say(`private Servex pid ${child.pid} stopped`);
	child = null;
	await until(async () => free(PORT) && free(PROXY) && free(INTERNAL), 15000, 500);
}

async function run(){
	// confirm on disk, before spawning anything, which levels actually have a readme —
	// what the agent's first message SHOULD contain, so the proof checks the real chain.
	const levels = [
		{ label: "root", dir: REPO },
		{ label: "public/", dir: path.join(REPO, "public") },
		{ label: "public/framework/", dir: path.join(REPO, "public/framework") },
		{ label: "public/framework/ux/", dir: path.join(REPO, "public/framework/ux") },
		{ label: "public/framework/ux/Dictate/", dir: path.join(REPO, DIR) }
	];
	const expected = levels.filter(l => fs.existsSync(path.join(l.dir, "readme.md")) || fs.existsSync(path.join(l.dir, "README.md")));
	say(`on disk, these levels have a readme: ${expected.map(l => l.label).join(", ")}`);

	await boot();

	const spawned = await tool("spawn_agent", {
		role: "minion", model: "claude-haiku-4-5-20251001", effort: "low", permission_mode: "plan",
		page: "/framework/ux/Dictate/",   // page-bound, not task:{dir} — see the file header comment
		prompt: "Reply with the single word: done. Use no tools."
	});
	say(`spawned ${spawned.id ?? JSON.stringify(spawned)}`);
	if (!spawned?.id) throw new Error(`spawn_agent did not return an id: ${JSON.stringify(spawned)}`);

	// the FIRST message the agent's own log recorded — written by Agent.start()
	// before the SDK has answered at all, so this needs no wait for a real reply.
	const first = await until(async () => {
		const rows = await get(`/log/agent-${spawned.id}?n=20`);
		return Array.isArray(rows) ? rows.find(e => e.type === "agent_msg" && e.first === true) : null;
	}, 15000, 500);
	if (!first) throw new Error("the agent's first agent_msg line never appeared within 15 s");
	const text = first.text ?? "";

	// order check: every readme this repo actually has, in the order it appears in `text`.
	const order = [];
	for (const l of expected){
		const marker = l.label === "root" ? /^readme\.md/m : new RegExp(l.dir.slice(REPO.length + 1).split(path.sep).join("/") + "/readme\\.md", "i");
		const at = text.search(marker);
		order.push({ label: l.label, found_at: at });
	}
	const in_order = order.every(o => o.found_at >= 0) && order.every((o, i) => i === 0 || o.found_at > order[i - 1].found_at);

	// let the cheap turn actually finish, then stop it — proof only needs the prompt, not the reply.
	await until(async () => {
		const row = (await get("/api/agents")).find(a => a.id === spawned.id);
		return row && row.state !== "working" ? row : null;
	}, 30000, 1000);
	await tool("stop_agent", { id: spawned.id }).catch(() => {});

	return { spawned, first_message: text, expected: expected.map(l => l.label), order, in_order };
}

let result = null, error = null;
try { result = await run(); }
catch (e){ error = String(e.stack || e); say(`ERROR ${e.message}`); }
finally { await shutdown(); }

const pass = !!result?.in_order;
const md = [
	"# readme-chain proof",
	"",
	`Run at ${new Date().toISOString()}, private Servex on port ${PORT} (proxy ${PROXY}, internal ${INTERNAL}), scratch \`${SCRATCH}\`.`,
	"",
	`**${pass ? "PASS" : "FAIL"}** — the test agent (\`${result?.spawned?.id ?? "?"}\`, spawned with \`page: "/framework/ux/Dictate/"\` — a page-bound spawn, chosen over \`task: {dir}\` so nothing is written into the live module; both are read by the same \`directory_of()\`) received its readme chain, in order: ${result?.expected?.join(" -> ") ?? "?"}.`,
	"",
	"## What was expected, from disk",
	"",
	...(result?.order?.map(o => `- ${o.label}: ${o.found_at >= 0 ? `found at character ${o.found_at}` : "NOT FOUND"}`) ?? [`(error before this point: ${error})`]),
	"",
	"## The agent's actual first message",
	"",
	"```",
	result?.first_message ?? "(none — see error below)",
	"```",
	...(error ? ["", "## Error", "", "```", error, "```"] : [])
].join("\n") + "\n";
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md);
say(`wrote ${OUT}`);
console.log(`\n${pass ? "PASS" : "FAIL"} — see ${OUT}`);
process.exit(pass ? 0 : 1);

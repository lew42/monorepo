/* The page pairs and their lifecycle, proven on a PRIVATE Servex — never the live one on 8090.
 *
 *   node <this file> <scratch dir> [--spike]
 *
 * Run from the root of the recursive-pairs worktree. It boots `node Servex/index.js`
 * there on 8290 (hidden; its own SERVEX_HOME and SERVEX_LAYERS_FILE in the scratch
 * dir; no gate, monitor, usage, pool, whisper or fast assistant; Layers ON, with the
 * owner's own numbers: 5 idle minutes, 4 live assistants, 30k/1 h resume, 40k fresh).
 *
 * Stages: three pages prompted (fresh starts) -> process count and MB -> a warm reply
 * -> 6 idle minutes -> process count and MB -> a resume -> two more pages and the cap
 * -> a compact + recycle and the fresh context after it -> the routes for / and a page.
 * `--spike` stops after the first stage (to read a fresh assistant's context size).
 * Everything printed also lands in proof.txt beside this file. It stops every agent,
 * kills the Servex tree and deletes the chat files it made. */
import fs from "fs";
import path from "path";
import { spawn, spawnSync } from "child_process";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = process.cwd();
const SCRATCH = path.resolve(process.argv[2] || path.join(HERE, ".proof-scratch"));
const SPIKE = process.argv.includes("--spike");
const CAP = process.argv.includes("--cap");   // the cap and a recycle, with Bash off: node <this> <scratch> --cap
const PORT = 8290, BASE = `http://127.0.0.1:${PORT}`;
fs.mkdirSync(SCRATCH, { recursive: true });
const LAYERS = path.join(SCRATCH, "layers.json");
try { fs.rmSync(LAYERS); } catch {}

const lines = [];
const t0 = Date.now();
const say = (...a) => { const s = `[${((Date.now() - t0) / 1000).toFixed(1).padStart(7)}s] ${a.join(" ")}`; console.log(s); lines.push(s); try { fs.appendFileSync(path.join(SCRATCH, "live.log"), s + "\n"); } catch {} };
const ok = (pass, what) => say(pass ? "PASS" : "FAIL", what);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ps = cmd => spawnSync("powershell.exe", ["-NoProfile", "-Command", cmd], { encoding: "utf8", windowsHide: true }).stdout.trim();
const post = async (url, body) => { const r = await fetch(BASE + url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body ?? {}) }); return { status: r.status, body: await r.json().catch(() => null) }; };
const get = async url => { const r = await fetch(BASE + url); return { status: r.status, body: await r.json().catch(() => null) }; };

/* ── boot, hidden ──────────────────────────────────────────────────────── */
const env = { SERVEX_PORT: PORT, SERVEX_PROXY_PORT: PORT + 1, SERVEX_PROXY_INTERNAL: PORT + 2, WHISPER_PORT: PORT + 3,
	SERVEX_NO_GATE: 1, SERVEX_NO_MONITOR: 1, SERVEX_NO_USAGE: 1, SERVEX_NO_POOL: 1, NO_WHISPER: 1, SERVEX_NO_ASSISTANT: 1,
	SERVEX_HOME: path.join(SCRATCH, "servex-home"), SERVEX_LAYERS_FILE: LAYERS, SERVEX_PROMPT_QUIET_MS: 1000, ...(CAP ? { SERVEX_ASSISTANT_BASH: "0" } : {}) };
const out = path.join(SCRATCH, "servex.out.log"), err = path.join(SCRATCH, "servex.err.log");
/* spawn, not a redirected Start-Process: that one inherits the pipe spawnSync waits on, and hangs it (2026-09-28). */
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, windowsHide: true, detached: true,
	env: { ...process.env, ...Object.fromEntries(Object.entries(env).map(([k, v]) => [k, String(v)])) },
	stdio: ["ignore", fs.openSync(out, "a"), fs.openSync(err, "a")] });
child.unref();
const pid = child.pid;
say(`private Servex: node pid ${pid}, ${BASE}, layers file ${LAYERS}`);

/* Every process under the Servex node: how many claude.exe, and their MB. */
function tree(){
	const rows = JSON.parse(ps("Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,WorkingSetSize | ConvertTo-Json -Compress") || "[]");
	const kids = new Map();
	for (const r of rows) (kids.get(r.ParentProcessId) ?? kids.set(r.ParentProcessId, []).get(r.ParentProcessId)).push(r);
	const all = [], walk = p => { for (const k of kids.get(p) ?? []){ all.push(k); walk(k.ProcessId); } };
	walk(pid);
	const claude = all.filter(r => /^claude/i.test(r.Name));
	const mb = list => Math.round(list.reduce((n, r) => n + Number(r.WorkingSetSize || 0), 0) / 1048576);
	return { claude: claude.length, claude_mb: mb(claude), all: all.length, all_mb: mb(all) };
}
const show = (label, t) => say(`${label}: ${t.claude} claude processes, ${t.claude_mb} MB (everything under Servex: ${t.all} processes, ${t.all_mb} MB)`);

const chat_file = page => path.join(REPO, "public", ...page.split("/").filter(Boolean), "ai", "chat.jsonl");
const made = new Set();
const replies = page => { try { return fs.readFileSync(chat_file(page), "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(l => l.message); } catch { return []; } };

/* One prompt, timed from the POST to the assistant's page_reply line in the chat. */
async function ask(page, text, ms = 180000){
	const before = replies(page).length, t = Date.now();
	made.add(page);
	const sent = await post("/api/page-ai", { page, text, from: "owner" });
	if (!sent.body?.ok){ say(`page-ai ${page} refused: ${JSON.stringify(sent.body)}`); return null; }
	while (Date.now() - t < ms){
		const r = replies(page);
		if (r.length > before) return { ms: Date.now() - t, reply: r.at(-1).message, assistant: sent.body.assistant };
		await sleep(250);
	}
	say(`no reply on ${page} within ${ms / 1000}s`);
	return null;
}
const agents = async page => (await get(`/api/page-agents?page=${encodeURIComponent(page)}`)).body ?? [];
const layers = () => { try { return JSON.parse(fs.readFileSync(LAYERS, "utf8")).cards; } catch { return {}; } };
const servex_log = () => { try { return fs.readFileSync(path.join(env.SERVEX_HOME, "logs", "servex.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(e => e.type === "layers"); } catch { return []; } };
/* A result lands a moment after the reply: wait for the context number to appear. */
async function context(page){
	for (let i = 0; i < 40; i++){
		const a = (await agents(page))[0];
		if (a?.context != null && a.state !== "working") return a;
		await sleep(500);
	}
	return (await agents(page))[0];
}
const SHORT = "This is an automated test. Call page_reply once with the single word: ok. Do nothing else.";

async function shutdown(){
	try {
		const list = (await get("/api/agents")).body ?? [];
		for (const a of list) if (a.state !== "stopped" && a.id !== "dispatcher")
			await post("/mcp?as=proof", { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "stop_agent", arguments: { id: a.id } } }).catch(() => {});
	} catch {}
	await sleep(1500);
	spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
	say(`private Servex pid ${pid} stopped`);
	for (const page of made){
		const f = chat_file(page);
		try { fs.copyFileSync(f, path.join(SCRATCH, `chat${page.replace(/\//g, "_")}jsonl`)); fs.rmSync(f); fs.rmdirSync(path.dirname(f)); } catch {}
	}
	say(`chat files copied to the scratch dir and removed from the worktree: ${[...made].join(" ")}`);
	fs.writeFileSync(path.join(HERE, SPIKE ? "spike.txt" : CAP ? "proof-cap.txt" : "proof.txt"), lines.join("\n") + "\n");
}

try {
	for (let i = 0; i < 60 && (await get("/api/page-agents?page=/").catch(() => null))?.status !== 200; i++) await sleep(500);
	ok((await get("/api/page-agents?page=/")).status === 200, "the private Servex answers");

	/* 0. opening a page spawns nothing */
	const none = await agents("/notes/");
	ok(Array.isArray(none) && none.length === 0, `GET /api/page-agents?page=/notes/ before any send: ${JSON.stringify(none)}`);
	const before = tree();
	show("before any prompt", before);

	if (CAP){
		/* five pages, one after another: the fifth must stop the least recently used */
		const FIVE = ["/notes/", "/blog/", "/imagine/", "/framework/faq/", "/framework/ux/"];
		for (const p of FIVE){ const r = await ask(p, SHORT); const a = await context(p); say(`fresh start on ${p}: ${(r?.ms / 1000).toFixed(1)} s, context ${a?.context} tokens`); }
		const live = (await get("/api/agents")).body.filter(a => /^assistant-/.test(a.id) && a.state !== "stopped");
		const lru = servex_log().filter(e => e.event === "lru-stop").map(e => e.id);
		ok(live.length === 4 && lru.includes("assistant-notes"), `five pages used, ${live.length} assistants live (${live.map(a => a.id).join(", ")}); stopped as least recently used: ${lru.join(", ") || "none"}`);
		show("at the cap", tree());
		/* a recycle, then the fresh context */
		const before_ctx = (await context("/blog/"))?.context;
		await post("/api/agent/assistant-blog/compact", {});
		for (let i = 0; i < 240 && layers()["/blog/"]?.assistant?.session_id; i++) await sleep(500);
		const summary = (() => { try { return fs.readFileSync(chat_file("/blog/"), "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(l => l.summary).at(-1)?.summary; } catch { return null; } })();
		ok(!layers()["/blog/"]?.assistant?.session_id && !!summary, `assistant-blog (context ${before_ctx}) wrote its checkpoint and was recycled: "${String(summary?.text).slice(0, 100)}"`);
		const again = await ask("/blog/", SHORT);
		const after = await context("/blog/");
		say(`fresh start after the recycle: ${(again?.ms / 1000).toFixed(1)} s`);
		ok(after?.context < 10000, `the recycled assistant's context begins under 10k (Bash off): ${after?.context}`);
		throw new Error("cap run done");
	}

	/* 1. three contexts, fresh */
	const PAGES = ["/", "/notes/", "/framework/ux/"];
	const fresh = await Promise.all(PAGES.map(p => ask(p, SHORT)));
	PAGES.forEach((p, i) => say(`fresh start on ${p}: ${fresh[i] ? `${fresh[i].assistant} replied "${fresh[i].reply.text}" after ${(fresh[i].ms / 1000).toFixed(1)} s` : "no reply"}`));
	for (const p of PAGES){ const a = await context(p); say(`  ${p}: ${a?.id} ${a?.model} context ${a?.context} tokens (${a?.pct}%)`); }
	ok(fresh.every(Boolean), "three pages prompted, three assistants replied into their own chat.jsonl");
	const root = (await agents("/"))[0];
	ok(root?.id === "assistant-root" && /opus/.test(root?.model ?? ""), `the root assistant runs on Opus: ${root?.id} ${root?.model}`);
	const three = tree();
	show("three assistants live", three);
	if (SPIKE) throw new Error("spike: stopping after stage 1");

	/* 2. a warm reply, the baseline for start costs */
	const warm = await ask("/notes/", SHORT);
	say(`warm (already running) on /notes/: ${(warm?.ms / 1000).toFixed(1)} s`);

	/* 3. six idle minutes, the owner's five-minute rule unshortened */
	say("waiting 6 minutes idle ...");
	for (let m = 1; m <= 12; m++){
		await sleep(30 * 1000);
		const alive = (await get("/api/page-agents?page=/notes/").catch(() => null))?.body;
		const t = tree();
		say(`  idle ${m * 30} s: Servex ${alive ? "answers" : "DOES NOT ANSWER"}, ${t.claude} claude processes, ${t.claude_mb} MB; ${PAGES.length} assistants: ${alive ? (await Promise.all(PAGES.map(p => agents(p)))).map(r => r[0]?.state).join(" ") : "?"}`);
	}
	const after = tree();
	show("after 6 idle minutes", after);
	const rows = await Promise.all(PAGES.map(p => agents(p)));
	ok(after.claude === 0 && rows.every(r => r[0]?.state === "stopped" && r[0]?.session_id), `all three stopped, session ids kept: ${rows.map(r => `${r[0]?.id}=${r[0]?.state}/${r[0]?.session_id?.slice(0, 8)}`).join(" ")}`);
	say(`freed: ${three.claude - after.claude} claude processes, ${three.claude_mb - after.claude_mb} MB`);

	/* 4. a resume */
	const resumed = await ask("/notes/", SHORT);
	const start_resume = servex_log().filter(e => e.event === "start" && e.id === "assistant-notes").at(-1);
	say(`resume on /notes/: ${(resumed?.ms / 1000).toFixed(1)} s (Layers logged: ${start_resume?.reason})`);
	ok(start_resume?.reason === "resume", "the stopped assistant was resumed by its session id");

	/* 5. the cap: two more pages make five contexts; four may run */
	const more = [];
	for (const p of ["/framework/faq/", "/blog/", "/imagine/"]){ more.push([p, await ask(p, SHORT)]); }
	for (const [p, r] of more) say(`fresh start on ${p}: ${(r?.ms / 1000).toFixed(1)} s`);
	const live = (await (await fetch(BASE + "/api/agents")).json()).filter(a => /^assistant-/.test(a.id) && a.state !== "stopped");
	const lru = servex_log().filter(e => e.event === "lru-stop").map(e => e.id);
	ok(live.length <= 4, `after 5 pages were used: ${live.length} assistants live (${live.map(a => a.id).join(", ")}); least-recently-used stopped: ${lru.join(", ") || "none"}`);
	show("at the cap", tree());

	/* 6. recycle: a checkpoint line, then a fresh start from it */
	const target = "assistant-faq";
	const before_ctx = (await context("/framework/faq/"))?.context;
	await post(`/api/agent/${target}/compact`, {});
	for (let i = 0; i < 240 && layers()["/framework/faq/"]?.assistant?.session_id; i++) await sleep(500);
	const summary = (() => { try { return fs.readFileSync(chat_file("/framework/faq/"), "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(l => l.summary).at(-1)?.summary; } catch { return null; } })();
	ok(!layers()["/framework/faq/"]?.assistant?.session_id && !!summary, `${target} (context ${before_ctx}) wrote its checkpoint and was recycled: "${String(summary?.text).slice(0, 120)}"`);
	const again = await ask("/framework/faq/", SHORT);
	const after_ctx = await context("/framework/faq/");
	say(`fresh start after recycle: ${(again?.ms / 1000).toFixed(1)} s, context now ${after_ctx?.context} tokens`);
	ok(after_ctx?.context < 10000, `the recycled assistant's context begins under 10k: ${after_ctx?.context}`);

	/* 7. the routes, for / and a plain page */
	for (const p of ["/", "/notes/"]){
		const rows = await agents(p);
		say(`GET /api/page-agents?page=${p} -> ${JSON.stringify(rows.map(({ id, role, state, model, context }) => ({ id, role, state, model, context })))}`);
	}
	const bad = await post("/api/page-ai", { page: "/no/such/page/", text: "x" });
	ok(bad.status === 404, `POST /api/page-ai for a page that does not exist -> ${bad.status} ${bad.body?.error}`);
	const pre = await fetch(BASE + "/api/page-ai", { method: "OPTIONS", headers: { origin: "http://monorepo.localhost", "access-control-request-method": "POST" } });
	ok(pre.status === 204 && pre.headers.get("access-control-allow-origin") === "*", `CORS preflight: ${pre.status}, allow-origin ${pre.headers.get("access-control-allow-origin")}`);

	say("start events Layers logged: " + servex_log().filter(e => e.event === "start").map(e => `${e.id}:${e.reason}`).join(" | "));
} catch (e){ say(`stopped: ${e.message}`); }
finally { await shutdown(); }

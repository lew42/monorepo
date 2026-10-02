// Standalone h1-page run through the LOCAL provider — the live, shared Servex
// does not know about provider "local" until this branch merges and restarts
// (same gap the chat page hit), so `evals/library.mjs`'s own spawn_agent-over-
// MCP path can't reach a local model today. This script does the same real
// work library.mjs's runOne() does (real tools, real file writes, the same
// mechanical checks), just calling the SDK's query() directly with env_for
// ("local") instead of going through the live Servex.
//
// Everything this script WRITES stays inside this task's own dir
// (public/framework/ai/2026-10-01/local-ai/build/h1-eval/), which is inside
// this minion's fence.
//
// Usage (from anywhere, needs Servex's own node_modules — `npm install` in
// Servex/ first if this worktree doesn't have them):
//   node public/framework/ai/2026-10-01/local-ai/build/h1-eval.mjs local/qwen2.5-coder
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = "C:/Code/lew42/worktrees/local-ai";
const SERVEX = ROOT + "/Servex/";
const u = p => pathToFileURL(SERVEX + p).href;

const { query } = await import(u("node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs"));
const Log = (await import(u("Log.js"))).default;
await import(u("ext/local/llama.js"));
const Process = (await import(u("Process.js"))).default;
const { LocalProxy } = await import(u("ext/local/llama.js"));
const { LLAMA_EXE, LLAMA_PORT, LOCAL_PROXY_PORT, env_for } = await import(u("ext/local/provider.js"));
const { browser } = await import(pathToFileURL(ROOT + "/Server/browser.mjs").href);

const TEST_DIR = path.join(ROOT, "public/framework/ai/tests/h1-page");
const RUN_ROOT = path.join(ROOT, "public/framework/ai/2026-10-01/local-ai/build/h1-eval");
const SITE_BASE = "http://local-ai.localhost";

const MODEL = process.argv[2] || "local/qwen2.5-coder";
const slug = MODEL.replace(/^local\//, "");
const runName = `h1-page-${slug.replace(/[^a-z0-9]+/gi, "-")}-${Date.now()}`;
const runDir = path.join(RUN_ROOT, runName);
const runUrlPath = `/framework/ai/2026-10-01/local-ai/build/h1-eval/${runName}/`;

// ---- copy the fixture, page.fixture.js -> page.js, same rule library.mjs uses ----
const as_run = name => name === "page.fixture.js" ? "page.js" : name;
function copyDir(from, to){
	fs.mkdirSync(to, { recursive: true });
	for (const e of fs.readdirSync(from, { withFileTypes: true })){
		const src = path.join(from, e.name), dst = path.join(to, as_run(e.name));
		if (e.isDirectory()) copyDir(src, dst); else fs.copyFileSync(src, dst);
	}
}
copyDir(path.join(TEST_DIR, "fixture"), runDir);

const lines = fs.readFileSync(path.join(TEST_DIR, "page.jsonl"), "utf8").split(/\r?\n/).filter(Boolean).map(l => JSON.parse(l));
const def = lines[0];
const promptText = fs.readFileSync(path.join(TEST_DIR, def.prompt), "utf8").trim();
const orient = `This folder is a real page on the live site: ${SITE_BASE}${runUrlPath} — it already has a page.js (a plain "Floor test" landing page). Work inside this folder.\n\n`;
const prompt = orient + promptText;

console.log("model:", MODEL, "\nrunDir:", runDir, "\nprompt:", prompt);

// ---- bring up a standalone llama-server + local proxy (same ports provider.js names) ----
const log = new Log();
const llama = new Process.Llama({ name: "llama-h1eval", log, port: LLAMA_PORT, command: LLAMA_EXE, args: [] });
llama.on("say", msg => console.log("[llama]", msg));
const proxy = new LocalProxy({ llama, port: LOCAL_PROXY_PORT }).start();

let turns = 0, result_text = "", t0 = Date.now(), errored = null;
try {
	for await (const m of query({ prompt, options: {
		model: MODEL,
		cwd: runDir,
		permissionMode: "bypassPermissions",
		/* ⚠ FOUND THE HARD WAY (first two runs): `allowedTools` only auto-approves
		 * — it does NOT trim what the model is actually offered. `tools` is the
		 * option that does (sdk.d.ts: "specify the BASE SET of available built-in
		 * tools"). Run 1, with no mcpServers override, inherited this repo's whole
		 * .mcp.json (~50 Servex/figma/site tools) and blew the prompt to 91k
		 * tokens before the model ever saw the task. Run 2, with mcpServers:{}
		 * but only `allowedTools` set, still offered every built-in tool this
		 * CALLING session itself has (Agent, Workflow, 30+ others) — 44k tokens,
		 * still over qwen2.5-coder's 32k context. `tools` is the real restriction;
		 * same minimal shape agents/tidy.js already uses for its own one-shot calls. */
		tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
		mcpServers: {}, strictMcpConfig: true, skills: [], settingSources: [],
		maxTurns: 20,
		env: { ...process.env, ...env_for("local") }
	} })){
		if (m.type === "assistant") turns++;
		if (m.type === "result") result_text = m.result ?? result_text;
	}
} catch (e){ errored = String(e?.message || e); console.error("query() threw:", errored); }
const ms = Date.now() - t0;

// ---- mechanical checks (same checks library.mjs makes, reimplemented small here since
// its own functions are module-private and this script's fence doesn't include that file) ----
function allFiles(dir){
	const out = [];
	for (const e of fs.readdirSync(dir, { withFileTypes: true })){
		const p = path.join(dir, e.name);
		if (e.isDirectory()) out.push(...allFiles(p)); else out.push(p);
	}
	return out;
}
function checksParse(dir){
	const bad = [];
	for (const f of allFiles(dir).filter(f => f.endsWith(".js"))){
		const r = spawnSync("node", ["--check", f], { encoding: "utf8", windowsHide: true });
		if (r.status !== 0) bad.push(path.relative(dir, f) + ": " + (r.stderr || "").split("\n")[0]);
	}
	return { ok: bad.length === 0, bad };
}
function checksLinked(dir, child){
	const parent = path.join(dir, "page.js");
	if (!fs.existsSync(parent)) return { ok: false, why: "fixture's own page.js is gone" };
	const text = fs.readFileSync(parent, "utf8");
	const ok = new RegExp(`children\\s*:[^,}]*\\b${child}\\b`).test(text);
	return { ok, why: ok ? `${child} is in children:` : `${child} not found in parent's children:` };
}
async function checksH1(url, expected){
	const b = await browser();
	const page = await (await b.newContext()).newPage();
	const page_errors = [];
	page.on("pageerror", e => page_errors.push(e.message));
	try {
		await page.goto(url, { waitUntil: "load", timeout: 20000 });
		await page.waitForTimeout(1200);
		const { found, all } = await page.evaluate(exp => {
			const texts = [...document.querySelectorAll(".page.active-page h1, .page.active-page .page-title")].map(e => e.textContent?.trim() ?? "");
			return { found: texts.includes(exp), all: texts };
		}, expected);
		await page.close();
		return { ok: found, found: all, errors: page_errors, why: found ? "an H1 matched exactly" : `H1s were ${JSON.stringify(all)}, wanted ${JSON.stringify(expected)}` };
	} catch (e){
		try { await page.close(); } catch {}
		return { ok: false, found: null, errors: [...page_errors, String(e?.message || e)], why: "the child page did not load" };
	}
}

const parse = checksParse(runDir);
const linked = checksLinked(runDir, def.new_child);
const h1 = (def.new_child && def.h1_text) ? await checksH1(`${SITE_BASE}${runUrlPath}${def.new_child}/`, def.h1_text) : null;

proxy.stop();
await llama.stop();
log.close?.();

const mechanicalOk = !errored && parse.ok && linked.ok && (!h1 || h1.ok);
const pass = mechanicalOk ? 1 : 0;
const note = errored ? `agent run failed: ${errored.slice(0, 300)}`
	: mechanicalOk ? "mechanical checks passed"
	: [!parse.ok && `parse failed: ${parse.bad.join("; ")}`, !linked.ok && linked.why, h1 && !h1.ok && h1.why].filter(Boolean).join(" | ");

const row = {
	at: new Date().toISOString(), run: runName, probe: "h1-page", model: MODEL, effort: "medium",
	dir: path.relative(ROOT, runDir).replaceAll("\\", "/"),
	pass, label: {}, reached: true, cost_usd: 0, turns, ms,
	mechanical: { parse: parse.ok, linked, h1 },
	note
};
console.log("\nmodel's own final reply:", JSON.stringify(result_text));
console.log("\nRESULT:", JSON.stringify(row, null, 2));
fs.writeFileSync(path.join(RUN_ROOT, runName + ".result.json"), JSON.stringify(row, null, 2));

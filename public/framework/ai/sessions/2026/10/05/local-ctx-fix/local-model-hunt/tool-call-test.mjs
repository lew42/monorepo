// tool-call-test.mjs — the brief's deliverable 2 tool-call test: "through the Claude Agent SDK
// pointed at the local server, read 3 files and answer a question about them."
//
// Uses the Servex local proxy that is ALREADY live on :8998 (the running Servex owns
// llama-server; this script never starts its own copy) — same trick as
// public/framework/ai/sessions/2026/09/24/servex-mastermind-opus/local-ai/build/h1-eval.mjs, just pointed at a plain
// read-only directory instead of a page fixture, and simpler because it doesn't need its
// own llama-server/proxy pair.
//
// Usage: node tool-call-test.mjs local/qwen3-8b
import path from "node:path";
import { pathToFileURL } from "node:url";

const SERVEX = "C:/Code/lew42/monorepo/Servex/";
const u = p => pathToFileURL(SERVEX + p).href;
const { query } = await import(u("node_modules/@anthropic-ai/claude-agent-sdk/sdk.mjs"));
const { env_for } = await import(u("ext/local/provider.js"));

const MODEL = process.argv[2] || "local/qwen3-8b";
const DIR = path.resolve("public/framework/ai/sessions/2026/10/05/local-ctx-fix/local-model-hunt/fixture");

const prompt = `Read the 3 files in this directory (a.txt, b.txt, c.txt) and answer: which animal appears in all three files, and what single number is common to all three?`;

let turns = 0, result_text = "", tool_calls = [], errored = null;
const t0 = Date.now();
try {
	for await (const m of query({ prompt, options: {
		model: MODEL,
		cwd: DIR,
		permissionMode: "bypassPermissions",
		tools: ["Read", "Glob"],
		mcpServers: {}, strictMcpConfig: true, skills: [], settingSources: [],
		maxTurns: 10,
		env: { ...process.env, ...env_for("local") }
	} })){
		if (m.type === "assistant"){
			turns++;
			for (const block of m.message?.content ?? []) if (block.type === "tool_use") tool_calls.push(block.name);
		}
		if (m.type === "result") result_text = m.result ?? result_text;
	}
} catch (e){ errored = String(e?.message || e); console.error("query() threw:", errored); }
const ms = Date.now() - t0;

const answer_lower = (result_text || "").toLowerCase();
const got_animal = answer_lower.includes("fox");
const got_number = answer_lower.includes("42");

const row = {
	model: MODEL, ms, turns, tool_calls, errored,
	result_text,
	used_tools: tool_calls.length > 0,
	correct_animal: got_animal,
	correct_number: got_number,
	pass: !errored && tool_calls.length > 0 && got_animal && got_number
};
console.log(JSON.stringify(row, null, 2));
const fs = await import("node:fs");
fs.writeFileSync(path.join(path.dirname(DIR), `tool-call-${MODEL.replace(/[^a-z0-9]+/gi, "-")}.json`), JSON.stringify(row, null, 2));

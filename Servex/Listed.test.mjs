// Listed + the `call` dispatcher (Servex/MCP.js): a few tools listed, every other one reached by name. node Servex/Listed.test.mjs
// Part 2 checks the docs against the LIVE registry (Servex on :8090): every mcp__servex__X / mcp__local__X a role readme or a
// skill names must still be a registered tool, so `call` can reach it. Fails, never skips, when a named tool is gone.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MCP from "./MCP.js";
import Listed from "./Listed.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const router = { post(){}, all(){} };

// 1. one MCP, three tools, a listing that shows one of them
const mcp = new MCP({ router, listed: () => ["shown"] });
mcp.tool({ name: "shown", description: "A shown tool that does a thing. More text.", inputSchema: { type: "object", properties: {}, required: [] }, handler: () => "shown ok" });
mcp.tool({ name: "close_task", description: "Close a task when it has landed. Long tail.", inputSchema: { type: "object", properties: { dir: { type: "string" }, evidence: { type: "array" } }, required: ["dir"] }, handler: a => `closed ${a.dir}` });
mcp.tool({ name: "take_worktree", description: "Take a ready worktree from the pool.", inputSchema: { type: "object", properties: {} }, handler: (a, ctx) => `taken by ${ctx.caller}` });

const list = (await mcp.result("tools/list", {}, { caller: "minion-x" })).tools;
assert.deepEqual(list.map(t => t.name).sort(), ["call", "shown"]);
const call = list.find(t => t.name === "call");
assert.match(call.description, /close_task, take_worktree/, "call's description names every unlisted tool");

// 2. the dispatcher reaches an unlisted tool, with the caller
const via = (tool, args) => mcp.call("call", { tool, args }, { caller: "minion-x" }).then(r => ({ text: r.content[0].text, error: !!r.isError }));
assert.deepEqual(await via("take_worktree", {}), { text: "taken by minion-x", error: false });
assert.deepEqual(await via("close_task", { dir: "a/b" }), { text: "closed a/b", error: false });

// 3. bad calls answer with the schema to use
let r = await via("close_task", {});
assert.ok(r.error && /missing dir/.test(r.text) && /"required":\["dir"\]/.test(r.text), r.text);
r = await via("close_task", { dir: "a", evidence: "x" });
assert.ok(r.error && /evidence should be array, got string/.test(r.text), r.text);
r = await via("close", {});
assert.ok(r.error && /Unknown tool: close\. Did you mean close_task/.test(r.text), r.text);

// 4. list: one line each, or one tool in full
assert.equal((await via("list", {})).text, "shown: A shown tool that does a thing.\nclose_task: Close a task when it has landed.\ntake_worktree: Take a ready worktree from the pool.");
assert.match((await via("list", { name: "close_task" })).text, /"inputSchema":\{"type":"object"/);

// 5. no listing = everything (SERVEX_LIST_ALL=1 path), and the role sets
assert.equal((await new MCP({ router }).result("tools/list", {})).tools.length, 1, "a bare MCP lists only call");
assert.ok(Listed.BASE.length <= 10 && Listed.REMOTE.length <= 10, "about 10 or fewer listed tools on each door");
assert.ok(Listed.local("single-voice-assistant-v-abc").includes("say"));
assert.ok(Listed.local("minion-x", "minion").includes("item") && !Listed.local("minion-x", "minion").includes("say"));
assert.ok(Listed.local(null).includes("call"));
const echo = { live: new Map([["echo-v-1", { role: "echo", allowed_tools: ["mcp__servex__refine_step", "Read"] }]]), reg: () => ({ read: () => ({}) }) };
assert.ok(Listed.for_agent(echo, "echo-v-1").includes("refine_step"), "a spawn whitelist's servex tools stay listed for that agent");
assert.ok(!Listed.for_agent(echo, "minion-y").includes("refine_step"));

// 6. docs vs the live registry
const ask = (body) => fetch("http://127.0.0.1:8090/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, ...body }) }).then(r => r.json());
let names;
try {
	const all = await ask({ method: "tools/call", params: { name: "call", arguments: { tool: "list" } } });
	names = all.result && !all.result.isError ? all.result.content[0].text.split("\n").map(l => l.split(":")[0]).concat("call")
		: (await ask({ method: "tools/list" })).result.tools.map(t => t.name);   // a Servex from before this change: everything is listed
} catch (e){ throw new Error(`Servex is not answering on :8090 (${e.message}); this test reads its live registry`); }
const texts = [...fs.readdirSync(path.join(ROOT, "Servex/agents/roles")).filter(f => f.endsWith(".md")).map(f => `Servex/agents/roles/${f}`),
	...fs.readdirSync(path.join(ROOT, ".claude/skills")).map(d => `.claude/skills/${d}/SKILL.md`).filter(f => fs.existsSync(path.join(ROOT, f)))];
const known = new Set(names), missing = [];
for (const f of texts) for (const m of fs.readFileSync(path.join(ROOT, f), "utf8").matchAll(/mcp__(?:servex|local)__(\w+)/g))
	if (!known.has(m[1])) missing.push(`${f}: ${m[1]}`);
assert.deepEqual([...new Set(missing)], [], "a role or skill names a Servex tool no longer registered");
// a role readme that names a tool its role does not see listed must say how to reach it (through call)
const unreached = [];
for (const f of texts.filter(f => f.startsWith("Servex/agents/roles/") && !f.endsWith("readme.md"))){   // readme.md is the index, not a role
	const text = fs.readFileSync(path.join(ROOT, f), "utf8"), role = path.basename(f, ".md"), shown = new Set(Listed.local(null, role));
	const named = [...text.matchAll(/`(\w+)(?:\(\))?`/g)].map(m => m[1]).filter(n => known.has(n) && !shown.has(n));
	if (named.length && !/call\(\{tool/.test(text)) unreached.push(`${f}: ${[...new Set(named)].join(", ")}`);
}
assert.deepEqual(unreached, [], "a role text names unlisted tools without saying call({tool, ...}) reaches them");
console.log(`Listed: ok (${names.length} registered, ${texts.length} role and skill texts checked)`);

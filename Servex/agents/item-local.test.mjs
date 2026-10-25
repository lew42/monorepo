// Step 12: the page tools in-process as `local`. `node Servex/agents/item-local.test.mjs`
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Agents } from "./Agents.js";
import { page_tools } from "./page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };
const NAMES = ["item", "page_set", "page_add", "page_log", "page_read", "page_call"];

const door = () => Agents.Agent.prototype.door.call({ id: "minion-x", host: { mcp_url: "http://127.0.0.1:1/mcp" }, mcp_servers: undefined });
delete process.env.SERVEX_LOCAL_TOOLS;
let d = door();
ok(d.mcpServers.local?.type === "sdk", "local is an in-process sdk server");
ok(d.mcpServers.servex?.type === "http", "HTTP servex entry stays");
ok(NAMES.every(t => d.disallowedTools.includes("mcp__servex__" + t)), "six HTTP twins disallowed");
ok(d.disallowedTools.length === 6, "only the twins");

process.env.SERVEX_LOCAL_TOOLS = "0";
d = door();
ok(!d.mcpServers.local && !d.disallowedTools && d.mcpServers.servex, "SERVEX_LOCAL_TOOLS=0: HTTP only");

// The SDK server hides its handlers, so call the same function through page_tools().
const REL = "public/framework/ai/sessions/2026/10/16/.item-local-test-" + process.pid;
const DIR = path.join(ROOT, REL);
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "task.jsonl"), JSON.stringify({ assign: { slug: "fixture", title: "Fixture" } }) + "\n");
fs.writeFileSync(path.join(DIR, "page.jsonl"), "");
try {
	const item = page_tools().find(t => t.name === "item");
	const r = JSON.parse(await item.handler({ path: "/" + REL.slice("public/".length) + "/", delta: { start: {} } }, { caller: "minion-x" }));
	ok(r.ok && r.now?.state === "running", "item start -> running (a write answers the state it left, not the whole picture)");
	console.log(`item-local: ${n} checks passed`);
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }
process.exit(0);

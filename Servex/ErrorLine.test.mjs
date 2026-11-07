// ErrorLine core test: where() finds the first repo frame, of() puts "error" first, note() lands one line in the agent's session log.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ErrorLine from "./ErrorLine.js";
import SpawnLog from "./SpawnLog.js";

const root = ErrorLine.ROOT;
const e = new Error("boom");
e.stack = [
	"Error: boom",
	`    at inner (${path.join(root, "node_modules", "x", "i.js")}:3:1)`,
	"    at node:internal/process/task_queues:95:5",
	`    at handler (file:///${path.join(root, "Servex", "agents", "tools.js").split(path.sep).join("/")}:612:9)`,
].join("\n");
assert.equal(ErrorLine.where(e), "Servex/agents/tools.js:612", "skips node_modules and node:internal, keeps the repo frame");
assert.equal(ErrorLine.where({ stack: "Error: x\n    at node:internal/a:1:1" }), null, "no repo frame: null");

const line = ErrorLine.of(e, { tool: "item" });
assert.deepEqual(Object.keys(line), ["error", "where", "tool"], "error is the fixed first key");
assert.equal(line.error, "boom");
assert.equal(ErrorLine.of("plain string").error, "plain string", "a thrown string still makes a line");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "errorline-"));
fs.writeFileSync(path.join(dir, "session.jsonl"), JSON.stringify({ title: "t", by: "test", ts: new Date().toISOString() }) + "\n");
const agents = { live: new Map([["minion-x", { task: { dir } }]]) };
ErrorLine.note(agents, "minion-x", e, { tool: "item" });
await SpawnLog.flush();
const last = JSON.parse(fs.readFileSync(path.join(dir, "session.jsonl"), "utf8").trim().split("\n").at(-1));
assert.equal(last.error, "boom");
assert.equal(last.where, "Servex/agents/tools.js:612");
assert.equal(last.agent, "minion-x");
assert.equal(last.tool, "item");
assert.equal(last.by, "servex");

assert.doesNotThrow(() => ErrorLine.note(null, null, e), "no agent and no sink: never throws");
fs.rmSync(dir, { recursive: true, force: true });
console.log("ErrorLine.test: ok");

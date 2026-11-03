// node Servex/agents/open-task.test.mjs — open_task starts a NEW session folder as session.jsonl and a task folder as task.jsonl.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import assert from "node:assert";
import { open_task } from "./Agents.js";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "open-task-")), day = path.join(root, "public/framework/ai/sessions/2026/10/20");
const open = (dir, session_id) => open_task({ dir }, { session_id, agent: "a1", model: "sonnet" });
const names = dir => fs.readdirSync(dir).sort();

open(path.join(day, "fresh-session"), "11111111-1111-4111-8111-111111111111");           // directly under a day: a session folder
assert.deepEqual(names(path.join(day, "fresh-session")), ["session.jsonl"]);
open(path.join(day, "fresh-session"), "11111111-1111-4111-8111-111111111111");           // opened again: the line goes to the same record
assert.deepEqual(names(path.join(day, "fresh-session")), ["session.jsonl"]);
assert.equal(fs.readFileSync(path.join(day, "fresh-session/session.jsonl"), "utf8").trim().split("\n").length, 2);

open(path.join(day, "fresh-session/the-task"), "11111111-1111-4111-8111-111111111111");  // inside a session: a spawned agent is a sub-session
assert.deepEqual(names(path.join(day, "fresh-session/the-task")), ["session.jsonl"]);

fs.mkdirSync(path.join(day, "old-task"), { recursive: true }); fs.writeFileSync(path.join(day, "old-task/task.jsonl"), "{\"log\":{\"msg\":\"x\"}}\n");
open(path.join(day, "old-task"), "22222222-2222-4222-8222-222222222222");                // an existing log keeps its name
assert.deepEqual(names(path.join(day, "old-task")), ["task.jsonl"]);

fs.rmSync(root, { recursive: true, force: true });
console.log("open-task: ok");

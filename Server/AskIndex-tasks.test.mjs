// node Server/AskIndex-tasks.test.mjs — after_refine also makes one Task per new ask, through the item tool; no Haiku, temp folder.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import AskIndex from "./AskIndex.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SESSION = "bbbbbbbb-0000-4000-8000-000000000000";
const DAY = path.join(ROOT, "public/framework/ai/sessions/2026/10/16/.askindex-tasks-test-" + process.pid);
const DIR = path.join(DAY, "bbbbbbbb-0000-4000-8000-000000000000");
const ASKS = path.join(DIR, "asks.jsonl");
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "task.jsonl"), JSON.stringify({ assign: { slug: "fixture", title: "Fixture" } }) + "\n");
try {
	const idx = new AskIndex({ root: ROOT });
	idx._dirs.set(SESSION, DIR);   // pin the fixture folder; real sessions are never touched
	const parsed = { asks: [{ id: "a1", text: "Make the mic dot bigger", module: "test/no-such-module-a" }, { id: "a2", text: "Log each prompt once", module: "test/no-such-module-b" }] };
	const ref = { session: SESSION, line: 3, at: "2026-10-16T10:00:00Z" };

	const n = idx.after_refine(ref, parsed);
	assert.equal(n.recorded, 2);
	assert.deepEqual(await n.tasks, { added: 2, skipped: 0, no_folder: 0 });
	const all = fs.readFileSync(path.join(DIR, "task.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l)).slice(1);
	const lines = all.filter(l => l.tasks?.add);   // the item tool also stamps one `sessions` line registering the caller
	assert.equal(lines.length, 2);
	for (const l of lines) assert.ok(l.by === "refine-queue" && l.ts && l.tasks.add.source?.session === SESSION && l.tasks.add.title, "stamped add line holds the source");
	assert.ok(lines.every(l => /^[a-z][a-z0-9]{7}$/.test(l.tasks.add.id)) && lines[0].tasks.add.id !== lines[1].tasks.add.id, "each ask's task gets a random 8-character id (Item.short_id), never a slug of its title");

	const again = idx.after_refine(ref, parsed);
	assert.equal(again.recorded, 0);
	assert.deepEqual(await again.tasks, { added: 0, skipped: 0, no_folder: 0 }, "second call: nothing recorded, nothing added");
	// a re-record of existing asks (rows lost) must still not duplicate tasks
	fs.rmSync(ASKS);
	const third = new AskIndex({ root: ROOT }); third._dirs.set(SESSION, DIR);
	assert.deepEqual(await third.after_refine(ref, parsed).tasks, { added: 0, skipped: 2, no_folder: 0 }, "same source: skipped");

	const view = await AskIndex.tasks_view(DIR);
	assert.equal(view.length, 2);
	assert.deepEqual(view.map(t => t.state), ["idle", "idle"]);
	assert.deepEqual(view[0].source, { session: SESSION, line: 3, id: "a1" });
	assert.equal(view[1].module, "test/no-such-module-b");
	assert.equal(view[0].title, "Make the mic dot bigger");

	const none = new AskIndex({ root: ROOT }); none._dirs.set("cccccccc-0", path.join(DAY, "missing"));
	assert.deepEqual(await none.make_tasks([{ session: "cccccccc-0", prompt_ref: "/ai-logs/x#1", id: "a1", ask: "x", module: "m" }]), { added: 0, skipped: 0, no_folder: 1 });
	console.log("AskIndex-tasks: all checks passed");
} finally { fs.rmSync(DAY, { recursive: true, force: true }); }

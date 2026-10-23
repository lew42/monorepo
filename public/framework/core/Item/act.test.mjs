// A button's verb is saved as a verb. `node public/framework/core/Item/act.test.mjs`
//  1. run_item as the owner writes {"start":{},"by":"owner","ts":…}; a fresh Task.replay of the file is running.
//  2. Item.act on a Task emits exactly one delta {start:{}} to a Store and none for the `state` set.
//  3. a refused verb emits nothing.
//  4. Store.skip_echo ignores by/ts.
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Task from "../Task/Task.js";
import Store from "./Store.js";
import { run_item } from "../../../../Servex/agents/page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const REL = "public/framework/ai/sessions/2026/10/22/.act-test-" + process.pid;
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "task.jsonl");
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify({ assign: { slug: "act", title: "Act" } }) + "\n");
try {
	const r = await run_item({ path: "/" + REL.slice("public/".length) + "/", delta: { start: {} } }, { caller: "owner" });
	ok(r.ok, "run_item answers ok: " + JSON.stringify(r.why));
	const lines = fs.readFileSync(FILE, "utf8").trim().split("\n").map(l => JSON.parse(l));
	const line = lines.find(l => l.start);
	ok(line && line.by === "owner" && line.ts, "the verb line is stamped by owner + ts");
	ok(Task.replay(lines).state === "running", "a fresh replay is running");
} finally { fs.rmSync(DIR, { recursive: true, force: true }); }

// Item.act: one delta, the verb.
const task = new Task({ data: { title: "t" } });
const seen = [];
task.on("delta", (d, origin) => seen.push({ d, origin }));
task.act("start");
ok(task.state === "running", "act ran the verb locally");
const verbs = seen.filter(x => x.d.start);
ok(verbs.length === 1 && JSON.stringify(verbs[0].d) === "{\"start\":{}}" && verbs[0].origin === task, "exactly one {start:{}} delta, origin the task");

// A Store attached records the verb only (not the state set).
const store = new Store({ url: "/x/task.jsonl" }), queued = [];
store.append = l => queued.push(l);
const t2 = new Task({ data: { title: "t2" } });
store.attach(t2);
t2.act("start");
ok(queued.length === 1 && JSON.stringify(queued[0]) === '{"start":{}}', "the store got only the verb line: " + JSON.stringify(queued));
t2.set({ title: "other" });
ok(queued.length === 2 && queued[1].set?.title === "other", "a plain set still records its state (Store.muted back to 0)");

// A refused verb: nothing.
const before = seen.filter(x => x.d.start).length;
task.act("start");   // already running
ok(seen.filter(x => x.d.start).length === before, "a refused verb emits nothing");

// Echo skip ignores by/ts.
const s = new Store({ url: "/x/task.jsonl" });
(s.sent ??= []).push('{"start":{}}');
ok(s.skip_echo({ start: {}, by: "owner", ts: "2026-10-22T00:00:00Z" }), "the echo with by/ts is skipped");

console.log(`act.test: ${n} passed`);

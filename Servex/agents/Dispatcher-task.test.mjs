/* node Servex/agents/Dispatcher-task.test.mjs — a dispatched task's dir is born with its first line (todo 165, 2026-09-30).
 * A real Dispatcher and the real open_task; the agents' spawn is a stub that does what Agents.spawn does with `task`. The dir lands
 * under this checkout's store and is removed at the end. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const home = fs.mkdtempSync(path.join(os.tmpdir(), "dispatcher-task-test-"));
process.env.SERVEX_HOME = home;
process.env.SERVEX_NO_BUDGET = "1";
const { default: Dispatcher } = await import("./Dispatcher.js");
const { open_task } = await import("./Agents.js");

const seen = [];
const servex = {
	log: { on(){}, tail: async () => [], append: async () => ({}) },
	agents: {
		live: new Map(), register(){},
		spawn(spec){
			assert.ok(spec.task?.dir, "the spawn carries a task option");
			const dir = open_task(spec.task, { session_id: "sess-test", agent: spec.name, model: spec.model });
			seen.push({ spec, dir });
			// the instant spawn returns: the dir and its line 1 are already there together
			assert.ok(fs.existsSync(path.join(dir, "task.jsonl")) || fs.existsSync(path.join(dir, "session.jsonl")), "the dir has its record");
			return { id: spec.name };
		},
	},
};
const d = new Dispatcher({ servex, id: "dispatcher-test" });
d.progress = () => {};
const slug = "t-zz-dispatcher-test-" + Date.now().toString(36);
await d.dispatch({ id: slug, brief: "do a thing" });

const { dir, spec } = seen[0];
try {
	const rel = path.relative(process.cwd(), dir).split(path.sep).join("/");
	const file = fs.existsSync(path.join(dir, "task.jsonl")) ? path.join(dir, "task.jsonl") : path.join(dir, "session.jsonl");
	const first = fs.readFileSync(file, "utf8").split("\n")[0];
	console.log("dir  :", rel); console.log("line1:", first);
	const a = JSON.parse(first).assign;
	assert.equal(a.agent, spec.name); assert.equal(a.session_id, "sess-test"); assert.ok(a.model);
	assert.match(spec.prompt, /already open at/);
	assert.ok(!/open your task folder with `new-task`/.test(spec.prompt));
	console.log("ok  the dispatcher's task dir is born with its first line");
} finally { if (!process.env.KEEP) fs.rmSync(dir, { recursive: true, force: true }); }
process.exit(0);

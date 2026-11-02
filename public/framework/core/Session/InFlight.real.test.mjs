// InFlight.pick over a copy of real lines: a session.jsonl with {task} refs to a running process, a running agent folder and a complete task.
import fs from "node:fs";
import Test from "../Test/Test.js";
import Task from "../Task/Task.js";
import Session from "./Session.js";
import InFlight from "./InFlight.js";

const read = f => fs.readFileSync(new URL("./fixtures/" + f, import.meta.url), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const refs = { "/p/process/": read("process.jsonl"), "/p/agent/": read("agent.jsonl"), "/p/done/": read("complete.jsonl") };
Task.resolver = ref => refs[ref] ?? null;

const t = new Test("InFlight: a session's {task} refs to real folders are picked by their state");
const s = Session.replay([{ session: { id: "real" } }, ...Object.keys(refs).map(task => ({ task }))]);
const p = InFlight.pick(s);
t.eq(p.inflight.length, 2, "the process and the agent folder are in flight");
t.eq(p.done, 1, "the complete one is counted done");
t.eq(InFlight.loading(s), 0, "nothing is still loading");

const stub = Session.replay([{ session: { id: "x" } }]); stub.tasks.add({ type: "Task", id: "l" }); stub._tasks.find("l").put("state", "loading");
t.eq(InFlight.loading(stub), 1, "a ref not yet read is counted as loading");
t.done();

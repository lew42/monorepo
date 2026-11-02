// Loading a legacy task log (no state verb) infers its state but writes nothing: Task.replay_end after Store.attach (the Item.open order).
import Test from "../Test/Test.js";
import Task from "./Task.js";
import Item from "../Item/Item.js";

const t = new Test("Task.replay_end: reading a legacy log appends 0 lines");
const Store = Task.Store, sent = [];
const store = new Store("/p/legacy/task.jsonl");
store.append = line => sent.push(line);   // what a Saver would send to disk
store.entries = [{ assign: { session_id: "s", agent: "a", slug: "legacy" } }, { log: "no state verb here" }];
const host = Item.class_for ? new Task({ id: "legacy" }) : new Task({ id: "legacy" });
store.attach(host);
host.replay_end();
t.eq(host.state, "running", "the open legacy log reads as running");
t.eq(sent.length, 0, "and nothing was written for it");
host.set({ title: "real change" });
t.ok(sent.length > 0, "a real change still saves");
t.done();

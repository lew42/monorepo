// Bug 2026-10-22: {tasks:{<id>:{start:{}}}} answered ok but did nothing (List.get never found members by id).
import Task from "./Task.js";
import Test from "../Test/Test.js";

const t = new Test("Task: a verb on a child by id changes only that child");
// A plain Task makes its list lazily, so get("tasks") finds nothing until it is read; the record classes expose it. Same here.
class Parent extends Task { get(k){ return k === "tasks" ? this.tasks : super.get(k); } }
const task = new Parent({ id: "parent" });
task.set({ tasks: { add: { type: "Task", id: "a", title: "a" } } });
task.set({ tasks: { add: { type: "Task", id: "b", title: "b" } } });
t.eq(task.tasks.items.length, 2, "two children added");
t.ok(task.tasks.get("a")?.id === "a", "List.get finds a member by id");
task.set({ tasks: { a: { start: {} } } });
t.eq(task.tasks.get("a")?.state, "running", "child a is running");
t.eq(task.tasks.get("b")?.state, "idle", "sibling b is untouched");
t.done();

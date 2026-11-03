// Bugs 2026-10-22: a fresh Task stored {tasks:{add}} as plain data (Item.get skipped the lazy `tasks` getter),
// and {tasks:{<id>:{start:{}}}} answered ok but did nothing (List.get never found members by id).
import Task from "./Task.js";
import Test from "../Test/Test.js";

const t = new Test("Task: children added by delta; a verb on a child by id changes only that child");
const task = new Task({ id: "parent" });
task.set({ tasks: { add: { type: "Task", id: "a", title: "a" } } });
task.set({ tasks: { add: { type: "Task", id: "b", title: "b" } } });
t.eq(task.tasks.items.length, 2, "two children added on a fresh Task");
t.ok(task.tasks.get("a")?.id === "a", "List.get finds a member by id");
task.set({ tasks: { a: { start: {} } } });
t.eq(task.tasks.get("a")?.state, "running", "child a is running");
t.eq(task.tasks.get("b")?.state, "idle", "sibling b is untouched");
t.done();

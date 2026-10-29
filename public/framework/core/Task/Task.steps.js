import Task from "./Task.js";

/* Task's core test as steps, in Item's step format (core/Item/Item.steps.js), run by core/Test/Steps.js: in node by
   Task.steps.test.mjs, in the browser by the test view (/framework/core/Test/view/?test=Task). Each click is a button
   the test view makes (not TaskView's own row buttons), calling the verb it names; the last step rebuilds the task
   from its lines.
   The clock is held still for the run (released by `t.cleanup` when the run ends or a step fails), so a replayed verb stamps the same times as the click did. */
const CLOCK = "2026-10-28T12:00:00.000Z";

export default [
	{
		title: "Create",
		code: `const fix = new Task({ id: "fix" })`,
		note: "A new task is idle, and making it writes nothing.",
		run: t => { Task.clock = CLOCK; t.cleanup(() => Task.clock = null); t.fix = new Task({ id: "fix" }); },
		check: t => t.fix.state === "idle" && t.lines.length === 0,
		show: t => t.fix,
	},
	{
		title: "Save",
		code: `store.attach(fix); fix.set({ title: "Fix the tab bar" })`,
		note: "From here on, every change is one line.",
		run: t => { t.store.attach(t.fix); t.fix.set({ title: "Fix the tab bar" }); },
		check: t => t.fix.get("title") === "Fix the tab bar" && t.lines.length === 1,
		show: t => t.fix,
	},
	{
		title: "Add two subtasks",
		code: `fix.tasks.add({ id: "css" })   // Add, twice`,
		note: "Each is one line under tasks. The task is now 0 of 2 done.",
		run: t => {
			t.click("Add: The CSS", () => t.fix.tasks.add({ id: "css", title: "The CSS" }));
			t.click("Add: The test", () => t.fix.tasks.add({ id: "test", title: "The test" }));
		},
		check: t => t.fix.progress().total === 2 && t.lines.length === 2,
		show: t => t.fix,
	},
	{
		title: "Start",
		code: `fix.act("start")   // Start`,
		note: "The button saves the verb, one line, and the subtasks start with it.",
		run: t => t.click("Start", () => t.fix.act("start")),
		check: t => t.fix.state === "running" && t.fix.tasks.find("css").state === "running" && JSON.stringify(t.lines) === `[{"start":{}}]`,
		show: t => t.fix,
	},
	{
		title: "Finish one",
		code: `css.act("complete")   // Done`,
		note: "1 of 2 done: the task keeps running while a subtask is open.",
		run: t => t.click("Done: The CSS", () => t.fix.tasks.find("css").act("complete", { auto: true })),
		check: t => t.fix.progress().done === 1 && t.fix.state === "running",
		show: t => t.fix,
	},
	{
		title: "Finish the last",
		code: `test.act("complete")   // Done`,
		note: "The last subtask done completes the task by itself.",
		run: t => t.click("Done: The test", () => t.fix.tasks.find("test").act("complete", { auto: true })),
		check: t => t.fix.state === "complete" && t.fix.progress().done === 2,
		show: t => t.fix,
	},
	{
		title: "Replay",
		code: `const copy = new Task({ id: "fix" }); lines.forEach(line => copy.set(line))`,
		note: "Rebuilt from the lines alone: the same task, the same view.",
		run: t => { t.copy = new Task({ id: "fix" }); t.store.lines.forEach(line => t.copy.set(line)); },
		check: t => t.copy.state === "complete" && t.same(t.fix, t.copy),
		show: t => t.copy,
	},
];

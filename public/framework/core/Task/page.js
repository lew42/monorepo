import { Doc, md, h2, code, div, span } from "/app.js";
import Task from "./Task.js";
import TaskView from "./TaskView.js";

export default new Doc({
	meta: import.meta,
	title: "Task",
	description: "A DOM-free unit of work — id, title, a state machine, a computed duration and progress, a List of subtasks.",
	icon: "checklist",

	subject: Task,
	properties: "state tasks",
	methods: "start pause resume stop complete approve improve reject settled duration progress",
	files: "Task.js Task.test.mjs readme.md page.js live/page.js process/page.js",

	initialize(){
		Doc.prototype.initialize.call(this);
		this.declare("live");
		this.declare("page");
		this.declare("process");
	},

	content(){

		code.js(`task.start()  task.pause()  task.resume()  task.stop(why)  task.complete({completion})
task.state       //  "idle" | "running" | "paused" | "stopped" | "complete"
task.duration()  //  ms of RUNNING time — pausing stops the clock
task.progress()  //  {done, total} — computed from task.tasks, never stored
task.tasks       //  a List of subtasks (core/List/)`);

		md("A **Task** is anything with a start, a middle and an end. It's an [Item](/framework/core/Item/) plus six states (`waiting` is the newest), timestamps, and a `tasks: List` of subtasks whose own finish **gates the parent's** — `complete()` refuses while any subtask isn't complete yet, and names the one that's blocking it. No throw: every illegal transition just warns and leaves the state alone.");

		h2("render() — the task drawn at three sizes");
		const demo = Task.replay([
			{ assign: { slug: "demo-task", title: "Build the task view", expected: "20 min", module: "core/Task", session_id: "3266250d", requested_at: "2026-10-16T09:00:00Z" } },
			{ commit: "a1b2c3d4e5f6" },
			{ start: {}, at: "2026-10-16T09:01:00Z" },
		]);
		div.c("flex v gap-50", () => {
			span("chip"); TaskView.chip(demo); span("row"); TaskView.row(demo); span("card"); TaskView.card(demo);
		});
		code.js(`task.render()  //  new Task.View({task}) — TaskView draws chip / row / card and redraws on change
Task.replay(lines)  //  the demo above: ${demo.state}, ${Math.round(demo.completion * 100)}% complete`);

		h2("The states");

		code.js(`idle → running → paused → running → stopped
                      ↘ complete  (only once every subtask is complete)`);

		md("`duration()` counts RUNNING time only — pausing stops the clock, so time spent paused is never duration. `progress()` is always computed from `task.tasks`' own states, never stored (CLAUDE.md law 7).");

		md("Try it, live: [**start, pause and finish a real task with subtasks**](/framework/core/Task/live/) — including trying to finish it too early, and seeing the refusal happen.");

		md.details(import.meta, "readme.md", "Readme");
	}
});

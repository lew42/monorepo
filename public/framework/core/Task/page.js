import { Doc, md, h2, code, div, span } from "/app.js";
import Task from "./Task.js";

export default new Doc({
	meta: import.meta,
	title: "Task",
	description: "A DOM-free unit of work — id, title, a state machine, a computed duration and progress, a List of subtasks.",
	icon: "checklist",

	subject: Task,
	properties: "state tasks",
	methods: "start pause resume stop finish duration progress",
	files: "Task.js Task.test.mjs readme.md page.js live/page.js",

	initialize(){
		Doc.prototype.initialize.call(this);
		this.declare("live");
	},

	content(){

		code.js(`task.start()  task.pause()  task.resume()  task.stop(why)  task.finish({complete})
task.state       //  "idle" | "running" | "paused" | "stopped" | "finished"
task.duration()  //  ms of RUNNING time — pausing stops the clock
task.progress()  //  {done, total} — computed from task.tasks, never stored
task.tasks       //  a List of subtasks (core/List/)`);

		md("A **Task** is anything with a start, a middle and an end. It's an [Item](/framework/core/Item/) plus five states, timestamps, and a `tasks: List` of subtasks whose own finish **gates the parent's** — `finish()` refuses while any subtask isn't finished yet, and names the one that's blocking it. No throw: every illegal transition just warns and leaves the state alone.");

		h2("The states");

		code.js(`idle → running → paused → running → stopped
                      ↘ finished  (only once every subtask is finished)`);

		md("`duration()` counts RUNNING time only — pausing stops the clock, so time spent paused is never duration. `progress()` is always computed from `task.tasks`' own states, never stored (CLAUDE.md law 7).");

		md("Try it, live: [**start, pause and finish a real task with subtasks**](/framework/core/Task/live/) — including trying to finish it too early, and seeing the refusal happen.");

		md.details(import.meta, "readme.md", "Readme");
	}
});

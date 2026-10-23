import { Page, div, a, span, small, icon } from "/app.js";
import Task from "./Task.js";
import "./TaskView.js";   // sets Task.View (and loads TaskView.css, which styles the groups too)

/* The page for a tasks/ DIRECTORY: every task beneath it as TaskView.row, grouped by module, ranked by Task.rank.
 * Page.child mounts it on any `tasks/` with no page of its own; /tasks/ is the index of every task home (Server/TaskHomes.mjs). doc: readme.md */
export class TasksPage extends Page {
	static LOAD_MS = 30000;   // how long the page waits for every task file before it shows an error
	static SHOW = 5;   // open rows a module group shows before "+ N more open" (a module can hold dozens of idle tasks)
	static open(t){ return t.state !== "complete" && t.state !== "stopped"; }
	static is_list(t){ return /\/tasks\/$/.test(t.data.path ?? ""); }
	static module_of(list){ return String(list.data.path ?? "").replace(/^\/framework\//, "").replace(/\/?tasks\/$/, "") || "/"; }

	// The list Task in <url>task.jsonl, opened ONCE per file (every view of it shares the Store); null when there is none.
	static list(url){
		const store = Task.Store.for(url + "task.jsonl");
		return store.tasks_page ??= store.host ? Promise.resolve(store.host)
			: store.open().catch(() => {}).then(() => store.host ?? (store.count ? store.attach(Task.replay_new(store.entries)).host : null));
	}

	// [{list, module, tasks}]: an index whose children are lists (/tasks/) gives one group per list; a module's tasks/ gives one.
	static async groups(url){
		const root = await this.list(url);
		if (!root) return [];
		const kids = [...root.tasks];
		await Promise.all(kids.map(k => k.ready));
		const lists = kids.some(k => this.is_list(k)) ? kids.filter(k => this.is_list(k)) : [root];
		await Promise.all(lists.flatMap(l => [...l.tasks].map(k => k.ready)));
		await Promise.all(lists.flatMap(l => [...l.tasks].flatMap(k => [...(k._tasks ?? [])].map(g => g.ready))));   // each row's bar
		return lists.map(list => ({ list, module: this.module_of(list), tasks: Task.rank([...list.tasks]) }));
	}

	static async counts(url = "/tasks/"){
		const tasks = (await this.groups(url)).flatMap(g => g.tasks);
		return { open: tasks.filter(t => this.open(t)).length, running: tasks.filter(t => t.state === "running").length };
	}

	render_content(){ return this.constructor.into(div().ac("wide"), this.url); }   // .wide: out of the 40em reading column, so the CSS columns have room

	// Fill `box` with the groups under `url` (a tasks/ folder). The one drawing: this page, and the Tasks tab of every Doc (ext/Doc).
	static into(box, url){
		box.ac("tasks-page").empty(() => div.c("muted", "Loading tasks…"));
		// A load that throws, or never settles (a child file that never answers), says so after LOAD_MS instead of reading "Loading" for good.
		let timer; const late = new Promise((_, no) => timer = setTimeout(() => no(new Error("no answer from " + url + " after " + this.LOAD_MS / 1000 + " s")), this.LOAD_MS));
		Promise.race([this.groups(url), late]).finally(() => clearTimeout(timer)).then(groups => box.empty(() => this.draw(groups)))
			.catch(e => box.empty(() => div.c("muted", "Could not read tasks: " + e.message)));
		return box;
	}

	static draw(groups){
		if (!groups.some(g => g.tasks.length)) return void div.c("muted", "No tasks yet");
		// Open tasks first; finished ones fold under "+ N done" (the migration filled /tasks/ with 211 mostly-finished tasks).
		for (const { module, tasks } of groups) if (tasks.length){
			const open = tasks.filter(t => this.open(t)), done = tasks.filter(t => !this.open(t));
			const $group = div.c("tasks-group"), fill = all => $group.empty(() => {
				a.c("tasks-group-head", () => { icon("folder"); span(module); }).href(module === "/" ? "/" : `/framework/${module}/`);
				const shown = all ? open : open.slice(0, this.SHOW), rest = open.length - shown.length;
				shown.forEach(t => Task.View.row(t));
				if (all) done.forEach(t => Task.View.row(t));
				else if (rest || done.length) small.c("task-row-more", [rest && `+ ${rest} more open`, done.length && `+ ${done.length} done`].filter(Boolean).join(" · ")).click(() => fill(true));
			});
			fill(false);
		}
	}
}

export default TasksPage;

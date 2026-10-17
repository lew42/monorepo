import { div, span, a, icon } from "/app.js";
import Task from "/framework/core/Task/Task.js";
import "/framework/core/Task/TaskView.js";

/* The "Tasks" card: the open goal tasks of every module list, ranked, each wrapped in its module (icon + title link).
 * A Live card {type:"part-live", live:"tasks"} draws this (Live.js). Step 3c replaces MODULES with the node-built index. */
export default class LiveTasks {
	static MODULES = [
		{ path: "core/Task", title: "core/Task", icon: "task_alt" },
		{ path: "servex", title: "servex", icon: "dns" },
		{ path: "audio/Voice", title: "audio/Voice", icon: "mic" },
		{ path: "ai", title: "ai", icon: "smart_toy" },
		{ path: "ext/Refine", title: "ext/Refine", icon: "auto_fix_high" },
	];

	// Each module's goal tasks (its list's children), read through the shared Store, open ones only.
	static async load(){
		const lists = await Promise.all(this.MODULES.map(async mod => {
			const store = Task.Store.for(`/framework/${mod.path}/tasks/task.jsonl`);
			if (!store.host){ await store.open().catch(() => {}); if (store.count) store.attach(Task.replay_new(store.entries)); }
			const kids = store.host ? [...store.host.tasks] : [];
			await Promise.all(kids.map(k => k.ready));
			await Promise.all(kids.flatMap(k => [...(k._tasks ?? [])].map(g => g.ready)));   // the steps under each goal
			return kids.map(task => ({ mod, task }));
		}));
		const rows = lists.flat().filter(r => r.task.state !== "complete");
		const order = Task.rank(rows.map(r => r.task));
		return order.map(t => rows.find(r => r.task === t));
	}

	static draw(rows){
		div.c("live-tasks", () => {
			if (!rows.length) return void span.c("muted", "No open goals.");
			rows.forEach(({ mod, task }) => div.c("live-task", () => {
				a.c("live-task-mod", () => { icon(mod.icon); span(mod.title); }).href(`/framework/${mod.path}/`);
				Task.View.row(task);
			}));
		});
	}

	static into(box){
		return this.load().then(rows => box.empty(() => this.draw(rows)))
			.catch(e => box.empty(() => span("Could not read tasks: " + e.message)));
	}
}

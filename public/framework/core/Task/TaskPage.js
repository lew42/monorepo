import { Page, div } from "/app.js";
import Task from "./Task.js";
import "./TaskView.js";   // sets Task.View
import { is_record_folder, names } from "../Router/listing.js";

/* The thin route for a task folder: opens its session.jsonl or task.jsonl and shows Task.View full-size. No task logic here. doc: readme.md */
export class TaskPage extends Page {
	// A step folder inside a task page (session.jsonl or task.jsonl, no page.js of its own) opens as a TaskPage too; AITask.route has the same rule.
	route(sub){
		if (sub.includes(".")) return;
		const url = this.url + sub + "/";
		if (!is_record_folder(url)) return;
		return new TaskPage({ title: sub, icon: "receipt_long", url });
	}

	async load_task(){
		const has = async n => (await fetch(this.url + n, { method: "HEAD" }).catch(() => null))?.ok;   // a spawned agent's folder holds session.jsonl, a task's task.jsonl
		// The folder's listing says which one it keeps, so no page asks for a file that is not there (the merge smoke test fails on any 404).
		// Off the dev server there is no listing: ask for the likely file first. A folder at <module>/tasks/<slug>/ is a task
		// (1753 of them; 6 sessions sit there), anything else is most often a session.
		const listed = names(this.url);
		const [a, b] = listed ? (listed.includes("session.jsonl") ? ["session.jsonl"] : ["task.jsonl"])
			: /\/tasks\/[^/]+\/$/.test(this.url) ? ["task.jsonl", "session.jsonl"] : ["session.jsonl", "task.jsonl"];
		const store = Task.Store.for(this.url + (!b || await has(a) ? a : b));
		await store.open();
		if (!store.host) store.attach(Task.replay_new(store.entries));   // attach replays the held entries
		return this.task = store.host;
	}

	render_content(){
		const box = div.c("task-page");
		this.load_task().then(task => box.empty(() => task.render()));
		return box;
	}
}

export default TaskPage;

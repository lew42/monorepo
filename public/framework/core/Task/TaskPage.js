import { Page, div } from "/app.js";
import Task from "./Task.js";
import "./TaskView.js";   // sets Task.View

/* The thin route for a task folder: opens its task.jsonl and shows Task.View full-size. No task logic here. doc: readme.md */
export class TaskPage extends Page {
	async load_task(){
		const store = Task.Store.for(this.url + "task.jsonl");
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

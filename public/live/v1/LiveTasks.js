import { a, span } from "/app.js";
import TasksPage from "/framework/core/Task/TasksPage.js";

/* The "Tasks" card: one line, "Tasks · N open · M running", linking to /tasks/ (TasksPage holds the rows; one of everything).
 * A Live card {type:"part-live", live:"tasks"} draws this (Live.js): line() is its preview, into() its full view. */
export default class LiveTasks {
	static URL = "/tasks/";

	static line(box){
		return TasksPage.counts(this.URL)
			.then(({ open, running }) => box.empty(() => a.c("live-tasks-line", `Tasks · ${open} open · ${running} running`).href(this.URL)))
			.catch(e => box.empty(() => span("Could not read tasks: " + e.message)));
	}

	static into(box){ return this.line(box); }
}

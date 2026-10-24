import { Page } from "/app.js";
import TaskQueueView from "./TaskQueueView.js";

export default new Page({
	meta: import.meta,
	title: "Task queue",
	description: "Every accepted task, ranked: what it is, why, its estimated cost and its priority. Computed from the task records, live.",
	icon: "list",
	classes: "tq-page",
	content(){ new TaskQueueView(); },
});

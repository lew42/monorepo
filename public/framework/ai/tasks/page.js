import { Page, div, md } from "/app.js";
import SavedFilter from "./SavedFilter.js";
import TaskLanes from "./TaskLanes.js";
import { AITask } from "/framework/ai/AITask/AITask.js";

// The list is the Inbox with the `tasks` chips (SavedFilter forwards there); Lanes and Architecture stay here. Doc: doc/architecture.md
export default new SavedFilter({
	meta: import.meta,
	title: "Tasks",
	icon: "task_alt",
	description: "What is in flight, queued and landed today: the Inbox with its Tasks chips on.",
	classes: "full fill",
	leaf: true,
	preset: "tasks",

	route(id){
		if (id === "lanes") return new Page({ title: "Lanes", url: this.url + "lanes/", classes: "inbox-takeover inbox-tab",
			content(){ TaskLanes.tabs(this.url.replace(/lanes\/$/, ""), "lanes"); new TaskLanes({ page: this, base: this.url.replace(/lanes\/$/, "") }).mount(); } });
		if (id === "architecture") return new Page({ title: "Architecture", url: this.url + "architecture/", classes: "inbox-takeover inbox-tab",
			content(){ TaskLanes.tabs(this.url.replace(/architecture\/$/, ""), "architecture"); div.c("flow").append(md.file({ url: import.meta.url }, "doc/architecture.md")); div.c("flow").append(md.file({ url: import.meta.url }, "readme.md", { h1: false })); } });
		if (/^\d{4}~/.test(id)) return new AITask({ title: id.split("~").at(-1), icon: "receipt_long", url: this.url + id + "/",
			src: "/framework/ai/sessions/" + id.replaceAll("~", "/") + "/session.json" });
	},
});

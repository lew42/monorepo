import { Page, div, h1, a, md } from "/app.js";
import TasksPage from "./TasksPage.js";
import TaskLanes from "./TaskLanes.js";
import { AITask } from "/framework/ai/AITask/AITask.js";

const bar = (url, here) => div.c("inbox-head", () => {
	div.c("doc-well", () => h1.c("doc-title h2", "Tasks"));
	div.c("tabs block", () => div.c("tab-bar", () => {
		a.c("tab tab-default").href(url).text("List");
		a.c("tab").href(url + "lanes/").text("Lanes");
		a.c("tab").href(url + "architecture/").text("Architecture");
	}));
});

export default new Page({
	meta: import.meta,
	title: "Tasks",
	icon: "task_alt",
	description: "What is in flight, queued and landed today, from the real state, live.",
	classes: "full fill",
	leaf: true,

	content(){
		bar(this.url);
		this.browse = new TasksPage({ page: this }).mount();
	},

	route(id){
		if (id === "lanes") return new Page({ title: "Lanes", url: this.url + "lanes/", classes: "inbox-takeover inbox-tab",
			content(){ new TaskLanes({ page: this, base: this.url.replace(/lanes\/$/, "") }).mount(); } });
		if (id === "architecture") return new Page({ title: "Architecture", url: this.url + "architecture/", classes: "inbox-takeover inbox-tab",
			content(){ div.c("flow").append(md.file({ url: import.meta.url }, "doc/architecture.md")); div.c("flow").append(md.file({ url: import.meta.url }, "readme.md", { h1: false })); } });
		if (/^\d{4}~/.test(id)) return new AITask({ title: id.split("~").at(-1), icon: "receipt_long", url: this.url + id + "/",
			src: "/framework/ai/sessions/" + id.replaceAll("~", "/") + "/session.json" });
	},
});

import { Page, AITask } from "/app.js";
import { dashboard, glance } from "/framework/ext/AITask/dashboard.js";

export default new Page({
	meta: import.meta,
	title: "2026-08-16",
	icon: "history",
	// No task dir is declared. A declared child renders its own page.js instead of
	// the log, which freezes at the moment it was written — so every task here
	// falls through to route() below and renders live from its task.jsonl.

	route(name){
		if (!name.includes(".")) return new AITask({
			title: name, icon: "receipt_long",
			url: this.url + name + "/", src: this.url + name + "/session.json",
		});
	},

	preview(nav){ return this.preview_card(nav, () => glance(this)); },

	content(){ dashboard(this); },
});

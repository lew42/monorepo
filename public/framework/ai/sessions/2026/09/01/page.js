import { Page, AITask } from "/app.js";
import { dashboard, glance, has_page_js, warm } from "/framework/ext/AITask/dashboard.js";

// Fired at module eval so a cold deep link has a warm cache before route() asks.
warm("2026-09-01");

export default new Page({
	meta: import.meta,
	title: "2026-09-01",
	icon: "history",

	// No `children:` — a task dir with its own page.js is found by NOT being
	// claimed here; everything else renders live from its task.jsonl.
	route(name){
		if (name.includes(".") || has_page_js(this.name, name)) return;
		return new AITask({
			title: name, icon: "receipt_long",
			url: this.url + name + "/", src: this.url + name + "/session.json",
		});
	},

	preview(nav){ return this.preview_card(nav, () => glance(this)); },

	content(){ dashboard(this); },
});

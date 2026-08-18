import { Page, md, AITask } from "/app.js";
import { dashboard, glance, has_page_js, warm } from "/framework/ext/AITask/dashboard.js";

// Fired at MODULE EVAL time — this file is imported as part of ai/page.js's
// own declared-children auto-import, well before Router walks to a task
// segment below, so a cold deep link (VS Code Simple Browser, no prior
// dashboard() render) still has a warm cache by the time route() asks.
warm("2026-08-17");

export default new Page({
	meta: import.meta,
	title: "2026-08-17",
	description: "Thirty tasks, two walls rebuilt, and an instrument that finally measures what it claims — read the report first.",
	icon: "history",

	// No `children:` — a task dir with its own page.js (report/, vision-browse/)
	// is found by NOT being claimed below; Page.load()'s filesystem probe does
	// the dynamic import. Nothing here ever needs declaring (ai-board-fix #8).
	route(name){
		if (name.includes(".") || has_page_js(this.name, name)) return;
		return new AITask({
			title: name, icon: "receipt_long",
			url: this.url + name + "/", src: this.url + name + "/session.json",
		});
	},

	preview(nav){ return this.preview_card(nav, () => glance(this)); },

	// One line, one link. It was three lines of prose promising "the five that need
	// Mike" — which `ux-v1` then hunted for in the rows below and could not find, at
	// all three widths. The promise belongs on the page that keeps it.
	content(){
		md("**[Today, ranked →](/framework/ai/2026-08-17/report/)** the five that need Mike, with the screenshots.");

		dashboard(this);
	},
});

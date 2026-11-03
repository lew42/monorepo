import { Page, md, AITask } from "/app.js";
import { dashboard, glance } from "/framework/ext/AITask/dashboard.js";

export default new Page({
	meta: import.meta,
	title: "2026-08-15",
	description: "An overnight layout campaign — census, direction, two builds, forensics — curated into one report, alongside the day's wider push.",
	icon: "history",
	// Task dirs stay undeclared unless they hold their own page.js: a declared
	// child skips route() and 404s on the page.js probe. The dashboard
	// enumerates them from directory.json either way.
	children: "layout-overnight",

	// An undeclared task dir still gets a page: the manifest viewer, pointed at it.
	route(name){
		if (!name.includes(".")) return new AITask({
			title: name, icon: "receipt_long",
			url: this.url + name + "/", src: this.url + name + "/session.json",
		});
	},

	// My tile on /framework/ai/: preview_card()'s `thumb` slot, live.
	preview(nav){ return this.preview_card(nav, () => glance(this)); },

	content(){
		dashboard(this);

		md(`**Five minions ran an overnight layout campaign — census, direction, two
builds, and a forensics pass — while the day's wider work kept going in parallel.**

- **[layout-overnight](/framework/ai/2026-08-15/layout-overnight/)** — a
  width-based layout library, 400px-first: two shipped previews, three
  findings, seven items parked for Mike. ~794k subagent tokens, session
  window held green all night.
- Elsewhere: the doc system, a mastermind wake-up loop, the Panel UI
  overhaul, and the day's usual mix of fixes and reviews — each its own
  task on the dashboard below.`);
	},
});

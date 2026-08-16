import { Page, md, AITask } from "/app.js";
import { dashboard, rail, effort_board } from "/framework/ext/AITask/dashboard.js";

export default new Page({
	meta: import.meta,
	title: "AI",
	description: "One page per working day — what the sessions changed, decided, and queued.",
	icon: "smart_toy",

	// One nav link, whatever the date children say: the rail below is the way in.
	leaf: true,
	children: "2026-08-15 2026-08-14 2026-08-13 2026-08-12 2026-08-11 2026-08-10 2026-08-09 2026-08-08",

	// The board IS the dashboard — catalog's previews() override, split-screen for free.
	initialize(){ this.catalog(); },
	previews(){ return rail(this); },

	// A day that hasn't written its page yet is still a dashboard — and its
	// task dirs still get the manifest viewer, same as a declared day's route().
	// ⚠ A plain Page sets no `$pages`, so a routed task walks up to MY catalog
	// region and lands beside its day rather than inside it — which is why
	// ai.css stands the day aside while one of its tasks is showing.
	//
	// `effort/` is the second segment a category tag can claim, and it earns the
	// nesting: a bare slug here is indistinguishable from a typo, and would turn
	// every miss under /framework/ai/ into a blank filter.
	route(name){
		if (/^\d{4}-\d{2}-\d{2}$/.test(name)) return new Page({
			title: name, icon: "history", url: this.url + name + "/",
			content(){ dashboard(this); },
			route(task){
				if (!task.includes(".")) return new AITask({
					title: task, icon: "receipt_long",
					url: this.url + task + "/", src: this.url + task + "/session.json",
				});
			},
		});

		if (name === "effort") return new Page({
			title: "Efforts", icon: "label", url: this.url + "effort/",
			content(){ md("An **effort** is the thread of work that outlives any one day. Every card wears its own as a tag — click one to see the board filtered to it."); },
			route(slug){ return new Page({
				title: slug.replaceAll("-", " "), icon: "label", url: this.url + slug + "/",
				content(){ return effort_board(this, this.name); },
			}); },
		});
	},
});

import { Page, md, AITask } from "/app.js";
import { dashboard, rail, effort_board, has_page_js, warm } from "/framework/ext/AITask/dashboard.js";

export default new Page({
	meta: import.meta,
	title: "AI",
	description: "One page per working day — what the sessions changed, decided, and queued.",
	icon: "smart_toy",

	// One nav link, whatever the date children say: the rail below is the way in.
	leaf: true,
	children: "2026-08-18 2026-08-17 2026-08-16 2026-08-15 2026-08-14 2026-08-13 2026-08-12 2026-08-11 2026-08-10 2026-08-09 2026-08-08",

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
		if (/^\d{4}-\d{2}-\d{2}$/.test(name)){
			// Fired the instant this day is routed to, not when its dashboard()
			// happens to render — a cold deep link straight to a task below has
			// no earlier chance, and every other child() hop still ahead (this
			// day Page's own construction, the task segment's child() call) gives
			// the fetch time to land before route(task) below ever asks.
			warm(name);
			return new Page({
				title: name, icon: "history", url: this.url + name + "/",
				content(){ dashboard(this); },
				// A task dir with its own page.js wins by NOT being claimed here —
				// Page.child()'s own filesystem probe (Page.load()) then dynamic-imports
				// it. `has_page_js` is undefined until the day's own dashboard() has
				// warmed the listing; undefined reads as "don't know", same as false.
				route(task){
					if (task.includes(".") || has_page_js(name, task)) return;
					return new AITask({
						title: task, icon: "receipt_long",
						url: this.url + task + "/", src: this.url + task + "/session.json",
					});
				},
			});
		}

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

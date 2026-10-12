import { Page, AITask } from "/app.js";
import { dashboard, glance, has_page_js, warm } from "/framework/ext/AITask/dashboard.js";

// Fired at module eval so a cold deep link has a warm cache before route() asks.
warm("2026-09-22");

export default new Page({
	meta: import.meta,
	title: "2026-09-22",
	icon: "history",

	// ⚠ ONLY task dirs that have their own `page.js` are named here. Everything else
	//   is left undeclared so `route()` below builds it live from its task.jsonl —
	//   a declared name skips route(), which is exactly what a page.js dir wants and
	//   exactly what a log-only dir must not have.
	children: "talk inbox-model ai2-master-detail servex-integrate review-3-days log-model prompt-lifecycle whisper-servex dictate-silence worktree-design tiers-design reuse-audit worktree-proof sub-mastermind-live skills-shrink-2 object-layer layout-analysis record card-to-task system-retro padding-law",

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

import { Page, p } from "/app.js";

/* A disposable page, linked from nowhere but this task's own page.js, used to
   prove Server/health.mjs actually catches a broken page. Safe to ignore —
   see /framework/ai/2026-09-21/safe-rollout/ for the story. */
export default new Page({
	meta: import.meta,
	title: "scratch: watcher proof",
	content(){
		p("A disposable page used to prove the page-health watcher (Server/health.mjs) catches a real break, without ever touching a page the owner is looking at. If you're reading this, it's currently in its clean state.");
	},
});

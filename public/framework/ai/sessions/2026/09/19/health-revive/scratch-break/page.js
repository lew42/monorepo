import { Page, p } from "/app.js";

/* A throwaway page, owned entirely by the health-revive task, whose only job
 * is to be broken on purpose and fixed again — the safe way to prove
 * Server/health.mjs actually notices a real break, without touching any page
 * the owner uses. See ../page.js for the write-up of what happened here. */
export default new Page({
	meta: import.meta,
	title: "Scratch — health proof",
	description: "A disposable page used only to prove the health watcher catches a real break.",
	content(){ p("This page is working normally right now."); },
});

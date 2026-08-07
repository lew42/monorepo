import { Page, p } from "/app.js";

/* A genuinely slow module. Page.load() does `await import(url + "page.js")`, and
 * a top-level await delays the module's completion exactly as a slow network
 * would — this is not a simulation of the wait, it IS the wait.
 *
 * Once. The module registry caches it, so a second visit is instant, which is
 * also the honest shape of the problem: the dead time is a first-visit cost, and
 * a lazy site pays it on every page a reader has not seen yet. */
await new Promise(done => setTimeout(done, 700));

export default new Page({
	meta: import.meta,
	title: "Arrived after 700ms",
	classes: "motion",

	content(){
		p("This module held `Router.load()` for 700 milliseconds. With the head start installed, the page you left spent those 700ms leaving. Without it, the app was frozen and then jumped.").ac("note");
		this.parent.link("↑ back");
	},
});

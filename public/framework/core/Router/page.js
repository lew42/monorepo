import { Router, classdoc, md, code, h2, a, div, demo, toc } from "/app.js";

export default classdoc.page({
	meta: import.meta,
	title: "Router",
	description: "Everything between a url changing and the DOM reflecting it.",
	icon: "alt_route",

	Class: Router,

	properties: "active app",

	methods: "go load load_segments activate mark mark_links " +
	         "click link_clicked listen chain shared_depth root assign",

	notes: "constructor registry-gate chain-diff marking styles-loaded " +
	       "navigated scroll-reset fragment backed-out measured",

	content(){

		toc();

		code.html(`<a href="/docs/intro/">Intro</a>`);

		md("That is the whole API. No reload, nothing to register, no route table. A link the Router can't resolve is handed back to the browser, so an external url or a `.pdf` still behaves like a link.");

		h2("A url is a path through the tree");

		code.js(`/docs/intro/  →  root › docs › intro`);

		md("One `page.child(name)` per segment, and a miss is an `import`. When the walk finishes, every page in the chain exists — **the walk is the loader.** Going somewhere else touches only the difference between the two chains, so a sidebar an ancestor built is never rebuilt.");

		h2("It writes four classes, and CSS does the rest");

		code.css(`.page.active-page      /* the leaf */
.page.active-ancestor  /* everything above it */

a.active               /* href is exactly here */
a.in-path              /* href is a directory above here */`);

		demo(() => {
			div.c("flex gap v-center", () => {
				a.c("page-link", "/framework/").href("/framework/");
				a.c("page-link", "/framework/core/").href("/framework/core/");
				a.c("page-link", "/framework/core/Router/").href("/framework/core/Router/");
				a.c("page-link", "/elsewhere/").href("/elsewhere/");
			});
		}, "Four real anchors, rendered by this page. The last one is dark; the other three lit themselves up — two `.in-path`, one `.active`. **No view compares `window.location` itself**: one pass after every navigation writes the classes, and CSS decides what each kind of link does with them.");

		md("Those four classes are everything this tier writes to the DOM. Every arrangement on this site — replace, tabs, columns, a topic with its own sidebar — is CSS reading them plus one class a page opted into. There is no layout tier to learn.");

		md("Next: [App](/framework/core/App/) — what boots all of this.");

		md.details(import.meta, "readme.md", "Design record — the walk, the chain diff, and what was backed out");
	}
});

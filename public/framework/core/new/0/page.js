import { Doc, md, code } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "new/0",
	description: "The Router-less MVP: two classes, 149 lines, that lock App↔Page and three CSS-driven UI modes before any routing exists.",
	icon: "looks_one",

	files: "App.js Page.class.js server.js readme.md",

	content(){

		code.js(`.page             { display: none; }        /* not in the chain */
.page.active-page { display: block; }        /* 1 · replace, the default */
[data-mode="columns"] .page.active-ancestor { display: block; }  /* 2 */
[data-mode="full"] .sidebar { display: none; }                   /* 3 */`);

		md("Every page's view is a direct child of `app.$pages`, at **every** depth — no per-page `$pages`, so an arrangement is a rule about siblings, and `App.mark()` writing two classes plus one `data-mode` attribute is the entire mechanism. There is no Router: `App` walks `location.pathname` through an in-memory tree because every child is a direct `import`, so the whole site is already loaded by the time a url resolves.");

		md("Three council seats (`agents/steve/`, `agents/eric/`, `agents/tim/`) proposed this independently; where they disagreed, the readme keeps the dissent next to the verdict — including the one nobody caught until review: the capture container was `$app`, not `$pages`, so every `render()` briefly stranded a page beside the sidebar.");

		md("What's deliberately absent, because the next tier adds it: `deactivate()` and a chain diff, lazy imports, `link()` as a real navigation only, and any history — `activate()` doesn't touch the url. Next: [new/starter](/framework/core/new/starter/), which adds the Router and hits the wall this design set up.");

		md.details(import.meta, "readme.md", "The council's decisions, what review caught, and what the Router changes");
	}
});

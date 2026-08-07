import { Router, classdoc, md, code, h2, toc } from "/app.js";

export default classdoc.page({
	meta: import.meta,
	title: "Router",
	description: "Everything between a url changing and the DOM reflecting it.",
	icon: "alt_route",

	Class: Router,
	methods: "go link_clicked load_segments activate mark mark_links",

	// The design record, served: each name is a ./doc/<name>.md the readme cites.
	notes: "registry-gate chain-diff marking styles-loaded navigated scroll-reset backed-out measured",

	content(){

		toc();

		code.html(`<a href="/docs/intro/">Intro</a>`);

		md("That is the whole API. The Router upgrades the click — no reload, no configuration, nothing to register. A link it can't resolve is handed to the browser, so an external url or a `.pdf` still behaves like a link.");

		h2("What a navigation does");

		code.js(`/docs/intro/  →  root › docs › intro`);

		md("One `page.child(name)` per segment, and a miss is an `import`. So when the walk finishes, every page in the chain exists — that's why nothing needs a route table: **the walk is the loader**.");

		h2("Only what changed");

		md("Going from `/a/b/c/` to `/a/x/` leaves `root` and `a` alone. `activate()` diffs the two chains and touches the difference: deactivate deepest-first, activate shallowest-first.");

		h2("Two classes, and CSS does the rest");

		code.css(`.page.active-page      /* the leaf */
.page.active-ancestor  /* everything above it */`);

		md("That's all this tier writes. Every arrangement on this site — replace, tabs, columns, a topic with its own sidebar — is CSS reading those two classes plus one a page opted into. There is no layout tier to learn.");

		h2("Links light themselves up");

		code.css(`a.active    /* href is exactly here */
a.in-path   /* href is a directory above here */`);

		md("Applied to every in-app anchor after each navigation. **No view should ever compare `window.location` itself** — sidebars, tab bars and preview cards all get their state from this one pass, and CSS decides what each kind of link does with it.");

		md("Next: [App](/framework/core/App/) — what boots all of this.");

		md.details(import.meta, "readme.md", "Design record — the walk, the chain diff, and what was backed out");
	}
});

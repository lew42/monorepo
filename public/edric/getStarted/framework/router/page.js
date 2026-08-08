import { Page, h2, md, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Router",
	description: "Everything between a url changing and the DOM reflecting it.",

	content(){
		code.js(`/docs/intro/  →  root › docs › intro`).ac("mb");
		md("The Router upgrades every same-origin link click: no reload, nothing to register. A link it can't resolve (an external url, a `.pdf`) is handed straight to the browser.").ac("mb");

		h2("What a navigation does").ac("mb");
		md("One `page.child(name)` per url segment, and a miss is an `import`. So when the walk finishes, every page in the chain exists, that's why there's no route table to maintain: the walk **is** the loader.").ac("mb");

		h2("Only what changed").ac("mb");
		md("Going from `/a/b/c/` to `/a/x/` leaves `a` and its ancestors alone. `activate()` diffs the two chains and touches only the difference: deactivate deepest-first, activate shallowest-first.").ac("mb");

		h2("Two classes, and CSS does the rest").ac("mb");
		code.css(`.page.active-page      /* the leaf */
.page.active-ancestor  /* everything above it */`).ac("mb");
		md("Every arrangement on this site, replace, tabs, columns, a topic with its own sidebar, is CSS reading those two classes plus one a page opted into.").ac("mb");

		h2("Links light themselves up").ac("mb");
		code.css(`a.active    /* href is exactly here */
a.in-path   /* href is a directory above here */`).ac("mb");
		md("Applied to every in-app anchor after each navigation. No view should ever compare `window.location` itself, sidebars, tab bars and preview cards all get their state from this one pass.").ac("mb");

		md("Next: [Page](/edric/getStarted/framework/page/), a node: a url, some content, and children.");
	}
});
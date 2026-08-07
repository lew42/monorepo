import { Page, md, demo } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "The registry gate",
	description: "What I meant by \"a swap, not a deletion\" — and why it's the worst UX seam on the site.",

	content(){

		md("This one wasn't clear the first time, so: **`Page.registry` isn't complexity you can delete. It's a design choice you can trade.**");

		md("### What it does today");

		demo(() => {
			// Router.intercept — the last guard before upgrading a click
			//   if (!Page.registry.has(url.pathname)) return;   // → full page load
		}, "The Router refuses to intercept a link unless that page is **already loaded**. It's a synchronous lookup, so checking costs nothing and can't trigger an import.");

		md("Why: you should never `pushState` to a URL you can't redraw. If you do, Back lands on a blank app. The gate makes that impossible.");

		md("### What it costs");

		md("Navigation inside a topic is instant. **Every exit is a full reload.** `/framework/core/View/` → `/michael/` reloads. So does the sidebar's Home link, and every link in the top nav. The framework's headline feature switches off exactly when a reader starts exploring.");

		md("### The trade");

		md(`| | registry gate (today) | optimistic (arya / alex) |
|---|---|---|
| in-topic nav | instant | instant |
| **cross-topic nav** | **full reload** | instant |
| non-page url | correct immediately | correct after a failed import |
| Back/Forward | safe by construction | safe — you only pushState what loaded |
| races | impossible (sync) | need a token counter |
| \`Page.registry\` | required | **deleted** |`);

		md("Arya and Alex both `await import()` on click and handle the failure. That's *more* capability for comparable code — which is why I called it a swap: you don't remove a concept, you replace a sync gate with an async one plus a fallback.");

		demo(() => {
			// go(url) — the optimistic version
			//   if (url !== location.pathname) history.pushState({}, "", url);
			//   if (await this.app.load_page(url) === false)
			//       window.location.href = url;    // not a page — let the browser have it
		}, "`load_page` returns `false` instead of rendering its error view when the import fails *and* there's a previous page to fall back from. Four lines.");

		md("### Verdict");

		md("**Do it — highest user-visible value of anything on these pages.** It deletes `Page.registry`, removes the worst seam on the site, and the invariant survives in outcome (you just discover the failure after the import instead of before).");

		md("Add the token counter Arya and Alex both have. Two fast clicks start two imports and they can finish in either order; ours has no async gap today, so this is a new failure mode that arrives with the change.");

		md("This is **independent** of [top-down loading](./top-down) — either can land first.");
	}
});

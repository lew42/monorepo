import { Page, md, h2, demo } from "/app.js";
import { sample } from "/framework/ext/demo/sample.js";

export default new Page({
	meta: import.meta,
	title: "2026-08-10",
	description: "Grid becomes the default page shape, the Overview becomes a catalog, and the demos share one tree.",
	icon: "summarize",

	content(){

		md("**2026-08-10.** One layout decision and three consolidations, all of them subtractions from the reader's point of view.");

		h2("Every page is a grid page now");

		md("Half the site's pages declared `classes: \"grid\"` and the other half sat 60em wide and **left-aligned** — a flex item capped by `max-width` parks at the start, while the grid centres itself with its own `1fr` gutters. Two lines fixed the class of bug: `render()` applies `this.classes ?? \"grid\"`, and `.page` carries `margin-inline: auto`. Declaring `classes:` opts out whole; eleven redundant declarations were deleted. [Fit](/framework/styles/layouts/fit/) teaches the new default by not declaring it.");

		h2("The Overview is a catalog");

		md("`Page.catalog()` — `previews()` as a persistent rail beside a `$pages` region, patched on by [ext/catalog](/framework/ext/catalog/) exactly the way `tabs()` is. Every classdoc runs **full width** now, each tab's pages on the standard grid, and the [Page overview](/framework/core/Page/) is the flagship: eleven live demo trees as the rail, the intro as the region's default, and each demo's page shows its **source beside the running tree** — side by side on a desktop, stacked when narrow.");

		h2("One tree, many renderings");

		demo.app(sample(), { nav: true }).ac("wide").style("height", "20em");

		md("`sample()` — nine children, three of them deeper — is the shared sample tree in [ext/demo](/framework/ext/demo/), where `mini_app()` also lives now (promoted from the Page demos by the five-block census: it frames a render, so it extends the stage block). The four arrangement demos are one `sample()` each with a different root, which is itself the lesson: an arrangement is only the parent's `content()`. The basics demos keep their bespoke minimal trees, because there the *source* is the lesson.");

		md("Verified with a playwright crawl at 1600 and 900: the classdoc surfaces, the demo rail (click-through included), the ui kit and the layouts pages — no console errors, no failed requests, no horizontal overflow.");

		md("Combining all of it — shapes, walls, catalogs, tabs, miniatures — is now written down once: [Page › Docs › css](/framework/core/Page/doc/css/).");
	},
});

import { Page, div, md, code, h1, h2 } from "/app.js";
import { stats } from "../stats.js";
import panel from "../ext/Panel/workspace.js";

/* /framework/old/ — the framework homepage as it stood before the 2026-10-02 sprawl
 * rebuild (public/framework/ai/2026-10-02/framework-home/). Nothing was deleted: the
 * same hero, clock and stats the live /framework/ page used to show, kept reachable at
 * its own address so a reader (or a link from an old bookmark or chat log) can still
 * see it.
 *
 * ⚠ This is a CHILD of `/framework/` now, not the root — the fresh-eyes review caught
 * that the first version still built its own `new Sidebar({...})`, which drew a SECOND
 * sidebar nested inside the one real one `/framework/page.js` already wraps every one
 * of its children in (two sidebars, stacked, at 1200px and up). An ordinary child page
 * never overrides `render()` or builds its own Sidebar — it just writes `content()`,
 * the same as every other page under `/framework/` (`core/Page/page.js`, `stats()`'s
 * own caller, anything here). `classes:` is gone too, for the same reason: the default
 * `"standard"` shape (a left-anchored measure with `.wide`/`.bleed` tracks) is what
 * every ordinary child page wants, and `"hides-nav"` was only ever for a page that
 * draws its OWN nav instead of the site's — true of the root `/framework/page.js`,
 * never true of a child like this one.
 */
export default new Page({
	meta: import.meta,
	title: "Framework (old)",
	description: "The framework homepage before the 2026-10-02 sprawl rebuild — kept for reference, not deleted.",
	icon: "widgets",

	content(){
		h1("A no-build, native-ESM web framework");

		md("Write a page, save the file, refresh the tab. The path in an `import` is the file on disk, and what you debug is what you typed.");

		div.c("bleed", () => panel("clock").ac("surface")
			.style("--panel-height", "clamp(13em, 30vh, 30em)"));

		md("That band is a live [`ext/Panel`](/framework/ext/Panel/) — split it, retint it, or trade the clock for any of the other twenty-seven entries in its **T** menu.");

		stats();

		h2("Write a page");

		md("Measured from a clean checkout — [Versus](/framework/versus/) has the method, and the column where React wins. Create `/path/page.js`:");

		code.js(`import { p } from "/app.js";

p("Hello world.")`);

		md("That's basically it.");

		md("Start at [Start here](/framework/start/) — three files and a working site. Then [FAQ](/framework/faq/) and [Versus](/framework/versus/).");

		md("Building a site rather than reading a framework? [Web](/web/) is the guide — nav patterns and layout principles, each one live and clickable.");

		md("The current framework homepage is [/framework/](/framework/); this page is kept only as a reference to how it used to look.");
	},
});

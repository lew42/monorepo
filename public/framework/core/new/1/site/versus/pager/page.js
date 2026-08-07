import { Page } from "/app.js";
import { code, section } from "../../ui.js";
import { file, pair, verdict, ledger, measured, note } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "vs the Pager tier",

	content(){
		verdict("Deleting the Pager tier was right. Nine lines of CSS do what 287 lines of layout classes did, three coordinating call sites became one, and two of ColumnPager's own open questions closed for free. Exactly one thing was genuinely lost — the per-topic sidebar — and it was lost to laziness, not to this refactor.");

		section("The same problem, both ways");

		note("*A topic whose descendants render as equal drill-down columns.* Here is the whole of what a topic writes, in each tier.");

		pair(() => {
			code(`
import { ColumnPager } from "/framework/core/Pager/ColumnPager.js";

export default new Page({
    meta: import.meta,
    title: "Docs",
    children: [intro, api],
    pager(){
        return new ColumnPager({ root: this, app: this.app });
    },
});`, "ColumnPager — the topic opts in");

			file("/framework/core/new/1/site/compound/tree-from-route/page.js", "this.$pages");
		});

		note("One line each, and they look comparable. They are not — because the left one only works if three *other* files agree with it, and the right one works because a div has a class on it.");

		section("The three coordinating places");

		note("`pager()` is inert until something calls it. Three files do, and CLAUDE.md flags exactly this as *“more remembering than this codebase wants.”* All three are fetched below, unedited.");

		file("/framework/core/App/App.js", "this.$app.empty()");
		file("/framework/core/Page/Page.class.js", "host(){");
		file("/framework/core/Page/Page.class.js", "async load_ancestors(){");

		note("Read `load_ancestors()` twice. Its loop condition is `!this.host().pager` — so the *loader* climbs the url importing parents **until the layout question is answered**. Loading is being driven by a rendering concern. That is the coupling, and it is why the three places cannot be reduced to two.");

		section("What replaced all of it");

		pair(() => {
			file("/framework/core/new/1/Page.class.js", "container(){");
			file("/framework/core/new/1/site/styles.css", ".cols {");
		});

		note("`container()` asks a smaller question than `host()` did — *“where do I mount”*, not *“who owns the layout”* — and it is the only walk left. Nothing imports a Pager, nothing calls `pager()`, and `load_ancestors()` has no reason to exist: the Router's walk already loads every ancestor, because walking the url **is** the loader.");

		section("Counted");

		measured("node scratch/count.mjs   # comments and blanks stripped", `
                        JS    CSS   total
ColumnPager.js          65    123     188
Pager.js                15      4      19
Sidebar.js              30     50      80
                                    ─────
the layout tier        110    177     287

new/1 columns           1      9      10
  the page's one line   1      —
  .cols + .pages + :has —      9`);

		note("287 to 10. But the honest version of that number is on `/versus/lines/`: the 9 CSS lines are shared by every arrangement on the site, and `.pages`/`.page` would exist anyway. The narrow claim — *columns cost 9 lines and ColumnPager cost 188* — holds.");

		section("What could ColumnPager do that new/1 cannot?");

		note("The demotion of the sidebar, crumbs, topbar and burger to *“site chrome, never was layout”* is mostly right. Row by row, honestly:");

		ledger(["ColumnPager had", "new/1", "call"], [
			["a per-topic sidebar, derived: `pages: root.children`, brand and brand_url from the topic", "one hand-typed global nav in `site/app.js`", "**real loss.** The only one."],
			["breadcrumbs from `leaf().chain`", "`this.chain().map(p => p.link())` — two lines, `chain()` is public", "relocated"],
			["topbar, burger, off-canvas below 45em", "site chrome", "relocated, and simpler — it was a container query on the pager's own width"],
			["`.col-bar` — the `/path` + ✕ strip", "gone", "good riddance; its own readme called it *“developer chrome… reads as an IDE”*"],
			["`close()` — ✕ climbs to the parent", "a link to `parent.url`", "relocated"],
			["`Pager.show()` — swap with no url involved", "`$region.empty().append(page.render())`", "never earned its class — see below"],
			["override one method (`brand()`, `nav()`) to vary a layout", "write a function and call it from `content()`", "different mechanism, arguably better — composition over inheritance"],
			["two columns, hard-coded `chain.slice(-2)`", "`grid-auto-flow: column` — as many as the chain has", "**new/1 wins.** ColumnPager's readme lists a third column as an open question; here it needs nothing."],
			["re-renders the whole pager on every navigation", "never rebuilds — `render()` caches `this.view`", "**new/1 wins.** ColumnPager's open question #3, closed for free."],
		]);

		section("The sidebar is the one real loss, and it is not this refactor's fault");

		file("/framework/core/Pager/ColumnPager.js", "sidebar(){");

		note("Zero configuration, and always correct: the sidebar listed **the current topic's children** and changed as you moved between topics. new/1's is 20 hand-typed lines in `site/app.js`, and its own readme Open #6 says why it has to be — building it from `app.root`'s children would import every one of them to read their titles.");

		code(`
ColumnPager could derive it   because loading was EAGER — root.children were Pages
new/1 cannot                  because loading is LAZY  — root.children are strings`, "the actual cause");

		note("So this is not a layout regression, it is the **laziness tax**, and it is the same tax `tabs()` pays when it labels unloaded tabs by their declared name. One trade, showing up in two places. `load_all_children()` buys it back and costs the laziness — which is the correct shape for the choice, just not a free one.");

		section("Dissent: the Pager base class never earned its keep");

		pair(() => {
			file("/framework/core/Pager/Pager.js", "show(page){");
			code(`
// View already:
$region.empty();
$region.append(page);`, "what show() is");

			});

		note("`Pager/readme.md` argues that `TabPager` *“is the honest justification for `Pager` existing”* because the panel **is** a plain `Pager` used by composition. It is not: `show()` is `empty()` + `append()`, both `View` methods, plus one assignment. Strip it and `Pager`'s only non-`View` content is `leaf()` — four lines that read `app.page`.");

		note("**I dissent from that readme.** A 15-line base class whose one novel method is a two-line delegation to its own superclass was inheritance for its own sake, and `TabPager` using it proved the opposite of what was claimed. new/1 deleting it lost nothing, and the readme's self-assessment should be corrected rather than preserved as the record.");

		section("Next");

		note("`/versus/lineage/` — the two corrections that got new/1 here, shown failing.");
	}
});

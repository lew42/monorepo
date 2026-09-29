import { Page, md } from "/app.js";
import { section } from "../../../ux/Content/structure/Structure.js";

/**
 * Layout — the owner's three words (standard / split / fill-as-columns) plus the
 * top-down shape, as one page of links. Nothing here is a new mechanism: every
 * item points at the real thing. proposal.md rewrite order item 2.
 *
 * ⚠ Word collision, named once so nobody re-discovers it: core already uses "wide"
 * and "fill" for something else (a page's own `width:` word, and a column's own
 * `width:` word) — not the owner's "two columns" and "three or more columns". That
 * is why the items below are named Standard / Split / Columns, not wide / fill.
 * Renaming core's words instead touches about a dozen callers — major surgery,
 * left for the owner to decide. audit/3c.md.
 */
export default new Page({
	meta: import.meta,
	title: "Layout",
	description: "Choosing a layout: standard, split, columns, floating page, top-down shape.",
	icon: "dashboard_customize",

	children: "floating",

	content(){
		md("**Choosing a layout.** Five shapes cover almost every page. Each link below goes to the real mechanism — nothing on this page is new.");

		section({
			title: "Choosing a layout", bg: true, items: [
				{ name: "Standard", icon: "view_agenda", weight: 3, href: "/framework/core/Page/doc/words/" },
				{ name: "Split", icon: "vertical_split", weight: 3, href: "/framework/core/Layout/main-aside/" },
				{ name: "Columns", icon: "view_column", weight: 3, href: "/framework/core/Page/doc/columns/" },
				{ name: "Floating page", icon: "flip_to_front", weight: 2, href: "/framework/core/Page/layout/floating/" },
				{ name: "Top-down shape", icon: "layers", weight: 2, href: "/framework/core/Page/doc/words/" },
			],
		});

		md(`| shape | one line | mechanism |
|---|---|---|
| **Standard** | one column, 300–1000px — the site's own default | a page that says nothing (\`doc/words.md\`) |
| **Split** | two columns, any proportion, stacks on mobile | \`arrangement: "main-aside"\` ([Layout catalogue](/framework/core/Layout/main-aside/)) |
| **Columns** | three or more standard columns, responsive | \`this.columns({ even: true })\` ([\`doc/columns.md\`](/framework/core/Page/doc/columns/)) |
| **Floating page** | an inner left sidebar beside a page that scrolls on its own | not built yet — [stub](/framework/core/Page/layout/floating/) |
| **Top-down shape** | background · padding · full-bleed | today spread over [\`doc/words.md\`](/framework/core/Page/doc/words/), \`doc/columns.md\` and styles' \`layout-system.md\` |`);

		md("> **Word collision.** The owner's *wide* (two columns) and *fill* (three or more) are not core's `width: \"wide\"` (one full track, no second column) or a column's own `fill` (take the leftover, no ceiling). Reusing those words here would make every doc ambiguous — that's why this page says **Split** and **Columns** instead. `doc/columns.md`'s six width words are a different vocabulary again, for a column's own width inside a `columns()` row.");

		md("More shapes than these five: the [Layout catalogue](/framework/core/Layout/) — 30 named arrangements, each proven at seven widths.");
	},
});

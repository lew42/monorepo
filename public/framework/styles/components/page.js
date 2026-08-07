import { Page, md, demo, div, a, span, icon, code, details, summary } from "/app.js";

import table from "./table/component.js";
import field from "./field/component.js";
import crumbs from "./crumbs/component.js";
import pagination from "./pagination/component.js";
import card from "./card/component.js";
import stats from "./stats/component.js";
import badge from "./badge/component.js";
import alert from "./alert/component.js";
import toolbar from "./toolbar/component.js";
import tags from "./tags/component.js";
import panel from "./panel/component.js";
import tooltip from "./tooltip/component.js";

import { surface } from "./parts.js";

/* No stylesheet here, and only one in the whole section — `tooltip/tooltip.css`,
 * loaded by the module that emits the classes it styles. A section arguing that
 * you almost never need CSS and shipping its own would be arguing against itself.
 *
 * Twelve tiny modules, imported eagerly and on purpose: the gallery renders every
 * one of them, so there is nothing to defer. Each is also imported by its own
 * page.js — one function, two call sites, no second copy of the markup to drift. */
const gallery = { table, field, crumbs, pagination, card, stats, badge, alert, toolbar, tags, panel, tooltip };

export default new Page({
	meta: import.meta,
	title: "Components",
	description: "Twelve UI components, eleven of them with no stylesheet at all.",
	icon: "widgets",

	// a gallery is not prose: no measure, so the wall gets the room it has
	classes: "dash",

	children: "table field crumbs pagination card stats badge alert toolbar tags panel tooltip",

	// Labels and icons come from the twelve pages themselves, so `children` stays a
	// string of NAMES and the gallery below cannot disagree with the sidebar.
	initialize(){ this.load_all_children(); },

	/* No toc() on this page, and it is not an oversight. `toc()` scans for
	 * `h2, h3, .h2, .h3` outside its skip list, and the gallery renders REAL
	 * components — `card`'s `h3`, `stats`'s `.h2`, `panel`'s `.h3`. Those are the
	 * insides of an example, not sections of this page, so the rail read
	 * "View · 3 · 0 · 16 · Delete branch?" above the four real headings. A wrong
	 * rail is worse than none. On the design record. */
	content(){

		// The gallery IS the page. Placed synchronously, then redrawn when the twelve
		// pages land — so the labels sharpen from names to titles and the icons
		// arrive. Same shape as Page.previews(), for the same reason.
		div.c("grid gap auto", $gallery => {
			this.cells();

			// The redraw builds links AFTER Router.mark() has run, so they missed the
			// pass — `crumbs` is a whole component whose point is being marked. Same
			// call Page.tabs() makes for the same reason.
			this.loading?.then(() => {
				$gallery.empty(() => this.cells());
				this.app?.router?.mark_links();
			});
		}).style({ "--column": "13em", "--gap": "1.5em" });

		md("Every cell above is a **live render** of the same function its page documents. **Eleven of the twelve ship no CSS**; the twelfth is [Tooltip](/framework/styles/components/tooltip/), and it needs five rules for a reason worth reading.");

		// The compact index, and the one thing the gallery cannot do: a `.page-preview`
		// is an anchor, so Router.mark_links() marks the card you are heading to.
		this.previews();

		md("## Utilities go a long way");

		demo(alert, "`alert/component.js`'s export, in full — the `note()` builder it calls is `pad flex gap` plus `surface`, five lines above it. The tone arrives as a token **name**, so the component contains no colour and retunes with any theme.");

		md("## What each one needed");

		md("| component | built from | its own CSS |\n| --- | --- | --- |\n| [Data table](/framework/styles/components/table/) | nothing — plain `table` markup | — |\n| [Form field](/framework/styles/components/field/) | `flex v` + `h4` | — |\n| [Breadcrumbs](/framework/styles/components/crumbs/) | `flex wrap v-center h4` + `.page-link` | — |\n| [Pagination](/framework/styles/components/pagination/) | `flex wrap v-center` + `.btn` / `.prim` | — |\n| [Card](/framework/styles/components/card/) | `pad flex v` + `surface` | — |\n| [Stat tiles](/framework/styles/components/stats/) | `grid gap auto` + `--column` override | — |\n| [Badges](/framework/styles/components/badge/) | `h4` + `pill` | — |\n| [Alerts](/framework/styles/components/alert/) | `pad flex gap` + `flex-1` | — |\n| [Toolbar](/framework/styles/components/toolbar/) | `flex wrap gap v-center` + `flex-1` | — |\n| [Tag input](/framework/styles/components/tags/) | `flex wrap v-center` + `flex-1` | — |\n| [Panel](/framework/styles/components/panel/) | `pad flex` + `split` + `reverse` | — |\n| [Tooltip](/framework/styles/components/tooltip/) | a `span` and five rules | **`tooltip.css`** |\n\nThe utilities that did the most work: `flex` in **eleven of twelve**, `h4` in seven, `pad` in six, `wrap` in five. `--column` turned out to be a **knob** rather than a default twice, and `.flex.reverse` turned out to be the right-aligned action row nobody was looking for.");

		md("## The findings");

		md("A component that needs a rule is a finding, not a failure — and so is a component that needs the same *inline* declaration over and over. Ranked by how many of the twelve wanted it:\n\n| # | wanted | today you write | verdict |\n| --- | --- | --- | --- |\n| **9** | a gap under `1em` | `.style(\"gap\", \"0.4em\")` | `.gap` is a hardcoded `1em` and reads no token. The strongest candidate by far: a `.gap-sm`, or `gap: var(--gap, 1em)` |\n| **7** | a fill + hairline + radius | `surface` in `parts.js` | **keep as is** — a look is not a stylesheet's business at rung 4 |\n| **4** | `text-decoration: none` on a link | `btn` in `parts.js` | a bug report about `framework.css`: `.btn` should finish the job |\n| **2** | a status colour | not possible | `--error` exists (for `.md-error`); nothing means *good* or *warning*. The axis is a third done |\n| **2** | small body text | `h4`, which SHOUTS | the scale's small level is an uppercase annotation, so help and error text has no size to borrow |\n| **1** | `justify-content: flex-end` | `.flex.reverse`, or inline | a `.flex.end` utility. `reverse` works but reverses DOM order too |\n| **1** | `text-align: right` for a numeric column | inline, per cell | no alignment utilities exist at all |\n| **1** | an input with no border | inline, over `@layer theme` | a `.bare` opt-out in `util`. The section's **only** override of `framework.css` |\n| **1** | `min-width: 0` in a grid cell | inline | `.basis` already carries it and `.flex-1` does not — the asymmetry is the bug |\n\nNone of these is applied: this section may not edit `framework.css`. The reasoning for each, and the four components that were dropped, is on the record below.");

		md("## The filler");

		details(() => {
			summary("parts.js — surface, pill, btn");
			return code.file(import.meta, "parts.js");
		});

		md("Three token-valued style objects, shared by all twelve, so a component file is only its component. The values are inline rather than a stylesheet rule because a fill, a border and a radius are a **look** — the same call `layouts/parts.js` and `styles/util/page.js` already make.");

		md("Start at [Data table](/framework/styles/components/table/) — the component with no classes at all.");

		md.details(import.meta, "readme.md", "Design record — the ladder per component, the nine findings, and what was dropped");
	},

	/* One cell per child. `nav_for()` supplies the label, icon and url, so this list
	   and the sidebar cannot disagree.

	   `zoom-50`, so a cell reads as an ICON of the component rather than as a second
	   place to use it — the gallery answers "which one is that" and the component's
	   own page answers everything else. `gallery-card` (Page.css) makes the whole
	   block one hit area and the thumbnail inert, which is what lets these be plain
	   divs: half of them contain links, and `<a>` inside `<a>` is invalid. */
	cells(){
		this.children.forEach((page, name) => {
			const nav = this.nav_for(name);

			div.c("page-preview gallery-card", () => {
				div.c("gallery-thumb zoom-50 flex v h-center pad", gallery[name]);

				a.c("gallery-link").href(nav.url).append(() => {
					if (nav.icon) icon(nav.icon);
					span.c("page-preview-title", nav.label);
				});
			});
		});
	},
});

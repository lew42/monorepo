import { Page, View, md, demo, div, a, span, icon, code, details, summary } from "/app.js";

import holy_grail from "./holy-grail/layout.js";
import sidebar from "./sidebar/layout.js";
import cards from "./cards/layout.js";
import dashboard from "./dashboard/layout.js";
import split from "./split/layout.js";
import centered from "./centered/layout.js";
import stack from "./stack/layout.js";
import masthead from "./masthead/layout.js";

/* css: .layout-side, .layout-rail, .layout-measure, .layout-card, .layout-thumb,
   .layout-full — and `.page-preview` / `.zoom-25`, which this page borrows from
   Page.css and framework.css (both loaded via /app.js, imported above). */
View.stylesheet(import.meta, "layouts.css");

/* Eight tiny modules, imported eagerly and on purpose: the gallery renders every
 * one of them, so there is nothing to defer. Each is also imported by its own
 * page.js and by its `full/` page — one function, three call sites, no second
 * copy of the markup to drift. */
const gallery = {
	"holy-grail": holy_grail,
	sidebar,
	cards,
	dashboard,
	split,
	centered,
	stack,
	masthead,
};

export default new Page({
	meta: import.meta,
	title: "Layouts",
	description: "Eight page layouts, live at zoom-25 — click one for the full size and the source.",
	icon: "dashboard_customize",

	children: "holy-grail sidebar cards dashboard split centered stack masthead",

	nav: {
		"holy-grail": { label: "Holy grail", icon: "view_quilt" },
		sidebar:      { label: "Sidebar",    icon: "view_sidebar" },
		cards:        { label: "Cards",      icon: "grid_view" },
		dashboard:    { label: "Dashboard",  icon: "dashboard" },
		split:        { label: "Split",      icon: "vertical_split" },
		centered:     { label: "Centered",   icon: "format_align_center" },
		stack:        { label: "Stack",      icon: "view_agenda" },
		masthead:     { label: "Masthead",   icon: "web" },
	},

	content(){

		// The gallery first, because it IS the page. Each card is the layout's own
		// function, run here — `nav_for()` supplies the label, icon and url, so
		// this list and the nav above cannot disagree.
		div.c("grid gap auto", () => this.children.forEach((page, name) => {
			const nav = this.nav_for(name);

			a.c("page-preview layout-card").href(nav.url).append(() => {
				div.c("layout-thumb zoom-25 flex all-1", gallery[name]);

				div.c("flex gap v-center", () => {
					icon(nav.icon);
					span.c("page-preview-title", nav.label);
				});
			});
		}));

		md("Every card above is a **live render**, not a picture: `zoom-25` lays the layout out at four times the card's width and paints it back down, so a preview is shrunken rather than squashed. Click one for the full size and its source.");

		md("## Utilities go a long way");

		demo(cards, "`cards/layout.js`, whole. `grid auto` is `repeat(auto-fit, minmax(min(var(--column), 100%), 1fr))` — a responsive card wall with **no stylesheet and no media query**. Three of the eight need no CSS at all.");

		md("## What each one needed");

		md("| layout | built from | its own CSS |\n| --- | --- | --- |\n| [Holy grail](/framework/styles/layouts/holy-grail/) | `flex v gap` + `flex gap flex-1` | `.layout-rail` |\n| [Sidebar](/framework/styles/layouts/sidebar/) | `flex gap` + `flex-1` | `.layout-side` |\n| [Cards](/framework/styles/layouts/cards/) | `grid gap auto` | — |\n| [Dashboard](/framework/styles/layouts/dashboard/) | `grid auto` + `--column` override | `.layout-rail` |\n| [Split](/framework/styles/layouts/split/) | `flex gap auto` + `--column` override | — |\n| [Centered](/framework/styles/layouts/centered/) | `pad flow` | `.layout-measure` |\n| [Stack](/framework/styles/layouts/stack/) | `flow` + `flex gap` | `.layout-measure` |\n| [Masthead](/framework/styles/layouts/masthead/) | `flex v gap` + `grid gap three` | — |\n\nThree rules for eight layouts, and they name two gaps: **a flex basis** (`.layout-side`, `.layout-rail`) and **a centred measure** (`.layout-measure`). `flex-1` names the fluid half of a two-column row; nothing names the fixed half.");

		md("## The filler");

		details(() => {
			summary("parts.js — box, lines, items, tile");
			return code.file(import.meta, "parts.js");
		});

		md("Four builders, shared by all eight, so a layout file is only its layout. The tint is an inline token value rather than a class — `layouts.css` stays layout-only, which is the same call `styles/util/page.js` makes for its demo cells.");

		md("Next: [Utilities](/framework/util/) — the JS helpers, which are far fewer.");

		md.details(import.meta, "readme.md", "Design record — zoom vs transform, one layout three ways, maximize without a query param");
	}
});

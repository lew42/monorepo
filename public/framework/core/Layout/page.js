import { Page, md, div, p } from "/app.js";
import Layout from "./Layout.js";
import { LAYOUTS, BANDS } from "./layouts.js";

/* ── THE THREE FILTERS, AS PROPS A LAYOUT PAGE ALREADY DECLARES ────────────────
   `browse()`'s `facets:` reads a page prop straight — there is no schema and nothing
   registers, which is the whole of "each layout can prescribe properties, and the
   filters can filter them". Every one starts empty, and empty means everything.

   ⚠ THIS USED TO BE A NEAR-COPY OF `browse()` in `core/Layout/tree.js`: slice A could
     not write in `ext/`, so the facet rows and the 60-cap were re-implemented beside
     the wall they were for. They are options on `browse()` now and that file is gone
     (2026-09-06, slice 3). */
const FACETS = [
	{ head: "Columns", key: "columns", values: [1, 2, 3, 4],
	  label: n => n === 4 ? "Four or more" : n + (n === 1 ? " column" : " columns") },

	{ head: "Tags", key: "tags", all: "Every tag" },

	// `approved` is a DATE or nothing, so the two states need naming rather than matching.
	{ head: "Proof", key: "approved", all: "Approved and draft", values: ["approved", "draft"],
	  label: value => value === "approved" ? "Approved" : "Draft",
	  match: (page, value) => (value === "approved") === Boolean(page.approved) },
];

/* THE TREE. Thirty layouts you click around, one column first — and the wall is
   the page: a sentence, then pictures, and every word of detail one click down.

   ⚠ The children ARE the catalogue. `layouts.js` is data with no imports; every
     entry becomes a `Layout` here, and `declare()` adopts each one at
     /framework/core/Layout/<name>/. There is no page.js per layout and there does
     not need to be — a layout is thirty lines of props, not a file. */

export default new Page({
	meta: import.meta,
	title: "Layout",
	description: "Thirty arrangements you can browse, each proven at seven widths.",
	icon: "view_quilt",

	children: [...LAYOUTS.map(entry => new Layout(entry)), "doc"],

	content(){

		p("Every way this site arranges a page, in one wall. Pick a shape by its picture; the page behind it opens the layout at its narrowest proven width, with a handle to drag and seven widths beside it showing how it responds.");

		/* 60 is two full rows at 3440 on a 20em column, and a card is a PICTURE rather
		   than a live instance — so sixty of them cost about one live render. */
		this.browse(BANDS, { "--column": "20em" }, { cap: 60, facets: FACETS, search: "intro when tags" })
			.ac("page-layout-tree");

		md("**A layout is the arrangement of boxes, and it owns no content.** What you see inside one is a *fixture* — shortest and longest text, no image and a huge one, light and dark — poured into its named slots. That is the whole test: a shape that only looks right with particular content is not a layout, it is a draft page.");

		md("Behind it: [the props a filter reads](/framework/core/Layout/doc/props/) · [the three rules](/framework/core/Layout/doc/rules/) · [fixtures and approval](/framework/core/Layout/doc/fixtures/) · [where the thirty came from](/framework/core/Layout/doc/porting/).");

		md.details(import.meta, "readme.md", "Readme");
	},
});

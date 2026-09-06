import { Page, md, div, p } from "/app.js";
import Layout from "./Layout.js";
import { LAYOUTS, BANDS } from "./layouts.js";
import { tree } from "./tree.js";

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

		tree(this, BANDS, { "--column": "20em" });

		md("**A layout is the arrangement of boxes, and it owns no content.** What you see inside one is a *fixture* — shortest and longest text, no image and a huge one, light and dark — poured into its named slots. That is the whole test: a shape that only looks right with particular content is not a layout, it is a draft page.");

		md("Behind it: [the props a filter reads](/framework/core/Layout/doc/props/) · [the three rules](/framework/core/Layout/doc/rules/) · [fixtures and approval](/framework/core/Layout/doc/fixtures/) · [where the thirty came from](/framework/core/Layout/doc/porting/).");

		md.details(import.meta, "readme.md", "Readme");
	},
});

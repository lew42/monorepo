import { Page, View, md } from "/app.js";

/* One rule, shared by the four pairings below: the flush-wall escape hatch that
   reaches past `.page-column-prose`'s own inset. Everything else in this dir is
   utility classes — `.grid.auto`, `.gap`, `.pad`, `.tint`, `.surface`. */
View.stylesheet(import.meta, "grids.css");

export default new Page({
	meta: import.meta,
	title: "Grids",
	description: "Grid-column pairings — a grid opening a detail column, and the backgrounds inside one.",
	children: "grid-detail list-large measure-3440 flush-wall",
	content(){
		md("Four small columns trees, each its own pairing — click through, each ends in a one-line verdict.");
		md("[Grid → detail](/framework/core/Page/overview/columns/examples/grids/grid-detail/) — a large grid of small tiles opens a small detail column.");
		md("[List → large](/framework/core/Page/overview/columns/examples/grids/list-large/) — a small picker opens a large content column.");
		md("[Measure at 3440](/framework/core/Page/overview/columns/examples/grids/measure-3440/) — one default-width column, real numbers.");
		md("[Flush wall](/framework/core/Page/overview/columns/examples/grids/flush-wall/) — a 0-gap 0-pad grid against the padded version.");
	},
});

import { Page, div } from "/app.js";

// The 4th-level experiment: the fifteen demo trees as a strip of top tabs instead
// of a catalog rail. `.page-old-invert` (old.css) undoes the tint Doc's outer
// strip sits in, so two `.tabs.block` sets nested inside each other still read
// as two different levels.
export default new Page({
	meta: import.meta,
	title: "Overview",
	description: "The fifteen demo trees, as top tabs instead of a rail.",
	// ⚠ `columns` is GONE from here, not forgotten: it graduated into core/Page
	// (`.page.columns`, Page.css) and its snapshot declared the same class names, so
	// the two sheets could not both be loaded. The live one is
	// /framework/core/Page/overview/columns/.
	children: "page children add labels route shapes wall catalog dashboard strip deep landing docs site",
	render(){ return this.view ??= div.c("page", () => this.tabs().ac("block page-old-invert")).ac("page--" + this.name); },
});

import { Page, demo, md } from "/app.js";
import { tree } from "../tree.js";

// Container: colstyles/'s own column, `fill`. Size: one demo.app() box,
// ~52em wide, one row tall. Own layout: `.flow` holding the box. Regions:
// one. Preview: default card.

export default new Page({
	meta: import.meta,
	title: "Glass",
	description: "The alpha ladder read as depth: a faint trail behind you, a frosted sticky head.",
	icon: "blur_on",
	width: "fill",

	content(){
		md("Depth, not decoration: `--fill-a04` on the columns behind you, `--fill-a08` on the one you're in — the same ladder a chip or a hover already wears. `backdrop-filter` earns its one placement on the sticky head, where body text scrolls under it.");
		demo.app(tree("glass")).style({ height: "26em", width: "min(100%, 52em)" });
		md("**Interaction:** resize/reveal untouched. Contrast measured both colour schemes — `doc/decisions.md`.");
	},
});

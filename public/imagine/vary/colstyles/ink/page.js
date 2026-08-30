import { Page, demo, md } from "/app.js";
import { tree } from "../tree.js";

// Container: colstyles/'s own column, `fill`. Size: one demo.app() box,
// ~52em wide, one row tall. Own layout: `.flow` holding the box. Regions:
// one. Preview: default card.

export default new Page({
	meta: import.meta,
	title: "Ink",
	description: "Dark, bold, presentational — built from the site's own dark-in-both-modes tokens.",
	icon: "dark_mode",
	width: "fill",

	content(){
		md("Dark columns, display-weight heads, `--prim` accent seams — built from `--code-bg` / `--code-ink` (lew42.css), which are already dark **in both** colour schemes. Toggle the site's theme; this look does not move.");
		demo.app(tree("ink")).style({ height: "26em", width: "min(100%, 52em)" });
		md("**Interaction:** resize/reveal untouched. `border-inline-end` had to be re-declared at core's own specificity (`.page.columns.vary-colstyles-look-ink`) — one class short of that and the hairline colour survives every override (colstyles.css).");
	},
});

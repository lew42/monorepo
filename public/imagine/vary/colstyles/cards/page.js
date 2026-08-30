import { Page, demo, md } from "/app.js";
import { tree } from "../tree.js";

// Container: colstyles/'s own column, `fill`. Size: one demo.app() box,
// ~52em wide, one row tall. Own layout: `.flow` holding the box. Regions:
// one. Preview: default card.

export default new Page({
	meta: import.meta,
	title: "Cards",
	description: "Each column a floating surface — the site's own card shadow, a wash gutter between them.",
	icon: "view_agenda",
	width: "fill",

	content(){
		md("Columns as panels: the site's own `--card-shadow` / `--card-ring`, rounded corners, margin standing in for a gap.");
		demo.app(tree("cards")).style({ height: "26em", width: "min(100%, 52em)" });
		md("**Interaction:** the seam still drags — it just floats in the card gutter instead of sitting flush on a hairline. Margin on the body, not `gap` on the row (colstyles.css says why).");
	},
});

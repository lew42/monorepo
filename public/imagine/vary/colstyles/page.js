import { Page, View, demo, div, h4, img, md } from "/app.js";
import { tree } from "./tree.js";

const LOOKS = ["finder", "cards", "ink", "glass"];
const ROWS = [["Narrow column", "18em"], ["Wide column", "34em"]];

// Container: /imagine/vary/'s own column (default width — this index has no
// word of its own). Size: one row of four cards, plus a short notes block.
// Own layout: previews() wall + `.flow`. Regions: one. Preview: a real still,
// not the icon (2026-09-05 ux-rethink). Shot lives in vary/shots/.
View.stylesheet(import.meta, "colstyles.css");

export default new Page({
	meta: import.meta,
	title: "Colstyles",
	description: "The column render CONTROL answer — every hook live, then the same tree in four complete looks.",
	icon: "view_column",
	index: true,
	children: "hooks finder cards ink glass",

	preview(nav){
		return this.preview_card(nav, () => img().attr("src", "/imagine/vary/shots/colstyles.jpg").attr("alt", nav.label)
			.style({ display: "block", width: "100%", height: "100%", "object-fit": "cover" }));
	},

	content(){
		md("Answering **do we have control over how a columns tree renders**: [Hooks](./hooks/) shows every control point live; Finder, Cards, Ink and Glass wear the same three-shelf content tree in four complete looks.");
		this.previews();

		md(`**Interaction notes**

- **Survives everywhere:** resize (the drag seam), reveal (\`scroll_column()\`) and a full route swap are core's own — none of the three looks touches them, only what a column paints.
- **What the tokens can't reach:** the drag seam's "zero outer size" math (Page.css) is written for a row with no gap between columns. Cards adds one anyway via *margin on the body*, never \`gap\` on the row — a real \`gap\` would land on the seam too and there is no token that exempts one flex item from it.
- **A specificity floor, not a bug:** core's own body rule is scoped \`.page.columns .page-column-body\` (three classes) for the properties it sets. A look that touches any of them — Cards' border, Ink's — has to match that count (\`.page.columns.vary-colstyles-look-X\`) or the override silently loses regardless of load order.
- **Dark that stays dark:** Ink reuses \`--code-bg\` / \`--code-ink\` (already dark in *both* colour schemes) rather than inventing a third dark-in-both-modes pair — the token system has no plain "always dark" primitive, and hand-picking both \`light-dark()\` sides is how the theme already gets one (the code block does it too).`);

		// The owner's ask tonight, checked for real (2026-09-05 ux-rethink): before this,
		// "permutation" here meant four colour looks on ONE fixed layout — the layout axis
		// only existed, uncrossed, in hooks/'s widths() control. This crosses both for real:
		// same four looks, two real column widths, eight small boxes instead of two claims.
		md("**Permutation, checked for real:** the four looks above vary colour on one fixed width. Cross that against the other real axis — the column's own width — and every look still reads at a glance, narrow or wide:");

		div.c("vary-colstyles-matrix flow", () => {
			ROWS.forEach(([label, w]) => {
				h4(label);
				div.c("flex gap wrap", () => LOOKS.forEach(look =>
					div.c("zoom-25", () => demo.app(tree(look)).style({ height: "11em", width: w }))));
			});
		}).style("--gap", "0.5em");

		md("**Verdict:** the two axes are independent — no look breaks, hides a rung, or reflows badly at either width — which is exactly what \"control over rendering\" should mean. What is still missing is the reverse crossing (one look, several *structural* layouts — add/swap/carousel from `place/`) — out of this task's build budget, named here so it isn't lost.");
	},
});

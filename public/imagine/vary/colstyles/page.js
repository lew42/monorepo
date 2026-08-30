import { Page, View, md } from "/app.js";

// Container: /imagine/vary/'s own column (default width — this index has no
// word of its own). Size: one row of four cards, plus a short notes block.
// Own layout: previews() wall + `.flow`. Regions: one. Preview: default card.
View.stylesheet(import.meta, "colstyles.css");

export default new Page({
	meta: import.meta,
	title: "Colstyles",
	description: "The column render CONTROL answer — every hook live, then the same tree in three complete looks.",
	icon: "view_column",
	index: true,
	children: "hooks finder cards ink",

	content(){
		md("Answering **do we have control over how a columns tree renders**: [Hooks](./hooks/) shows every control point live; Finder, Cards and Ink wear the same three-shelf content tree in three complete looks.");
		this.previews();

		md(`**Interaction notes**

- **Survives everywhere:** resize (the drag seam), reveal (\`scroll_column()\`) and a full route swap are core's own — none of the three looks touches them, only what a column paints.
- **What the tokens can't reach:** the drag seam's "zero outer size" math (Page.css) is written for a row with no gap between columns. Cards adds one anyway via *margin on the body*, never \`gap\` on the row — a real \`gap\` would land on the seam too and there is no token that exempts one flex item from it.
- **A specificity floor, not a bug:** core's own body rule is scoped \`.page.columns .page-column-body\` (three classes) for the properties it sets. A look that touches any of them — Cards' border, Ink's — has to match that count (\`.page.columns.vary-colstyles-look-X\`) or the override silently loses regardless of load order.
- **Dark that stays dark:** Ink reuses \`--code-bg\` / \`--code-ink\` (already dark in *both* colour schemes) rather than inventing a third dark-in-both-modes pair — the token system has no plain "always dark" primitive, and hand-picking both \`light-dark()\` sides is how the theme already gets one (the code block does it too).`);
	},
});

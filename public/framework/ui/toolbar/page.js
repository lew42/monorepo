import { Page, md, demo, div, button, input, icon } from "/app.js";
import { palette, copy } from "../parts.js";

const toolbar = () => div.c("surface pad flex wrap gap v-center", () => {
	div.c("flex v-center gap", () => {
		button.c("prim", "New");
		button("Import");
	}).style("--gap", "0.3em");

	input().ac("flex-1").attr("type", "search").attr("placeholder", "Filter modules…")
		.style("minWidth", "9em");

	div.c("flex v-center gap", () => {
		button(() => icon("view_list"));
		button(() => icon("view_module"));
	}).style("--gap", "0.3em");
});

const group = () => div.c("flex wrap gap", () => {
	div.c("flex v-center gap", () => {
		button.c("prim", "Save");
		button("Save as…");
	}).style("--gap", "0.3em");

	div.c("flex v-center gap", () => {
		["format_bold", "format_italic", "format_underlined"].forEach(glyph =>
			button(() => icon(glyph)).style("padding", "0.5em"));
	}).style("--gap", "0.15em");
});

export default new Page({
	meta: import.meta,
	title: "Toolbar",
	description: "A template, not a function — groups, a growing field, and why `flex-1` beats `split`.",
	icon: "tune",

	content(){

		palette(
			["groups + a field", toolbar],
			["a button group", group],
		);

		md("## Copy it");

		copy(toolbar);

		md("**There is no `ui.toolbar()`.** A bar is `pad flex wrap gap v-center` on a surface, and everything interesting about it is *what you put in it* — which groups, which one grows, how tight each gap is. A function would either hardcode one bar (useless twice) or take a config object describing the row (worse than the row).");

		md("## `flex-1`, not `split`");

		md("`split` is `justify-content: space-between`, which spreads *three* groups into thirds and leaves the field its intrinsic width. `flex-1` on the one element that should absorb the slack does the right thing with any number of groups — and it fixes the input, which `framework.css` makes `width: 100%`, meaning \"as wide as you can\" inside a flex row.");

		md("`wrap` is the other half, and it needs one thing from you: **`flex: 1` is `flex-basis: 0`**, so in a tight row the field collapses to a couple of pixels rather than dropping to the next line. A `min-width` is what gives `wrap` something to act on. Then the groups reflow at any width with no media query — drag a demo's handle and watch it.");

		md("## A group is a row with a smaller gap");

		demo(group, "`0.3em` for labelled buttons, `0.15em` for icon ones. A *joined* segmented control is the one thing here that would need real CSS — a negative margin and corner suppression on the middle buttons — and it earns none: the theme already draws borderless buttons, so a tight gap reads as a group.");

		md("Next: [Tag input](/framework/ui/tags/) — the one component that opts out of a base rule.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-75 pad", toolbar)); },
});

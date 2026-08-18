import { Page, md, demo, div, button, input, icon } from "/app.js";

// The template, verbatim — rendered on the stage AND printed as the source, so the
// code on the page is the code that ran.
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

const heading = () => div.c("surface pad flex wrap gap v-center split", () => {
	div.c("flex v", () => {
		div.c("h4 muted", "Core");
		div.c("h3", "View");
	});

	div.c("flex v-center gap", () => {
		button("Discard");
		button.c("prim", "Publish");
	}).style("--gap", "0.3em");
});

export default new Page({
	meta: import.meta,
	title: "Toolbar",
	description: "A template, not a function — groups, a growing field, and why `flex-1` beats `split`.",
	icon: "tune",

	children: [
		demo.page("title", heading, {
			note: "The other bar every app has: what you are looking at on one side, what you can do to it on the other. **This one wants `split`, not `flex-1`** — two groups and no field to absorb the slack, so `space-between` is exactly the right sentence. The rule below is about the three-group bar, not this one." }),

		demo.page("group", group, {
			note: "`0.3em` for labelled buttons, `0.15em` for icon ones. A *joined* segmented control is the one thing here that would need real CSS — a negative margin and corner suppression on the middle buttons — and it earns none: the theme already draws borderless buttons, so a tight gap reads as a group." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(toolbar, steer).ac("bleed"),
			def: toolbar,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**There is no `ui.toolbar()`.** A bar is `pad flex wrap gap v-center` on a surface, and everything interesting about it is *what you put in it* — which groups, which one grows, how tight each gap is. A function would either hardcode one bar (useless twice) or take a config object describing the row (worse than the row). **Drag the stage** and the groups reflow with no media query.",
		});

		md("## `flex-1`, not `split`");

		md("`split` is `justify-content: space-between`, which spreads *three* groups into thirds and leaves the field its intrinsic width. `flex-1` on the one element that should absorb the slack does the right thing with any number of groups — and it fixes the input, which `framework.css` makes `width: 100%`, meaning \"as wide as you can\" inside a flex row.");

		md("`wrap` is the other half, and it needs one thing from you: **`flex: 1` is `flex-basis: 0`**, so in a tight row the field collapses to a couple of pixels rather than dropping to the next line. A `min-width` is what gives `wrap` something to act on.");

		md("Next: [Tag input](/framework/ui/tags/) — the one component that opts out of a base rule.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", toolbar)); },
});

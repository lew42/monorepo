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

// A segment, not a group: `.prim` marks the SELECTED option among three
// mutually exclusive ones, which `group`'s clusters of independent actions
// never claim. Still the same tight `0.15em` gap — not the joined control
// this section already ruled out (this page's own `group` note, below).
const filter = () => div.c("surface pad flex wrap gap v-center", () => {
	div.c("flex v-center gap", () => {
		["All", "Active", "Archived"].forEach((label, i) =>
			i === 0 ? button.c("prim", label) : button(label));
	}).style("--gap", "0.15em");

	input().ac("flex-1").attr("type", "search").attr("placeholder", "Filter…")
		.style("minWidth", "9em");
});

// The two honest answers to a toolbar with no room, shown side by side
// rather than argued about. Neither is new CSS: `wrap` is the existing
// class, the scroll row is one value the cascade never had an opinion
// about (`overflow-x`) on one element — the record's own bar for "inline
// is fine" (doc/record.md §3).
const ROW = ["New", "Import", "Export", "Share", "Archive"];
const row = () => ROW.forEach((label, i) => i === 0 ? button.c("prim", label) : button(label));

const wrapping = () => div.c("surface pad flex wrap gap v-center", row).style("--gap", "0.3em");

const scrolling = () => div.c("surface pad flex gap v-center", row)
	.style({ "--gap": "0.3em", flexWrap: "nowrap", overflowX: "auto" });

const mobile = () => div.c("flex v gap", () => {
	div.c("flex v gap", () => { div.c("h4 muted", "wrap"); wrapping(); });
	div.c("flex v gap", () => { div.c("h4 muted", "horizontal scroll"); scrolling(); });
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

		demo.page("filter", filter, {
			note: "The same tight gap as `group`, doing different work: `.prim` on `All` reads as the currently-selected segment, not a fourth independent action. Still not the joined control this page already ruled out — nothing here needed a negative margin." }),

		demo.page("mobile", mobile, {
			note: "Not equally good. `wrap` costs height — the row grows down a line at a time and every button stays reachable. The scroll row keeps one line by hiding an unknown number of buttons off the right edge, with nothing telling you they're there until you swipe. Default to `wrap`; reach for scroll only when the bar must never grow taller than one line." }),
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

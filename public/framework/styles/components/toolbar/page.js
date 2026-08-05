import { Page, md, demo, div, button, icon } from "/app.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Toolbar",
	description: "Groups, a growing field, and why `flex-1` beats `split`.",
	icon: "tune",

	content(){

		demo(component, "`pad flex wrap gap v-center` is the bar. The two button groups are the same row again with a tighter gap, and `flex-1` on the search input is what pushes the second group to the far end.");

		md("## `flex-1`, not `split`");

		md("`split` is `justify-content: space-between`, which spreads *three* groups into thirds and leaves the field its intrinsic width. `flex-1` on the one element that should absorb the slack does the right thing with any number of groups, and it also fixes the input: `framework.css` makes every text input `width: 100%`, which inside a flex row means \"as wide as you can\" — `flex: 1` overrides the basis and it behaves.");

		md("`wrap` is the other half. At a narrow width the groups drop onto their own lines instead of crushing, with **no media query** — the same intrinsic behaviour `grid auto` uses.");

		md("## A button group");

		demo(() => {
			div.c("flex wrap gap", () => {
				div.c("flex v-center", () => {
					button.c("prim", "Save");
					button("Save as…");
				}).style("gap", "0.3em");

				div.c("flex v-center", () => {
					["format_bold", "format_italic", "format_underlined"].forEach(glyph =>
						button(() => { icon(glyph); }).style("padding", "0.5em"));
				}).style("gap", "0.15em");
			});
		}, "A group is just a row with a smaller gap — `0.3em` for labelled buttons, `0.15em` for icon ones. A *joined* segmented control is the one thing that would need real CSS (a negative margin and corner suppression), and it earns none: the theme already draws borderless buttons, so a tight gap reads as a group.");

		md("Next: [Tag input](/framework/styles/components/tags/) — the only place this section overrides `framework.css`.");
	}
});

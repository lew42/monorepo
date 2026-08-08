import { Page, md, h2, demo, div } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Flex",
	description: "The .flex utilities for one-dimensional layouts and spacing.",
	icon: "view_column",

	content(){

		demo(() => {
			div.c("boxes flex gap", () => {
				div("1"); div("2"); div("3");
			});
		}, "`.flex` turns on flexbox; `.gap` spaces the children. You will use both constantly.");

		h2("Stack vertically");

		demo(() => {
			div.c("boxes flex v gap", () => {
				div("1"); div("2"); div("3");
			});
		}, "`.v` switches the direction to a column.");

		h2("Even columns");

		demo(() => {
			div.c("boxes flex gap all-1", () => {
				div("1"); div("2"); div("3");
			});
		}, "`.all-1` makes every child share the space equally. `.auto` instead lets children wrap once they get narrower than `--column` (14em).");

		h2("Push apart");

		demo(() => {
			div.c("boxes flex split", () => {
				div("left"); div("right");
			});
		}, "`.split` pushes children to the two ends — a header with a title on the left and actions on the right.");

		h2("Centering");

		demo(() => {
			div.c("boxes flex gap h-center v-center", () => {
				div("centered");
			}).style("min-height", "5em");
		}, "`.h-center` centers on the main axis, `.v-center` on the cross axis. Combine them to center both ways.");

		h2("Spacing utilities");

		md("`.pad` pads an element; `.all-pad` pads every child; `.mb` adds a bottom margin. All pair with flex.");

		md("Next: [Grid](/alex/styles/grid/) — the same job in two dimensions.");
	},
});

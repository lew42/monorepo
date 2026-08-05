import { div } from "/app.js";
import { box, lines, items, tile } from "../parts.js";

/* `--column` is the wrap width `grid.auto` reads, so overriding it on the tile
 * row is how four tiles fit where two cards would — a token, not a rule. */
export default () => {
	div.c("flex v gap", () => {
		div.c("grid gap auto", () => {
			tile("Visitors", "12.4k");
			tile("Pages", "38");
			tile("Errors", "0");
			tile("Build", "1.2s");
		}).style("--column", "8em");

		div.c("flex gap flex-1", () => {
			box("Traffic", () => lines(3)).ac("flex-1");
			box("Activity", () => items(5)).ac("layout-rail");
		});
	});
};

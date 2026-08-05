import { div } from "/app.js";
import { box, lines } from "../parts.js";

/* `flex auto` gives every child `flex: 1 1 var(--column)` — equal panes that
 * stack the moment two of them no longer fit. Zero CSS, zero media queries. */
export default () => {
	div.c("flex gap auto", () => {
		box("Left", () => lines(3));
		box("Right", () => lines(3));
	}).style("--column", "18em");
};

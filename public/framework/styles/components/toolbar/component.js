import { div, button, input, icon } from "/app.js";
import { surface } from "../parts.js";

export default () => div.c("pad flex wrap gap v-center", () => {

	// a button group: the same row, one class, a tighter gap
	div.c("flex v-center", () => {
		button.c("prim", "New");
		button("Import");
	}).style("gap", "0.3em");

	// `flex-1` is what pushes everything after it to the far end — `split` would
	// space the groups instead of growing the field. The `min-width` is what makes
	// `wrap` do something: `flex: 1` is `flex-basis: 0`, so in a tight row the field
	// collapses to nothing instead of dropping to the next line.
	input().ac("flex-1").attr("type", "search").attr("placeholder", "Filter modules…")
		.style("minWidth", "9em");

	div.c("flex v-center", () => {
		button(() => { icon("view_list"); });
		button(() => { icon("view_module"); });
	}).style("gap", "0.3em");

}).style(surface);

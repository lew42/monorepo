import { Page, demo, div, span, icon } from "/app.js";

// The template, verbatim: rendered on the stage AND printed as the source.
const rows = () => div.c("flex v", () => {
	div.c("ui-row", () => { icon("mail"); span.c("flex-1", "A row"); span.c("muted", "now"); });
	div.c("ui-row selected", () => { icon("mail"); span.c("flex-1", "A selected row"); span.c("muted", "2m"); });
});

export default new Page({
	specimen: rows,
	meta: import.meta,
	title: "Row",
	description: "One line in a list, on its parent's ground: padding in its own em, a ground only on hover or when selected.",
	icon: "view_list",

	content(){
		demo.exhibit({ page: this, stage: steer => demo.stage(rows, steer), def: rows, file: new URL("page.js", import.meta.url).pathname, note: "Add `ui-row` to any flex line. A line that also needs a divider or a done state keeps those rules in its own module; the row owns only the padding, the gap and the hover ground." });
	},
});

import { Page, View, md } from "/app.js";

/* One stylesheet for the whole lab — loaded once here, since load_all_children()
   (Page.class.js) imports every child below before this module finishes evaluating,
   so it is live before any of them render. */
View.stylesheet(import.meta, "looks.css");

export default new Page({
	meta: import.meta,
	title: "Looks",
	description: "Backgrounds, padding, seams, scrollbars — one variable at a time.",
	icon: "palette",
	children: "backgrounds padding scrollbars",
	content(){
		md("Three small labs. Each is a real `columns()` tree — pick the variable apart, then read the one-line verdict.");
		md("[Backgrounds](/framework/core/Page/overview/columns/examples/looks/backgrounds/) — `--wash` vs `--tint` vs `--surface`, and whether a child column matches its parent.");
		md("[Padding](/framework/core/Page/overview/columns/examples/looks/padding/) — a grid always has padding, unless it opts into flush.");
		md("[Seams + scrollbars](/framework/core/Page/overview/columns/examples/looks/scrollbars/) — a scrollbar is a decision; an accidental one breaks the column boundary.");
	},
});

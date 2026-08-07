import { div } from "/app.js";
import { box, lines, items } from "../parts.js";

/* The middle row is `flex-1`, so the footer sits at the bottom of whatever
 * height the layout is given — the thumbnail on the index proves it. */
export default () => {
	div.c("flex v gap", () => {
		box("Brand", () => { div.c("flex-1"); items(2); }).ac("flex gap v-center");

		div.c("flex gap flex-1", () => {
			box("Nav", () => items(5)).ac("layout-rail");
			box("Article", () => lines(3)).ac("flex-1");
			box("Aside", () => items(3)).ac("layout-rail");
		});

		box("Footer");
	});
};

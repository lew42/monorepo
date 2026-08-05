import { div } from "/app.js";
import { box, lines } from "../parts.js";

export default () => {
	box("Essay", () => {
		div.c("h1", "One column, centred");
		lines(4);
	}).ac("layout-measure");
};

import { div } from "/app.js";
import { box, lines, items } from "../parts.js";

export default () => {
	div.c("flex gap", () => {
		box("Sidebar", () => items(6)).ac("layout-side");
		box("Content", () => lines(4)).ac("flex-1");
	});
};

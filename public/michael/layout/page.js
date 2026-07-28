import { Page, p } from "/app.js";
import flex from "./flex/page.js";
import gap from "./gap/page.js";
import grid from "./grid/page.js";
import containers from "./containers/page.js";

export default new Page({
	meta: import.meta,
	title: "Layout",
	description: "The util layer — flex, gap, grid, and container queries.",
	children: [flex, gap, grid, containers],
	content(){
		p("The `util` layer in `framework.css`. These are the composable building blocks — the same classes work full-width on desktop and inside a narrow card. Open one to see it live.");
		this.previews();
	}
});

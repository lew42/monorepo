import { Page, View, div, p, a } from "/app.js";
import { mount } from "./tool.js";
View.stylesheet(import.meta, "lines.css");

// Container: Imagine's column row; fill the remaining width. Two image panes,
// stacked at 400 and beside each other from 1200; controls above, one doc link below.
// The parent preview says what you can do, rather than explaining the algorithm.
export default new Page({
	meta: import.meta,
	title: "Line art",
	description: "Turn any image into line art: darker pixels mark steadier, straighter edges.",
	icon: "gesture",
	width: "fill",
	index: true,
	content(){
		p("Darker means more likely to be a line. Drop an image or try a sample.");
		const host = div.c("lines-tool");
		mount(host.el);
		a("How the filter works").href("./doc/filter/");
	},
});

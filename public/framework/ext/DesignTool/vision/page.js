import { Page, View } from "/app.js";
import { browse } from "./browse.js";

View.stylesheet(import.meta, "vision.css");

export default new Page({
	meta: import.meta,
	title: "Vision browse",
	description: "Every screenshot a run took — prompt, model, tokens and feedback, with a box to ask more.",
	icon: "visibility",
	classes: "dt-page",   // full width WITH a gutter; .page.full would zero it and strand the title

	content(){
		browse();
	},
});

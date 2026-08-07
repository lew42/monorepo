import { Page, p, div, a } from "/app.js";
import { code, section } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Full",

	// positions me over the window. Staying visible while one of my columns
	// is the leaf needs no class — see styles.css.
	classes: "full",

	// LAZY — neither is fetched until you open one
	children: "left right",

	content(){
		p("I cover the window by **position**, not by hiding anything: `position: fixed; inset: 0`. Nothing on `.app` is set, synced, or unset — check the console, `.app` is still just `class=\"app\"`.");

		code(`
classes: "full",
content(){
    this.$pages = div.c("pages cols");
}`, "full/page.js");

		section("…and columns inside me");

		p("This is the thing one `mode` property could never express. Covering the window and arranging a subtree are answers to different questions, so they live on different elements and never compete.");

		div.c("row", () => {
			a.c("page-link", "left").href("/full/left/");
			a.c("page-link", "right").href("/full/right/");
			a.c("page-link", "← leave").href("/");
		});

		// my region — children land here as equal columns, not beside the sidebar
		this.$pages = div.c("pages cols");
	}
});

import { Page, p, a } from "/app.js";
import { source } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Lazy",

	content(){
		source(import.meta);

		p("I was the string `\"lazy\"` until you clicked. `child(\"lazy\")` found `null` in the Map, worked out my url from my parent's plus my name, and imported me.");

		p("Nobody registered me anywhere. The filesystem is the router: a directory with a `page.js` and a parent that names it is the whole of what makes a url exist.").ac("note");

		p("`child()` is also where `.app` is handed down — on the walk, to the page about to need it. Nothing recurses it over the tree at boot, which is exactly why a name can be a child at all.").ac("note");

		a.c("page-link", "← children").href("/nav/children/");
	}
});

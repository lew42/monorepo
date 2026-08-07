import { Page, p, a } from "/app.js";
import { section } from "../ui.js";
import { source } from "../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "Start here",

	// Seven steps, in order. A section is a path, not a fan-out — every one of
	// these ends by naming the next.
	children: "files second links tree lazy cols next",

	content(){
		source(import.meta);

		p("Nothing to install, no build step, no config file. Three files and a browser. By the end of this you will have a site with a page tree, real urls, lazy loading and a column layout — and you will have typed about forty lines.").ac("note");

		section("The seven steps");

		this.previews();

		p("Walk them in order. Each one adds exactly one idea, and each shows the file that produced it.").ac("note");

		section("Begin");

		a.c("page-link", "Three files  →").href("/start/files/");
	}
});

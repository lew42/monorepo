import { Page, p, a } from "/app.js";
import { code, section } from "../../ui.js";
import { source } from "../../nav/ui.js";

export default new Page({
	meta: import.meta,
	title: "Lazy",

	// Two names. Neither file is fetched until you click.
	children: "one two",

	content(){
		source(import.meta);

		p("You have been writing lazy pages since step 2 — `children: \"one two\"` is a list of names, and a name costs nothing.").ac("note");

		section("Proof, right now");

		code(["one", "two"].map(name =>
			`children.get("${name}")`.padEnd(24) +
			(this.children.get(name) === null ? "null   not imported" : "Page   imported")
		).join("\n"), "read at render");

		p("Open the network panel and click one. That is the moment its `page.js` is fetched — and coming back here will show it as `Page`.").ac("note");

		this.previews();

		section("The other tier");

		p("`children: [one, two]` with real imports at the top of the file loads them with you. Both work at any depth, and each page chooses for itself — there is no global switch.").ac("note");

		a.c("page-link", "An arrangement  →").href("/start/cols/");
	}
});

import { Page, p, a } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../ui.js";
import eager from "./eager/page.js";

export default new Page({
	meta: import.meta,
	title: "children",

	// Both tiers, one line. `eager` arrived with this file; "lazy" is a string
	// until something walks to it.
	children: [eager, "lazy"],

	content(){
		source(import.meta);

		p("A child is either an import or a name. The two compose at any depth and neither is a global switch — each page says what it wants in its own file.");

		section("One Map, three states");

		source("/framework/core/new/1/Page.class.js");

		p("`declare()` builds one `Map` of name → `Page | null`. `undefined` means not mine, so 404; `null` means declared but not loaded, so import it; a `Page` means it is here. Setting an existing key never moves it, so a name keeps its declared position when it resolves.").ac("note");

		section("Which is which");

		this.previews();

		p("The first card reads `Eager` — a title, because that page is in memory. The second reads `lazy` — a name, because nothing has been imported. Open the network panel and click it: `lazy/page.js` is fetched by that click.").ac("note");

		section("Next");

		a.c("page-link", "inline  →").href("/nav/inline/");
	}
});

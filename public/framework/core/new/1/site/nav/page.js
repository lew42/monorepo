import { Page, p } from "/app.js";
import { section } from "../ui.js";
import { source } from "./ui.js";

export default new Page({
	meta: import.meta,
	title: "Navigation primitives",

	// TWELVE names, zero imports. Watch the console: each page.js is fetched by
	// the click that walks to it, never by this load.
	//
	// `links` and `cards` are not called `link` and `preview`, and `dynamic` is
	// not called `route`. A name is not free — /nav/naming/ measures why.
	children: "links replace children inline dynamic container cols tabs full cards chain naming",

	content(){
		source(import.meta);

		p("One mechanism per page, in order, each alone in its smallest form. Nothing here is retyped: every page fetches and shows its own file, so the code you read is the code that ran.").ac("note");

		section("Start at the top");

		this.previews();

		p("The cards read as `links`, `replace`, `children` — lowercase names, not titles. `previews()` is synchronous, so an unvisited child is drawn from the one thing a name already tells us. `/nav/cards/` measures that.").ac("note");

		section("What is not here");

		p("Combinations. A tab set inside a column, a full page holding columns — every one of those is two of these pages and no new mechanism. They belong to the sections that follow.").ac("note");
	}
});

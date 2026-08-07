import { Page, p, a } from "/app.js";
import { code, section, watch } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Flat columns",
	children: "a b",

	// the whole opt-in, and the ONLY file in this subtree that says anything
	classes: "flat",

	content(){
		code(`
classes: "flat",`, "modes/flat/page.js — and nothing in a/ or a/deep/");

		p("Column 1. My children and grandchildren are ordinary `page.js` files — open `a/` and `a/deep/` and you'll find `title` and `content` and nothing else.");

		this.previews();

		section("Compare with 2 · Columns");

		code(`
layouts/column/    classes: "columns"   nested grids   494 | 246 | 245
                   repeated in EVERY file that wants a column

modes/flat/        classes: "flat"      one grid       329 | 329 | 329
                   written ONCE, here`);

		p("Same DOM, same Router, same `activate()`. The difference is four CSS rules.").ac("note");

		section("Switching inside the arrangement");

		p("`a` and `b` are siblings. Moving between them keeps column 1 mounted and swaps only the tail — the same chain diff as any other navigation, just visible side by side.");

		a.c("page-link", "Bare mode →").href("/modes/bare/");

		watch(
			"Open a › Deep — three equal columns, none of which asked for it.",
			"Click b — column 2 swaps, column 1 never moves.",
			"Then Bare: leaving the subtree takes the class with it."
		);
	}
});

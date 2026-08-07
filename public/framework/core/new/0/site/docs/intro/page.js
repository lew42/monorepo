import { Page, p } from "/app.js";
import { code, section } from "../../ui.js";

export default new Page({
	meta: import.meta,
	title: "Intro",

	content(){
		code(`
export default new Page({
    meta: import.meta,
    title: "Intro",
    content(){ … }
});`, "docs/intro/page.js — the whole file");

		p("Column 2. No `mode`, no override, no idea I am a column. `App.mark()` found `\"columns\"` on my parent while walking the chain I was already in.");

		section("Nearest the leaf wins");

		code(`
chain.findLast(p => p.mode) ?? "replace"`, "App.mark()");

		p("`findLast`, not `find` — so a deep page can declare `mode: \"full\"` and take the window even inside a columns topic. Same override direction as CSS itself.").ac("note");
	}
});

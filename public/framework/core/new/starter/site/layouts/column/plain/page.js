import { Page, p } from "/app.js";
import { code } from "../../../ui.js";

export default new Page({
	meta: import.meta,
	title: "plain",
	children: "deep",

	content(){
		code(`
export default new Page({
    meta: import.meta,
    title: "plain",
    children: "deep",
});`, "layouts/column/plain/page.js — the whole file");

		p("Column 2, and an ordinary page. I know nothing about columns — so I am a **switcher**: whatever you open below replaces this text instead of standing beside it.");

		this.previews();

		p("Open Deep and watch: it appears **in place of** my text, not beside it, because I have no `layout` class. Two columns, and the right one is now a switcher.").ac("note");
	}
});

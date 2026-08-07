import { Page, p } from "/app.js";
import { code } from "../../../ui.js";

export default new Page({
	meta: import.meta,
	title: "a",
	children: "deep",

	content(){
		code(`
export default new Page({
    meta: import.meta,
    title: "a",
    children: "deep",
    content(){ … }
});`, "modes/flat/a/page.js — the whole file");

		p("Column 2. No `classes`, no `activate()`, no idea it is a column. My parent's grid reached me because `display: contents` dissolved the wrapper between us.");

		this.previews();

		p("This is the difference that matters: in **2 · Columns** this file would have to repeat `classes: \"columns\"` to keep the drill-down going.").ac("note");
	}
});

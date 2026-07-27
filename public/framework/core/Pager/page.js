import { Page } from "/app.js";
import md from "../../ext/markdown/md.js";

// The proof that ext/markdown works: this page IS readme.md. One source of
// truth — the readme stays readable on GitHub, the page stays in sync for free.
export default new Page({
	meta: import.meta,
	title: "Pager",
	description: "A swap container; ColumnPager is the drill-down layout.",
	content(){
		return md.file(import.meta, "readme.md", { h1: false }); // the Page title is the h1
	}
});

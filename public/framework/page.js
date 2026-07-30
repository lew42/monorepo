import { Page, ColumnPager, md, pre } from "/app.js";
import start from "./start/page.js";
import core from "./core/page.js";
import ext from "./ext/page.js";
import styles from "./styles/page.js";
import util from "./util/page.js";
import dev from "./dev/page.js";

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "A no-build, native-ESM web framework — read the code, get it.",
	col: "narrow", // as a nav column it's a title and a list — 18em is plenty
	children: [start, core, ext, styles, util, dev],

	// This topic renders its whole subtree as drill-down columns. App.load_page
	// calls pager() on the nearest ancestor that defines one; render() below is
	// still just this page's own content, which is what a column shows.
	pager(){
		return new ColumnPager({ root: this, app: this.app });
	},

	content(){

		md("Create `/path/page.js`:");


		pre(`import { p } from "/app.js";

p("Hello world.")`);

		md("That's basically it.");

		this.previews();

		md.details(import.meta, "readme.md", "Design record — open questions & alternatives");
	}
});

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
	pager: ColumnPager,
	col: "narrow", // as a nav column it's a title and a list — 18em is plenty
	children: [start, core, ext, styles, util, dev],
	content(){

		md("Create `/path/page.js`:");


		pre(`import { p } from "/app.js";

p("Hello world.")`);

		md("That's basically it.");

		this.previews();

		md.details(import.meta, "readme.md", "Design record — open questions & alternatives");
	}
});

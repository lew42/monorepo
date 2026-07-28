import { Page, ColumnPager, md, pre } from "/app.js";
import start from "./start/page.js";
import core from "./core/page.js";
import ext from "./ext/page.js";
import util from "./util/page.js";
import dev from "./dev/page.js";

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "A no-build, native-ESM web framework — read the code, get it.",
	pager: ColumnPager,
	col: "narrow", // as a nav column it's a title and a list — 18em is plenty
	children: [start, core, ext, util, dev],
	content(){

		pre(`import { Page, p } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Hello",
    content(){
        p("A page.");
    }
});`);

		md("Save it as `page.js`. Refresh. That's the framework.");

		this.previews();

		md.details(import.meta, "readme.md", "Design record — open questions & alternatives");
	}
});

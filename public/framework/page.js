import { Page, ColumnPager, p } from "/app.js";
import core from "./core/page.js";
import dev from "./dev/page.js";
import util from "./util/page.js";
import ext from "./ext/page.js";

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "A no-build, native-ESM web framework — read the code, get it.",
	pager: ColumnPager,
	children: [core, dev, util, ext],
	content(){
		p("A tiny, no-build web framework: native ES modules served straight from disk — no bundler, no transpile, no config. The docs mirror the code — `framework/core/` (the classes), `framework/dev/` (local dev tooling), `framework/util/` (helpers), `framework/ext/` (opt-in addons) — so a page lives next to what it documents.");
		p("Pick a section from the sidebar. It opens in a column to the right, and its children become the nav for the next level. This is the start of the official docs — rough, and growing.");
		this.previews();
	}
});

import { Page, p, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "MVP",
	description: "Define pager() on a topic.",
	content(){
		p("One method turns a topic into a drill-down: `pager()`. Its descendants stay plain Pages — they never know they're in a ColumnPager.");

		pre(`import { Page, ColumnPager } from "/app.js";
import elements from "./elements/page.js";
import layout from "./layout/page.js";

export default new Page({
    meta: import.meta,
    title: "Docs",
    pager(){ return new ColumnPager({ root: this, app: this.app }); },
    children: [elements, layout]
});`);

		p("That's exactly how `michael/page.js` is defined. When you open `/docs/elements/text/`, `Page.host()` walks up to the topic that owns the pager, the App mounts its ColumnPager, and it reads the URL to render the columns.");

		p("Descendant pages are ordinary — no `pager`, no layout knowledge:");

		pre(`// elements/text/page.js — just content
export default new Page({
    meta: import.meta,
    title: "Text",
    content(){ /* … */ }
});`);
	}
});

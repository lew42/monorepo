import { Page, md, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Page",
	description: "A node: a url, some content, and children.",

	content(){

		pre(`export default new Page({
    meta: import.meta,
    title: "Intro",
    children: "guide api",        // lazy — imported when walked to
    content(){ md("hello"); },
});`);

		md("A `Page` is dormant: constructing one renders nothing, so `export default new Page(…)` is always import-safe. It renders when something places it.");

		md("`children` is one Map with three states — a name that isn't there yet (`null`), a name that is (`Page`), and a name that was never declared (`undefined`, which is a 404 unless `route()` claims it).");
	}
});

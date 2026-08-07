import { Page, p } from "/app.js";
import { code, section } from "../ui.js";
import child from "./child/page.js";

export default new Page({
	meta: import.meta,
	title: "Replace",

	// EAGER — child/page.js was imported at the top of this file, so it arrived
	// with me. Nothing is fetched when you click into it.
	children: [child],

	// Pages with no file of their own. initialize() runs in the constructor, so
	// they are in `children` before the Router could ever walk to them.
	initialize(){
		this.add("inline", () => p("A content function, and nothing else. My url is my parent's plus the name I was given — I never wrote a path."));
		this.add("options", { title: "Inline options", content(){ p("An options object. Same result, room for a title."); } });
	},

	content(){
		code(`
import child from "./child/page.js";
children: [child],`, "replace/page.js");

		p("**Mode 1 · replace**, the default — no `mode` property anywhere in my chain, so `findLast` finds none and falls back.");

		this.previews();

		section("Eager, under a lazy parent");

		p("I was imported lazily (the root declared me as a name), and I import my own child eagerly. The two tiers are a per-page decision, not a global switch — open the console and click through: my child costs **zero** further requests.");

		code(`
/            import /page.js                 1 module
/replace/    import /replace/page.js         + child/page.js, together
/replace/child/                              nothing — already here`);

		section("Pages with no file");

		code(`
initialize(){
    this.add("inline",  () => p("…"));                        // a content function
    this.add("options", { title: "…", content(){ … } });      // options
    this.add("built",   new Page({ … }));                     // a Page you built
}`, "replace/page.js");

		p("`add()` is the only place `parent` is assigned, so a file-backed child and an inline one arrive the same way. `/replace/inline/` and `/replace/options/` are real urls with nothing on disk behind them.").ac("note");
	}
});

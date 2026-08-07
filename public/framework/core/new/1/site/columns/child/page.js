import { Page, p } from "/app.js";
import { code, section } from "../../ui.js";
import grandchild from "./grandchild/page.js";

export default new Page({
	meta: import.meta,
	title: "Column child",

	// EAGER, under a lazily-imported parent — the two tiers nest either way round
	children: [grandchild],

	content(){
		p("Column 2. I declare no `mode` — my parent's `\"columns\"` reached me because `Router.mark()` resolves it from the chain, not from me.");

		code(`
import grandchild from "./grandchild/page.js";
children: [grandchild],`, "columns/child/page.js");

		this.previews();

		section("Lazy above me, eager below me");

		p("I was fetched on demand; my own child came with me. Nothing coordinates those two decisions — each page says what it wants in its own file.");
	}
});

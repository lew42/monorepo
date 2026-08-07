import { Page, p } from "/app.js";
import { code, section } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "About — replace",

	content(){
		code(`
export default new Page({ meta: import.meta, title: "About" });`,
			"the whole opt-in: nothing");

		p("**Mode 1 · replace.** No `mode` property, so `App.mark()` finds none in the chain and falls back to `\"replace\"`. Home is still mounted, one `order` slot to my left — you just can't see it.");

		section("The rule that does it");

		code(`
.page             { display: none; }        /* not in the chain */
.page.active-page { display: block; }       /* the leaf, and only the leaf */`);

		p("Replace has no mode class of its own. It is what's left when neither of the other two applies — the cheapest rung on the ladder.").ac("note");
	}
});

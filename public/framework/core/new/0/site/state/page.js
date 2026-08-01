import { Page, p } from "/app.js";
import { code, section, api, watch } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Keeping state",

	content(){
		code(`
.page:not(.active-page):not(.active-ancestor) { display: none; }`,
			"the only thing that ever takes a page off screen");

		p("Nothing is detached, and there is no option to make it so. A page mounts once and stays mounted; what you can see is decided by CSS, from the classes the Router already maintains.");

		section("Why detaching was never worth it");

		api([
			["render()", "holds this.view forever — detaching frees no memory", "activate()"],
			["display:none", "keeps layout, scroll, focus, media, form values", "the default now"],
			["remove()", "would drop scroll and focus, and free nothing", "(nobody)"],
		]);

		p("That top row is the whole argument. `render()` memoizes the node for the life of the page, so taking it out of the document releases **nothing** — it only throws away state the layout engine was holding for free. There used to be a `keep: true` flag to opt out of detaching; it's gone, because the default it opted out of was simply wrong.").ac("note");

		section("deactivate() does nothing");

		code(`
deactivate(){ return this; }`, "Page.class.js, in full");

		p("There is nothing to undo. The Router drops the page's `.active-*` class a moment later and CSS takes it off screen. Override it only if a page holds something real — a socket, a timer, a playing `<video>`.").ac("note");

		section("Scroll, for free");

		code(`
/nesting/deep/   scrolled to 532
/nesting/     →  0        never visited — opens at the top
/nesting/deep/ →  532      its own scroller, untouched`, "measured");

		p("`overflow-y` is on `.page-content`, so **every page is its own scroll container**. A page you return to is where you left it; a page you have never opened starts at the top. Both are what you'd expect, and neither is implemented anywhere.");

		p("It used to be one shared scroller on the chrome, and the offset bled between pages — leave a long page half way down, arrive half way down the next one. That was never a scroll bug; it was the scroller being on the wrong element.").ac("note");

		section("What the framework deliberately does NOT do");

		code(`
no page.state             a Page is a plain object — put fields on it
no serialize/restore      nothing is destroyed, so there is nothing to restore
no keep-alive list        nothing is ever evicted
no scroll restoration     each page owns its scroller — nothing to restore`);

		p("Every one of those would be a base-class feature paying for a problem the structure already answers.");

		watch(
			"Tabs → type in a box → switch → back. Still there.",
			"Scroll any page half way, go somewhere else, come back. Still there.",
			"Inspect the DOM: nothing was removed — every page you visited is still in it."
		);
	}
});

import { Page, p } from "/app.js";
import { code, section, watch } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Multiple areas",

	content(){
		code(`
render(){
    this.$app = div.c("app", () => {
        this.$left   = div.c("left");        // navigator — files, layers
        this.$center = div.c("center");      // the workspace
        this.$right  = div.c("right");       // properties, contextual
    });
}`, "site/app.js — three areas is just chrome");

		p("Building three areas is easy and needs nothing new. The hard part is that **a url is one path, and one path can only remember one thing.**");

		section("What the url can and can't hold");

		code(`
/doc/42/layer/7/          ONE chain. the router walks it, diffs it, swaps it.   ✓

/doc/42/ + left=layers    a second, independent selection                       ✗
        + right=props     a third                                              ✗`);

		p("`/a/b/c/` is a single sequence of parent→child steps. Two panels changing independently are two sequences, and there is no way to interleave them into one path without inventing a syntax the browser doesn't share.");

		section("So which areas are routed?");

		code(`
ROUTED     one area. the one whose content IS the page you're looking at.
           deep-linkable, Back-able, survives a reload.

NOT        every other area. contextual to the routed one, or local UI state.
           a sidebar filter, an inspector tab, a collapsed panel.`);

		p("This is not a limitation to work around — it's the honest shape of a url. The routed area is the *document*; the rest are *views onto it*.").ac("note");

		section("Which means the layouts you already have are enough");

		code(`
$center     router.active            ← Page + show()/hide(), as documented
$left       a View reading app.router.active.chain()
$right      a View reading app.router.active`);

		p("The left and right areas aren't pages and don't need routing. They're ordinary Views that re-read the active chain whenever it changes — exactly what the sidebar on this site already is. It has no `.parent`, no url, and never appears in a chain.");

		section("The part that isn't solved");

		code(`
left panel selection     survives a reload?    ✗  it isn't in the url
                         survives Back?        ✗  Back only moves the chain
                         two windows differ?   ✓  it's per-window state`);

		p("For a docs site those three answers are fine. For a design tool they're not — and that's the point where the url stops being your application state. **Beyond the url** picks that up.");

		section("If a second area really must be linkable");

		code(`
/doc/42/?panel=layers        a query param: state the router CARRIES but never WALKS`);

		p("One line in `go()` and the layouts read it. Worth knowing it exists; worth resisting until something actually needs it, because every param is a second source of truth about what's on screen.").ac("note");

		watch(
			"The sidebar on this site is already a non-routed area.",
			"Navigate anywhere and watch: no Page.render for it, ever. It's built once in App.render.",
			"Its highlight comes from mark_links() reading the ACTIVE PAGE's url — told, not asking."
		);
	}
});

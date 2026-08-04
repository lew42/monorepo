import { Page, p, div, a, button } from "/app.js";
import { code, section } from "../../ui.js";
import { live } from "../../async/lab.js";

export default new Page({
	meta: import.meta,
	title: "Scroll",

	/* A child that mounts INSIDE me, so I stay on screen as a scrollable
	 * ancestor while it is the leaf. That is the one arrangement that can tell
	 * "reset the leaf" apart from "reset everything that just entered". */
	initialize(){
		this.add("deep", () => {
			p("I am a child of `/state/scroll/`, mounted in its region — so my parent is still on screen, still scrolled, above me.");
			div.c("state-tall", "the parent kept its offset; did it deserve to?");
			a.c("page-link", "← scroll").href("/state/scroll/");
		});
	},

	content(){
		p("`render()` memoizes, so a page you return to keeps its scroll offset. That is true, and it is not the framework doing it.");

		section("Measured first");

		code(`
document.documentElement   scrollHeight 800 === clientHeight 800
                           the document NEVER scrolls. Every .page scrolls
                           itself, because .page { overflow-y: auto }.

history.scrollRestoration  "auto" — and completely inert here, because the
                           thing it restores is the document scroller.

a hidden page              scrollTop reads 0 while display:none, and returns
                           to its old value when displayed again:
                           350 → (hidden) 0 → (shown) 350`,
			"playwright, 1400×800");

		p("So the browser is already doing scroll restoration, for free, and more accurately than we could — note the middle line: at the moment you would have to SAVE the offset, it already reads 0. There is nothing to write down.").ac("note");

		section("The actual bug is the opposite one");

		code(`
                            what happens   what should happen
Back to a page you scrolled    restored        restored     ✓
a fresh CLICK to that page     restored        top          ✗`);

		p("Both restore, because both end in the same `display: none` → `display: block` round trip and the browser cannot tell them apart. So clicking `Async` in the sidebar can drop you halfway down a page you have never scrolled in this visit. Nothing is missing from the framework; one thing is missing from a FORWARD navigation.").ac("note");

		section("Try it");

		live(() => {
			div.c("state-tall", "scroll this page down, then leave and come back");

			div.c("row", () => {
				button.c("async-btn", "leave and return by CLICK").click(async () => {
					await this.app.router.go("/state/stale/");
					await this.app.router.go("/state/scroll/");
				});

				button.c("async-btn", "leave and return by BACK").click(async () => {
					await this.app.router.go("/state/stale/");
					history.back();
				});
			});
		}, "today both buttons land you in the same place — that is the bug");

		section("The proposal");

		code(`
async go(url){
    if (await this.load(url)){
        history.pushState({}, "", url);
        this.scroll_top();          // a forward navigation starts at the top
    } else {
        location.assign(url);
    }
}

/* Back and Forward are NOT this. The browser restores a hidden page's offset
 * when it is shown again — for free, and more accurately than we could, since
 * scrollTop reads 0 the moment the page is hidden. popstate deliberately does
 * not call this. */
scroll_top(){
    this.active?.view?.el.scrollTo(0, 0);
    return this;
}`, "PROPOSAL — Router.js, five lines. VERIFIED by patching it at runtime");

		code(`
scrolled to        400
fresh click back     0   ✓
browser Back       500   ✓
tab switch         the tabs page keeps its 200 — the leaf tab has
                   overflow: visible, so it is not a scroller at all`,
			"measured with the patch applied");

		p("The tab row is the part worth noticing: it needed no special case. A tab child is not a scrolling box, so setting its `scrollTop` is a no-op and the tab group keeps its position — which is what a tab bar should do. The rule falls out of the CSS that was already there.").ac("note");

		section("Why not history.state");

		code(`
Router already pushes an EMPTY state object:

    history.pushState({}, "", url);

so there is a per-entry store sitting unused, and "save scrollTop into it" is
the obvious design. It is the wrong one:

  · redundant — the browser restores the offset without being asked
  · impossible to populate honestly — scrollTop reads 0 once the page is
    hidden, so you must capture BEFORE Router hides anything, which means a
    new call in activate() before the deactivate loop
  · N scrollers per entry, not one — a column arrangement has several, and
    the set changes per arrangement
  · it would fight the browser's restore rather than replace it`);

		p("Recorded as a KEEP verdict: `history.state` stays empty, and scroll restoration stays the browser's job. The only thing we add is the reset the browser cannot infer.").ac("note");

		section("Why the leaf, and only the leaf");

		p("The obvious worry about `scroll_top()` is that it resets one page when several just entered the chain. Scroll this page, then open its child — the child mounts in this page's own region, so this page stays on screen underneath it:");

		div.c("row", () => a.c("page-link", "deep →").href("/state/scroll/deep/"));

		code(`
parent offset before opening the child   250
parent offset after                      250
parent display throughout                block  ← it never left the screen
parent scrollable                        true`, "measured on this page");

		p("That settles it, and not the way I expected. An ancestor that stays on screen was never hidden, so nothing RESTORED its offset — it simply still has it, because you are still looking at it. Resetting that would yank the scroll position of a page the reader never navigated away from. Leaf-only is not a compromise; it is the correct rule.").ac("note");

		code(`
// recorded and REJECTED — resets pages the reader is still looking at
scroll_top(){
    this.entered?.forEach(page => page.view.el.scrollTo(0, 0));
    return this;
}`, "the alternative, and why it is not the proposal");

		section("So: bug, feature, or decision?");

		code(`
feature    keeping the offset on Back. Free, exact, nothing to maintain.
bug        keeping it on a forward click. One line to fix.
neither    an ancestor keeping its offset — it never left the screen.`);

		p("The framework should do one thing and no more: reset the leaf on a forward navigation. Everything else about scroll is already handled by the browser or is not a problem, and the best code here is the code nobody writes.").ac("note");

		// my own region, so `deep` mounts inside me and I stay on screen
		this.$pages = div.c("pages");

		a.c("page-link", "← back to State").href("/state/");
	}
});

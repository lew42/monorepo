import { Page, View, p } from "/app.js";
import { section, file, stage, code } from "../ui.js";

View.stylesheet(import.meta, "baseline.css");

export default new Page({
	meta: import.meta,
	title: "The naive transition",
	classes: "motion motion-naive",

	content(){
		file(import.meta, "baseline.css");

		stage("motion-naive");

		p("Press “swap + measure”. The card appears, `getAnimations()` reports `0`, and computed opacity is already `1` on the first sampled frame. Nothing transitioned. This whole page carries `motion-naive` too, so the navigation that brought you here did the same nothing.").ac("note");

		section("Three reasons, and only the third is interesting");

		code.css(`
1  the leaving element     display: none removes the box. A transition needs a box,
                           so the outgoing fade is cancelled before it can paint.

2  the entering element    it was display: none, so it has NO before-change style.
                           A transition interpolates between two computed values;
                           there is only one.

3  the same frame          Router.activate() mounts the view and Router.mark()
                           adds .active-page with no await between them, so the
                           browser only ever computes style ONCE — at the end.`);

		p("The third is the one people get wrong. Even if `display` were interpolatable, a `requestAnimationFrame` dance would be needed to give the browser two style recalcs — which is what every hand-rolled router does, and what `@starting-style` exists to make unnecessary.").ac("note");

		section("What it is not");

		p("It is not a bug in `Router`, and adding an `await` there would not fix it — the awaits would have to be *between* the mount and the class, inside a method whose no-await guarantee is what makes View Transitions possible at all. The fix is entirely in CSS.").ac("note motion-verdict");

		section("Next");

		p("`/motion/discrete/` — the same four lines plus two more, and it works.").ac("note");
	},
});

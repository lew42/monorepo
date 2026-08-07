import { Page, p, div, details, summary } from "/app.js";
import { section, file, code } from "./ui.js";

export default new Page({
	meta: import.meta,
	title: "Motion",
	classes: "motion",

	children: "baseline discrete view-transitions direction arrangements release reduced head-start",

	content(){
		code.css(`
.page             { display: none; }    /* not in the chain */
.page.active-page { display: block; }   /* the leaf */`);

		p("The entire arrangement vocabulary, and the hardest thing in CSS to animate: `display` is not interpolatable, an element that is `display: none` has no box to animate from, and `Router.activate()` applies both classes in one synchronous frame with no awaits.").ac("note");

		section("The verdict");

		code.css(`
entry motion      ZERO changes.  @starting-style + transition-behavior: allow-discrete
exit motion       ONE line, in the SITE stylesheet:  .pages { position: relative }
direction         ZERO changes — an ext patches Router.activate() from outside
per-arrangement   ZERO changes — motion is an inert class, exactly like .cols and .full
release           ZERO changes — deactivate() already exists and already fires
reduced motion    ZERO changes — two custom properties and one media query`);

		p("Every page below shows the code that produced it, and every measurement was taken with `getAnimations()` and a screenshot burst rather than by looking.").ac("note motion-verdict");

		section("Why no awaits is the good news");

		code.fn(() => {
			// Router.activate() — the comment says it is about a console group.
			// It is also the exact precondition document.startViewTransition() needs.
			from.slice(shared).reverse().forEach(p => p.deactivate());
			to.slice(shared).forEach(p => p.activate());
		});

		p("A View Transition wraps a synchronous DOM mutation. Most routers have to be torn apart to produce one; this one already is. The import is awaited in `load()`, and everything the DOM sees happens in a single frame.").ac("note");

		section("Read in order");

		this.previews();

		section("The contract being animated");

		details(
			summary("site/styles.css — the rules every page here fights"),
			file(import.meta, "../styles.css"),
		);

		file(import.meta, "motion.css");
	},
});

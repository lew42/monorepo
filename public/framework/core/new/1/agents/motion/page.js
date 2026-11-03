import { Page, p, h2, table, thead, tbody, tr, th, td, code } from "/app.js";
import "/framework/ext/highlight/highlight.js";

const section = title => h2.c("section", title);

export default new Page({
	meta: import.meta,
	title: "Motion — the Choreographer's report",

	content(){
		code.css(`
entry motion      ZERO changes.  @starting-style + transition-behavior: allow-discrete
view transitions  ZERO changes.  Router.activate() is already synchronous
direction         ZERO changes.  an ext patches activate() from outside
per-arrangement   ZERO changes.  motion is an inert class, exactly like .cols and .full
release           ZERO changes.  deactivate() already exists and already fires
reduced motion    ZERO changes.  two custom properties and one media query

exit motion       ONE LINE, and it is in site/styles.css, not the framework:
                  .pages { position: relative }`, "the verdict");

		p("`Page`, `Router` and `App` need no change to animate. The one line that is needed is a site stylesheet rule, it is inert, and I measured that it is inert. Everything below was taken with `getAnimations()`, `getComputedStyle()` and screenshot bursts in Chromium 151.0.7922.34 at 1400×800 — 24 routes, zero console errors, zero horizontal overflow.").ac("note motion-verdict");

		p("Pages: `/motion/` and eight children. Every one shows the code that produced it.").ac("note");

		section("Why this framework is unusually easy to animate");

		code.js(`
// Router.activate() — the comment is about a console group.
// It is also the exact precondition document.startViewTransition() requires.
// no awaits past this point, so the group is guaranteed to close
from.slice(shared).reverse().forEach(p => p.deactivate());
to.slice(shared).forEach(p => p.activate());`);

		p("Most routers must be taken apart to produce a synchronous DOM mutation. This one already has one, and the import is awaited in `load()`, safely outside it. The single most valuable property for motion in this codebase was added for an unrelated reason and must not be given up.").ac("note");

		section("1. The baseline — a naive transition does nothing");

		code.css(`
.page.motion-naive            { opacity: 0; transition: opacity .32s; }
.page.motion-naive.active-page { opacity: 1; }

measured, 14 frames:   getAnimations() 0    computed opacity 1.00 on every frame`);

		p("Three reasons, and only the third is interesting: the leaver's box is removed by `display: none`; the enterer has no before-change style because it was `display: none`; and `activate()` + `mark()` run in one task, so the browser computes style exactly once, at the end. Even an interpolatable `display` would not save it.").ac("note");

		section("2. @starting-style + allow-discrete — the finding");

		code.css(`
.page.motion-fade {
    opacity: 0;
    transition: opacity var(--motion-dur) var(--motion-ease),
                display var(--motion-dur) allow-discrete;
}
.page.motion-fade.active-page { opacity: 1; }
@starting-style { .page.motion-fade.active-page { opacity: 0; } }`);

		code.css(`
entry   getAnimations ["opacity"]              opacity 0.00 → 0.89 over 10 frames
exit    getAnimations ["display","opacity"]    opacity 1.00 → 0.03 over 217ms
        the leaver keeps display: block for the whole fade`);

		p("Support is real but young: Chrome 117 (Sep 2023), Safari 17.4–17.5 (spring 2024), Firefox 129 (Aug 2024). Baseline *newly* available, not yet widely. Every rule degrades to today's behaviour, so an older browser gets a correct page with no fade — which is the right way round for decoration.").ac("note");

		section("…and the one thing CSS alone cannot do");

		p("`display: none` does two jobs. `allow-discrete` fixes visibility; it does nothing about **layout**. A page fading out is still laid out, and `.pages` is a flex row.").ac("note motion-warn");

		code.css(`
with    .pages { position: relative }  and  the leaver at position: absolute
        IN  w1160 x240        OUT w1160 x240      ← same box, a real cross-fade

without
        IN  w 553 x240        OUT w 607 x793      ← two pages sharing the row`);

		section("REQUEST 1 — one line, and I measured that it changes nothing");

		code.css(`
/* site/styles.css, in @layer theme, beside the .pages rule that is already there */
.pages { display: flex; flex: 1 1 auto; min-width: 0; min-height: 0; position: relative; }`);

		code.css(`
.page.full covering the window, before  1400x800 @0,0
.page.full covering the window, after   1400x800 @0,0      ← identical`);

		p("`position: relative` does not create a containing block for `position: fixed`, so `.full` is untouched. Measured, not reasoned. Without it, `/motion/discrete/` scopes the same rule with `.pages:has(> .page.motion-fade)` — a workaround for not owning the file, and it should be deleted the day this lands.").ac("note");

		section("REQUEST 2 — one word, so a full page can animate out");

		code.css(`
/* today — the positioning is keyed on being the leaf */
.page.full.active-page,
.page.full.active-ancestor { position: fixed; inset: 0; z-index: 10; … }

/* the instant it stops being the leaf it stops being fixed, drops back into
   whatever grid it nominally lives in, and fades out from there */

.page.full { position: fixed; inset: 0; z-index: 10; … }`);

		p("A `.full` page that is `display: none` is not rendered, so the qualifiers buy nothing today and cost the exit everything. With the qualifiers dropped, `full` becomes the only arrangement whose exit is free: measured `[display, opacity, scale]` with `position: fixed` held for the whole fade, no positioned container needed.").ac("note");

		section("3. View Transitions — nothing needed, and here is the exact shape");

		code.fn(() => {
			// App does `new Router(this.router, { app: this })` and Router's
			// constructor is Object.assign-based, so an own-property `activate` on
			// the config object shadows the prototype. This works TODAY.
			new App({
				router: {
					activate(page){
						return document.startViewTransition
							? document.startViewTransition(() => Router.prototype.activate.call(this, page))
							: Router.prototype.activate.call(this, page);
					},
				},
			});
		});

		code.css(`
measured, wrapping the live router:
  ::view-transition-group(root) | ::view-transition-new(root)
  ::view-transition-old(root)   | ::view-transition-old(motion-page)
  present frames 2–19 (~290ms), matching the declared .3s`);

		p("The only wart is `Router.prototype.activate.call(this, page)` — an override with no `super`. If that is worth one line, make the Router class a config value; it buys `super` and nothing else.").ac("note");

		code.js(`
// App.load(), today
this.router = new Router(this.router, { app: this });

// with a class-valued option
this.router = new (this.Router ?? Router)(this.router, { app: this });`);

		p("I recommend **not** adding a `transition(swap){ return swap(); }` seam to `Router`. An empty hook is API surface forever and buys nothing the assign constructor did not already give away. Record the trick in the readme instead.").ac("note motion-verdict");

		section("4. Direction — free today, one line to stop paying twice");

		code.css(`
deeper   deep/ → deep/deeper/          data-direction=deeper   translate  24px
back     deep/deeper/ → deep/          data-direction=back     translate -24px
across   deep/deeper/ → wide/further/  data-direction=across   translate  0 24px`);

		p("`Router.activate()` computes `from`, `to` and `shared`, uses them, and drops all three. An ext can recover the word today by recomputing the same diff one stack frame up — which is exactly what `/motion/direction/` ships, and exactly what makes the case for putting it in core.").ac("note");

		code.js(`
// Router.activate(), one line after \`shared\`
this.app.$pages.attr("data-direction", this.direction(from, to, shared));

// Subtraction, not bookkeeping: nothing is remembered, so nothing goes stale.
direction(from, to, shared){
    if (!from.length) return "cold";              // first paint, nothing to move away from
    if (from.length === shared) return "deeper";  // only added segments
    if (to.length === shared) return "back";      // only removed segments
    return "across";                              // swapped a branch
}`);

		code.css(`
+  one method name on Router          direction(from, to, shared)
+  one attribute name                 .pages[data-direction]
+  one claim the tier does not make   "how you got here", not just "where you are"

−  no state, nothing to unset, nothing to resolve, no new page property`);

		p("The third line is the real cost. `new/1`'s boast is that this tier writes two classes and a link pass, and that every arrangement is CSS someone opted into by name. `data-direction` is a third assertion and it is about the *journey*, which is a new kind of claim. My recommendation is **yes for motion, and only for motion** — if nothing else ever reads it, an ext is the honest home.").ac("note motion-verdict");

		p("An attribute, not a class: a class needs `rc(\"deeper back across cold\")` to clear, which is the remembered-list smell that killed `mode`. One overwritten attribute cannot desynchronise. Dissent noted below.").ac("note");

		section("5. Per arrangement — motion is a class, like .cols and .full");

		code.js(`
classes: "motion motion-col"      // a column that slides in
classes: "motion motion-tab"      // a tab that drops in
classes: "motion motion-cover"    // a full page that scales up`);

		table.c("motion-table", () => {
			thead(tr(th("arrangement"), th("entry"), th("exit"), th("measured")));
			tbody(() => {
				tr(td("replace"), td("free"), td("REQUEST 1"), td("with: both pages w1160 x240. without: w553 / w607"));
				tr(td("columns"), td("free"), td("don't"), td("first w540 / second w540 held constant while second faded in from 19.7px"));
				tr(td("tabs"), td("free"), td("one scoped line"), td("entry from −9.6px; a block panel stacks the leaver above the arriver"));
				tr(td("full"), td("free"), td("REQUEST 2"), td("[display, opacity, scale], position fixed held throughout"));
			});
		});

		p("Entry motion is free in every arrangement with no framework change. Exit cost is decided entirely by how that arrangement removes a page from layout — which is a property of the CSS, not of `Router`. Columns is the interesting no: a leaving grid item takes a third track and resizes the columns you are reading, so drill-down wants entry-only, and entry-only needs no base state at all.").ac("note");

		section("6. deactivate() — the numbers");

		code.css(`
two pages, identical except one method, after 1 second away:

                    setInterval   rAF frames   running
no deactivate()       12 → 22        134        true      ← still burning the main thread
with deactivate()      5 →  5         30        false

a CSS animation, same test:
  page visible   getAnimations() → [motion-spin 417ms running]
  page hidden    getAnimations() → []`);

		p("The last pair is the one worth knowing: a CSS animation on a hidden page is not paused, it does not exist, and it restarts from zero. So CSS motion needs no release hook at all — one more reason to prefer it to a JS loop in this framework specifically.").ac("note");

		p("The default is right and should not change. `Page.render()` memoizing is what makes Back instant and keeps a half-typed input half-typed; the leak is the price of that, and `deactivate()` is where you pay it. The ordering — deepest-first, before anything activates — means a page releasing a resource cannot collide with a page acquiring it.").ac("note motion-verdict");

		p("One gap, left alone deliberately: nothing calls `deactivate()` on unload. A page holding a server-side session has no hook, and adding a `beforeunload` listener to `Router` would put a site's problem in the framework.").ac("note");

		section("7. Reduced motion — a token, not a blanket");

		code.css(`
.page.motion { --motion-dur: .32s;  --motion-shift: 1.5rem;
               --calm-dur:   .12s;  --calm-shift:   0rem; }

@media (prefers-reduced-motion: reduce) {
    .page.motion { --motion-dur: var(--calm-dur); --motion-shift: var(--calm-shift); }
}`);

		code.css(`
no preference   --motion-dur .32s   --motion-shift 1.5rem   ["opacity 320ms","translate 320ms"]
reduce          --motion-dur .12s   --motion-shift 0rem     ["opacity 120ms"]`);

		p("The translate transition is not shortened, it is never created — its endpoints are identical. That is the correct reading of the preference: `prefers-reduced-motion` is about vestibular triggers, so the movement goes and the fade stays. The usual blanket rule spends `!important` on a decision a custom property makes for free, and reaches every element on the page including other people's work.").ac("note motion-verdict");

		p("One exception, and it is deliberate: a spinner slows to 3s rather than stopping, because it is telling you something is happening.").ac("note");

		section("8. The idea nobody asked for — the click starts the transition, not the load");

		code.js(`
async load(url){
    this.app.$pages.ac("navigating");           // + the click has happened
    const page = await this.load_segments(url);
    this.app.$pages.rc("navigating");           // + the module has arrived

    if (page) this.activate(page);
    …
}`);

		code.css(`
measured — "was the class present at the next animation frame", i.e. did the browser paint it:

  during a cold import (700ms top-level await)   painted: TRUE     total 1305ms
  during a warm navigation                       painted: FALSE    total    0ms`);

		p("`Router.load()` awaits a dynamic import and, for the whole of that await, nothing on screen changes. The reader has committed and the app's answer is stillness, for a duration nobody controls. Lazy loading is the headline feature of `new/1` and this is the moment its bill arrives.").ac("note motion-verdict");

		p("The property that makes it worth doing: when the walk resolves in microtasks — most navigations — the class goes on and off inside one task and the browser never paints it. No timer, no duration to tune, no minimum, and it cannot ever be the slow part. It costs nothing exactly when there is nothing to hide.").ac("note");

		p("`load()` and not `click()`, because `load()` is the one gate both `go()` and `popstate` pass through, and it is the method that owns the await.").ac("note");

		p("Rejected, and it sounds better: starting a real exit animation at click time and swapping when the load lands. If the import beats the animation you have *added* latency to look busy, and every fast navigation pays for one slow one.").ac("note");

		section("BUGS I FOUND THAT ARE NOT ABOUT MOTION");

		p("These affect every seat, and I would fix the first one before shipping anything.").ac("note motion-warn");

		section("BUG 1 — a lazy page's stylesheet is not applied on its first render — APPLIED");

		code.css(`
cold first visit to a page that ships a stylesheet:
  <link> in document.styleSheets at swap   false
  getAnimations()                          []
  computed opacity                         1.00 on every frame   ← rendered UNSTYLED

with \`await this.app.loaded()\` before activate():
  <link> in document.styleSheets at swap   true, 2 rules
  getAnimations()                          ["opacity","translate"]
  computed opacity                         0.00 → 0.82`);

		code.js(`
// Router.load()
async load(url){
    const page = await this.load_segments(url);

    if (page){
        await this.app.loaded();     // ← one line; App already has this method
        this.activate(page);
    }
    else console.log(\`router.load("\${url}") — 404, nothing resolves it\`);

    return !!page;
}`);

		p("This is a FOUC on every lazily-imported page that ships CSS, not a motion problem — motion is just what made it visible, because a missing animation is louder than a missing margin. `View.stylesheet()` appends the `<link>` during the module import, and `activate()` renders before it has loaded. `App.loaded()` already exists and already means exactly this.").ac("note");

		p("Two caveats, both real. The await is in `load()`, before `activate()`, so `activate()` stays synchronous and the View Transitions story is untouched — this must stay that way. And `app.loaders` is an array that only grows, so awaiting it on every navigation is O(total loaders); they are all settled, so the cost is a microtask, but a narrower `Promise.all(View.stylesheets)` would do the same job.").ac("note");

		p("Applied by the owner in `Router.load()`, with the reasoning in the comment. Re-verified after the change: a cold first visit now animates, so this section is history rather than a request.").ac("note motion-verdict");

		section("BUG 2 — Router.mark() owns two class names document-wide");

		code.js(`
this.root().querySelectorAll(".active-page, .active-ancestor")
    .forEach(node => node.classList.remove("active-page", "active-ancestor"));`);

		p("Any component anywhere inside `$app` that uses `.active-page` or `.active-ancestor` for its own purposes is silently stripped on every navigation. I hit this building an in-page demo and renamed to `.showing`. Worth one sentence in the readme: those two words belong to the Router.").ac("note");

		section("BUG 3 — the visibility contract has two clauses, and motion must mirror both");

		code.css(`
.page.active-page                            { display: block }
.page.active-ancestor:has(.page.active-page) { display: block }`);

		p("A recipe that mirrors only the first gets drill-down wrong, silently: the page you drilled *from* is an `.active-ancestor` that does not contain the leaf, so it stays in the flex row and squeezes the arriving page into a strip. My own stylesheet shipped that bug and numbers did not catch it — a screenshot did.").ac("note motion-warn");

		p("A cheap prevention would be for `styles.css` to name the shown state once, so a recipe has one selector to copy rather than two clauses to remember.").ac("note");

		code.css(`
.page:is(.active-page, .active-ancestor:has(.page.active-page)) { display: block; flex: 1 1 auto; }`);

		section("GOTCHA — a transform on .pages silently breaks .full");

		code.css(`
.page.full covering the window                        1400x800 @0,0
…with  .pages { translate: 0px }                      1080x112 @280,530`);

		p("A transform, filter, perspective, `will-change` or `contain` on any ancestor makes it the containing block for `position: fixed` descendants. Any future motion on `.pages` itself — a page-level slide, a parallax — breaks `/full/` and does it without an error. This is the strongest argument for animating the pages and never the container.").ac("note motion-warn");

		section("Dissent, recorded");

		code.css(`
1  direction in core is a THIRD thing the tier writes, and the first that
   describes the journey rather than the position. An ext has it today at the
   cost of recomputing one cheap diff. If nobody but motion reads it, keep it out.

2  .navigating is also a third DOM write, and it makes the app admit it is
   waiting. Some designers will call that worse than a freeze. I disagree, but
   the objection is real and it is a taste question, not a technical one.

3  attribute vs class for direction — I chose an attribute because a class needs
   a removal list. Anyone preferring classes must accept rc("deeper back across cold").

4  the :has() scoping in discrete.css and direction.css is a workaround for not
   owning site/styles.css. If REQUEST 1 lands, delete it; it is not a pattern.

5  I did not import ext/markdown, so prose here uses p() backticks like every
   other page in this sub-site rather than md(). Consistency with six sibling
   seats beat the house rule; say the word and I will switch.`);

		section("How every page shows the code that produced it");

		code.js(`
file(import.meta, "discrete.css")     // the stylesheet, FETCHED from the url the browser loaded
code.fn(() => { … })                  // real code the IDE checks, stringified, never run
code.css(\`…\`) / code.js(\`…\`)          // a proposed diff for a file that is not mine
demo/stage                            // a rendered result, with its own measurement button`);

		p("Motion is mostly CSS, and CSS retyped into a template string is a second copy that drifts the first time somebody tunes a duration. So each page keeps its animation in its own stylesheet, loads it with `View.stylesheet(import.meta, \"x.css\")`, and prints it with `code.file(import.meta, \"x.css\")`. Same url, same bytes, no extraction, nothing to keep in sync — and a stale example is impossible rather than merely unlikely.").ac("note motion-verdict");

		p("The pages carry live probes rather than quoted numbers wherever they can: “swap + measure” samples `getAnimations()` and computed opacity in the reader's own browser, and `/motion/discrete/` prints that browser's real feature support instead of a table I would have to maintain.").ac("note");

		section("THE MOTION CONTRACT");

		p("Four things a reader must remember before animating anything here. Everything else in this report is evidence for one of them.").ac("note motion-verdict");

		code.css(`
1 — "DISPLAYED" HAS TWO CLAUSES. Mirror both, or drill-down breaks silently.

.page.active-page                            { display: block }
.page.active-ancestor:has(.page.active-page) { display: block }

so the page on its way out is:

:not(.active-page):not(.active-ancestor:has(.page.active-page))`);

		p("A recipe that mirrors only the first clause gets the drill-down case wrong: the page you drilled *from* is an `.active-ancestor` that does not contain the leaf, so it stays in the flex row and squeezes the arriving page into a strip. This section's own stylesheet shipped that bug. Every opacity and duration was correct, so the numbers looked right — a screenshot caught it.").ac("note motion-warn");

		code.css(`
2 — ENTRY MOTION IS FREE. EXIT COSTS ONE LINE, because display: none is not
    only invisibility, it is REMOVAL FROM LAYOUT.

.pages   { position: relative }              /* the container */
<leaver> { position: absolute; inset: 0 }    /* the page on its way out */

with      both pages w1160 x240      a real cross-fade
without   w553 x240 / w607 x793      two pages sharing the flex row`);

		code.css(`
3 — NEVER PUT A TRANSFORM ON A CONTAINER. Animate the pages, never .pages.

A transform, filter, perspective, will-change or contain on any ancestor makes
that ancestor the containing block for position: fixed descendants — which is
exactly how .full covers the window.

.page.full covering the window        1400x800 @0,0
…with .pages { translate: 0px }       1080x112 @280,530

position: relative is safe — measured identical. Nothing else is, and it fails
with no error and no warning.`);

		code.js(`
4 — .active-page AND .active-ancestor BELONG TO Router.mark().

this.root().querySelectorAll(".active-page, .active-ancestor")
    .forEach(node => node.classList.remove("active-page", "active-ancestor"));

That runs over the whole of $app on every navigation, so any component using
either name for its own state is silently stripped. Pick your own word — the
demos here use .showing.`);

		section("Files");

		code.css(`
site/motion/page.js  motion.css  ui.js
        baseline/    the naive transition, and why it does nothing
        discrete/    @starting-style + allow-discrete — the finding
        view-transitions/  wrap.js — an opt-in patch, removed by deactivate()
        direction/   direction.js — deeper / back / across / cold
        arrangements/  columns, tabs and full, three different motions
        release/     ticker.js — what leaks, and what stops by itself
        reduced/     two tokens and one media query
        head-start/  slow/ — a module with a real 700ms top-level await`);
	},
});

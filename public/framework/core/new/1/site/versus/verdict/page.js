import { Page } from "/app.js";
import { code, section } from "../../ui.js";
import { verdict, ledger, measured, note } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "The verdict",

	content(){
		verdict("Use it when every screen is a url, the content is static, and you would rather read the whole framework than trust one. Do not use it when the page must exist without JavaScript, when data loading is a real problem, or when anything on screen is not a url. It is the best small navigation design I have compared, and it is small because it declined problems, not because it solved them cheaply.");

		section("Genuinely good for");

		ledger(["fits", "why, specifically"], [
			["**Documentation sites and design systems**", "The url *is* the state, the tree is the information architecture, and the visit distribution is long-tailed — so laziness pays on almost every load. This is the case the whole design was shaped by, and it shows."],
			["**Static hosting with no pipeline**", "Adding a page to a *deployed* site is uploading one file and editing one `children` string. No rebuild, no manifest, no redeploy of anything else. Nothing else in the field does this."],
			["**Anything that must be readable end to end**", "290 lines, three classes, one afternoon. Measured against `core/App`+`Page`+`Pager` at 348 lines and against View's 492, the *tier you have to understand to use it* is genuinely the small one."],
			["**Content trees deeper than they are wide**", "`container()` and `.cols` make depth free. `grid-auto-flow: column` grows a track per level with no declared count, and `:nth-last-child(of S)` caps it when you want it capped."],
			["**Long-lived screens with DOM state**", "Pages are built once and never rebuilt. Scroll position, focus and half-typed inputs survive navigation *by construction* — verified across sets, across columns, and through an overlay. Most frameworks buy this back with effort."],
		]);

		section("Genuinely bad for");

		ledger(["does not fit", "why, and how bad"], [
			["**Anything needing HTML without JS**", "`index.html` is a shell; every route renders client-side. A crawler or reader without JS sees an empty page. **Disqualifying, not a trade-off** — and for a docs site, which is the best fit above, this is a real tension."],
			["**Data-driven applications**", "There is no loader, no cache, no per-route error boundary, no retry, no cancellation. Every page invents its async story by hand, and the `/async/` section is 12 urls long because inventing it correctly is genuinely hard."],
			["**Anything on screen that is not a url**", "A modal over the previous page, a wizard you can back out of, a lightbox, a carousel. One url means one arrangement. Next's intercepting routes exist for this; new/1 has no answer and the `Pager.show()` that could have faked it was deleted."],
			["**Deep urls over slow networks**", "Measured: 8 segments = 8 modules, and 7 of 7 hops began strictly after the previous response. Depth × RTT, serially, before first paint. Fixable, unfixed."],
			["**Teams large enough to need guardrails**", "No types, no build step, therefore no build-time check. A typo in `children: \"intro guide\"` is a 404 on a click, possibly in production. The route tree exists nowhere you can read it."],
			["**Browsers older than about Dec 2023**", "`:has()` is load-bearing for the single most important rule in the stylesheet. Firefox 121 is the floor. There is no graceful degradation — the arrangement is simply wrong."],
		]);

		section("What you would have to know to recommend it");

		code(`
1  IS EVERY SCREEN A URL?
   Yes  -> strong fit; this is the whole thesis.
   No   -> the model fights you on the first modal, and it will not stop.

2  DOES ANYTHING NEED TO WORK WITHOUT JAVASCRIPT?
   Yes  -> stop. Not a trade, a disqualification. Look at Astro.

3  WHERE DOES THE DATA COME FROM?
   Static / in the module   -> fine, and the laziness is free.
   A network per page       -> you are building the loader yourself, per page.

4  HOW DEEP ARE THE URLS, AND HOW SLOW IS THE NETWORK?
   depth x RTT is your cold-load floor. 3 levels on fibre is nothing.
   6 levels on 3G is six round trips before anything paints.

5  HOW MANY PAGES, AND HOW LONG IS THE TAIL?
   Many pages, rarely visited -> laziness pays every load. Best case.
   Few pages, all visited     -> laziness buys nothing; you paid for it anyway.

6  WHO MAINTAINS IT IN TWO YEARS?
   Someone who can read 290 lines -> this is the only option on the list
   that lets them read ALL of it.
   A rotating team of twelve      -> you want the build-time checks.`);

		section("The three things I would fix before recommending it to anyone");

		code(`
1  A post-navigation seam.  Six seats found it missing independently, which is
   the strongest signal this council produced. Build it as TWO things — an
   overridable Page seam and one Router-level call — or it becomes an option.

2  Carry the query string.  Two lines. Today Router.click() silently deletes
   what an author typed into an href, which is worse than not supporting it.

3  Say that an undeclared page.js is a 404.  Measured, and it contradicts the
   sentence in CLAUDE.md that everyone quotes. Not a bug — a real trade for
   real benefits — but it is the design's most surprising rule and it is
   currently written down as the opposite.`);

		section("The comparison that actually settles it");

		measured("what a maintainer has to hold in their head", `
                        classes  lines  concepts a topic must know
new/1                      3      290   $pages · a class name              = 2
core/ + Pager tier         5      348   pager() · host() · leaf() · root ·
                                        Pager · col · load_ancestors ·
                                        classify() · Sidebar               = 9
Next app router            —        —   layout · loader · route group ·
                                        parallel · intercepting · server
                                        vs client component · streaming    = 7+`);

		note("That middle row is the honest comparison, because both sides sit on the same `View` and solve the same problem for the same site. **new/1 replaced nine concepts with two and lost one feature** — the per-topic sidebar, which it lost to laziness rather than to layout. That is the trade, and it is a good one.");

		section("Final");

		note("The strongest evidence for this design is not any measurement on these eight pages. It is that thirteen other seats spent a session building ~15,000 lines against it — ten compound recipes, forty-nine live layouts, five levels of nesting, a hundred urls — and produced **nineteen** ranked requests of which exactly **two** add public surface to the three classes. Everything else is behaviour that was already wrong, CSS, or a log line. A framework that survives that much use while growing by two methods is a framework whose boundaries were drawn in the right place.");

		note("It is also, by the same evidence, a framework that has never met a database, a search engine crawler, or a designer who wants a modal. Judge it on the first paragraph, not the last.");
	}
});

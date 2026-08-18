import { Page, p, a, div } from "/app.js";
import { code, section } from "/ui.js";

/* The Metrologist's report.
 *
 * Tables here are monospace blocks, not <table>s, and that is deliberate: this
 * file is read as source at least as often as it is rendered, and a report that
 * needs a stylesheet to be legible is a report that can be misread. The LIVE
 * instruments are at /perf/ — every number below can be reproduced by pressing
 * a button there, next to the code that produces it.
 */
export default new Page({
	meta: import.meta,
	title: "Cost — the measurements",

	content(){
		code(`
machine     Intel i7-14700K, 20C/28T, 32GB, Windows 11
browser     Chromium via Playwright 1.62.1, fresh context per cold sample
server      the running dev server on :8300 — no second server was started
latency     Network.emulateNetworkConditions at 0 / 50 / 150 ms, 10 Mbps
samples     medians, n stated per table; never a single sample
disclosed   the harness stubs WebSocket to disable LiveReload. It reloaded the
            browser mid-run once and destroyed a 20-minute measurement. It is
            also dev-only, so removing it makes these numbers production-shaped.`,
			"conditions — read these before any number below");

		section("Every claim in the readme's Measured block");

		code(`
CLAIM                                                MEASURED                       VERDICT
/ = 1 module                                         1 page.js (9 js total)         HOLDS
/columns/child/grandchild/ = 4                       exactly 4, its own chain       HOLDS
replace/, tabs/, full/ never touched                 absent from the request log    HOLDS
columns 360 | 360 | 360 equal tracks                 360@280  360@640  360@1000     HOLDS
full 1400@0 covering the window                      1400@0                         HOLDS
.app class is still just "app"                       class="app"                    HOLDS
inline /replace/inline/ + /replace/options/          real urls, 3 modules, no files HOLDS
404 renders with the chrome intact                   sidebar + 21 nav links         HOLDS
/dynamic/N/ = two imports, any N                     2, for N = 42 and N = 499      HOLDS
tab labels identical from 4 entry points             "Overview api guide" x4        HOLDS
no horizontal overflow on any route                  0 of 25 routes overflow        HOLDS
no console errors on any route                       0, except the 404 route        CLARIFY
/tabs/state/ = 2 modules (root, tabs)                3 — root, tabs, OVERVIEW       REFUTED
redirect /tabs/ -> /tabs/one/; Back lands on /       no redirect exists              STALE`,
			"claim / measured / verdict — 14 claims, 12 hold");

		p("Two corrections, both small and both worth making. `/tabs/state/` costs three modules, not two: `tabs()` always imports its first tab so the group's own url renders something — which the readme explains correctly two sections further down, so only the Measured block is wrong. The `redirect` line describes a feature the same readme records as backed out.").ac("note");

		p("The 404 clarification: `/no-such-thing/` does print to the console, because `App.error()` calls `console.error` on purpose. Nothing throws unhandled. The claim is true; the wording should say “no unhandled errors”.").ac("note");

		section("1. The serial walk — RTT plus 16 ms, per url segment");

		code(`
ms of walk (window.app assigned -> app.ready), median of n=5, cold each time

depth  route                    0ms lat   50ms lat   150ms lat
  1    /                           15.9       77.0       173.0
  3    /perf/walk/                 95.9      395.6       869.7
  5    /perf/walk/a/b/            126.3      548.9      1216.1
  8    /perf/walk/a/b/c/d/e/      173.4      789.4      1737.4

cost of one more segment          15.6       79.4       173.8      (fit over d3..d8)
as a multiple of RTT                 —        1.6x        1.16x`,
			"live at /perf/walk/ — the waterfall is read from resource timing");

		p("The model is `RTT + 16 ms` per segment, and it is linear with no surprises. A five-deep url on a 150 ms connection spends 1.7 seconds walking. On localhost it spends 173 ms. This is the price of “the filesystem is the router, with no manifest”, and it is paid on cold deep links and on any jump of more than one segment — not on ordinary click-by-click navigation, which imports exactly one module.").ac("note");

		code(`
IT CANNOT BE PARALLELISED BLINDLY, and the reason is not incidental:

    /a/b/  ->  root.child("a")   must RUN before "b" is known to be legal
           ->  a.child("b")

A url is a path through a tree the client has not seen. Speculating on /a/b/
is right whenever the url resolves and wrong whenever a parent claimed the
segment with route() — and route() is used in about twenty pages here, so the
wrong case is not rare.

VERDICT: do not speculate on the boot walk. DO speculate on hover, where the
user has already made the guess. See proposal R2.`, "the honest problem");

		section("2. Laziness — verified, and it survived contact with real content");

		code(`
page.js modules fetched on a COLD load, per section, after every seat landed

/nav/                                  3      /library/                       2
/nav/children/lazy/                    8      /chrome/                        2
/compound/                             3      /patterns/                      2
/compound/tabs-in-a-column/what/deeper 7      /patterns/docs/guide/…/batches/ 6
/deep/                                 2      /motion/                        2
/deep/nesting/a/b/c/d/e/               8      /a11y/                          2
/deep/scale/                           3      /perf/                          2

EVERY ONE equals the length of its own chain. No section imports a sibling.
0 console errors and 0 horizontal overflow across all 15 sections.`,
			"live at /perf/lazy/ — press the button to watch laziness die on purpose");

		p("This is the strongest result in the report. Laziness usually dies quietly once real content arrives; here five seats wrote roughly a hundred pages and not one route fetched a module outside its own ancestry. The `children` Map with three states is doing exactly what it claims.").ac("note");

		section("3. The memoized view — flat when bounded, linear when not");

		code(`
GC forced before every sample; heap from CDP JSHeapUsedSize, not
performance.memory (which is bucketed to 10 MB and useless here)

BOUNDED — 14 real routes, cycled 500 times
  navs      0     25     50    100    250    500
  nodes   151    555    555    555    555    555      <- flat after one lap
  .page     1     16     16     16     16     16
  listeners 15    17     17     17     17     17
  heap MB 1.20   1.38   1.40   1.41   1.44   1.46     <- +0.08 MB over 475 navs

  median navigation: 0.2 ms (n=500). Last 100: max 0.4 ms.

UNBOUNDED — /dynamic/N/, route()-claimed, never repeated
  navs      0     25     50    100    250    500
  nodes   192    317    442    692   1442   2692      <- +5.0 nodes per url
  .page     2     27     52    102    252    502      <- +1 per url, forever
  heap MB 1.21   1.30   1.33   1.38   1.45   1.55
  modules fetched by all 500: 0`,
			"live at /perf/memo/");

		p("A first pass reported the bounded case still growing at navigation 500. It was not: the count included detached nodes not yet collected. Forcing a GC before reading turns it exactly flat. Recording the mistake because an uncollected-garbage reading is the single easiest way to invent a memory leak that does not exist.").ac("note");

		section("Is there ever a reason to evict a view? Yes — exactly one");

		code(`
Bounded tree      urls are files. 16 pages, 555 nodes, flat forever.
                  NO eviction needed. This argument is over.

route() tree      urls are strings the USER types. children is keyed by user
                  input and nothing ever deletes a key. 500 urls = 502 live
                  Pages and 502 .page elements, and no upper bound exists.

route() is used in ~20 pages across this site, so this is the common escape
hatch, not a corner case. /deep/scale/ reached the same conclusion independently
and framed it well: "the question is not whether caching pages is fast — it is
whether anything ever STOPS caching them."`, "the answer, in two lines");

		section("Findings, ranked by what they actually cost");

		code(`
#  FINDING                                     COST NOW                  WHERE
1  route() views are never evicted             +1 page +5 nodes / url    /perf/memo/
2  serial walk on cold deep links              RTT + 16ms per segment    /perf/walk/
3  nothing paints until every loader resolves  = the whole walk, blank   /perf/paint/
4  mark_links() parses each url 5x per nav     11.0 ms at 5000 anchors   /perf/mark/
5  a page.js fetched twice to show its source  +1 round trip per call    /perf/hidden/
6  console.log shipped in constructors         10% of a cold walk        /perf/hidden/
7  lazily-loaded stylesheet not awaited        1 RTT unstyled            /perf/hidden/
8  app.loaders is never drained                ~0 — bounded, listed for  /perf/hidden/
                                               completeness`, "eight, worst first");

		section("Proposals — measured now, predicted after, price");

		code(`
R1  Page.forget()  —  name the three lines that already work

    now      +1 Page, +1 view, +5 DOM nodes per route() url, forever
    after    FLAT. Measured, not predicted: 500 dynamic urls left 3 pages
             and 200 nodes, identical to the starting state.
    price    ONE method on Page. Opt-in, and it changes no default:

               forget(){
                   this.view?.remove();
                   this.view = null;
                   this.parent?.children.delete(this.name);
                   return this;
               }

             The opt-in is already-existing API — deactivate() is documented as
             the seam for releasing "a socket, a timer, a <video>". Releasing
             YOURSELF is the same category:

               route(name){ return { title: …, content(){ … },
                                     deactivate(){ return this.forget(); } }; }

    caveat   a forgotten page loses its state. That is the point, and it is why
             this must stay opt-in rather than becoming route()'s default.`,
			"R1 — the one framework change I would actually fight for");

		code(`
R2  Router.prefetch(url) + Router.prefetch_on_hover()

    now      a 5-segment jump costs 5 x (RTT + 16ms) — 869 ms at 150 ms RTT
    after    ~1 RTT, IF the hover leads the click by one RTT. Cold import
             measured at 1.8 ms median on localhost (n=9); warm is 0 ms, so
             the saving is the whole cold number, which is the RTT.
    price    ~20 lines on Router and one opt-in call in site/app.js.

    THE PART THAT IS EASY TO GET WRONG: prefetching only the leaf saves almost
    nothing, because load_segments() still imports every ancestor serially.
    prefetch() must warm EVERY PREFIX of the url, in parallel:

        /a/b/c/  ->  /a/page.js  /a/b/page.js  /a/b/c/page.js

    signature   prefetch(url)            warm a url and all its ancestors
                prefetch_on_hover()      one delegated pointerover on $app

    on Router, NOT on Page: the thing being warmed is a url, and the page
    object does not exist yet — that is the whole point. Router also already
    owns the "is this one of ours" predicate, in link_clicked().

    mechanism   <link rel="modulepreload">, never import(). import() RUNS the
                module, so hovering would execute "new Page(…)" and every side
                effect in a file the reader may never open. Both remove the
                same network wait; only one is free of consequences.

    price when wrong   one chain of preloads per grazed link. Measured on a
                real page here: 51 in-app links, 32 distinct urls. A pointer
                crossing the sidebar warms 32 chains nobody asked for.`,
			"R2 — the cheap classic, with the trap in it");

		code(`
R3  mark_links() — read link.pathname once

    now      11.0 ms at 5000 anchors; 89 us at this site's real 49 anchors
    after    ~5.3 ms at 5000 — predicted 52% off, from 5 URL parses to 2
    price    one local variable. No API change, no behaviour change.

    THE SWEEPS ARE NOT THE PROBLEM. Decomposed at 5000 anchors:

      querySelectorAll("a[href]")            84 us      <- the feared part
      querySelectorAll(".active-page, …")    61 us
      read .origin + .pathname            4,930 us      <- the actual cost
      compare a string                      175 us
      two classList.toggle                  230 us
      whole mark_links()                 11,015 us

    .origin and .pathname are not properties, they are a URL parse, and the
    method reads pathname three times and origin once per link. Caching it in
    a local is the entire fix.

    URGENCY: low. This site has 49 anchors and mark() costs 89 us. Worth doing
    because it is free, not because anything is slow.`,
			"R3 — free, and the diagnosis is the interesting part");

		section("Already fast enough — no change needed");

		code(`
mark()'s two querySelectorAll sweeps
    49 anchors (real)     2.2 us + 1.4 us
    20,000 anchors        252 us + 396 us
    A 60fps frame is 16,700 us. The sweeps never become the problem, at any
    size this framework will meet. ARGUMENT CLOSED.

:has() — the selector everyone is told to fear
    rules found and genuinely deleted for the A/B (3 of them)
    extra .page nodes      0      100      400     1600
    with :has()          1.5     22.0     57.0      147   us
    without :has()       2.0      0.5      0.5      0.5   us
    cost of :has()      (noise)  21.5     56.5      146   us

    So :has() IS essentially the whole recalc — about 300x the cost of not
    having it — and it is still 146 us at 1600 pages, which is 0.9% of one
    frame. At ~0.09 us per .page node you would need roughly 183,000 pages on
    screen to spend a single frame. This site's largest page has 20.
    THE FEAR IS DIRECTIONALLY REAL AND PRACTICALLY IRRELEVANT. Keep the rules;
    the "holds" class they replaced is not coming back.

Warm navigation
    median 0.2 ms over 500 navigations, max 0.4 ms in the last hundred.
    Nothing to do.

route() ordering
    navigating to a url that resolves nowhere issues ZERO page.js requests.
    The readme's "only declared names ever hit the network" is exactly true.`,
			"four measured non-problems");

		p("A measured “no change needed” is the most valuable output this seat has, because it ends an argument permanently. Four of the eight investigations end here.").ac("note");

		section("First paint — a real trade, with the number attached");

		code(`
App.instantiate()   config -> render -> AWAIT LOAD -> initialize -> inject

Nothing is in <body> until every loader resolves, so first-contentful-paint is
a direct reading of the blank screen, not a proxy for it.

                        chrome COULD paint    actually painted (FCP)   blank for
  d1, 0 ms latency           454 ms                 488 ms              34 ms
  d1, 150 ms latency       1,149 ms               1,348 ms             199 ms
  d8, 150 ms latency       1,139 ms               2,904 ms           1,765 ms

"chrome COULD paint" is measured, not guessed: it is the moment window.app is
assigned, which is after config() and render() and before the first await.

So moving inject() above await load() would cut the blank screen by the entire
duration of the page walk — up to 1.8 seconds on a deep cold link over a slow
connection.`, "live at /perf/paint/");

		p("What it would cost: an empty sidebar and an empty tab bar on screen, then content arriving under them. `tabs()` pushes its filling promise onto `app.loaders` for precisely this reason — the readme says so in a comment — so the current order is a deliberate answer to a bug someone already hit.").ac("note");

		code(`
MY RECOMMENDATION: keep the current order for this site, and stop calling it
free.

  for   the chrome here is a hand-typed sidebar. Painting it 1.8 s earlier
        shows the reader navigation they cannot use yet, then reflows.
  for   an empty tab bar is a measurably worse first impression than a blank
        screen, and it is the exact bug tabs() was changed to avoid.
  against  1.8 s is not a rounding error, and it grows with BOTH depth and
        latency, which is the worst pair to grow with.

  If it is ever revisited, it should be revisited WITH a loading state, not by
  moving one line. Moving the line is a one-line change with a one-line
  regression, and the regression is the one already fixed once.`,
			"the verdict, and the dissent against it");

		section("Showing the code — four implementations, measured");

		code(`
The council independently built FOUR ways to put source on a page. Costs:

  site/ui.js   code(string, label)     0 kB    a hand-typed COPY — can drift
  nav/ui.js    source(import.meta)     +1 round trip PER CALL, per page
  deep/probe   code.fn via ext/highlight  63.9 kB / 8 requests, once per session
  perf/ui.js   source(fn) on a live object   1.3 kB, no request, no drift

Measured: /nav/children/lazy/ makes 4 duplicate page.js requests to show four
files the module map already holds — 1,200 extra bytes and 4 round trips, after
render. /compound/ does the same, 3 times.

ext costs, measured by importing them and counting:
  ext/demo         6.3 kB   3 requests
  ext/markdown    52.0 kB   3 requests
  ext/highlight   63.9 kB   8 requests   (buys real syntax highlighting)`,
			"one problem, four answers, a 50x spread");

		p("This section reads its own source with `source(Router.prototype.mark)` — `fn.toString()` on the object that is already loaded. It costs one 1.3 kB utility, cannot drift, and issues no request. It also gives no syntax highlighting, which is what the 63.9 kB buys, so this is a trade rather than a verdict. What is not a trade: re-fetching a file the browser already has.").ac("note");

		section("What I got wrong");

		code(`
1  My :has() A/B deleted ZERO rules for its first run and I nearly shipped the
   result. Since CSS nesting shipped, every CSSStyleRule has a (usually empty)
   .cssRules, so "if (rule.cssRules) recurse" treats every ordinary rule as a
   group and never inspects it. The "cost of :has()" I first measured was the
   noise between two identical configurations. Test the selector first.

2  My own /perf/prefetch/ page fired nine cold module imports ON LOAD — the
   exact tax I told the other seats not to charge. It is gated now. The rule
   was right; I broke it inside a day of writing it.

3  The first memo run reported growth that was uncollected garbage.

Everything in this report that survived those three is what is left after
looking twice.`, "three measurement bugs, found by testing the measurements");

		section("Round 2 — re-measured after the round's six changes");

		code(`
CHANGE                                  COST                        VERDICT
container() logging via mounts_in()     72 us per cold deep load    KEEP
seven class fields on Page              0 us — unmeasurable         KEEP
alias() guard now complete              0 us                        KEEP
adoption through the constructor        new Page() = 0.1 us         KEEP
this.app.navigated?.(page)              0 us until defined          KEEP
View.text()/html() chainability         0 us — a comparison         KEEP

Nothing the round landed is measurable except the logging, and the logging is
72 microseconds.`, "all six, priced");

		code(`
console.log, measured directly     9.0 us per line   (inspector attached)
                                   9.3 us per line   (Runtime.disable)

container() lines, cold depth-8    8      ->  72 us total
container() lines, per navigation  0.9    ->   8 us
ALL console lines, cold depth-8    56     -> 504 us`,
			"the direct measurement, n=9 rounds of 300 calls");

		p("Verdict on `container()` logging: keep it. 72 microseconds buys the one step a reader of a page file genuinely cannot see — which parent claimed it. That is the best value-per-microsecond in the framework.").ac("note");

		code(`
I FIRST REPORTED console instrumentation at "1.2 ms of an 11.9 ms cold walk,
about 10%". That was wrong, and the direct measurement supersedes it.

The 10% came from comparing two POPULATIONS of cold loads (n=9 each, console
stubbed vs not). Cold-load variance swamped the effect. The tell was in the
container() A/B, which returned 0.96 ms per mount at 1x CPU and 0.38 ms at 4x
— throttling made it CHEAPER, which is impossible, so the number was noise.

Per-call measurement puts all 56 console lines on that route at ~0.5 ms, not
1.2 ms, and container()'s share of it at 0.07 ms. My dissent stands and is now
much better supported: keep the logging.`, "a correction to my own first report");

		code(`
                    slope, ms per url segment
latency        round 1      round 2 (after the changes)     model RTT + 16
    0 ms          15.6              15.7                          16
  150 ms         173.8             172.7                         166

The canonical number is unmoved. Permanent home: /budget/ladder/.`,
			"the depth ladder, re-fitted");

		section("Requests to the owner");

		code(`
R1  Page.forget()               3 lines, opt-in     measured flat vs +5 nodes/url
R2  Router.prefetch(url)        ~20 lines, opt-in   869 ms -> ~150 ms at d5
R3  cache link.pathname         1 local             11.0 ms -> ~5.3 ms at 5000
R4  readme: /tabs/state/ is 3 modules, not 2
R5  readme: delete the stale "redirect" line from Measured
R6  readme: "no console errors" -> "no unhandled errors" (the 404 logs its own)
R7  document that a lazily-loaded stylesheet is NOT awaited on SPA navigation.
    I recommend NOT fixing this — blocking navigation on a stylesheet is worse
    than 1 RTT of unstyled content — but it should be written down.

R8  make source(import.meta) LAZY — fetch on <details> open, not on load.
    7 of 31 routes fail the budget on this and no other cause.
    Predicted: one round trip saved per page view on 32 pages, no behaviour
    change for anyone who opens the box. Full pricing at /budget/source/.

NOT requested, deliberately:
    console.log in the constructors, including container()'s. Measured directly
    at 9 us per line — 72 us for container() on a cold deep load, 0.5 ms for
    all logging. My first report put this at 10% of a cold walk; that was
    cold-load noise and I have withdrawn it. The console trace is one of the
    best teaching artifacts this project has, and it is now measured to be
    nearly free. Keep it; if it ever moves, move it behind the dev/ tier
    rather than deleting it.`, "eight, in priority order");

		div.c("row", () => {
			a.c("page-link", "the live instruments →").href("/perf/");
			a.c("page-link", "the serial walk →").href("/perf/walk/");
			a.c("page-link", "the memoized view →").href("/perf/memo/");
		});
	},
});

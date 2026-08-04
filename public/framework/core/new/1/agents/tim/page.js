import { Page, p, a, div } from "/app.js";
import { code, section } from "../../site/ui.js";
import { probe, snippet, whole } from "../../site/deep/probe.js";

/* No `meta: import.meta`. This module lives in agents/, not under site/, so
 * import.meta would fix my url to /framework/core/new/1/agents/tim/ — and
 * naming() uses ??=, so adoption could never correct it. A page whose file
 * location is not its route must let its parent name it. (Finding R14.) */
export default new Page({
	name: "tim",
	title: "Technical Tim — defect & risk register",

	content(){
		code(`
RANK  WHAT BREAKS                                        WHERE            OPEN #
────────────────────────────────────────────────────────────────────────────────
 R1   a url can crash a route() page — no file needed    /deep/alias/       —
      (the view/parent half of this was FIXED upstream mid-session)
 R2   no error boundary after boot — a dead click        /deep/edges/       —
 R3   a full ancestor that does not hold the leaf        /deep/chrome/      3
 R3b  a full page crushes its own content to 2px         /deep/chrome/      —
 R4   a failed navigation reloads the whole document     /deep/errors/      —
 R5   popstate failure: url and DOM disagree, silently   /deep/history/     —
 R6   two clicks race; the slower one wins               /deep/race/        4
 R7   a file with a bad import is reported as a 404      /deep/errors/      —
 R8   route() cannot be async, and fails silently        /deep/errors/      —
 R9   full covers the chrome; 20 tab stops behind it     /deep/chrome/      3
R10   every navigation rescans everything ever mounted   /deep/scale/       —
R11   an unvisited page's go() throws, sometimes         /deep/gap/         2
R12   a lazy page paints before its stylesheet applies   /deep/edges/       —
R13   ?query and #hash are dropped by the router         /deep/edges/       —
R14   meta: import.meta pins a url adoption cannot fix   this page          —
R15   **bold** renders as literal asterisks, site-wide   every page.js      —
R16   activate() has an unwritten precondition           /deep/orphan/      5
R17   nav CAN be derived and lazy; hook now exists,      /deep/nav/         6
      unused — my two workarounds should be deleted`,
			"eighteen findings, ranked");

		p("Ranked by what it costs a user who does nothing wrong. Everything below carries a measurement or a transcript from Playwright at 1400×800 against the live site — no claim here is reasoned-only unless it says so.").ac("note");

		section("What held up");

		p("Stated first, because a register that lists only defects is a lie about the design. Three of the load-bearing claims are exactly true as written.");

		code(`
shared_depth       /deep/nesting/a/b/c/d/e/ → e2   1 module fetched, 7 pages untouched
                   ancestor build stamps identical before and after the hop
cold load          8 levels = 8 page modules, and nothing else. No sibling of any
                   ancestor is fetched — 11 other investigations cost 0
back/forward       tabs + full + 8-deep, 5 Back then 3 Forward: url, router.active
                   and the rendered leaf agreed on every single step
route() at scale   1000 urls, 0 modules, 0.6 KB heap each
flat container     13 pages, 40+ probes, several deliberately async — zero elements
                   escaped their page. The sync-capture discipline holds.`,
			"measured, and correct");

		section("R1 · A url can crash a route() page, with no file involved");

		p("Half of this was fixed while I was writing the page, which is worth recording as carefully as the defect. `alias()` writes a resolved child onto its parent by name and refuses to shadow an existing property with `if (!(key in this))` — a guard that was complete for the prototype and blind to every field assigned later. A directory called `view` therefore blanked its parent on a cold load and not on a click, because reloading adopts the whole chain before rendering any of it.");

		p("`Page` now declares its seven mutable fields at the top of the class — `view`, `regions`, `$pages`, `loading`, `default_tab`, `parent`, `app` — which makes the guard true. Another seat reached the same defect from the url side. That fix is better than the reserved-name list I had drafted, because the guard *is* the declaration and there is no second copy to drift.").ac("note");

		p("What remains is that the criterion is one word off. The declared seven are the properties `Page` assigns. `render()` also reads properties the author supplies, and those are still undeclared:");

		code(`
cold-loaded, measured — /deep/errors/ has a route() that claims any name

  /deep/errors/col/        Page Load Error — arg.split is not a function
  /deep/errors/classes/    Page Load Error — arg.split is not a function
  /deep/errors/content/    renders (wrong, but harmless)
  /deep/errors/harmless/   renders correctly

render() does .ac(this.col).ac(this.classes); View.ac() calls arg.split(" ")
on whatever it is handed, and a Page has no .split.`,
			"reproduction — no files, no author mistake");

		p("This is worse than the original in one specific way: it needs no `page.js` on disk and no mistake by anyone. Any page with a `route()` — the feature that exists precisely so a page can own urls it could not list in advance — is crashed by a visitor typing `/…/col/`. A public catalogue behind `route()` has a url-shaped denial of service in it.");

		snippet("same fix, right criterion", () => {
			class Complete extends Page {
				view; regions; $pages; loading; default_tab; parent; app;   // assigns — done
				col; classes; content; route; meta;                        // READS — still open
			}
		});

		p("Five lines, same mechanism, and it changes the rule from *'every property this class assigns'* to *'every property this class touches'* — which is what `alias()` actually has to defend. Cost: the class-field list must grow whenever `render()` learns to read something new, and that is a real maintenance obligation rather than a free win.").ac("note");

		section("R2 · There is no error boundary after boot");

		p("`App.load()`'s `try` covers the root import and the first navigation. Nothing covers the second. A `content()` that throws mid-session produces an unhandled promise rejection, a click that does nothing at all, and a `console.groupCollapsed` that `render()` never closes — so every log line for the rest of the session is nested inside a group nobody opened.");

		code(`
click a link whose content() throws
  go() rejects            (nothing catches it — Router.click() ignores the promise)
  url                     unchanged
  rendered leaf           unchanged
  visible feedback        none whatsoever`,
			"/deep/edges/ probe 1");

		snippet("the fix — App.error() already exists and has no caller after boot", () => {
			class Guarded extends Router {
				async go(url){
					try {
						if (await this.load(url)) return history.pushState({}, "", url);
						location.assign(url);
					}
					catch (error){ this.app.error(error); }
				}
			}
		});

		p("Price: one `try`. `App.error()` already renders into `$pages` and already keeps the chrome — the machinery exists, it is just unreachable.").ac("note");

		section("R3 · A full ancestor that does not contain the leaf stays on screen");

		p("This one I did not go looking for; it fell out of measuring the tab order for Open #3, and it is the sharpest CSS defect I found.");

		code(`
on /deep/chrome/sealed/          display   size        classes
  page                           none      0x0         active-ancestor
  page-deep                      none      0x0         active-ancestor
  page-chrome                    flex      1400x800    full active-ancestor   ←
  page-sealed                    flex      1400x800    full active-page

tab order, unsealed /deep/chrome/   Tab 1-20 all land in the covered sidebar
tab order, sealed                   Tab 1-6 land in page-chrome, underneath`,
			"measured at 1400×800");

		p("The general rule asks the real question and is right to be proud of it: `.page.active-ancestor:has(.page.active-page)`. The `full` rule does not ask it. `.page.full.active-page, .page.full.active-ancestor` is unconditional, so a `full` page stays fixed at `inset: 0` whether or not the leaf is inside it — and `sealed` mounts in `app.$pages` because `chrome` claims no region.");

		p("Cost: two full-screen pages stacked, the lower one invisible and every control in it still in the tab order and the accessibility tree. `inert` on the sidebar cannot help, because the thing leaking focus is another page. Verified fix — inject `:has(.page.active-page)` onto the ancestor half and `page-chrome` collapses to `display: none`, with the tab order starting inside the leaf.");

		code(`
.page.full.active-page,
.page.full.active-ancestor:has(.page.active-page) { position: fixed; inset: 0; … }`,
			"styles.css — one selector, and it is the question the file already asks elsewhere");

		section("R3b · A full page crushes its own content");

		p("Same three lines of CSS, a second defect, and this one I hit by being unable to click my own button. `.page.full` sets `display: flex; flex-direction: column`, so every direct child becomes a flex item with the default `flex-shrink: 1`.");

		code(`
/deep/chrome/, before the workaround      box height   height needed
  DIV.code                                       2 px          309 px
  DIV.code                                       2 px          289 px
  DIV.code                                       2 px          248 px

Playwright, clicking the Run button inside one of them:
  "element is visible, enabled and stable … <p class="note"> intercepts
   pointer events"  × 20 retries, then a 30s timeout`,
			"measured at 1400×800");

		p("The rule was written for a page whose only meaningful child is a `.pages` region — that child gets `flex: 1 1 auto` and behaves. Ordinary content is crushed instead, and because `.code` clips its own overflow a 300px block becomes a 2px line with an unreachable button inside it. `overflow-y: auto` on the page never rescues it: flex shrinking removes the overflow before a scrollbar could appear.");

		p("It is silent, and it only appears once a full page's content exceeds the viewport — which is exactly when someone reaches for `full` in the first place.");

		code(`.page.full > * { flex: 0 0 auto; }        /* alongside the existing .pages rule */`,
			"styles.css — verified: 2px → 311px, nothing crushed, /full/left/'s columns unaffected");

		p("`/deep/chrome/` and `/deep/chrome/sealed/` carry that rule scoped to their own two classes in `deep.css`, labelled as a bug report rather than a preference, so the pages are usable while the finding stands.").ac("note");

		section("R4 · A failed navigation costs a full document reload");

		p("`go()` treats *'this url does not resolve'* as *'not mine'* and calls `location.assign()`. The SPA fallback then serves `index.html`, the app boots from scratch, the walk fails again, and the error page finally renders — with every bit of in-memory state gone.");

		code(`
click a link to a declared-but-missing child
  window marker set before the click     WIPED — the document was reloaded
  navigation entries                     1  (a real browser navigation)
  wall clock                             2559 ms
  page modules re-fetched                4`,
			"/deep/errors/ → ghost, measured");

		p("Cost: a typo in one `href` turns into a two-and-a-half-second reload that discards the whole session. This is also the reason R6's fix cannot simply return `false` for a superseded navigation — false means *reload the world*.");

		p("Smallest fix: `location.assign` is right for a url that is genuinely not ours, and wrong for one that is ours and broken. The router already knows the difference — `load_segments` returning null after walking into our own tree is not the same as a url outside the app. Splitting those two is a handful of lines and it is the same three-state change R6 needs.").ac("note");

		section("R5 · popstate has no failure branch");

		code(`
history.pushState(…, "/deep/history/nowhere/")   an entry the Router never validated
go to /deep/history/, then Back

  address bar     /deep/history/nowhere/
  router.active   /deep/history/
  rendered        Back and forward at depth
  agree?          NO`,
			"/deep/history/ probe 2 — nothing threw, nothing rendered");

		p("`go()` has an `else` for a failed load. `popstate` calls `load()` and discards the boolean. The url has already changed by the time the handler runs, so a failure is permanent and silent: the address bar shows one page, the document shows another, and reloading gives a 404 screen for a page you appear to already be on.");

		p("A bookmark, a shared link, or a `page.js` deleted since the entry was pushed all produce this. Fix: `if (await this.load(location.pathname)) return; location.reload();` — one line, and the reload is honest, because a fresh visit is exactly what the browser thinks is happening.").ac("note");

		section("R6 · Open #4, reproduced deterministically");

		code(`
click 1 → /deep/race/slow/  (400ms)
click 2 → /deep/race/fast/  (20ms)
  activate → /deep/race/fast/
  activate → /deep/race/slow/          ← lands second, wins

you asked for   /deep/race/fast/
url is          /deep/race/slow/
router.active   /deep/race/slow/`,
			"/deep/race/ — repeatable, no top-level await needed");

		p("The reproduction overrides `child()` on the page instance to delay per name, which is ordinary userland and repeatable — a slow module would reproduce it exactly once per document, because the registry caches the second attempt.");

		p("Honest severity: lower than it sounds. The DOM does not corrupt. Each `activate()` diffs against `this.active` at the moment it runs, so the second correctly deactivates `fast` and mounts `slow` — the tree is consistent, it is simply showing a page nobody asked for, with history entries in click order rather than intent order.");

		snippet("the guard — and I am the persona who has to name its price", () => {
			class Guarded extends Router {
				async load(url){
					const token = this.token = {};
					const page = await this.load_segments(url);

					if (token !== this.token) return "superseded";

					if (page) this.activate(page);
					return page ? "loaded" : "missing";
				}

				async go(url){
					const result = await this.load(url);

					if (result === "loaded") history.pushState({}, "", url);
					else if (result === "missing") location.assign(url);
					// "superseded" — another navigation owns the url now. Do nothing.
				}
			}
		});

		p("Price, stated plainly: `load()` stops returning a boolean. That is the whole cost and it is not nothing — a two-value return is easier to read than a three-value one, and Simple Steve is right to push back. My answer is that the third state already exists in the world; today it is spelled *'false'* and therefore means *'reload the entire document'* (R4). Naming it is not new machinery, it is admitting to machinery that is already there.").ac("note");

		section("R7 · A file that exists is reported as missing");

		code(`
boom       throws at import time       → "the file EXISTS but failed to load"   ✓
badimport  its dependency 404s         → null, silent, classified as MISSING    ✗
ghost      no file at all              → null, silent                            ✓`,
			"/deep/errors/ probe 1 — console.error captured live");

		p("The browser's message for a module whose dependency 404s names the module you asked for: *'Failed to fetch dynamically imported module: .../badimport/page.js'*. `Page.missing()` has only that string, so a `page.js` with one bad import becomes indistinguishable from a `page.js` that was never written — precisely the confusion the method's own comment says it exists to prevent.");

		p("No regex fixes this; the exception does not carry the fact. Fix: on the failure path only, ask the network — `fetch(url, { method: 'HEAD' })` answers *'is the file there'* factually, at the cost of one request on an error you were already handling. Price: `Page.load` gains an await on a path that is already slow and already failing.").ac("note");

		section("R8 · route() cannot be async, and says nothing about it");

		code(`
route() returns          becomes                     renders
  42                     Page, title "number"        a bare heading
  Promise.resolve({…})   Page, title "promise"       a bare heading
  undefined              null → 404                  correct
  { title, content }     Page                        correct`,
			"/deep/errors/ probe 2");

		p("`route()` is called synchronously and its result goes straight to `add()`, which passes anything that is not a string, a function or a `Page` into `new Page(...)`. `Object.assign(this, promise)` copies nothing — a promise has no own enumerable properties — so you get an empty page named after the url.");

		p("An async `route()` is the single most likely thing anyone will try with this API — it is the natural place to fetch a record before rendering it — and it fails completely silently. Fix: one `is.pojo` check in `add()` with a `console.warn`, or make `add()` await a promise. I would take the warn: awaiting changes `child()`'s timing for everyone to serve one case.").ac("note");

		section("R9 and R17 · Open #3 and Open #6 want the same one line");

		p("Open #3: `full` covers rather than removes the chrome. Measured — the first twenty tab stops on `/deep/chrome/` are sidebar links behind the overlay; a keyboard user never reaches the page. The readme names `inert` as the fix and calls it the site's job. `inert` is verified to work, and the ownership call is right.");

		p("But the site has nothing to hang it on. `Router` never tells anyone a navigation happened, so the only place left is the page itself, which then has to name `app.$sidebar` — a property of this site's `App` subclass — from inside a page that is otherwise portable. `/deep/chrome/sealed/` does exactly that, and every line of it is a liability.");

		p("Open #6 lands in the same place from the other side. A nav that is derived *and* lazy already works: `children` is a Map whose keys are known without importing anything, so a name is a link and only a title needs a module. `/deep/nav/` renders the whole known tree for zero page modules, and it borrows `.nav-link` so `mark_links()` gives it active state with no code. What is missing is not derivation — it is knowing when to redraw.");

		p("Both of them want the same one line, and while I was measuring, it landed — requested independently by the chrome seat:");

		code(`
// Router.activate(), after mark()
this.app.navigated?.(page);`,
			"already in Router.js — verified present, and site/app.js does not yet define it");

		p("So the ask is granted and the seam is unused. That is the right order: the framework offers the moment, the site decides what to do with it. `/deep/nav/`'s redraw button and `/deep/chrome/sealed/`'s hand-rolled `activate()`/`deactivate()` pair are both now workarounds for a hook that exists — they should be rewritten as `App.navigated()` in `site/app.js`, once, for the whole site.");

		p("Price, for the record, since I would have had to argue it: one duck-typed call, the same shape as `activate?.()` already in this codebase, and `Router` learns nothing about navs or about `full`. The objection worth taking seriously is that it is an event bus getting its foot in the door — one optional method today, `beforeNavigate`, `afterRender` and a listener list later. The defence is that it is called from the one place that already knows a navigation finished, and `mark_links()` was already evidence the seam was wanted.").ac("note");

		p("Verdict on Open #6: the nav is derivable and lazy today. The honest limit is that it is progressive, not complete — a lazy subtree has no keys until its parent is imported, so the tree can only show one level past where you have been. That is what laziness is, and a full sitemap is the thing you cannot have for free.").ac("note");

		section("R10 · Every navigation rescans everything you have ever visited");

		code(`
mounted .page   median hop ms   a[href] rescanned by mark_links()
            3            0.20                                  57
          255            0.60                                 307
         1005            2.10                                1057
         3005            5.70                                3057`,
			"a hop between two ALREADY-BUILT pages — work that should be constant");

		p("`Router.mark()` runs two `querySelectorAll` sweeps over the whole `$app` subtree on every navigation: one to wipe two classes, one over every anchor in the document. Both grow with everything ever mounted, so a page you looked at once and will never see again taxes every future click. A 28× slowdown across a session that visited 3000 urls, and it is on the popstate path too.");

		p("The heap is not the story — 1000 `route()` urls cost 0.6 KB and 5 DOM nodes each. Five thousand hidden nodes walked twice per navigation is the story.");

		snippet("half of it is free — Router already knows the previous chain", () => {
			class Scoped extends Router {
				mark(){
					// the wipe does not need a query: the pages that carry those
					// classes are exactly the ones in the chain we are leaving
					this.marked?.forEach(page => page.view.rc("active-page", "active-ancestor"));
					this.marked = this.chain();
					this.marked.forEach(page =>
						page.view.ac(page === this.active ? "active-page" : "active-ancestor"));

					this.mark_links(this.active.url);
				}
			}
		});

		p("Price: one remembered array, and it replaces a stateless wipe with state that could go stale — the exact trade the current code deliberately refused, and refused for a good reason. So I am not asking for it yet. I am asking for the number to be on the record, because *'pages are built once and never thrown away'* is currently priced as free and it is not: it is linear, unbounded, and paid on every click. `mark_links()` is the larger half and I have no cheap fix for it.").ac("note");

		section("The remaining findings, in one place");

		code(`
R11  Open #2. An eager child never navigated to has no .app, so go() throws —
     and stops throwing the moment anyone visits it. Non-determinism is the
     defect, not the throw. link() genuinely covers the common case; it does
     not cover a button or a redirect.
     FIX  go(){ return (this.app ?? this.chain()[0].app).router.go(this.url); }
     COST one line. chain()[0] is the root, the one page App assigns app to.

R12  A lazy page's stylesheet is never awaited. Cold loads are fine — the link
     is pushed before App.load()'s await. Warm SPA navigation is not: measured
     at the instant go() resolved, the page was active and visible, its <link>
     present, its rules NOT applied — .probe-bar computed display:block where
     the sheet says flex.
     FIX  await this.app.loaded() in Router.load() before activate().
     COST one await on the navigation path.

R13  Router.click() calls go(link.pathname). ?query and #hash are discarded.
     Going the other way is worse: router.go("/x/?a=1") looks for a child
     literally named "x?a=1", 404s, and reloads the document (R4).
     FIX  go(link.pathname + link.search + link.hash), resolve the path only.
     COST one line, plus a decision about whether a query is app state.

R14  meta: import.meta pins url at construction and naming() uses ??=, so
     adoption can never correct it. A page whose file location is not its
     route must omit meta — as this report does.
     FIX  documentation, not code.

R15  p() handles backticks and nothing else, so every **bold** in every
     page.js on this site renders as literal asterisks. CLAUDE.md already
     says "prose is markdown, use md()". new/1's site imports no markdown
     ext, so the rule has no way to be obeyed.
     FIX  import ext/markdown in site/app.js, or stop writing ** in prose.
     COST one import and one stylesheet — or nothing, and a convention.

R16  Open #5. activate() assumes its ancestors are mounted. Called on a page
     nothing adopted it throws on this.app.$pages. Called on a properly
     walked page it silently mounts an invisible node nothing can ever show
     or remove — and if an ancestor claims a region that has not rendered,
     the page lands in app.$pages instead. All three measured.
     VERDICT theoretical. Router is the only caller and iterates root-to-leaf.
     FIX  one sentence in the doc comment: this is a precondition, not a
     description. Two guard branches on the hot path of every page is a
     worse trade than the sentence.`,
			"R11 – R16");

		section("Verdicts on the Open list");

		code(`
#1  container() is action at a distance   AGREE, KEEP. Two levels is right, and
                                          R16 shows the walk is order-dependent —
                                          a doc-comment problem, not a design one.
#2  a page's own .app gap                 GENUINELY OPEN, but trivial. One line.
                                          "link() covers it" is an argument for
                                          not fixing something cheap.
#3  full covers rather than removes       GENUINELY OPEN, and three defects deep:
                                          20 tab stops (R9), a full ancestor that
                                          never leaves (R3), and content crushed
                                          to 2px (R3b). Two are plain CSS bugs in
                                          the same rule and want no discussion.
#4  no in-flight guard                    GENUINELY OPEN. Reproduced determinist-
                                          ically. Three lines and one three-valued
                                          return, which is the part to argue about.
#5  activate() assumes mounted ancestors  THEORETICAL. Document the precondition;
                                          do not guard it.
#6  the sidebar nav is hand-typed         SOLVED. Derived + lazy works today at
                                          zero module cost, and app.navigated?.()
                                          landed mid-session, so the redraw hook
                                          exists. Nothing is blocking it now.

Verified against the current Router.js and Page.class.js after this session's
upstream edits: go() still has no try and no in-flight token, load() still
returns a boolean, popstate still discards it, Page.go() still reads this.app
directly, and missing() is unchanged. R2, R4, R5, R6, R7 and R11 all stand.`,
			"six items, and where they actually are");

		section("Dissent, recorded");

		p("I am the persona allowed to ask for more machinery, so the record should show where I chose not to. I did not ask for a guard on `activate()` (R16), a `pending` map for in-flight imports beyond the single token (R6), a page-eviction policy for `render()`'s memo (R10), or an await in `add()` for async `route()` (R8). Each would fix something real and each costs more than the thing it fixes.");

		p("Where I did ask — the in-flight token, the `try` in `go()`, five more class fields, one `:has()` and one `flex: 0 0 auto` — the total is roughly a dozen lines across three files, and exactly one of them changes a return type. That is the entire bill. The `navigated?.()` seam I was going to ask for arrived on its own.");

		p("The disagreement I expect and accept: Steve will say `load()` returning a string instead of a boolean is exactly the API surface this codebase refuses. That is fair, and it is the one item here I would let the council overrule. My counter is only that R4 and R5 prove the third state already exists — unnamed, undocumented, and currently spelled *'reload the entire document'*.");

		p("And a correction against myself, since it is the sharpest thing this section learned: R1 was my top-ranked defect and it was fixed by another seat while I was writing the page describing it. The probe on `/deep/alias/` survived that intact because it *computes* which properties are guarded instead of listing them, and it now reports the fix rather than the bug. The prose beside it did not, and I had to rewrite it by hand. `probe()` protects the code; nothing protects the caption. That is the honest limit of the whole show-the-real-source approach, and it is worth knowing before anyone trusts a page here that has not been re-run.").ac("note");

		section("How this section shows its code");

		p("Every code block under `/deep/` is a real function object or a real file. No hand-typed source strings anywhere — `snippet()` and `probe()` both render via `code.fn`, and `probe()` wires its Run button to the same function object it just printed, so the code you read is the code that ran.");

		p("`demo(fn)` was the obvious choice and is the wrong one here: it runs its function at render time, and half of these reproductions throw, navigate, or mount things in the wrong container. Run-on-click keeps the blast radius inside a button press. The residual risk is prose — `probe()` protects the code and not the caption, and this section had one caption that was already wrong (*'the third Tab is behind the overlay'*; measured, it is the first twenty). Each page also carries its own file, fetched on demand, which is the only artefact here that literally cannot drift.");

		div.c("row", () => {
			a.c("page-link", "the evidence →").href("/deep/");
			a.c("page-link", "R1 · alias").href("/deep/alias/");
			a.c("page-link", "R3 · full").href("/deep/chrome/");
			a.c("page-link", "R6 · race").href("/deep/race/");
			a.c("page-link", "R10 · scale").href("/deep/scale/");
		});

		whole(import.meta);
	}
});

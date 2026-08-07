import { Page, p, div, a } from "/app.js";
import { code, section } from "../../site/ui.js";

/* The sixth seat's report: eight miniature products, built to find out whether
 * the framework's vocabulary can carry the shape of real content.
 *
 * The products are at /patterns/. This page is the record: what each content
 * shape demanded, which recipe it needed, and what was missing. Everything
 * numbered below was measured with Playwright at 1400×900 against the running
 * sub-site — 41 urls, zero console errors, zero horizontal overflow.
 */
const nav = () => ({
	meta: import.meta,
	title: "Applied IA — report",
	content(){ this.lead(); this.requests(); this.answers(); this.products(); this.notes(); },
});

export default new Page(nav(), {

	/* ── the finding that matters most ──────────────────────────────── */

	lead(){
		code(`
the SAME card, on the same page, three branches — cold load vs click-through

/patterns/docs/guide/concepts/batches/     Guide             vs  guide
/patterns/docs/reference/backoff-cap/      Config reference  vs  reference
/patterns/docs/tutorials/retries/          Tutorials         vs  tutorials

whichever branch you cold-load gets a Title; the other two get names.`,
			"url-is-the-state does not hold — measured, character by character");

		p("The readme's central claim is that state is read entirely off the url, so clicking produces byte-identical output to reloading. Realistic content breaks it twice, and both breaks have one cause: a page renders once, from whatever happened to be resolved at that moment.");

		code(`
1.  previews()   A cold deep load resolves the WHOLE chain before anything
                 renders, so previews() finds the chain's child already loaded
                 and prints its title. Click in and previews() runs while that
                 child is still null, so it prints the declared name — and the
                 page is built once, so it never says anything else.

2.  tab panels   When two pages in one region are visible at once, their DOM
                 order is ARRIVAL order, not chain order. /settings/notifications/
                 push/ renders Notifications-then-Account on a reload and
                 Account-then-Notifications on a click-through.`);

		p("Break 2 also falsifies the reasoning that removed `order` from `Router.mark()`: “same-depth siblings are never visible together, so their relative order can't be observed.” They are, and it is. Fix the tab-panel rule (request 3) and the ordering symptom goes with it — one bug, not two.");

		p("`tabs()` already refuses to print titles for exactly this reason, and the readme argues the case well. `previews()` has the same problem and no such rule. That asymmetry is the bug.").ac("note");

		section("Request 1 — one Set fixes both label bugs");

		code(`
// Page.declare() — remember which names arrived as strings
declare(){
    const list = typeof this.children === "string" ? … : …;
    this.children = new Map();
    this.lazy = new Set(typeof this.children === "string" ? list : []);
    …
}

// Page.previews() — a lazily-declared child is drawn from its NAME, always
page && !this.lazy.has(name) ? page.preview() : a.c("page-preview", name)…

// Page.tabs() — and the same test replaces (this.loading || i === 0)
const label = (name, i) =>
    !this.lazy.has(name) || this.loading || i === 0 ? page.title : name;`,
			"declare() records it; previews() and tabs() consult it");

		p("The second half is a real bug on its own: an INLINE child's title is in memory from the constructor onwards, on every entry point, and `tabs()` still prints its declared name — `/patterns/settings/notifications/` read “Email push digest” until `load_all_children()` was added, which for inline-only children costs zero requests and therefore buys nothing but the correct label. `children` forgets which names were lazy; the Set is the memory it is missing.").ac("note");
	},

	/* ── the requests, in the order I would spend them ───────────────── */

	requests(){
		section("Request 2 — the query string has to exist");

		code(`
// Router.click — carry it
this.go(link.pathname + link.search);

// Router.load — walk the path, keep the query
async load(url){
    const { pathname, search } = new URL(url, location.origin);
    const page = await this.load_segments(pathname);
    if (page) this.activate(page, search);
    return !!page;
}

// Router.activate(page, search = location.search) — hand it to the leaf
this.search = search;
page.query?.(new URLSearchParams(search));

// Router.mark_links — a filter chip is not the page it points at
mark_links(here = this.active?.url, search = this.search ?? ""){
    …
    link.classList.toggle("active", link.pathname === here && link.search === search);`,
			"five lines, one opt-in userland hook");

		p("Measured, unmodified: a cold load of `/patterns/shop/outerwear/?colour=oxblood` works — `location.search` survives and the walk only ever needed the pathname. Clicking `<a href=\"?colour=oxblood\">` navigates to `/patterns/shop/outerwear/` and pushes that url. Reloadable but not clickable, and the loss happens inside the framework's own click handler, so nothing downstream can prevent it.");

		p("`query(params)` is `route(name)`'s twin: `route()` claims a path segment, `query()` reads the modifier on the segment you already claimed. Both opt-in, both invisible to a page that defines neither, and neither adds a property to `Page`. With it, a filter chip is a plain `<a href=\"?colour=oxblood\">` and needs no JavaScript at all.");

		p("`mark_links()` is the fifth line and it is not cosmetic any more. It compares `link.pathname` only, so every filter chip on a page is marked `.active` — measured, all ten of them at `/patterns/shop/outerwear/?colour=oxblood` — and `styles.css` has just given `.page-link.active` a look, so the catalogue now lights its whole filter bar at once. It is visible on the page today.").ac("note");

		p("The catalogue ships an eight-line shim that does this per-page — a click handler calling `stopPropagation()` so `Router`'s document listener never sees the event, plus a `popstate` listener. It passes every test (click filters, url carries it, reload reproduces it, Back restores it), which is the proof the four lines are enough. It is also the escalation smell exactly: it works once, for one page, and the next person writes it again.").ac("note");

		section("Request 3 — nested tab sets");

		code(`
.tab-panel:not(:has(> .page.active-page, > .page.active-ancestor))
    > .page.default { display: block; }`, "styles.css — the panel half, and it is complete");

		p("Measured at `/patterns/settings/notifications/push/`: the outer panel displays `.page-account.default` AND `.page-notifications` simultaneously, because `:not(:has(> .page.active-page))` is true when the tab is an ANCESTOR rather than the leaf. Adding `.active-ancestor` to that `:has()` fixes the panel and the DOM-ordering break above at the same time.");

		p("The bar half does not have a CSS-only fix and I want to be clear about why rather than propose something that half-works. `mark_links()` writes `.active` on an exact match, so at a nested url no tab is active and `.tab-bar:not(:has(.tab.active)) > .tab:first-child` lights the first one. Using `.in-path` instead does not work either: the first set's first tab is href'd to the GROUP url, which is a prefix of everything below it, so it is permanently `.in-path`. The bar needs “the nearest of MY tabs”, which is a longest-prefix question scoped to one bar — CSS cannot ask it and `mark_links()` should not answer it globally, because a sidebar crumb trail wants every ancestor lit.");

		code(`
options for the bar, none of them free

a) tabs() re-marks its own bar on each navigation   needs a per-activation hook (request 4)
b) the first tab links to its own url, not the group  costs the no-redirect property
c) leave it: a nested set lights its first tab       what happens today, silently`);

		p("I would ship the panel fix now and leave the bar until request 4 exists, at which point (a) is four lines inside `tabs()` and nothing else changes. Recording (b) as considered and rejected: `/tabs/` being its own default tab with no redirect is one of the nicer things in this tier and is not worth spending here.").ac("note");

		section("Request 4 — a per-page entry hook, now cheaper than when I wrote it");

		code(`
// already landed, for the chrome seat — Router.activate()
this.app.navigated?.(page);

// so a SITE can already do this, in one line, in its own app.js
navigated(page){ page.entered?.(); }

// which means the framework request shrinks to: should Page own it?
activate(){ …mount…; this.entered?.(); return this; }`,
			"revised after `app.navigated` landed mid-council");

		p("`deactivate()` is documented as “Override to release a socket, a timer, a `<video>`” and there was nothing to acquire them with — `content()` runs once, and overriding `activate()` in an options object silently breaks `container()` mounting because a POJO has no `super`. The chrome seat's `app.navigated?.(page)` closes the gap from above, and one line of userland dispatch turns it into `page.entered?.()`.");

		p("So this is now a smaller question, and I would still say yes. Four of the eight products want it — the dashboard to refresh its readings, the API index to re-apply a filter, the catalogue for the second half of request 2, the onboarding flow for a progress bar that is not hand-wired — and asking every site to write the same dispatch line is the sort of thing the base API is supposed to absorb. It is also strictly leaf-only through `navigated`, which is right for all four of my cases but would not be if an ancestor ever needed to know it had re-entered the chain.").ac("note");

		section("Request 5 — split `full` into the two things it is");

		code(`
.page.fills.active-page,
.page.fills.active-ancestor:has(.page.active-page) {
    display: flex; flex-direction: column; overflow: hidden; padding: 0;
}
.page.fills > .pages { flex: 1 1 auto; min-height: 0; }

.full  =  .fills  +  position: fixed; inset: 0; z-index: 10; background: #fff`,
			"styles.css — promote patterns.css's `.patterns-fills`");

		p("A documentation site needs a page that hands its height to its region — so the columns scroll and the page does not — WITHOUT covering the site chrome. `.full` welds those two jobs together, so today the choice is “columns that share one scrollbar” or “lose the sidebar”. `patterns.css` carries the split half under a prefixed name and every columned product here uses it; it is pure layout and belongs upstream.");

		p("The gallery makes the same point from the other side: `.full` sets an opaque background, so it can never be a modal. Covering, filling and being opaque are three decisions and one class currently makes all three.").ac("note");

		section("Request 6 — WITHDRAWN, it landed mid-council");

		code(`
this.add("notifications", { initialize(){ this.add("email", …); } });

was      initialize() ran before adoption, so the inner child was named against
         a parent with no url and computed "undefinedemail/"
now      new Page(opts, { name, parent, app }) — adoption through the
         constructor, later args win, initialize() runs WITH a url

verified live, against the current tree:
    parent  /probe-parent/        child  /probe-parent/kid/`,
			"found independently by the url seat; the fix is the one I was going to ask for");

		p("Recorded rather than deleted, because the shape that surfaced it is worth keeping: a nested tab set is an inline page whose `initialize()` adds inline children, and every `route()`-built page was in exactly the same position. Two seats reaching the same fix from different products is the best evidence it was the right one.").ac("note");
	},

	/* ── the two questions this seat was asked ───────────────────────── */

	answers(){
		section("Does the query string need to exist? Yes, and only for one reason");

		code(`
a filter is state that is not a place

?colour=oxblood            one url, one screen, shareable, reload-safe
/colour/oxblood/           works TODAY with route(), and:
                             - two filters need /colour/oxblood/size/l/, so
                               route() parses pairs and chain() gains fake nodes
                             - the path namespace is spent: a category called
                               "colour" is now impossible
                             - /shop/outerwear/ and /shop/outerwear/colour/any/
                               are two urls for one screen
nothing                    works TODAY (DOM state survives back/forward,
                           because pages are built once) and cannot be shared,
                           reloaded, bookmarked or advertised to`);

		p("Two independent products asked for it. The catalogue needs shareable filtered listings, which is a business requirement rather than a nicety — a marketing link goes to a filtered view or it goes nowhere. The dashboard asked for it from a different direction: its `route()` has an `if/else` that disambiguates a panel name from a time range, which is one door for two kinds of thing, and the collision is only waiting for a panel called `7d`.");

		p("The test that settles it: does the segment name a PLACE, or say how to read the place you are at? Place goes in the path. Everything else is a query, and the framework currently destroys it on click.");

		section("Can a settings screen live with url-only state? Yes — better than expected, with one bug");

		code(`
selection    /patterns/settings/billing/    a colleague can be sent the screen
form         unsaved input survives leaving and returning   VERIFIED
reload       unsaved input is gone                          VERIFIED, and correct
per-set      "which sub-tab was I on" is deliberately forgotten — and for a
             settings screen a default section is meaningful, so this is fine
nested sets  BROKEN — request 3`);

		p("The pleasant surprise is the form. Pages are built once and only hidden, so the DOM holding a half-typed form is never thrown away: fill in the account form, open Billing, open Advanced, come back, and it is all still there. Reload and it is not, which is exactly what an unsaved form should do — the alternative would be a settings screen that lies about what is saved.");

		p("So the answer is yes, and the “deliberately not remembered” trade in the readme is the right one here: a settings url that meant two different screens depending on how you reached it would be worse than a forgotten sub-tab. The only thing that genuinely does not work is sub-sections, and every real settings screen has them.").ac("note");
	},

	/* ── the eight products ──────────────────────────────────────────── */

	products(){
		section("Content shape → navigation recipe → what was missing");

		code(`
docs        deep one branch, flat the other      cols + lazy files + inline
            5 files in guide/, 14 pages and 0 files in reference/
            MISSING: nothing caps the column count — 1400px gives 4 columns of
            290px at depth four, and a guide gets less readable the deeper it
            goes. ColumnPager showed the last two of the chain; .cols shows all.
            It cannot be a CSS class either: hidden pages stay mounted, so
            :nth-last-of-type counts every page ever visited in that region.
            Capping needs a number from the chain, which only Router has.

api         115 symbols, 32 with members         route() over a data module
            VERIFIED: route() nests — what it returns is Page options, so the
            claimed page may carry a route() of its own. /api/Store/subscribe/
            costs 3 page.js and 14 js in total.
            The contrast worth stating: a nav over unimported pages knows only
            names; a nav over data knows kind, module, signature and members.
            Laziness costs you knowledge, data costs you the download, and at
            115 symbols the download is cheaper by two orders of magnitude.
            MISSING: previews() is useless here (route()-claimed children are
            not in the map until visited), so every index is hand-built. Fine —
            but every route()-using product in this section hit it.

settings    sections, sub-sections, a form       tabs + a nested tabs file
            MISSING: requests 1 and 3, plus 6 (found here too, now landed).

dashboard   12 panels, one url                   no navigation at all
            A panel is not a page, and the test is not "is it a box" — it is
            "can you link to it". Composition is the default and it is free;
            a panel becomes a page for the cost of one route() branch.
            MISSING: request 2, from the "is a range a segment" direction.

shop        categories, items, FILTERS           inline children + route()
            MISSING: request 2. The sharpest one.

wiki        a graph: no tree, cross-links        route(), one level, flat
            chain() is a tree walk, container() is a tree walk, and
            url = parent.url + name is a tree. A graph gets nothing from any of
            them, so it goes flat and builds backlinks, orphans and recency out
            of its data. That WORKS, and the framework should not grow a graph
            mode — but the cost should be written down: no previews(), no crumb
            trail, no column arrangement, and depth 4 for every note.
            Encoding a path instead is worse: the same note gets a different url
            per route in, and moving a note breaks every link through it.

onboarding  5 ordered steps, no skipping         inline children
            The honest answer is DON'T GUARD. content() runs once so it cannot
            gate; returning null from child() 404s, and Router.go() hands a 404
            to location.assign(), so "not yet" costs a full page reload; a
            redirect from activate() re-enters the Router mid-activation and
            open issue 4 says there is no in-flight guard. Render the step, say
            what is missing, disable the button. On static hosting there is no
            security boundary to enforce anyway: guard the action, never the url.
            I AGREE with the readme's backout of redirect() and Router.enter().
            MISSING: request 4 — the progress bar only works because every step
            calls a module-level complete() that the flow page can see, which is
            impossible the moment two pages live in two modules.

gallery     albums, a photo OVER its album       route() + one overlay class
            A modal route needs NO framework support: the album claims a region
            so it CONTAINS its frames, the frame is position: fixed, and
            .active-ancestor:has(.active-page) — written for tabs — keeps the
            grid alive behind it. VERIFIED: album stays visible, keeps its
            scroll offset exactly (150px in, 150px out), zero re-renders.
            MISSING: router.back() does not exist (Escape calls history.back()
            directly), nothing marks the chrome inert, and .full's opaque
            background means it can never be reused for this.`);
	},

	/* ── method, numbers, dissent ────────────────────────────────────── */

	notes(){
		section("Measured");

		code(`
Playwright 1400×900, against the running sub-site

41 urls          zero console errors, zero horizontal overflow
10 journeys      cold load vs click-through: 6 identical, 4 divergent (the lead)
back/forward     back ×3 then forward ×2 at depth 4 — every hop resolves,
                 retitles, and logs nothing
columns          1 / 580·580 / 387·387·387 / 290·290·290·290 at depth 1..4
catalogue shim   9 items -> 1 on click, url carries ?colour=oxblood, reload
                 reproduces 1, Back restores 9 — all four, zero errors
api filter       115 -> 27 on "query"; survives navigating away and back;
                 gone after a reload; location.search stayed "" throughout

module cost, cold load                          page.js    js total
  /                                                  1          9
  /patterns/                                         2         12
  /patterns/docs/guide/concepts/batches/             6         16
  /patterns/docs/reference/backoff-cap/              4         14
  /patterns/api/Store/subscribe/                     3         14
  /patterns/shop/footwear/boot-01/                   3         14
  /patterns/wiki/idempotency/                        3         14
  /patterns/gallery/harbour/harbour-05/              3         14
  /patterns/settings/notifications/push/             4         14

Laziness survives realistic breadth: the deep docs url fetches exactly its own
chain and nothing else, while 14 inline reference pages, 115 API symbols, 24
catalogue items and 7 sibling products cost zero. The API reference is the
headline — 3 page modules for 115 symbols and 32 member pages.

a dead in-app link    1 FULL document navigation, then "Page Load Error"`);

		p("That last line is a cost worth knowing at scale: `Router.go()` hands an unresolved url to `location.assign()`, so a stale link in a 115-symbol reference reloads the whole app to say 404. Correct in principle — the framework cannot know the url isn't another app's — but a docs site is exactly where stale links accumulate.").ac("note");

		p("The two filters together are the cleanest statement of request 2. The API filter is DOM state and should be: nobody links a colleague to a half-typed search, and it survives a round trip for free because pages are built once. The catalogue's filters are the same mechanism and the opposite requirement — a marketing link goes to a filtered listing or it goes nowhere. One of them needs the url and the other must not have it, which is why the answer is an opt-in hook rather than a behaviour.").ac("note");

		p("Harness note: `Socket.js` had to be stubbed out (`window.WebSocket = class {}`) for the suite to run to completion. LiveReload fires on any write under `public/`, and a reload mid-journey destroys the execution context and fails the run in a way that looks exactly like a routing bug. Worth knowing before someone else spends an hour on it.").ac("note");

		section("How every page shows its own code");

		code(`
const nav = () => ({ meta, title, children, route, content(){ … } });

export default new Page(nav(), { …everything the page SAYS… });

recipe(nav);   // prints the SAME object, via util/source`, "patterns/recipe.js");

		p("Weighed four options and picked one. A hand-typed string (`ui.js`'s `code()`) is dead text in the editor and drifts. `code.fn()` from `ext/highlight` is IDE-checked but is still a second copy, and costs 7 module fetches for the highlighter and its five grammars — which would also make this section the only highlighted one on the site. `demo(fn)` stringifies AND runs, which is wrong for a page declaration that must be constructed exactly once. Fetching `import.meta.url` cannot drift but shows the whole file, and on a realistic product page the content is 90% of it and all of the noise.");

		p("The two-object split wins because it makes drift impossible rather than unlikely: `nav` is executed, so a mistake in it is a runtime error, and it is short because content lives in the second object. Route-claimed pages print their parent's `nav`, which is literally the code that produced them. Cost: one extra module (`util/source`), no highlighting, and an author has to keep navigation out of the second object — which is a constraint that improved every file it touched.").ac("note");

		section("Dissent, and things I did not do");

		code(`
KEEP  redirect() / Router.enter() stay backed out. The onboarding flow is the
      product with the strongest claim on them and it does not want them.

KEEP  container()'s two levels of claim. Every product here fits in $pages plus
      regions, including the modal route, which nobody designed for.

KEEP  "the state is read entirely off the url" as the GOAL. The two breaks in
      the lead are bugs against it, not arguments for remembering state.

NOT DONE  I changed no shared file. patterns.css carries .patterns-fills under
      a prefixed name rather than editing styles.css; the catalogue ships a
      per-page shim rather than patching Router. Both are requests, above.

NOT DONE  Capping the column count. It needs the chain, so it is Router's or a
      new class's, and that is a design decision rather than a fix.`);

		p("One more thing that is not a request. `patterns.css` is 7 rules and one of them — the panel border — is a look rather than layout. A dashboard's meaning is that its readings are independent, and with no edge between them a grid of numbers reads as one list. Three declarations, and I would rather flag it than pretend it is layout.").ac("note");

		div.c("row", () => {
			a.c("page-link", "the eight products →").href("/patterns/");
			a.c("page-link", "the catalogue").href("/patterns/shop/");
			a.c("page-link", "the settings bug").href("/patterns/settings/notifications/push/");
		});
	},
});

import { Page, p, div, a } from "/app.js";
import { code, section } from "../../site/ui.js";

export default new Page({
	meta: import.meta,
	title: "Compound navigation — Eric",

	content(){
		code(`
site/compound/                 ten recipes, all lazy, one page.js each
site/compound/recipe.js        this_file() · when() · cost()
site/compound/compound.css     14 rules — 6 of them bug reports upstream`, "what shipped");

		p("Ten compound recipes, verified in Chromium at 1400×800: every route renders, no route has a console error, no route overflows horizontally, and every deep url reloads to byte-identical output. Five of the ten needed no CSS at all.");

		// ── the recipes ────────────────────────────────────────────────────
		section("The recipes, and when to reach for each");

		code(`
tabs-in-a-column   a section with alternate views AND sub-pages          0 rules
columns-in-full    a task that wants the window and still has structure  0 rules
master-detail      a long uniform list from data — one file for all      4 rules
drilling-tabs      a tab that is really a small section of its own       4 rules
two-bars           two independent choices, only one of them linkable    0 rules
steps              a linear flow: onboarding, checkout, a long form      2 rules
crumbs             any tree deep enough that "where am I" is a question  1 rule
three-layers       an application shell rather than a document           0 rules
tree-from-route    a hierarchy that lives in data, not in files          0 rules
overlay            a modal that is a url, page underneath intact         2 rules`);

		p("Each recipe page states its own `when` and its own `cost` in one sentence each; those lines are canonical and this table is a summary of them. A recipe that could not answer both did not get built.").ac("note");

		p("Two of the ten are mine rather than the brief's, and both earn it. `tree-from-route` is a `route()` that returns a page with its own `route()` — an arbitrarily deep tree, browsed as columns, with zero files below the recipe. `overlay` is a modal that is a url: a `classes: \"full\"` child mounted inside its parent's region, so the parent stays rendered underneath and closing it restores a half-typed input.");

		// ── the drift decision ─────────────────────────────────────────────
		section("Every page prints its own file — and why that one");

		code(`
export function this_file(meta){
    return div.c("code", () => {
        div.c("code-label", new URL(meta.url).pathname);

        // placed NOW, while the captor is still ours; filled when the fetch lands
        const $pre = pre();
        fetch(meta.url).then(res => res.text()).then(src => $pre.text(src.trimEnd()));
    });
}`, "compound/recipe.js — the whole mechanism");

		p("Four options were on the table. The test is not \"does the code shown match?\" but \"can it ever not match?\", and only one of them answers structurally.");

		code(`
fetch(import.meta.url)   ONE artifact — the file. Nothing to drift.      ✓ chosen
demo(fn)                 stringifies AND RUNS fn. Running a page's own
                         layout a second time builds a second copy of it.
code.fn(fn)              a real, IDE-checked function — but a second copy
                         of the code unless the function IS the method.
code(\`...\`, label)        a hand-typed string. Drifts the first time
                         anyone edits the code and not the string.`);

		p("`demo()` is disqualified by what these recipes are. A demo renders a widget into `div.demo-render`; a recipe's product is the page's own arrangement, built by `content()`, `initialize()` and `children:` at mount time. There is nothing to re-run into a box. `code.fn()` is the right tool for a snippet and the wrong one here for the same reason — it would be a second copy of a method that already exists three lines above it.");

		p("So the page shows itself, whole: imports, comments, the `this_file(import.meta)` call that produced the box. That last part is not a flaw, it is the proof — you are looking at the line that drew what you are looking at.").ac("note");

		p("I deliberately did NOT import `ext/highlight` for this, and it was the closest call in the assignment. `code.file(import.meta, \"page.js\")` is the same function, already written, already cached, with colour. But importing it patches `View.prototype.append` and `View.prototype.prerender` for the whole sub-site — and my deliverable is a measurement of new/1's navigation. Putting a monkey-patch of the View layer inside the instrument was not worth syntax colouring. The cost of saying no: five lines of my own fetch, and grey code. Recommend the site adopt `ext/highlight` globally in `site/app.js`, at which point `this_file()` becomes `code.file()` and my five lines are deleted.");

		// ── the trades ─────────────────────────────────────────────────────
		section("Trades I accepted, and what each bought");

		p("This is the part I was asked for, so it is stated as a ledger. A complexity earns its place only if it removes more than it adds.");

		code(`
ACCEPTED — removed more than it added
  one fetch per page      removes every possible drift between doc and code
  .tabs-drill (4 rules)   removes 3 wrong-looking states; opt-in by class
  a CSS counter on steps  removes hand-typed step numbers, which go stale
  recipe = ONE file       removes "which of these five files made this?"

REJECTED — would have added more than it removed
  ext/highlight import    colour, at the price of patching View in the
                          instrument I am measuring with
  load_all_children()     real titles on the index, at the price of the
                          laziness the index exists to demonstrate
  a shared crumbs helper  one import saved, at the price of a recipe whose
                          code is no longer entirely on its own page
  a per-set tab memory    "list + week" as one url, at the price of a url
                          that means two different screens`);

		p("The `steps` counter deserves a sentence, because it is the whole method in miniature. A stepper wants numbers. Typing `\"1. Account\"` into a title is one character cheaper than `counter-increment` and is wrong the instant anyone inserts a step above it. Two CSS lines buy a number that cannot be wrong. That is the same trade as `this_file()`, made in a different language.").ac("note");

		p("The one I refused hardest: `load_all_children()` on the `/compound/` index. Ten cards reading `tree-from-route` instead of `Tree from route()` is genuinely worse for a reader, and one line fixes it. But the index exists partly to demonstrate that ten recipes cost two module imports, and paying ten imports to make ten labels prettier is exactly the trade the framework's laziness was built to refuse. Measured: `/compound/` = 2 modules. The cards stay ugly and the page says why.");

		p("`steps` also settles a naming question the brief raised. I did not add a mechanism for it, because there wasn't one to add: a stepper is `tabs()` with a numbered bar and neighbours computed from `children` order. Both derived, so inserting a step rewires the numbering and both of its neighbours' links, and no file mentions a step it isn't. The navigation type is worth naming — I called it steps — but naming it did not cost a line of framework.");

		// ── where it fought ────────────────────────────────────────────────
		section("Where the framework fought me — 6 requests");

		p("All six are CSS in `site/styles.css`, none is in `App.js`, `Page.class.js` or `Router.js`. That is the headline finding: the three classes held up under everything I could compose, and every wrong-looking screen I hit was a rule in the stylesheet that had only ever been asked one question.");

		code(`
1  .tab-bar's first-child fallback lights the WRONG tab
     at /drilling-tabs/api/detail/ nothing is exactly .active, so
     "overview" highlights while api's panel is on screen.
     MEASURED A/B — with .tabs-drill: api[600], overview default hidden
                    without:          Overview[600], default SHOWN beside api

2  the .default panel renders BESIDE the drilled tab
     .tab-panel:not(:has(> .page.active-page)) is still true when the
     panel's child is an ANCESTOR of the leaf. Needs
     :not(:has(> .page.active-page, > .page.active-ancestor)).

3  .tab-panel > .page { padding: 0 } unpads ONE level
     a tab that drills has grandchildren; they arrive fully padded
     inside an already-padded panel.

4  .page-link.active has no styling at all
     Router.mark_links() writes .active on every in-app link and
     styles.css dresses .nav-link and .tab but not .page-link — so a
     link to where you already are looks like a link somewhere else.
     Every list, rail and crumb trail wants it.

5  .page.full has no scrolling body
     styles.css gives .page.full > .pages "this is the part that
     scrolls"; ordinary content in a full page is silently clipped.

6  .in-path is unusable on a tab bar, by construction
     the first tab's href IS the group url, so it prefixes every tab
     and is permanently .in-path. Any rule keyed on .in-path must
     exclude :first-child by hand. This one is arguably the framework's,
     not the stylesheet's — see below.`);

		p("Request 6 is the only one I would consider changing `Page.tabs()` for, and I am not proposing it. The clean fix is for the bar to read the active chain rather than href prefixes — but selection changes per navigation while the bar is built once, so it would need a hook from `Router.mark()` into the tab bar. That is a routing concept entering `Router` to pay for one layout's convenience, which is precisely what the readme records backing `redirect()` out for. `.tabs-drill` is 4 lines of opt-in CSS in the file that wants the behavior. Leave it there until a second caller appears.").ac("note");

		p("Nothing else fought me. `container()`, `route()`, `regions`, `chain()`, lazy `children` and inline `add()` all composed exactly as documented, including combinations the readme never claimed — a `route()` that returns a page with its own `route()`, an inline page whose only child is a file three directories down, and a `full` page mounted inside another page's region.");

		// ── open #1 ────────────────────────────────────────────────────────
		section("Verdict on Open #1 — container() as action at a distance");

		p("Keep it, unchanged, at exactly two levels. I am the persona most likely to want it gone and I could not find a version worth trading for.");

		code(`
the evidence, from ten recipes

  5 of 10   need container() to do something non-default
  10 of 10  are expressible only because it does
  1 of 10   was confusing to read because of it (three-layers)
  0         needed a THIRD level of claim`);

		p("The distance is real and I felt it exactly once. In `three-layers`, the page you are looking at is decided by three files and only the middle one is on screen: `three-layers/page.js` claims the subtree, `left/page.js` claims its tab children, and `left/tests/` — which mounts inside a panel inside a column inside a fixed page — says nothing about any of it. Reading `tests` tells you nothing about where it lands.");

		p("But look at what the alternative costs. Every recipe here is a child mounting somewhere a parent decided. Making that visible in the child means writing the placement in the child — and then moving a parent, or reusing a page in two arrangements, edits every descendant. `tabs-in-a-column` is the case that proves it: `what/deeper/page.js` is a plain page with no opinion, and it renders as a second column purely because `container()` walked past a parent that claimed nothing. Give `deeper` an opinion and the recipe stops being a recipe — it becomes a fixed layout with a page welded into it.");

		p("So the trade is: one thing a reader cannot see from the child's file, in exchange for every child being reusable and every arrangement living in exactly one place. That is the right side of the ledger, and it is the only piece of black magic in the three classes.");

		code(`
what would make it worse, and should not be added

  a third level of claim      two answered everything I built
  a "where do I mount" prop   the child's opinion is the thing to avoid
  a registry of regions       a second source of truth for one Map`);

		p("One containable improvement, not a design change: `container()` could log which claim it took at each mount, the way `add()` and `child()` already log. `page{/x/} mounts in $pages of page{/y/}` in the console turns the invisible step into a visible one without moving a responsibility. That is the cheapest possible answer to \"a reader cannot see it\" — make it observable rather than declarative.").ac("note");

		// ── measured ───────────────────────────────────────────────────────
		section("Measured — Playwright, Chromium, 1400×800");

		code(`
route                                           page modules  visible pages
──────────────────────────────────────────────────────────────────────────
/                                                    1              1
/compound/                                           2              1   ← 10 recipes, 0 imports
/compound/tabs-in-a-column/                          3              2
   …click "open deeper"                              1              3   ← 1 module on the click
   …reload that same url cold                        4              3   ← identical boxes
/compound/columns-in-full/left/deeper/               5              3   full + 2 columns
/compound/master-detail/1026/                        3              2   240px | 840px tracks
/compound/drilling-tabs/api/detail/                  3              3   all inline, 0 files
/compound/two-bars/week/                             3              3
/compound/steps/payment/                             3              2
/compound/crumbs/alpha/beta/                         3              3   360px each, 5 crumbs
/compound/three-layers/left/tests/                   4              3   full + column + panel
/compound/tree-from-route/framework/core/Page/       3              4   3 synthetic columns
/compound/overlay/sheet/                             3              2   parent live under fixed sheet

console errors      0 on every route
horizontal overflow 0 on every route
.app class          exactly "app" on every route, including all three full pages`);

		p("The two apparent exceptions are deliberate 404s — `/master-detail/9999/` and `/tree-from-route/framework/nope/`, where `route()` correctly declines. `App.error()` logs by design and renders the error page with the chrome intact. Both were checked, both behave as the readme describes.").ac("note");

		section("Laziness survives composition");

		code(`
/compound/                            2 modules for 10 recipes
click into a 3-deep recipe            1 module — only the page you opened
cold /columns-in-full/left/deeper/    5 modules — its own chain, nothing else
/drilling-tabs/api/detail/            3 modules — 4 url segments, ONE file
/tree-from-route/a/b/c/               3 modules at ANY depth — synthetic pages
                                      are objects, so depth is free`);

		p("Composition costs nothing in imports. A deep url pays for its own chain and not one module from any sibling recipe — verified per navigation, counting only requests whose resource type is `script`.");

		p("One honest addition to the ledger: each recipe page also issues one `fetch` of its own source. It is a text fetch, not a module import, it hits the HTTP cache, and it is the entire price of the no-drift guarantee.").ac("note");

		section("url is the only state — the hard test");

		code(`
/compound/tabs-in-a-column/what/deeper/

  reached by clicking      3 visible pages, identical boxes
  reached by reloading     3 visible pages, identical boxes
  selected links           identical set

state that is NOT in the url, and correctly survives anyway:
  two-bars   an <input> keeps its value across a set-2 round trip
  overlay    the page under the sheet keeps its input after open + Back`);

		p("This is the framework's central claim and the compound recipes are its hardest test, because a compound screen has more than one thing selected. It holds. Selection is url state and is reproduced exactly; DOM state is not url state and survives because pages are built once. The two never got confused in ten recipes.");

		// ── dissent ────────────────────────────────────────────────────────
		section("Dissent");

		p("The tab bar's label rule is right and its highlight rule is not, and they are the same rule. `tabs()` labels non-first tabs by their declared name so the bar cannot read differently per entry point — deterministic, and I agree with it. But the highlight is `.active` on an exact href match with a first-child fallback, and that IS entry-point-dependent: at `/drilling-tabs/api/detail/` the raw stylesheet highlights the wrong tab. The label rule was designed against this exact failure mode; the highlight rule was not held to it. Finding 6.");

		p("`.tab-panel > .page { padding: 0 }` is the shape of a rule that was asked one question. It is correct for a tab, and a tab that has children was simply never tried. There are four such rules in `styles.css` and I hit three of them. Not a criticism of the design — a note that the stylesheet has been exercised by one layer at a time, and this library is the first thing to compose them.");

		p("`full` covering rather than removing the chrome is being under-counted. The readme lists it once as an accessibility cost. With `overlay` it becomes a pattern people will reach for constantly, and every use ships a focus trap bug. `inert` on `.sidebar` while a `.full` page is active is one line and belongs to the site. I did not add it because I do not own `site/app.js`.");

		p("The `/compound/` index is worse than it should be and I chose that. Ten cards reading directory names is a real cost paid for a real property. If the council decides labels matter more than the demonstration, `load_all_children()` in `initialize()` is the one-line change, and the note explaining the cards should be deleted in the same commit — an explanation for a cost you are no longer paying is worse than either option.");

		section("Requests, in the order I would take them");

		code(`
1  site/styles.css   .page-link.active — 1 rule, fixes every list and trail
2  site/styles.css   .page.full > a scrolling body — 1 rule
3  site/styles.css   fold the 4 .tabs-drill rules in, unscoped
4  site/app.js       inert on .sidebar while a .full page is active
5  site/app.js       import ext/highlight once; this_file() becomes code.file()
6  Page.class.js     container() logs which claim it took — observability only`);

		p("Nothing on that list is a change to `App`, `Page` or `Router` behavior. After ten compound recipes, the three classes need no new API and no new option — which is the strongest thing I can say about them.");

		// ══ ROUND 2 ════════════════════════════════════════════════════════
		section("Round 2 — does a Page compose?");

		code(`
site/compose/                  seven questions, one attempt to break it
site/compose/compose.css       6 rules, and one of them is the whole answer`);

		p("`/compound/` asked whether navigation composes. This asked whether a `Page` does — inside another page, three times with different data, sharing content, sharing state, standing beside a page it never imported, and filling holes in somebody else's layout. Everything below was measured in the live framework by constructing pages in the console, not reasoned about.");

		section("Seven answers, one line each");

		code(`
1  a page inside a page   content() composes; render() does not. A View
                          is a place, so the 2nd append MOVES it.
2  a page as a component  the parameter lives on the INSTANCE. render()
                          caches per instance, so a component is a factory.
3  fragments              a plain function. The ladder is function ->
                          View subclass -> Page. Stop at the first that works.
4  shared state           yes — the page tree is already a state tree.
                          It is not a binding tree and must not become one.
5  labels before import   the url segment is the only metadata a parent
                          has for free. Everything else costs the module.
6  slots                  already exist. They are called assign().
7  where it runs out      not CSS. Identity.`);

		section("The sentence the whole section reduces to");

		code(`
A View is a place, not a value.
A Page has one parent.

Everything that composes, composes because it is a function or a value.
Everything that is forbidden is forbidden because it is a location.`);

		p("That is why the ledger's third block is short and absolute. It is not policy anybody chose — it is `render()` memoizing into `this.view` plus a DOM node having one parent, and no amount of API would change either.").ac("note");

		section("Task 2 — I could not break it");

		p("Said in the terms it was asked for: CSS-plus-two-classes did not run out. I built a split view of two live urls with independent scroll and a draggable divider, a persistent timer, three instances of one factory side by side, and a page rendered beside a page it does not contain. Every arrangement I could describe, I could build.");

		code(`
what it took, in full

  show a page the Router never marked   .show-all > .page { display: block }
  two named panes                       new Map([["before", $l], ["after", $r]])
  a resizable split                     one custom property, written by a drag
  a persistent timer                    nothing. Nothing tears a page down.

  five of ten compound recipes          zero CSS
  six rules                             the entire compose section`);

		p("The `regions` line is the interesting one. `container()` checks `this.parent.regions` FIRST, and `tabs()` is merely the only thing that had ever written it. Two named panes is two Map entries — so a split view needed no mechanism, just a second author for a mechanism that already existed.").ac("note");

		p("What DID run out is identity, and that is the correct place for a limit to live: it is the one limit that is a fact rather than a decision. Composition failed exactly where composition should fail — when you ask one object to be two.");

		section("Round 2 — four new findings");

		code(`
1  add() reparents, and the url does NOT follow          ← I call this a bug
     x.add("settings", shared)   /x/settings/  chain: x › settings
     y.add("settings", shared)   /x/settings/  chain: y › settings
     …and x.children STILL holds it. One page, one url, a different
     chain, two parents claiming it. Nothing threw. naming() uses ??=,
     so a url that exists is never re-derived; add() reassigns parent
     regardless. link() and the crumb trail now disagree, permanently.

2  assigning activate() silently never mounts
     Object.assign IS the constructor, so every prototype method is
     assignable. Four are load-bearing — activate, render, container,
     chain — and shadowing any of them fails with a blank screen and
     an empty console. THREE writers share one namespace on a Page:
     the prototype, your options object, and alias() writing child
     names onto it. alias() guards. The constructor cannot, because
     overriding is the whole point of it.

3  there is a safe hook for LEAVING and none for ENTERING
     deactivate() does nothing in the base, so overriding it is free —
     and it is the documented place to release a timer. activate()
     mounts the page, so the symmetric thing is a trap. A page that
     must re-read state on the way in has no safe way to ask.

4  regions is public by accident
     container() reads it, tabs() writes it, nothing documents it as
     either. My split view writes it directly and that is the only
     reason a named pane is expressible. Worth deciding on purpose.`);

		section("Requests — round 2");

		code(`
1  Page.add()      warn, or re-derive, when adopting a page that already
                   has a different parent. Silent corruption is the worst
                   kind, and this is the only one I found in three files.
2  Page.activate() call this.entered?.() as its last line — one line, and
                   it makes the enter/leave pair symmetric. deactivate()
                   already established that a hook here is acceptable.
3  readme          name regions as public, or rename it _regions and
                   give tabs() a companion for the named-pane case.
4  readme          list the four load-bearing methods as reserved names.
                   Cheapest possible fix: a sentence.`);

		p("Nothing on that list changes an arrangement, and none of it is urgent — three of the four are documentation. Only #1 is a correctness fix, and it is six lines.").ac("note");

		section("Round 2 — measured");

		code(`
17 compose routes            0 console errors, 0 horizontal overflow
.app class                   exactly "app" on every one
click == reload              identical boxes on /compose/component/throughput/
laziness                     /compose/ = 2 modules for 7 pages
                             every recipe = 3 modules, its own chain only

the live proofs, run in the browser rather than asserted
  fragments   the const view is held by ONE column; badge() by both
  embed       3 boxes -> the 3rd loses its page after you visit it
  component   3 cards visible at once, 4 once route() claims the 4th
  state       basket survives two navigations; receipt re-reads on entry
  labels      "(not imported)" -> still "(not imported)" after visiting
              -> "API" only after pressing re-read
  limits      drag moved the pane 536px -> 386px; move/put-back emptied
              and refilled it; the two-urls corruption reproduced live`);

		p("The labels sequence is the one to read twice. Visiting the child imports it and the children map really does gain a page — and the table on screen does not change, because `content()` ran once and drew a photograph. Question 5 and question 4 turn out to be the same question, and the button that fixes it is the same `refresh()` the state page recommends.").ac("note");

		section("Round 2 — dissent");

		p("Everything in this framework is a snapshot, and only two pages on this site say so. `built once` is sold as what makes a half-typed input survive navigation, which it is. It is equally what makes every derived label, every count, every list-of-children stale the moment the thing it read changes. That is a fine trade and I would keep it — but it is currently discovered rather than documented, and I discovered it by writing a table that was wrong.");

		p("I also think request #1 should be treated as more serious than its size suggests. Every other sharp edge in this council has been visible — a wrong highlight, a blank panel, a clipped page. Adopting a page twice produces an object that renders perfectly and lies about where it is, and there is no screen on which you could see it.");

		div.c("row", () => {
			a.c("page-link", "compound — the recipes →").href("/compound/");
			a.c("page-link", "compose — does a page compose? →").href("/compose/");
			a.c("page-link", "where it runs out →").href("/compose/limits/");
			a.c("page-link", "the labels proof →").href("/compose/labels/");
		});
	}
});

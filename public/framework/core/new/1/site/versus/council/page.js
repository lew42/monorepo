import { Page } from "/app.js";
import { code, section } from "../../ui.js";
import { verdict, ledger, measured, note } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "The council, synthesised",

	content(){
		verdict("Fourteen seats, working in parallel and unable to read each other, converged on one missing feature and disagreed about where to put it. Six independently found that nothing runs after a navigation completes. Three independently wrote the same two-line query-string fix. Re-run after eleven applied changes: seven requests closed, one half-closed on purpose, eleven survive — and two of the applied fixes are contradicted by the evidence of the very seats that asked for them.");

		note("**The ruling on #1 is recorded here because it is the round's design decision.** `App.navigated` was built; `Page.entered()` was refused as a *separate* request rather than merged into it. The a11y seat then found something better than the argument it originally made: it wanted `from.length` to detect first paint, and instead uses `isConnected` — during boot `App.inject()` has not run and `$app` is still detached, so `focus()` on it genuinely does nothing. **That is a precondition rather than a flag**, which is why `navigated(page)` correctly takes one argument and not two. I had this filed as a contradiction; checking it, the seat had already withdrawn it in favour of a better answer.");

		section("The ranked list — status after eleven applied changes");

		note("Independently means: no seat could read another's work when it wrote this. Rank is seat count first, then how cheap the fix is. **Re-run after the owner applied eleven changes** — seven requests closed, one was ruled deliberately half-open, eleven survive. Verified against the source, not against the changelog.");

		ledger(["#", "request", "seats", "status"], [
			["1", "**Something runs after a navigation completes.** Six seats, and three named three different lines.", "**6**", "**HALF CLOSED, on purpose.** `Router.activate()` now ends `this.app.navigated?.(page)`. `Page.entered()` refused as a separate request — the right call, see below."],
			["2", "**`full` is three bugs and an accessibility hole**, not one footnote.", "**5**", "**CLOSED**, all four parts: the `:has()` guard on `.active-ancestor`, `overflow-y: auto`, the sidebar hidden under a full page, and the nav contrast fail."],
			["3", "**Carry the query string.** `Router.click()` still does `go(link.pathname)`.", "**3**", "**OPEN.** Unchanged. Three seats wrote the same two lines and none of them is in."],
			["4", "**Label a lazy child without importing it.**", "**3**", "**OPEN.** No `child_label`, no `live_preview`."],
			["5", "**No in-flight guard** — two fast clicks race, the slower import wins.", "**3**", "**OPEN.** No generation token in `Router`."],
			["6", "**Links rendered late miss `mark_links()`.**", "**2**", "**OPEN.** No observer. A *different* `mark_links()` bug was fixed — the in-page-anchor guard — which is not this one."],
			["7", "**`container()` should log which claim it won.**", "**2**", "**CLOSED.** `mounts_in(view, claim)` logs region / `$pages` / app on every mount."],
			["8", "**A module that throws is reported as a module that isn't there.**", "**2**", "**OPEN.** `Page.missing()` still sniffs the message."],
			["9", "**Inline children of an inline child get broken urls.**", "**2**", "**CLOSED.** Adoption now goes in through the constructor — `new Page({…}, adopt)` — so `initialize()` sees a parent and a url."],
			["10", "**`p()` is not markdown.**", "**2**", "**CLOSED as a rule**, not as code. Third seat to ship literal asterisks; now in the readme."],
			["11", "**`ext/demo` and `ext/highlight` are unusable here.**", "**2**", "**CLOSED.** Six tokens at `:root` — the sixth, `--prim`, was one `md.css` also needed."],
			["12", "Every navigation rescans every page you have ever visited.", "1", "**OPEN.**"],
			["13", "`aria-current=\"page\"` in `mark_links()`.", "1", "**OPEN.** One line, still not in."],
			["14", "`util/source` slices at the first `=>`.", "1", "**CLOSED.** Depth-tracking `arrow_at()`, and it keeps `({ a }) => body` working."],
			["15", "`page-<name>` shares CSS's namespace with `.page-link`.", "1", "**OPEN.**"],
			["16", "`.page-link.active` has no styling.", "1", "**CLOSED**, plus `.in-path` as a bonus."],
			["17", "No error boundary after boot · `popstate` has no failure branch · a failed navigation costs a full reload · `route()` cannot be async.", "1", "**OPEN**, all four — and #17's first item is now *more* load-bearing, see below."],
			["18", "Canonical url on push · scroll to the hash after render.", "1", "**OPEN.**"],
			["19", "Speculative parallel warm.", "1", "**OPEN**, and I dissented from my own request."],
		]);

		section("Two applied fixes that seat evidence contradicts");

		note("This is the part I was asked for, and both are blunt. Neither is visible on screen: **90 route×width runs across every seat came back clean**, so nothing here is a bug you can see today. Both are bugs you can see later.");

		note("**CONTRADICTION 1 — the FOUC fix was applied wider than the seat that proposed it asked for, and it silently kills a different seat's request.**");

		code(`
Router.load(), as applied:
    await this.app.loaded();          // = Promise.all(View.stylesheets ++ this.loaders)
    this.activate(page);

What the MOTION seat actually proposed, in the same breath:
    "app.loaders is an array that only grows, so awaiting it on every
     navigation is O(total loaders); they are all settled, so the cost is a
     microtask, but a NARROWER Promise.all(View.stylesheets) would do the
     same job."                                    — agents/motion/page.js

The narrower one is the fix. The wider one drags loaders into the hot path.`);

		note("**And it falsifies the async seat's PROPOSAL 1 without anyone noticing.** That proposal renames `loaders` to `first_paint`, and its whole premise was measured: *“`App.loaders` is a one-shot first-paint queue, and a push after boot is silently inert… that entry was never awaited by anything, ever.”* That is no longer true — `loaders` is now awaited on **every** navigation. Renaming it `first_paint` today would be actively misleading. **Mark async P1 contradicted, not open.**");

		measured("playwright — measured against the current build", `
app.loaders after boot                       0
  …after /tabs/                              2      tabs() pushes per set
  …after /nav/tabs/                          4      and never drains
every navigation now awaits all of them.

Then: push ONE rejected promise into app.loaders and navigate.
  router.go("/columns/")  threw   "a fill blew up"
  url before /versus/   url after /versus/      <- navigation did not happen
  active page "Versus"                          <- unchanged
  error view rendered?  NO                      <- nothing on screen at all`);

		note("`Router.load()` is not wrapped in a `try`; `App.error()` is only reachable from boot. And `Router.click()` never awaits `go()`, so in real use the rejection becomes an unhandled rejection and **the link simply does nothing, forever, for the rest of the session.** Reachable: `Page.tabs()` pushes `filling` — a `.then()` chain with **no `.catch()`** — into `loaders`, so one throwing tab `content()` now breaks navigation site-wide instead of breaking one tab. That is a severity escalation the fix created.");

		code(`
Two ways out, and the first is the seat's own words:

  1  await Promise.all(View.stylesheets);     // motion's narrower proposal
     — stylesheets are what FOUC is about; loaders were never the point.

  2  keep loaded(), and make Router.load() survive a rejection:
     try { await this.app.loaded(); } catch (e){ console.error(e); }
     — a stylesheet that 404s already resolves rather than rejects, so the
       only rejections here are author fills, which must not stop routing.`);

		note("**CONTRADICTION 2 — the class-fields fix closes seven doors of ten, and the three it misses are the three `render()` reads.**");

		code(`
Declared (the url seat's fix):  view regions $pages loading default_tab parent app
Read by render(), NOT declared: content classes col

alias() writes a child onto \`this\` when \`!(key in this)\`. Those three are not
in \`this\` until something sets them — and a page need never set any of them.`);

		measured("playwright — a page with no own content/classes/col, one child of each name", `
prop           declared?   child aliased over it?
view…app       yes         no      x7   <- the fix works
content        NO          YES     shadowed
classes        NO          YES     shadowed
col            NO          YES     shadowed

render() with a child named "content"
  -> renders the CHILD as its own content. Silent. No error.
     textContent: "victim" + "content" + "I am a child, not the content"

render() with a child named "classes"
  -> THROWS: "arg.split is not a function"   (.ac(this.classes) on a Page)`);

		note("`content` is the one that matters: it is an ordinary section name — this site has a `/content/` — and it is only safe on the root because the root happens to define its own `content()`. Any page that declares a child named `content` and has none of its own renders its child instead, silently.");

		code(`
DO NOT just add three more class fields.

An instance field SHADOWS a prototype method, so declaring \`content;\` would
break \`class MyPage extends Page { content(){ … } }\` — the field wins and the
method is never seen. The existing seven are safe only because none of them is
ever a method. \`content\` routinely is.

Safer, and it says what it means:

    static reserved = new Set(["content", "classes", "col"]);

    alias(name, page){
        const key = name.replaceAll("-", "_");
        if (!(key in this) && !Page.reserved.has(key)) this[key] = page;
    }`);

		note("The general lesson, and it is why this one is worth the lines: `alias()` guards against **properties that exist**, and every bug in this family is a property that does not exist *yet*. Declaring fields fixes the instances of that; it does not fix the shape.");

		section("Already fixed, mid-council");

		code(`
alias() wrote a child onto \`this\` by name, so a page named "route" became
this.route — and the next unclaimed url called a Page as a function.

  nav.route  before visiting /nav/route/ : undefined     404 clean
  nav.route  after  visiting /nav/route/ : object        TypeError

Reported by the nav seat. Now in Page.class.js:

  const claimed = is.fn(this.route) && this.route(name);`, "requested and shipped while the council was still sitting");

		note("Worth recording because it is the shape the process is supposed to have: a seat measured a bug, proposed the one-line guard, and the guard is in the file. It also broke every line-numbered excerpt on this section, which is why `/versus/` quotes code by **name**.");

		section("Agreed without talking — five convergences");

		ledger(["what", "who", "why it matters"], [
			["**Show the real file; never retype code.** `fetch(import.meta.url)` and print it.", "nav · compound · library · versus (4 of 4 that had to show code)", "Four seats independently rejected `demo()` and `code.fn()` for the same stated reason — a typed block is a *copy*, and a copy can drift. This is now the de-facto house rule and nobody proposed it."],
			["**Keep `container()`. Two levels, no third.**", "compound · nav · versus", "The three seats that examined readme Open #1 most closely all voted keep, and all three noted the same fix: make it *observable*, not declarative."],
			["**No new option, flag or hook on the base classes.**", "every seat", "Not one request in the ranked list adds surface to `App`, `Page` or `Router` except #1 — and #1 is a hook the classes already almost have."],
			["**Laziness is worth an ugly label.**", "compound · nav · patterns", "Three seats hit the unresolved-title cost, three refused `load_all_children()`, all three explained the cost on the page instead."],
			["**A global `View` patch is not one seat's to install.**", "compound · async", "Both declined `ext/highlight` for the identical reason: thirteen seats render into one document, and patching `View.prototype` inside the instrument you are measuring with is not a local decision."],
		]);

		section("The contradictions — the part no single seat can see");

		note("These are the valuable ones. Each is two seats being right about different things.");

		code(`
CONTRADICTION 1 — where the post-navigation hook lives.   THE BIG ONE.

Three seats wrote out the exact line they wanted. They are three different lines.

  chrome R2    Router.activate(), last line:
                   this.app.navigated?.(page);            ← a ROUTER event
               "I want this more than Request 1. Four patterns need it and none
                of them can be written without it."

  patterns R4  Page.activate(), last line:
                   this.entered?.();                      ← a PAGE hook
               "Four of the eight products wanted it… overriding activate() in
                an options object silently breaks container() mounting, because
                there is no super in a POJO."

  a11y         Router.activate(), after mark() — and explicitly NOT on Page:
               "only the Router knows when the page it just mounted became
                visible."
               Measured: focus() inside page.activate() does nothing at all,
               because the page is still display:none until mark() adds the
               class. It fails silently and throws nothing.

  async P4     split Page.activate() into activate() + mount()  ← a PAGE seam
  patterns     /shop: query() must run on EVERY activation      ← a PAGE hook
  motion       re-derives a diff the Router already computed    ← a ROUTER event`, "six seats, one name, two mechanisms");

		note("**They are two different requests wearing one name, and the split is real.** A page *entering* the chain needs an overridable seam (`activate()` is currently also placement, which is why overriding it is unsafe). Anything *outside* the chain — chrome, focus, a live region, a motion diff — needs a signal that fires after `mark()`, when the DOM is finally visible, and it must fire even when **no page entered at all**.");

		measured("reading Router.activate() — why a shared-prefix page never hears anything", `
from.slice(shared).reverse().forEach(p => p.deactivate());
to.slice(shared).forEach(p => p.activate());

Pages in the SHARED PREFIX are never touched. So on
  /shop/  ->  /shop/outerwear/
the shop page gets no call of any kind, which is exactly
patterns/shop's bug and exactly chrome's.`);

		note("So the honest answer to #1 is **both, and they are cheap**: `activate()` split so a page can override the entering seam, plus one call at the end of `Router.activate()` for everything that is not a page. One of those is a rename, the other is a line. Neither is an option.");

		code(`
CONTRADICTION 2 — which @layer a seat's stylesheet belongs in.

  async     dissents from the brief and ships @layer theme, citing CLAUDE.md:
            "escalation is a one-way ratchet… spending a rung with no override
             fight to point at raises the cost for everyone after me."

  compound  ships @layer site.
  versus    ships @layer site.

Three stylesheets, two layers, in one document, right now. The async seat is
reading CLAUDE.md correctly and the brief said otherwise. Somebody has to pick.`);

		code(`
CONTRADICTION 3 — "code first, literally."

  nav       dissents, WITH A MEASUREMENT: showing a real file at the top of a
            page pushed the thing the file produced below the fold. Both tab
            bars on /nav/tabs/ started at 900px. One CSS rule capping the box
            took /nav/cols/one/ from 1465px tall to 767.
            Proposed amendment: "code first, AND BOUNDED."

  everyone  followed the rule as written.

This is the only doc-rule dissent in the council with a number behind it.`);

		code(`
CONTRADICTION 4 — how to label a child you have not imported.
                  Three seats, three mechanisms, and they do not compose.

  compound  refuses load_all_children() on principle: ten prettier labels are
            not worth ten module imports. Ships ugly cards + a note saying why.

  chrome R1 Page.child_label(name) — DERIVE it from the name, deterministically:
            "columns" -> "Columns". One line, no import, no document. But it can
            never be the real title, only a guess that reads like one.

  library   live_preview() — an <iframe src> per card. The framed document
            resolves its OWN title, correctly, and imports nothing into THIS
            document. Costs one document per card.

  patterns  one Set fixes "both label bugs" — a third framing again.

Nobody is wrong. chrome buys correctness-of-shape for free; library buys
correctness-of-fact for a document; compound refuses to buy. The right answer
depends on card count, and no seat had the other two's option in front of it.`);

		section("Where a seat contradicted the framework's own readme");

		ledger(["readme says", "measured", "seat"], [
			["A tab label from `title` *“only exists once that page is imported.”*", "The code's rule is `(this.loading \\|\\| i === 0) && page?.title`. `state` is an **inline** child, in memory since construction, with a real title — and its label is still `state`. The behaviour is right; the sentence builds the wrong model.", "nav"],
			["`Pager`'s base class is justified because `TabPager` composes it.", "`show()` is `empty()` + `append()` — both `View`. Strip it and only `leaf()` is novel.", "versus"],
			["*“New pages are added by creating a `page.js` file; no registration anywhere.”* (CLAUDE.md)", "True of `core/`. In new/1 an undeclared `page.js` is a 404 — measured, file served 200, route refused.", "versus"],
			["`full` costs accessibility — listed once, as one item.", "*“Under-counted.”* With `overlay` it becomes a pattern people reach for constantly, and every use ships a focus-trap bug.", "compound"],
		]);

		section("My dissent, against the majority");

		code(`
1  RANK #1 SHOULD NOT BE BUILT AS ONE THING, and six seats asking for it is
   exactly the pressure that would build it as one thing. Two names, two
   places, or it becomes an option with a flag inside a year.

2  I dissent from the enthusiasm for #15 (live_preview) and #14 (my own
   prefetch request). Both are good ideas. Neither has been asked for twice.
   The async seat's rule is the right one — record it so the SECOND request
   is recognised as the second — and I am applying it to my own proposal.

3  THE COUNCIL IS SYSTEMATICALLY BIASED TOWARD ADDING. Fourteen seats spent
   a session looking for what is missing, and found fifteen things. Nobody
   was asked what to DELETE. The strongest finding in this whole exercise is
   the one nobody was assigned: after thirteen sections, ten compound
   recipes and forty-nine live layouts, the three classes needed no new API.
   That result deserves to be the headline and it is buried in a ledger.

4  Against my own section: I claimed CSS "runs out" in three places and found
   only two, because :nth-child(of S) had quietly closed the third. I had
   written the third one down before I tested it. Every seat here should
   assume one of its claims is that claim.`);

		section("The one number that should survive this council");

		measured("counted, across all nineteen ranked requests — after the eleven changes", `
CLOSED                                         7   #2 #7 #9 #10 #11 #14 #16
HALF CLOSED, deliberately                      1   #1 — App.navigated in,
                                                   Page.entered() refused
OPEN                                          11
CONTRADICTED BY AN APPLIED FIX                 1   async P1, the loaders rename

add PUBLIC surface to App / Page / Router      2   #1 (a seam) and #4 (a label)
                                                   — one of the two is now in
delete something                               0   <- nobody was asked

three classes   290 -> 307 code lines    +17    for eleven changes
                578 -> 649 raw lines     +71    (the difference is comments)

No new class, no new option, no new flag.`);

		note("That is the number I would put in the readme. **Eleven applied changes cost seventeen lines of code and zero new concepts** — and the one thing that is genuinely new surface, `App.navigated`, is a duck-typed optional call that costs nothing until a site defines it. Note the second row: 71 raw lines for 17 of code, because every fix arrived with the measurement that justified it written above it. That ratio is the house style working.");

		note("**This is stronger evidence for the design than anything I wrote before the fixes landed**, because a framework that survives *use* has only been tested one way. This one has now been tested by **change** — eleven of them, by a different hand, against thirteen seats' worth of dependent work — and it absorbed them for seventeen lines and broke nothing measurable across 90 route×width runs.");

		section("Next");

		note("`/versus/verdict/` — good for, bad for, and what you would need to know.");
	}
});

import { Page, a, div } from "/app.js";
import { code, section } from "../../site/ui.js";
import { note, verdict, ledger, measured } from "../../site/versus/ui.js";

export default new Page({
	meta: import.meta,
	title: "The Comparativist — versus",

	content(){
		verdict("new/1 is the best of the four designs in this repo and the comparison proving it has only ever been run against the other three. Against its ancestors it wins on every axis but one. Against the field it is not competing: it solves a smaller problem than Next or React Router, and solves it with less machinery than anything else that solves it at all. Recommend it when every screen is a url and the content is static. Do not, when the page must exist without JavaScript.");

		code(`
site/versus/          9 pages, 1 helper module, 1 stylesheet, 7 CSS rules
  ui.js     file() pair() ledger() measured() note() verdict()
  pager/    vs the ColumnPager tier it deleted
  lineage/  vs new/0's eager tree and starter's doomed 404
  container/ vs parent-placement, slots, and a layout component
  css/      two classes vs a layout tier — where CSS actually runs out
  field/    React Router · Next · SvelteKit · Astro, reasoned not benchmarked
  lines/    what 265 includes, and where the complexity went
  council/  thirteen seats: agreements, contradictions, the ranked asks
  verdict/  good for, bad for, what you would need to know`, "what shipped");

		note("18 route×width runs verified at 1400 and 900: zero console errors, zero horizontal overflow, one active page each, every fetched excerpt resolved. Side-by-side code was the stated overflow risk; `minmax(0, 1fr)` and a stack below 62rem hold it.");

		// ── the five findings that are mine ────────────────────────────────
		section("Five findings, in order of how much they change");

		note("**1 — An undeclared `page.js` is a 404.** The single most surprising rule in the tier, and it is currently written down as its opposite.");

		measured("playwright — a real page.js the parent does not declare", `
created   site/versus/probe-undeclared/page.js     valid Page, default export
GET       /versus/probe-undeclared/page.js         200 — the server serves it
visit     /versus/probe-undeclared/                404 — nothing matches

App.load: Error: 404 — nothing matches "/versus/probe-undeclared/"`);

		note("`children.get(name)` returns `undefined` for a name nobody declared, and `undefined` means *not mine* — the filesystem is never consulted. CLAUDE.md's *“New pages are added by creating a `page.js` file; no registration anywhere”* is true of `core/`, which imports straight from the url, and **false of new/1**. It is a good trade — it buys the `route()` ordering and cost-free laziness — but it is the design's most surprising rule and the docs say the reverse. Probe deleted after measuring.");

		note("**2 — CSS does not run out where everyone assumed.** `:nth-last-child(-n+2 of .active-ancestor, .active-page)` expresses ColumnPager's `chain.slice(-2)` exactly, in one selector.");

		measured("playwright — Chrome 151, the exact DOM new/1 produces", `
DOM in activation order, so the stale page from another branch is LAST:
  root .active-ancestor | a .active-ancestor | b .active-ancestor
  | c .active-page | stale

:nth-last-child(-n+2 of .active-ancestor, .active-page)  ->  b, c     correct
:nth-last-child(-n+2)                                    ->  c, stale wrong`);

		note("So the one feature I had written down as *“lost with ColumnPager”* was never lost. It is live on `/versus/css/` — five boxes, two highlighted, `stale` last in the DOM and correctly dark. **I had the third limit written down before I tested it**, which is the mistake I would tell every other seat to go looking for in its own report.");

		note("The honest remainder: CSS runs out in exactly **two** places — producing text (every label, every crumb) and relating a url to a link. Both are already JS, and together they are most of what the 290 lines are.");

		note("**3 — The walk is fully serial, and structurally cannot be otherwise.**");

		measured("playwright — page.js fetches on a cold load", `
/                          1 module
/deep/nesting/a/b/c/d/e/   8 modules, and 7 of 7 hops began strictly AFTER
                           the previous response ended

load_segments() awaits child(name) before it knows what to ask for next.`);

		note("Free on localhost; eight round trips before first paint on a 100ms link, growing linearly with depth — which is exactly where a docs site lives. The fix needs no new concept, because every module url is derivable from the path *before* the walk starts: fire them all, then walk into a warm registry. Sketched on `/versus/field/`, **not** proposed for the default — it speculatively fetches urls a `route()` might have claimed. Opt-in or not at all.");

		note("**4 — The `Pager` base class never earned its keep, and its readme says the opposite.** `Pager/readme.md` argues `TabPager` *“is the honest justification for `Pager` existing”* because the panel **is** a plain `Pager`. It is not: `show()` is `empty()` + `append()`, both `View` methods, plus one assignment. Strip it and only `leaf()` is novel — four lines that read `app.page`. I dissent from that readme, and the record should be corrected rather than preserved.");

		note("**5 — 265 is the one number that is true and misleading.** Measured 290, or 267 without its own logging, which is what 265 counts. It sits on a 492-line `View` — 1.7× the tier. Quote **17** (index.html + a page.js: a working, routed, lazily-loaded site) or quote **830**. 265 is the count of a middle layer presented as the count of a system.");

		// ── what the refactor cost ────────────────────────────────────────
		section("vs the Pager tier — the ledger");

		note("Deleting it was right. Nine lines of CSS replace 287 lines of layout classes, three coordinating call sites become one, and two of ColumnPager's own open questions closed for free. Row by row, the only genuine loss:");

		ledger(["ColumnPager had", "new/1", "call"], [
			["a per-topic sidebar, derived from `root.children` at zero configuration", "one hand-typed global nav", "**the only real loss** — and it is the laziness tax, not this refactor: eager children were Pages, lazy children are strings"],
			["breadcrumbs · topbar · burger · `close()`", "`chain()` + a link, or site chrome", "relocated, all of it"],
			["`.col-bar` — the `/path` + ✕ strip", "gone", "its own readme called it *“developer chrome… reads as an IDE”*"],
			["`Pager.show()` — swap with no url", "`$region.empty().append(page.render())`", "never earned its class"],
			["two columns, hard-coded `chain.slice(-2)`", "any number, and *also* the last N — one selector", "**new/1 wins**, and by more than it knew"],
			["re-renders the whole pager per navigation", "never rebuilds", "**new/1 wins** — ColumnPager's open question #3, closed for free"],
		]);

		note("287 lines to 10. `container()` asks a smaller question than `host()` did — *where do I mount*, not *who owns the layout* — and `load_ancestors()` has no reason to exist, because walking the url **is** the loader.");

		// ── container ─────────────────────────────────────────────────────
		section("Open #1 — keep it, and it is not a style choice");

		note("`container()` is right, and the complaint is fair about a cost that is genuinely bought. Once pages are built once and never rebuilt, **there is no render pass in which a parent could place a child** — so the child must find its own home. All three alternatives trade that persistence away, and persistence is what pays for the scroll retention and DOM identity.");

		ledger(["", "reads well?", "survives depth?", "keeps DOM identity?", "call"], [
			["`container()` — current", "no, and it says so", "yes", "yes", "**best**"],
			["a layout owns its children (ColumnPager, Next `layout.tsx`)", "**best**", "yes", "no — rebuilds", "right if you re-render; this tier does not"],
			["slots / portals", "yes", "yes", "yes", "silent-failure namespace, and it freezes a child into one role"],
			["the parent places the child", "yes", "**no**", "yes", "`container()` with more steps"],
		]);

		note("The slots case is the interesting one, because it *would* answer the complaint. It loses on a decision the current design gets right: `tabs(\"what why\")` decides **at placement** which children are tabs, so one page can have several sets and a child in no set is ordinary. With slots the child declares *“I am a tab”* — and then it is only ever a tab. **Nothing on a Page says what role it plays, and slots would delete that.**");

		note("My one change, and it is my top request: **`container()` should log which claim it won.** Every other method in these three classes logs — `child()` its import, `activate()` the chain diff, `add()` the adoption. `container()` is the only silent one, and it is the only thing a reader cannot see. Three lines, no API, no new concept. The compound seat asked for exactly this, independently.");

		// ── council ───────────────────────────────────────────────────────
		section("The council — the ranked asks");

		note("Nineteen requests, ranked by how many seats independently wanted each. Re-run after eleven applied changes — seven closed, one half-closed on purpose, eleven survive. Full table with status on `/versus/council/`. The top five:");

		ledger(["#", "request", "seats", "status now"], [
			["1", "**Something runs after a navigation completes.** Three of six named three different lines.", "**6**", "**half closed on purpose** — `App.navigated` in, `Page.entered()` refused separately"],
			["2", "**`full` is three bugs and an accessibility hole**, not one footnote.", "**5**", "**closed**, all four parts"],
			["3", "**Carry the query string** — `Router.click()` silently edits the author's own href.", "**3**", "**open**"],
			["4", "**Label a lazy child without importing it.**", "**3**", "**open**"],
			["5", "**No in-flight guard** — two fast clicks race, the slower import wins.", "**3**", "**open**"],
		]);

		note("Also closed: `container()` logging, inline-child adoption, the ext tokens, `util/source`, `.page-link.active`, and `p()`-is-not-markdown as a readme rule. Still open: late-link marking, missing-vs-broken modules, `aria-current`, the `page-<name>` namespace, tim's four, urls' two, and my own speculative warm.");

		section("Two applied fixes that seat evidence contradicts");

		note("Asked for bluntly, so: both are real, neither is visible today. **90 route×width runs across every seat came back clean** — these are bugs you see later, not now.");

		note("**1 — The FOUC fix was applied wider than the seat that proposed it asked for.** `Router.load()` awaits `this.app.loaded()`, which is `Promise.all(View.stylesheets ++ this.loaders)`. The motion seat proposed it and in the same breath said the narrower `Promise.all(View.stylesheets)` *“would do the same job”*, because `loaders` only grows. The narrow one is the fix.");

		note("**It also silently falsifies the async seat's PROPOSAL 1.** That rename — `loaders` → `first_paint` — rests on a measurement: *“a push after boot is silently inert… never awaited by anything, ever.”* `loaders` is now awaited on **every navigation**, so `first_paint` would be a lie. **Mark async P1 contradicted, not open.**");

		measured("playwright — against the current build", `
app.loaders   boot 0  ->  /tabs/ 2  ->  /nav/tabs/ 4     never drains

push ONE rejected promise into app.loaders, then navigate:
  router.go("/columns/")   threw "a fill blew up"
  url /versus/ before and after      navigation did not happen
  active page unchanged              error view rendered? NO`);

		note("`Router.load()` has no `try`; `App.error()` is boot-only; `click()` never awaits `go()`. So a rejected loader makes the link do **nothing, silently, for the rest of the session** — and `Page.tabs()` pushes a `.then()` chain with **no `.catch()`** into `loaders`, so one throwing tab `content()` now breaks navigation site-wide instead of breaking one tab. The fix created that escalation. Either take motion's narrower line, or wrap the await in a `try`.");

		note("**2 — The class-fields fix closes seven doors of ten, and the three it misses are the three `render()` reads.** `alias()` writes a child onto `this` when `!(key in this)`. Declared: `view regions $pages loading default_tab parent app`. Not declared, and read by `render()`: **`content`, `classes`, `col`.**");

		measured("playwright — a page with no own content/classes/col, one child of each name", `
view … app     declared     not shadowed   x7    <- the fix works
content        NOT declared SHADOWED  -> renders the CHILD as its own content,
                                         silently, no error
classes        NOT declared SHADOWED  -> THROWS "arg.split is not a function"
col            NOT declared SHADOWED`);

		note("`content` is the reachable one — an ordinary section name, and this site has a `/content/`. It is safe on the root only because the root happens to define its own `content()`.");

		note("**Do not just declare three more fields.** An instance field shadows a prototype method, so `content;` would break `class MyPage extends Page { content(){ … } }`. The existing seven are safe only because none of them is ever a method; `content` routinely is. A `static reserved = new Set([\"content\", \"classes\", \"col\"])` checked in `alias()` says what it means and carries no such risk.");

		note("The shape behind both: `alias()` guards against properties that **exist**, and every bug in this family is a property that does not exist *yet*. Declaring fields fixes the instances; it does not fix the shape.");

		section("What the changes cost");

		measured("counted — three classes, before and after the eleven changes", `
290 -> 307 code lines    +17
578 -> 649 raw lines     +71     the difference is comments

No new class, no new option, no new flag.`);

		note("**Eleven applied changes cost seventeen lines of code and zero new concepts.** This is stronger evidence for the design than anything in my first report, because a framework that survives *use* has been tested one way only — this one has now been tested by **change**, eleven of them, by a different hand, against thirteen seats of dependent work, and it absorbed them without growing a concept.");

		section("The contradiction worth the whole exercise");

		code(`
Six seats want "something after a navigation".
Three wrote out the exact line. They are three different lines.

  chrome R2    Router.activate():  this.app.navigated?.(page);   a ROUTER event
  patterns R4  Page.activate():    this.entered?.();             a PAGE hook
  a11y         Router.activate(), after mark() — and explicitly NOT on Page:
               "only the Router knows when the page it just mounted became
                visible." Measured: focus() inside page.activate() does
                nothing, because the page is display:none until mark() runs.`);

		note("**They are two requests wearing one name.** A page *entering* the chain needs an overridable seam. Anything *outside* the chain — chrome, focus, a live region, a motion diff — needs a signal after `mark()`, and it must fire even when **no page entered at all**, which is precisely the `/shop/ → /shop/outerwear/` case where the shared prefix is never touched.");

		note("So the answer is **both, and both are cheap** — but built as one thing it becomes an option with a flag inside a year. That is the single most actionable sentence I can offer this council.");

		section("Agreed without talking");

		ledger(["what", "who"], [
			["**Show the real file; never retype code.** `fetch(import.meta.url)` and print it.", "nav · compound · library · versus — 4 of the 4 seats that had to show code, none of whom could read the others"],
			["**Keep `container()`. Two levels, no third.**", "compound · nav · versus"],
			["**Laziness is worth an ugly label.**", "compound · nav · patterns"],
			["**A global `View` patch is not one seat's to install.**", "compound · async — both declined `ext/highlight` for the identical reason"],
		]);

		note("The last one is why `/versus/` has a nine-line local `emphasis()` instead of importing `ext/markdown`: thirteen seats render into one document, and patching `View.prototype` is not a local decision.");

		section("Dissent, including against myself");

		code(`
1  RANK #1 MUST NOT BE BUILT AS ONE THING. Six seats asking for it is exactly
   the pressure that would build it as one thing.

2  I dissent from my own request #19 (speculative warm) and from #4's
   live_preview(). Both are good. Neither has been asked for twice. The async
   seat's rule is right — record it so the SECOND request is recognised as
   the second — and it applies to me.

3  THE COUNCIL IS SYSTEMATICALLY BIASED TOWARD ADDING. Fourteen seats spent a
   session looking for what is missing and found nineteen things. Nobody was
   asked what to DELETE. The strongest result here is the one nobody was
   assigned: nineteen requests, and only TWO add public surface.

4  AGAINST MYSELF: I claimed CSS ran out in three places and found two,
   because :nth-child(of S) had quietly closed the third — and I had written
   the third down before testing it. Every seat should assume it has one
   claim of that shape.

5  AGAINST MYSELF: all nine of my pages shipped literal ** in prose, the exact
   bug two other seats had already measured and reported. Found by measuring
   my own output, not by reading it. 195 instances.`);

		section("Two things this section cannot claim");

		code(`
NOT RUN HERE   every statement about React Router, Next, SvelteKit and Astro.
               No new npm dependency is permitted, so I could not install one,
               could not benchmark one, and did not. /versus/field/ carries no
               cross-framework number at all, deliberately.

NOT DURABLE    excerpts were quoted by LINE NUMBER for the first hour and the
               ranges rotted inside it — Page.class.js gained four lines while
               I worked. They are quoted BY NAME now: file(url, "container(){")
               re-finds its block on every load and says so in red when the
               block is gone. Same lesson four other seats reached from the
               other direction.`);

		section("Where the pages are");

		code(`
/versus/           the verdict, and the ledger of what was bought and cost
/versus/pager/     START HERE — the comparison the other seven refer back to
/versus/css/       the live :nth-last-child(of S) probe
/versus/council/   the ranked list, the agreements, the contradictions`);

		div.c("row", () => {
			a.c("page-link", "→ /versus/").href("/versus/");
			a.c("page-link", "the ranked asks →").href("/versus/council/");
			a.c("page-link", "the verdict →").href("/versus/verdict/");
		});
	}
});

import { Page, p, div, a } from "/app.js";
import { code, section } from "../../site/ui.js";

export default new Page({
	meta: import.meta,
	title: "Librarian — the Layout Library",

	content(){
		code(`
site/library/page.js      19 live tiles, 62 cards, 8 arrangements
site/library/library.css  6 rules, layout only
agents/librarian/live_preview.md   the framework proposal, ready to paste

/library/                         the gallery
/library/<arrangement>/           the arrangement, live, with its own source
/library/<arrangement>/<place>/   the arrangement doing its job — and the switcher`, "what landed");

		p("Every tile is an `<iframe>` at a real url, shrunk with `zoom`. Nothing is a clone, a screenshot or a mock — click a tile and you land on the exact document it was showing.").ac("note");

		section("Curation, not machinery");

		code(`
before   49 live tiles, one flat shelf per SEAT      50 documents
after    19 live tiles, one promoted per KIND        20 documents
         43 alternates as ordinary links              0 documents`);

		p("A reader arrives asking *how do I do columns*, never *what did Steve build* — so the catalogue is grouped by arrangement kind, one specimen of each promoted to a live tile and the rest as plain `.page-preview` links. That is the whole reduction. An `IntersectionObserver` would have made the page lazier without making it better, and it is an editorial problem: **deciding what to promote is a librarian's job, not a browser's.**").ac("note");

		// ── the decision ────────────────────────────────────────────────────

		section("Why an iframe, and not a second Page instance");

		code(`
                        second instance in-document      <iframe src>
second instance         IMPOSSIBLE (measured)            n/a — it IS one
.page{display:none}     0x0, needs a CSS fight           .active-page already
.full{position:fixed}   escapes the tile (measured)      covers the tile
inner viewport          the tile's width                 1400px (measured)
async boundary          inside the capture system        the browser's job
cost                    0 documents                      1 document per tile`);

		p("The first row settles it, and it is measured, not argued. `import()` is memoised, so `/full/left/page.js` hands **every** caller the same `Page` object:").ac("note");

		code(`
await import("/full/left/page.js").default === app.root.full.children.get("left")
// true

// so a second tree would do this, to the pages the live tree is using:
add(name, child){ page.assign({ name, parent: this, app: this.app }) }
//                                    ^^^^^^ reassigned on a SHARED page`, "measured in the console at /full/left/deeper/");

		p("A second tree can only own its **first** level. Everything below is shared with the live tree, and `add()` reassigns `.parent` on it — two trees, one set of leaves, and the deeper walk wins. Cloning is not a workaround either: `new Page({...original})` hands the constructor a `children` **Map**, which `declare()` iterates as if it were a declaration list and throws.").ac("note");

		p("The other three rows are each independently fatal, which is worth saying because it means the decision is not close. A page rendered outside the chain measures **0x0** — `.page { display: none }` and the Router only marks its own chain. A `.full` page is `position: fixed; inset: 0`, and a `zoom`ed ancestor does **not** contain it (measured — `contain: layout` does, but then the tile's own offset gets scaled too). And a layout wants a desktop viewport; a document has one.").ac("note");

		// ── the small render ────────────────────────────────────────────────

		section("zoom vs scale — measured, both, at 1400x800");

		code(`
iframe 1400x800     inner viewport   painted box   LAYOUT box
zoom: .23           1400px           322x184       322x184
scale(.23)          1400px           322x184       1400x800   <- phantom

/full/left/deeper/ inside either:  660 | 660  — identical to full size`);

		p("Both are correct. `zoom` wins on the third column only: it shrinks the box **in flow**, so the shelf needs no fixed cell size and nothing to clip. One property instead of a wrapper, an explicit size and an `overflow: hidden`.").ac("note");

		section("The fixed inner width is the whole trick");

		code(`
zoom .25, no inner width     3 flex children @ 117 LAYOUT px  -> a 350px design
zoom .25, width: 1400px      3 flex children @ 467 LAYOUT px  -> a 1400px design`);

		p("`zoom` **reflows**. A frame left to size itself computes its layout against the tile and re-flows the design instead of shrinking it — the failure looks like a working page, which is why it has to be measured rather than eyeballed. With an iframe the fixed width is simply the element's `width`; there is no inner wrapper to remember.").ac("note");

		// ── the async boundary ──────────────────────────────────────────────

		section("The async question dissolved");

		p("The brief asked what a tile shows before its page has loaded, and how it upgrades without breaking the synchronous-capture rule. With a frame the answer is that there is no upgrade: `<iframe src>` is a **synchronous element whose contents are fetched by the browser**. It never touches `View.captor`.");

		code(`
function frame(url){
    return iframe.c("page-frame").attr("src", url).attr("loading", "lazy").attr("title", url);
}`, "the entire loading story");

		p("`content()` ended up with **zero** awaits. An earlier draft probed each specimen's module with `fetch(…, {method:'HEAD'})` and filled the shelf asynchronously — correct capture shape (`div.c(…, async $shelf => $shelf.append(…))`, naming the target), but it cost a console 404 per absent directory, which is indistinguishable from a real failure. Reverted, for the reason this framework already gives: *only declared names ever hit the network*. The catalogue is hand-typed like the sidebar, and checked against disk before each run.").ac("note");

		// ── the framework request ───────────────────────────────────────────

		section("The framework request — one method");

		p("Almost nothing is needed. `iframe` is already a View factory, so the gallery required **no** framework change. The one thing worth adding is the live twin of `preview()`, because it makes an argument `previews()` cannot:");

		code(`
// Page.class.js — a sibling of preview(), never a replacement.
function live_card(url, title){                     // module scope: needs ONLY
    return a.c("page-preview", () => {              // a url and a label, which
        iframe.c("page-frame")                      // is the whole argument
            .attr("src", url).attr("loading", "lazy").attr("title", title);
        div(title);
    }).href(url);
}

live_preview(){ return live_card(this.url, this.title ?? this.name); }

live_previews(){
    return div.c("page-previews", () => this.children.forEach((page, name) =>
        page ? page.live_preview() : live_card(this.url + name + "/", name)));
}`, "proposed — Page.class.js");

		p("The exact bodies, the failure modes, the cost line and the argument against an option all live in `agents/librarian/live_preview.md`, written to be pasted.").ac("note");

		section("…and it is verified, not proposed on paper");

		code(`
patched onto the real Page.prototype, run on /tabs/ (which imports only its first child)

child_states   overview=Page  api=null  guide=null  state=Page  notes=Page
                              ^^^^^^^^  ^^^^^^^^^^ never imported

card           href              label   frame renders
               /tabs/api/        api     page-api    active-page
               /tabs/guide/      guide   page-guide  active-page

console errors 0`);

		p("Read those two rows together. The **label is still the declared name**, because the parent never imported them and still has not — and the **frame rendered the real page anyway**. Both branches of `live_previews()` produce a complete card, which `previews()` cannot claim.").ac("note");

		p("That also corrects an overclaim I made in the first report. `previews()`'s documented cost does not *disappear* — the card's label is still `api` rather than `API reference`. What happens is better stated and smaller: **the cost stops mattering**, because the page the title was standing in for is now visible inside the card. Laziness is preserved exactly.").ac("note");

		code(`
.page-frame { display: block; border: 0; width: 1400px; height: 800px; zoom: .23; }
.page-preview .page-frame { pointer-events: none; }`, "proposed — the framework's half of the CSS");

		p("The `width` is **load-bearing behaviour, not a look** — without it the framed layout reflows, which is the one thing a preview must not do. The three numbers are a matched set. The second rule is not optional: without it the iframe swallows the click and the card's own `href` never fires.").ac("note");

		// ── bugs found ──────────────────────────────────────────────────────

		section("What the library found, none of it mine");

		code(`
util/source/source.js   source(fn) printed a FRAGMENT          FIXED by Mike
site/forms/field.js     every url under /forms/ threw          FIXED by that seat
site/content/           loaded a content.css that did not exist FIXED by its author
site/styles.css         a full page with no region hides its child   accepted, deferred
site/page.js            /start/ ships 3 page.js files and is UNREACHABLE   open`);

		p("Five findings from one page that does nothing but render every url at once. Three were fixed by their authors during the run — which is the argument for treating `/library/` as infrastructure rather than a demo.").ac("note");

		section("New: /start/ exists and cannot be reached");

		code(`
site/start/page.js          on disk
site/start/files/page.js    on disk
site/start/second/page.js   on disk

/start/  ->  404 — nothing matches "/start/"

children: "replace columns tabs dynamic full nav compound deep library chrome
           patterns motion a11y perf async urls content forms versus council"
                                                                        ^ no "start"`, "site/page.js");

		p("A page nobody declared does not exist — CLAUDE.md says exactly this, and here it is costing a whole topic. `start` is missing from the root's `children` string, so the walk never reaches it and three finished files are invisible. One word fixes it. It is `site/page.js`, so it is yours.").ac("note");

		p("**1. `source()` sliced at the first `=>`, which may be a nested one** — since fixed, and it was worse than reported: *any* ordinary function containing an arrow printed a fragment, silently, as valid-looking code that simply was not the code you wrote. It affected `demo()` and `code.fn()` across the real site, not just here. Three of my arrangement pages showed fragments until I caught it by reading the rendered page rather than the source.").ac("note");

		code(`
source(function(){ this.$pages = div.c("pages cols", () => $col = div.c("col")); return $col; })

// prints:            $col = div.c("col"));  return $col;  }        <- a fragment

// the fix — an arrow only counts if it comes before the first brace
const open  = src.indexOf("{");
const arrow = src.indexOf("=>");
const body  = arrow !== -1 && (open === -1 || arrow < open) ? src.slice(arrow + 2).trimStart() : null;`, "util/source/source.js");

		p("Only *concise* nested arrows break it — `() => { … }` recovers by accident, because the remainder still starts with a brace. My arrangements take `page` explicitly instead of using `this`, which sidesteps it and reads better anyway; the fix above is still worth making.").ac("note");

		p("**2. `.page.full.active-ancestor` is unconditional**, where every other ancestor rule asks `:has(.page.active-page)`. So a `full` page whose child mounts elsewhere keeps covering the window, and the child renders **behind** it — visible in the DOM, `display: block`, and completely invisible. Nothing throws.").ac("note");

		code(`
.page.full.active-page,
.page.full.active-ancestor:has(.page.active-page) { position: fixed; inset: 0; … }
/*                       ^^^^^^^^^^^^^^^^^^^^^^^ matching the general rule */`, "site/styles.css — proposed");

		p("This is the sharpest concrete evidence yet for the readme's Open #1. A page declares `classes: \"full\"`, forgets to claim a region, and the failure appears in a *different* file with no error anywhere. My `full` recipe claims a region for exactly this reason, and says so in its own source.").ac("note");

		p("**3. `/forms/` was down** — `control.attr is not a function` at `forms/field.js:25`, every url under it erroring. Fixed by that seat, and `/forms/wizard/` is now the applied catalogue's wizard specimen. A tile is a live page or it is not a tile, so it stayed out until it rendered.").ac("note");

		// ── names ───────────────────────────────────────────────────────────

		section("The names");

		code(`
frame(url)        an <iframe> at a url, shrunk. Says HOW, which is the
                  non-obvious part — a reader must know it is a document.
tile(url,…)       one gallery cell: a card, a frame, a caption.
tiles(list)       a set of them. RENAMED from shelf() — see below.
alternates(list)  the rest of a kind, as links. Not mounted, one click away.
variants(place)   the switcher: every arrangement, at the place you are in.
arrange(page)     the ONE thing that differs between arrangements, and the only
                  function whose source is printed. Takes page, not this.
in_a_frame()      RENAMED from framed(). A predicate, and now unmistakably one.
.page-frame       prefixed into the framework's existing .page-* family, so it
                  sits beside .page-preview / .page-previews where it belongs.
.kind             a kind's promoted tile with its alternates beside it.
.master-detail    .cols with the first track pinned. Rare, genuinely compound.`);

		p("**`framed()` → `in_a_frame()`.** It read as a predicate *and* as a past participle of `frame()`, three lines apart — exactly the ambiguity the naming rule exists to prevent, and it would have collided with a `frames()` on Page.").ac("note");

		p("**`shelf()` → `tiles()`, and `shelf` was wrong.** It was named for the library metaphor rather than for the thing, which is decoration — the test is whether the name answers *what* on its own, and \"shelf\" answers *where in a library*. The deciding argument is that the framework already owns this exact singular/plural pair: `preview()` builds one card, `previews()` builds the container of them. `tile()` / `tiles()` follows the house pattern and adds no vocabulary at all. `alternates()` earns its length by being the rarer, compound half.").ac("note");

		p("`zoom` and `scale` were deliberately **not** invented as names: the CSS property is called `zoom`, so the stylesheet and any conversation about it use the same word.").ac("note");

		// ── variants ────────────────────────────────────────────────────────

		section("The switcher — the one idea here worth stealing");

		code(`
/library/cols/two/   ->   /library/tabs/two/
 ^ arrangement ^ place      ^ changed    ^ kept

function variants(place){
    return div.c("row", () => recipes.forEach(r =>
        a.c("tab", r.title).href("/library/" + r.name + "/" + place)));
}`, "library/page.js");

		p("A url here is two independent facts — which arrangement, and which place — and the switcher varies exactly one. Switching from `two` under Columns lands on `two` under Tabs: you keep your place and only the arrangement changes. That is what makes these *variants* rather than eight unrelated demos.").ac("note");

		p("There is **no selected-state code, and no current-variant to store.** Every entry is a real url, so `Router.mark_links()` writes `.active` on the one that matches — the same pass that lights the sidebar. Reload-identical comes free, because the state IS the url. `.row` for layout and `.tab` for the look; deliberately not `.tab-bar`, whose `:first-child` fallback would light a wrong entry on a url the bar does not contain.").ac("note");

		p("It is rendered by the **child**, never the arrangement — only the child knows the place to keep. That is also why every gallery tile opens a child rather than an arrangement root: you land where the switcher works.").ac("note");

		p("The limit is worth stating, because it is the honest constraint on the pattern: **a switcher can only preserve a place both sides can name.** `drill` claims any segment while the other seven claim `one two three`, so below drill's first level the bar can only offer the arrangements themselves — and says so on the page instead of quietly linking to urls that would 404.").ac("note");

		section("What a variant turned out to be");

		code(`
const kid_body = function(){ … };                 // ONE function object
const kid = name => KIDS.includes(name) && { title: name, content: kid_body };

recipe("cols",  "Columns", page => { page.$pages = div.c("pages cols", …); … })
recipe("tabs",  "Tabs",    page => { page.$tabs  = page.tabs("one two three"); … })
//     ^ same three children, same content, different arrangement, own url`);

		p("A variant is the same content under a different arrangement — so all eight recipes share the *same function object* for their children. The claim is checkable by identity rather than by reading, which is the only version of that claim worth making. Each is a real url, and each reloads to exactly what clicking produced (verified, all eight).").ac("note");

		p("The design deliberately has **no detail page**. An earlier plan had `/library/<recipe>/` describe an arrangement and frame it; that is a page *about* a layout, which is the screenshot problem wearing a different hat. Instead the recipe url **is** the arrangement, live, with its own source in column one — exactly how `site/columns/page.js` already does it.").ac("note");

		// ── children ────────────────────────────────────────────────────────

		section("Inline pages nest exactly one level");

		code(`
constructor(...args){ …; this.initialize?.(); }        // runs HERE
add(name, child){ new Page(child); page.assign({ name, parent: this }) }   // …parent lands HERE

// so a grandchild built in a nested initialize() derives its url from a
// parent that has none yet:
add("one", …) -> naming() -> this.parent.url + "one/" -> "undefinedone/"`);

		p("`route()` is the way down, and it is the right one: it runs on the walk, after adoption, when `this.url` is real. All eight recipes claim their children that way, and `drill` hands the **same** `route()` to every level it creates, so `/library/drill/a/b/c/d/e/` resolves with no files and no declarations.").ac("note");

		p("Worth a framework fix all the same — `add()` could call `child.initialize?.()` after assigning the parent rather than letting the constructor do it, or `naming()` could recurse. Either makes two-level inline trees behave the way everyone will expect them to.").ac("note");

		// ── measured ────────────────────────────────────────────────────────

		section("Measured — Playwright, 1400x800");

		code(`
live tiles             19, every one live; 0 broken, 0 zero-height
cards total            62 — 19 live, 43 alternates costing nothing
frame box              322x184, uniform across all 19
inner viewport         1400px in all 19
inner render           .active-page present and non-empty in all 19
horizontal overflow    0, outer and inner
console errors         0.  failed responses: 0
recursion guard        /library/ inside a frame builds 0 frames

switcher               24 urls — 8 arrangements x 3 places — ALL pass:
                       exactly one entry marked, 8 targets, reload-identical
place preserved        from /library/cols/three/, clicking Tabs, Full,
                       Master/detail and Replace lands on .../three/ every time

first tile in the DOM  347 ms
network idle           2.2 s
documents              20, down from 50 — curation, no machinery
lazy deferral          1 document when /library/ is a hidden ancestor.
                       Does NOT defer much on the open gallery — measured,
                       and the reason curation is the real control.`);

		p("The gallery paints in ~350ms and the frames stream in behind it, because every tile is placed synchronously and only its *contents* are late. Nothing blocks.").ac("note");

		// ── dissent ─────────────────────────────────────────────────────────

		section("Dissent");

		p("**A document per tile is not free, and curation is the only honest control.** Twenty documents is affordable; fifty was not, and no amount of `loading=\"lazy\"` fixes that — measured, it defers reliably only while the container is hidden. I argued the lever was curation rather than machinery and then had to take my own advice: the catalogue is now grouped by arrangement kind with one live specimen each. It is a better library at 19 tiles than it was at 49, which is the part I did not expect.");

		p("**Every tile includes the site's sidebar** — 240 of each frame's 1400px. It makes tiles look more alike than the arrangements are. Hiding it would need a query parameter that `site/app.js` honours, and at that point the tile stops being the real page, which is the one thing it must never stop being. Kept, with the cost stated.").ac("note");

		p("**The gallery is a site feature and should stay one.** Only `live_preview()` belongs in the framework; a catalogue of urls is editorial, and editorial belongs to whoever owns the site.").ac("note");

		div.c("row", () => {
			a.c("page-link", "the library").href("/library/");
			a.c("page-link", "drill-down").href("/library/drill/a/b/c/");
			a.c("page-link", "tabs in columns").href("/library/tabs-cols/two/");
		});
	},
});

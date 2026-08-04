import { Page, p, a } from "/app.js";
import { code, section } from "../../site/ui.js";

export default new Page({
	meta: import.meta,
	title: "Simple Steve — the floor, and what to delete",

	content(){
		code(`
site/start/     the floor      14 files   nothing to install, ends with a real site
site/nav/       primitives     21 files   each mechanism alone, in its smallest form
                               1 helper, 1 CSS rule, 0 hand-typed code blocks`, "what shipped");

		p("52 routes verified at 1400x800 and at 700px: zero console errors, zero horizontal overflow, every page rendering, every source box filled.").ac("note");

		section("The floor — /start/");

		code(`
/start/          what you are about to build
  files/         index.html · app.js · page.js, all three in full
  second/        a file, and one word in its parent
  links/         an <a href>, and page.link()
  tree/          a directory is a url segment
  lazy/          children: "one two", proven null before the click
  cols/          this.$pages = div.c("pages cols")
  next/          where to go, named explicitly`, "seven steps, each ending by naming the next");

		p("Walkable in one sitting: measured, all seven steps reachable by clicking Next, with no console errors across the whole walk. A cold load of `/start/` is 2 modules; `/start/tree/deep/` is 4 — its own chain and nothing else.").ac("note");

		section("One thing I had to change about step 2");

		p("The brief said \"a second page — one file, no registration anywhere. The filesystem is the router.\" That is not true in new/1, and the floor is the worst place to say something a reader will later find out is false.").ac("note");

		code(`
children.get(name)  ->  Page        use it
                    ->  null        declared: import it
                    ->  undefined   never declared: route() may claim it, else 404`, "Page.child(), the whole resolution");

		p("An undeclared directory has no url. So the floor teaches the honest version: a page is a file plus one word in its parent. Two edits, not one — and the word buys something real, which is that only names you wrote ever reach the network.").ac("note");

		p("`/start/second/` proves that rather than asserting it. It shows its own file, then its parent's file with the word `second` visible in the `children` string, then reads the live Map, then shows the bytes of `/start/second/ghost/page.js` — a real 571-byte page.js that nothing declares. The file is on screen; its url is a 404. Both measured.").ac("note");

		section("Decided — the page-<name> collision");

		p("`render()` put a class on every page built from its own name, in the one namespace CSS has. I said the candidates out loud first, per the rule.").ac("note");

		code(`
p-<name>            \`p\` is the paragraph factory in this codebase. No.

page--<name>        correct meaning — it IS a modifier of .page — but a missing
                    dash silently does nothing, and it is still a CLASS, so it
                    moves the collision rather than removing it.

rename the site's   fixes today's collision, not the next one. Any component
classes             class starting \`page-\` reopens it. Treats the symptom.

scope them          .page-previews > .page-preview raises specificity DOWNSTREAM,
                    which is the one direction CLAUDE.md forbids.

delete it outright  nobody consumes it — but devtools legibility is real, and
                    that is the baby in the bathwater.

data-page           CHOSEN. Attributes and classes are different namespaces, so
                    the collision is removed by construction, not by convention.`, "five candidates, said out loud");

		code(`
// Page.class.js, render() — today
    .ac(this.name && "page-" + this.name)   // style THIS page
    .ac(this.col)
    .ac(this.classes);

// proposed
    .ac(this.col)                            // per-page column width
    .ac(this.classes);                       // style pages LIKE this one

// Identity, not a style hook.
if (this.name) this.view.attr("data-page", this.name);`, "the exact diff — one line moved, no call sites touched");

		p("It keeps what the auto-class was good for — opening devtools and knowing which page you are looking at — and gives up what it was never good at. Styling one page already has an answer that is visible in the file that opted in: `classes: \"…\"`.").ac("note");

		section("…and the evidence");

		code(`
.page-link          /styles.css
.page-preview       /styles.css
.page-previews      /styles.css
.page-title         /styles.css`, "every .page-* selector in the site's stylesheets");

		p("Four, all of them component classes somebody wrote by hand, not one of them a page's name. The auto-class is emitted on every page in the site and consumed by nobody — except when it collides. `/nav/naming/` runs that survey live, by fetching the stylesheets' own bytes.").ac("note");

		code(`
two div.page elements, neither of them the active page:

  page page-preview    display: inline-block   color: rgb(10, 88, 202)   border: 1px
  page                 display: none           color: rgb(36, 41, 47)    border: 0px

/nav/naming/preview/   a real page, class "page page-preview active-page"
                       padding 4.8px 11.2px, where every other page gets 32px 40px 80px`, "measured on /nav/naming/");

		p("`.page-preview` and `.page` are both one class deep, so source order breaks the tie and the later one wins. A page stops hiding because of what it was called. The attribute-named twin is correctly invisible — the fix proved on screen rather than argued.").ac("note");

		section("A second, smaller ask");

		p("`alias()` is silent when it declines. Writing that very page I typed `this.preview.link()` — `preview` is a method, so `alias()` correctly refused to overwrite it, and I got a `TypeError` at render pointing at a line that looks fine. The guard is right; it is just quiet. One `console.warn` when it skips would have said so immediately.").ac("note");

		section("The cut list");

		p("Ranked. Every count below is grepped, not remembered.").ac("note");

		code(`
1  page-<name> auto-class     -> data-page. Consumed by nobody; collides.
                              Above, with the diff.

2  Page.preview()             ONE call site in the entire tree, and it is inside
                              previews() itself. Zero userland callers. A private
                              helper wearing public clothes — inline it into
                              previews() and delete the method.

3  Page.alias()               the this.<name> shortcut. Two measured failure
                              modes: it created the \`route\` landmine (now paid
                              for by a defensive is.fn() line in child()), and it
                              fails silently, which cost me a TypeError today.
                              Cutting it retires that defensive line as well.
                              MOST CONTESTABLE — it is genuinely handy, and 7
                              call sites already use children.get() anyway.

4  Page.go()                  one caller in the tree — site/deep/gap/page.js —
                              and it calls it to demonstrate that it throws.
                              router.go(page.url) is the same length and always
                              works. Cutting it closes readme open question 2.

5  readme, the /tabs/ para    line 157 says /tabs/ is "the bars with empty
                              panels… no default tab". Line 238 says it "shows
                              the first tab". Measured: both panels show their
                              defaults. Line 157 is stale — delete it.

6  .cols > .col border-right  draws a rule down a single-track region.
                              .cols > .col + .col { border-left } says what was
                              meant.`, "what should not exist");

		p("Two I put on the list and took off after grepping. `load_all_children()` — three pages call it, and two seats wrote about refusing it on purpose; it earns its place. `container()`'s two-level claim — action at a distance, but every alternative I can sketch moves the claim onto the child, which is worse.").ac("note");

		section("Standing dissent");

		p("The readme's tab-label rule still does not describe the code. It says a title label \"only exists once that page is imported\"; the code is `(this.loading || i === 0)`. Measured on `/nav/tabs/`: `state` is inline, in memory since construction, has `title: \"State\"` — and its label is still `state`. The patterns seat hit the same thing independently. The behaviour is defensible; the sentence explaining it will build the wrong model.").ac("note");

		p("`p()` is not markdown. Four literal asterisk pairs render on `/replace/`; zero in anything I own.").ac("note");

		section("Two things you own");

		p("`/start/` is declared on the root and routes correctly, but it is not in the sidebar — and it is the floor, so it probably belongs above `Home` rather than among the recipes.").ac("note");

		p("`source()` now has three consumers — `/nav/`, `/start/` and Eric's section — and still lives in `site/nav/ui.js`. It belongs in `site/ui.js` beside `code()` and `section()`. Nine lines; I left it because that file is yours.").ac("note");

		a.c("page-link", "→ /start/").href("/start/");
		a.c("page-link", "→ /nav/naming/").href("/nav/naming/");
	}
});

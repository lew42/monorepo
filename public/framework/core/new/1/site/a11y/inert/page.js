import { Page, p, div, a } from "/app.js";
import { section } from "../../ui.js";
import { js, transcript, focus_log, code } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Open #3 — full covers the chrome",
	classes: "a11y-page a11y-scrolls full",   // `full` covers the window; `a11y-scrolls` keeps this page scrollable inside it

	content(){

		div.c("row", () => {
			a.c("page-link", "← back to Access").href("/a11y/");
			a.c("page-link", "the unfixed version: /full/left/deeper/").href("/full/left/deeper/");
		});

		p("**This page is `full`.** Press Tab. The first stop is a link on this page, not a sidebar link you cannot see — because of one CSS rule, at the bottom of this page. Now open the other link and press Tab there: twenty stops, all of them underneath an opaque overlay.").ac("note");

		focus_log();

		section("What the readme says");

		transcript(`
new/1/readme.md, Open #3

  "full covers rather than removes the chrome. It's still in the DOM,
   still tabbable, still read by a screen reader. display: none didn't
   have that problem. If that matters, inert on the chrome is the fix,
   and it belongs to the site, not the framework."`);

		p("It matters. Here is the evidence it was written without.").ac("note");

		section("Twenty stops under the overlay");

		transcript(`
/full/left/deeper/ — Tab from the top of the document

 1  a.nav-link "Home"            /            OBSCURED-BY: P
 2  a.nav-link "Replace"         /replace/    OBSCURED-BY: code-label
 3  a.nav-link "Columns"         /columns/    OBSCURED-BY: PRE
 4  a.nav-link "Tabs"            /tabs/       OBSCURED-BY: PRE
 …
19  a.nav-link "Forms"           /forms/      OBSCURED-BY: code-label
20  a.nav-link "Versus"          /versus/     OBSCURED-BY: PRE
21  a.page-link "left"           /full/left/  ← the first thing you can see

sidebar computed:  display block · visibility visible · inert false`, "measured — elementFromPoint at each focused element's centre");

		p("Every one of the first twenty stops fails **WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum, AA)**: the focused element is entirely hidden by author-created content. It is also twenty keypresses through a menu a screen reader will read out in full, on a page whose whole point is that it took over the window.").ac("note");

		section("Two fixes, both measured");

		transcript(`
                     first Tab stop        obscured in 8   sidebar links exposed to AT
  today              a.nav-link "Home"           8                     20
  inert on .sidebar  a.page-link "left"          0                      0
  visibility:hidden  a.page-link "left"          0                      0`, "measured — identical outcomes");

		p("Both work, and they work identically. So the question is not which is correct — it is which one costs less.").ac("note");

		section("Where I disagree with the readme");

		transcript(`
inert                                    visibility: hidden
────────────────────────────────────     ────────────────────────────────
something must SET it                    nothing sets anything
…and UNSET it on the way out             unsets itself
…and know that a "full" page is active   the selector asks that question
JS, in a file that owns no chrome        CSS, in the file that owns the chrome

"Nothing on .app has to be set, kept in sync, or unset on the way out"
 — new/1/readme.md, on why "full" is positioning rather than chrome
   management. inert would put that back.`);

		p("I agree with the readme's **verdict** — this is the site's job, not the framework's — and disagree with its **mechanism**. `inert` is a JS attribute, so applying it needs something that observes \"a page with class `full` became active.\" The framework does not interpret `full` (deliberately, and rightly). A page could reach up and mutate `app.$sidebar` from its own `activate()`, but then every `full` page has to remember to, and to undo it — which is the exact state-sync problem deleting `mode` was meant to remove.").ac("note");

		section("The site can, in fact, do it alone");

		// CSS, so `source(fn)` cannot help here — a rule is not a function object.
		// This one is a proposal for a file that doesn't have it yet, so there is
		// nothing for it to drift from.
		code(`
.app:has(.page.full.active-page, .page.full.active-ancestor) > .sidebar {
    visibility: hidden;
}`, "site/styles.css @layer site — one rule, no JS, no state, nothing to unset");

		p("`:has()` is already this stylesheet's vocabulary — `.page.active-ancestor:has(.page.active-page)` is the rule the readme is proudest of, and it works by asking a question instead of remembering an answer. This is the same move. `visibility: hidden` removes an element from sequential focus navigation **and** from the accessibility tree, which is the `display: none` behaviour the readme says was lost.").ac("note");

		transcript(`
with the rule, on /full/left/deeper/
   1  a.page-link "left"    /full/left/      ← first stop
   sidebar links exposed to AT:  0

then navigate away to /columns/
   sidebar visibility:  visible             ← nothing had to unset it
   first stop:          a.nav-link "Home"`, "measured");

		section("It landed — and it taught us something on the way in");

		transcript(`
site/styles.css @layer site

  .app:has(.pages > .page.full.active-page,
           .pages > .page.full.active-ancestor) .sidebar { visibility: hidden; }

measured, /full/left/deeper/
  sidebar links      21
  first content stop  1     ← was 22
  obscured stops      0     ← was 20`, "measured — after the rule landed");

		p("The first version of this rule was **dead on arrival**, and silently: `:has()` may not be nested inside `:has()`, and one invalid selector in a comma-separated list drops the *whole* rule. It matched in `element.matches()` while never reaching the stylesheet at all — a failure that looks exactly like the rule not being written. Worth knowing before you write the next `:has()` list.").ac("note");

		p("One caveat worth stating plainly: the rule names `.sidebar`, a class its own stylesheet does not emit. That is a dependency on `site/app.js` — which always loads, because it *is* the chrome — but it is exactly the coupling `framework/readme.md` asks you to declare rather than leave for someone to find.").ac("note");

		section("Where it would become the framework's job");

		p("If a second site ever ships `full`, every one of them writes this rule again, and the framework is the only place that can stop that. The cheap version is not a mechanism — it is a line in the readme next to `full`, saying *the chrome is covered, not removed; here is the rule.* If that ever stops being enough, the honest fix is a framework-owned utility class rather than JS: `.covers` shipped with its own `:has()` rule. Not `inert`, and not `Router` learning what covering means.").ac("note");

		p("Next: **Tabs** — the one where an accessibility purist is wrong.").ac("note");
	},
});

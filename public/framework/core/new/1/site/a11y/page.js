import { Page, p, View } from "/app.js";
import { section } from "../ui.js";
import { js, transcript, focus_log, navigated } from "./ui.js";

View.stylesheet(import.meta, "a11y.css");

export default new Page({
	meta: import.meta,
	title: "Access",
	classes: "a11y-page",

	// LAZY — eight investigations, none imported until you open one
	children: "focus announce current inert tabs headings skip motion audit",

	content(){

		transcript(`
                              BEFORE                    NOW
──────────────────────────────────────────────────────────────────────────
/ → /columns/                 a.nav-link "Columns"      div.page "Columns"
/columns/ → child/            a.page-preview "child"    div.page "Column child"
/replace/ → /replace/child/   body                      div.page "Replace child"
Back                          body                      div.page "Access"
Forward                       body                      div.page "Focus after…"
a tab click                   a.tab "api"               div.page "API reference"

BEFORE: the anchor you clicked, or body when the navigation hid it.
NOW:    the page, focused, named, and announced as a region.`, "document.activeElement — measured, both builds");

		p("`Router.activate()` now ends with `this.app.navigated?.(page)`. That one duck-typed line is the whole difference, and the row that matters is **Back** — it fires there too, which is precisely the case a per-page hook could never reach.").ac("note");

		section("The whole of it");

		// the function object itself, printed. Not a copy of it — this is the
		// function that just ran to put focus where it is.
		js(navigated, "site/a11y/ui.js — running now, on this navigation");

		focus_log();

		p("That read-out is live, and it already names this page. Press **Back**, then **Forward**: it names both. Nine `activate()` overrides could not do that; one hook does.").ac("note");

		section("Eight findings, worst first");

		this.previews();

		p("Ranked by how badly each one breaks somebody's day. `focus` is first because it is the only one that makes the site unusable rather than unpleasant.").ac("note");

		section("What was measured");

		transcript(`
Playwright 1.62.1 (global), Chromium, 1400×800, dev socket stubbed
  full tab-order dumps on / · /columns/child/grandchild/ · /tabs/api/ · /full/left/deeper/
  document.activeElement after every soft navigation, and after Back
  CDP Accessibility.getFullAXTree before and after navigating
  heading and landmark dumps at depth
  computed contrast and hit-target size of every navigation control
  the proposed diff, applied by rewriting the module text on the wire

zero console errors · no horizontal overflow on any route`);

		p("Nothing on these pages is asserted. Every transcript is pasted output, and every proposed change was run before it was written down.").ac("note");
	},
});

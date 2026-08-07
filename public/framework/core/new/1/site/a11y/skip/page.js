import { Page, p, div, a, el } from "/app.js";
import demo from "/framework/ext/demo/demo.js";
import { section } from "../../ui.js";
import { js, transcript, code, focus_log, View } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Skip links",
	classes: "a11y-page",

	content(){

		transcript(`
Tab from the top of the document, on every route

  1 … 20   a.nav-link      Home · Replace · Columns · Tabs · route() · Full ·
                           Primitives · Compound · Deep & edges · Layout library ·
                           Chrome · Applied IA · Motion · Access · Cost · Async ·
                           URL design · Content · Forms · Versus
  21       the first control inside the page

landmarks: []   ·   <main>: none   ·   <nav>: none   ·   skip link: none`, "measured — /, /columns/child/grandchild/, /tabs/api/");

		p("Twenty keypresses to reach the content, on every page, every time. And there is no landmark to jump to instead — a screen reader user's \"go to main\" key does nothing, because there is no `<main>` and no `<nav>` in the document at all.").ac("note");

		section("Tab into this and feel it");

		demo(() => {
			div.c("demo-frame", () => {
				div.c("demo-frame-side", () => {
					a.c("visually-hidden on-focus", "Skip to content").href("#demo-content");
					["Home", "Replace", "Columns", "Tabs", "route()", "Full",
					 "Primitives", "Compound", "Deep", "Library", "Chrome", "Patterns"]
						.forEach(name => a(name).href("#demo-content"));
				});
				div.c("demo-frame-main", () => {
					el.c("h2", "section", "Content").attr("id", "demo-content").attr("tabindex", "-1");
					p("Tab into the box: the first stop is a skip link that was invisible until you reached it. Press Enter and the next Tab is here, not link four of twelve.");
					a.c("page-link", "a control in the content").href("#demo-content");
				});
			});
		}, "The skip link is `.visually-hidden.on-focus` — clipped until `:focus`, which is the whole implementation.");

		focus_log();

		section("The two halves, and the second one is the one people miss");

		transcript(`
skip link → #content, target has NO tabindex
   url        /full/left/deeper/#content     ← the Router left it alone, correctly
   focus      body                           ← the browser did NOT move focus

skip link → #content, target has tabindex="-1"
   focus      div.pages
   next Tab   a.page-link "left"             ← it worked`, "measured");

		p("A fragment link moves the *sequential focus starting point*, not focus. Keyboard users get away with it; screen reader users often do not, because the virtual cursor does not follow. The target needs `tabindex=\"-1\"` — one attribute, and without it the whole thing is decorative.").ac("note");

		section("…and it needs a name");

		transcript(`
focusing div.pages[tabindex="-1"] announces:

  "new/1three classesApp boot, the ONE flat container, and nothing els…"

An element with no role and no accessible name is announced by its text
content, and this element's text content is every page in the site.`, "measured");

		p("Which is the argument for `<main>` rather than a div: a landmark has a role, so it announces \"main\" and stops. It is also the thing the screen reader's own jump key was looking for.").ac("note");

		section("The diff — and it is the site's, not the framework's");

		js(function render(){
			this.$body = View.body();

			this.$app = div.c("app", () => {
				a.c("skip-link visually-hidden on-focus", "Skip to content").href("#content");   // FIRST focusable thing

				this.$sidebar = el.c("nav", "sidebar", () => {                                    // was div.c("sidebar", …)
					// … unchanged …
				}).attr("aria-label", "Sections");

				this.$pages = el.c("main", "pages").attr("id", "content").attr("tabindex", "-1"); // was div.c("pages")
			});

			View.set_captor(this.$pages);
		}, "site/app.js — three elements changed, one added");

		p("`<nav>` and `<main>` are the same two elements with better tags, so `.sidebar` and `.pages` keep every rule that already targets them. `$pages` still holds the class `pages`, so the property name and the class still agree.").ac("note");

		section("Why the framework should model it anyway");

		transcript(`
App.render()        builds div.c("pages")
site/app.js         OVERRIDES render() wholesale, and builds its own

→ the framework cannot enforce <main>: render() is the documented seam
  a site is invited to replace. What it CAN do is ship the right default,
  so the copy-paste that starts every new site starts correct.`);

		p("This is the same shape as the announcer, with the opposite answer. The announcer must be **guaranteed**, so it belongs outside `render()` — in `inject()`. `<main>` cannot be guaranteed and does not need to be, so it belongs *inside* `render()`, as a default worth copying.").ac("note");

		section("One more stop nobody asked for");

		transcript(`
/columns/child/grandchild/ — Tab order

  21  PRE   ".cols { display: grid; grid-auto-flow: column; gri…"
  23  PRE   "import grandchild from \\"./grandchild/page.js\\"; chi…"

3 of the 4 <pre> blocks are horizontally scrollable, and Chrome makes
scroll containers focusable. No role, no label — announced as the code.`, "measured");

		code(`
.a11y-page pre { white-space: pre-wrap; overflow-x: visible; }`, "site/a11y/a11y.css — what this section does instead");

		p("Two ways out: name the stop (`tabindex=\"0\"` + `role=\"region\"` + a label), or remove it. Removing is cheaper, and wrapping also satisfies **SC 1.4.10 Reflow**, which two-dimensional scrolling fails anyway. Every code block on this page wraps — including this one, which is how you can tell.").ac("note");

		p("Next: **Motion, contrast and target size** — measured, on the navigation controls only.").ac("note");
	},
});

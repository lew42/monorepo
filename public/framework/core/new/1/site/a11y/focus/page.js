import { Page, p, div, h2 } from "/app.js";
import demo from "/framework/ext/demo/demo.js";
import { section } from "../../ui.js";
import { js, transcript, focus_log, press, navigated, focus_page, name_page } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Focus after navigation",
	classes: "a11y-page",

	content(){

		transcript(`
router.go()  →  load_segments()  →  activate()  →  mark()  →  document.title = …
                                                                  ↑ nothing touches focus

/ → /columns/                  activeElement  a.nav-link.active "Columns"
/columns/ → child/             activeElement  a.page-preview.active "child"
/replace/ → /replace/child/    activeElement  body
                               ↳ the clicked anchor's page is now display:none
Back (popstate)                activeElement  body`, "measured — 4 navigations, no focus move");

		p("Two different failures, one cause. When the anchor survives the navigation, focus stays on it — a screen reader is still in the sidebar while the whole main region changed underneath. When the anchor **doesn't** survive, the browser drops focus to `body` and the next Tab starts from the top of the document: twenty links back to where you were.").ac("note");

		section("The fix, on the hook that now exists");

		js(navigated, "site/a11y/ui.js — the function that just ran");

		js(focus_page, "…and the two it calls");
		js(name_page);

		focus_log();

		p("That read-out is live, and it already names this page. Press **Back**, then **Forward** — it names both. `Router.activate()` ends with `this.app.navigated?.(page)`, which fires on popstate too, and that is the row nothing else could reach.").ac("note");

		section("Why the page and not the h1");

		demo(() => {
			let $panel;
			const show = name => {
				$panel.empty(() => {
					h2.c("section", name);
					p("This panel replaced the last one. Focus is on the panel itself, which is a region with an accessible name — a screen reader says the name and the role, and stops.");
				});
				$panel.attr("tabindex", "-1").attr("role", "region").attr("aria-label", name).el.focus();
			};

			div.c("demo-frame", () => {
				div.c("demo-frame-side", () => ["Alpha", "Beta", "Gamma"].forEach(n => press(n, () => show(n))));
				$panel = div.c("demo-frame-main");
			});

			show("Alpha");
		}, "Press a button and Tab: focus is inside the new panel, not back at the top.");

		transcript(`
focus target                    what a screen reader says
─────────────────────────────────────────────────────────────────────
h1[tabindex=-1]                 "Grandchild, heading level 1"
div.page[tabindex=-1]           the entire text content of the page
div.page + role + aria-label    "Grandchild, region"
div.pages[tabindex=-1]          "new/1three classesApp boot, the ONE fla…"
                                ↑ measured. An unnamed container reads EVERYTHING.`, "measured — four candidates");

		p("The bare `tabindex` is the trap: a focusable element with no role and no name is announced by its text, and a page's text is the whole page. The h1 is cheap and reads well, but a page with no title renders no h1 — and it buys nothing else. `role` + `aria-label` costs two more attributes and pays for three findings at once: it is the focus target, it is the landmark this site has none of, and it is the skip-link destination.").ac("note");

		section("Whose job — settled");

		transcript(`
framework   Router.activate()   this.app.navigated?.(page)      ← LANDED
framework   Page.render()       tabindex=-1, role=region,       ← still open
                                aria-label=title
site        navigated(page)     name, announce, focus — in that order

The framework says a navigation happened. The site decides what that means.
Neither tier had to learn what the other one wants.`);

		p("The line landed because two seats asked for it from opposite directions in the same hour — the chrome seat for crumbs, prev/next and closing a drawer; this seat for focus and announcement. Neither could read the other's work. That is the strongest evidence a hook is real rather than convenient.").ac("note");

		section("The first paint is not a navigation");

		js(focus_page, "site/a11y/ui.js — the guard, and it needs no state");

		p("Moving focus on the **first** paint would drop a keyboard user past the skip link before they pressed a key. `navigated()` fires on boot too, but during boot `App.inject()` has not run and `$app` is still detached — so `isConnected` is false exactly once. That is not a flag wearing a disguise: `focus()` on a detached element genuinely does nothing, so the guard is the real precondition and the behaviour we want falls out of it.").ac("note");

		transcript(`
cold load /a11y/focus/     activeElement  body     ← $app detached, isConnected false
then click any link        activeElement  div.page.active-page  role=region`, "measured");

		section("…and the one that is easy to get wrong");

		transcript(`
focus() called inside page.activate()     activeElement  body
focus() called after router.mark()        activeElement  div.page.active-page

A page is display:none until mark() adds .active-page. focus() on a
display:none element does nothing — and throws nothing. It fails silently.`, "measured — the first version of this page did exactly that");

		p("So the call has to be **after** `mark()`, and `navigated()` is placed exactly there — after `mark()` and after `document.title`. A page hook could never have been.").ac("note");

		section("The one that proved where it belonged");

		transcript(`
/a11y/ → /a11y/focus/ → Back

  from   [root, a11y, focus]
  to     [root, a11y]
  shared 2
  to.slice(2)  →  []          ← nothing is activated. a11y never left.

  a per-page activate() hook      activeElement  body
  navigated() in Router           activeElement  div.page  "Access"
  Forward again                   activeElement  div.page  "Focus after navigation"`, "measured — before and after the hook");

		p("Navigating **up** the tree enters nothing: the ancestor is in the shared prefix, so `page.activate()` is never called on it. This section shipped with Back deliberately broken for one round, because a defect nobody can work around is a better argument than a fix. It is fixed now, and the transcript above is the same test that broke.").ac("note");

		p("Three independent reasons converged on one placement: the `mark()` ordering, the tab default that is rendered but never activated, and Back entering nothing. Any one of them rules out a `Page` hook.").ac("note");

		section("What it still needs from Page");

		js(function render(){
			if (this.view) return this.view;

			this.view = div.c("page", () => { /* … */ })
				.attr("tabindex", "-1")                  // ← ADD
				.attr("role", "region")                  // ← ADD
				.attr("aria-label", this.title)          // ← ADD
				.ac(this.name && "page-" + this.name)
				.ac(this.col)
				.ac(this.classes);

			return this.view;
		}, "Page.class.js — the half navigated() cannot do");

		p("`navigated()` names `page.chain()`, which covers every page in the chain. It cannot name the one page that is **visible without ever being in a chain**: a tab set's default, which `tabs()` renders with `.render()` and never activates. `render()` is the one place every visible page passes through, which is why the attributes belong there and the focus move does not.").ac("note");

		p("Next: **Announcement** — what a live region should say, and why the answer is nothing.").ac("note");
	},
});

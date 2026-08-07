import { Page, p } from "/app.js";
import { section } from "../../ui.js";
import { js, transcript, code, focus_log } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Tabs, or links?",
	classes: "a11y-page",

	// Inline tabs — each one spreads in the same focus behaviour, so clicking a
	// tab here does what the report asks every navigation to do.
	initialize(){
		this.add("links", {
					title: "They are links",
			content(){
				code(`<a class="tab" href="/a11y/tabs/links/">They are links</a>`, "what tabs() renders today");

				p("A real url. Bookmarkable, shareable, Back-able, middle-clickable, and it survives the Router failing to boot. A screen reader says **\"link, They are links\"** — which is true, and which tells the user they can open it in a new tab.").ac("note");

				p("Every one of those properties is destroyed by `role=\"tab\"`. A `role=\"tab\"` element is not announced as a link, so the affordance is hidden from exactly the users who most need to be told about it.").ac("note");
			},
		});

		this.add("aria", {
					title: "The APG pattern",
			content(){
				code(`
<div role="tablist">
  <a role="tab" aria-selected="true"  tabindex="0"  aria-controls="p1" id="t1">…</a>
  <a role="tab" aria-selected="false" tabindex="-1" aria-controls="p2" id="t2">…</a>
</div>
<div role="tabpanel" id="p1" aria-labelledby="t1" tabindex="0">…</div>`, "WAI-ARIA APG — Tabs");

				p("Roving `tabindex`, arrow-key handling, `aria-selected` kept in sync, ids for `aria-controls` and `aria-labelledby` — in a framework whose Page has no id scheme. That is a real amount of machinery, and the APG scopes it to content that **shows and hides within the page without navigating**.").ac("note");

				p("This navigates. `history.pushState`, `document.title`, a module import, a url you can reload. It is not the pattern's case.").ac("note");
			},
		});

		this.add("verdict", {
					title: "Verdict",
			content(){
				p("**Keep the links. Style them honestly.** The tab bar should read as a navigation, and the current one should say so — which is `aria-current=\"page\"`, already requested for every link on the site, and it costs this pattern nothing extra.").ac("note");

				code(`
add                            because
─────────────────────────────  ────────────────────────────────────────────
aria-current="page"            one link is the current one; say which
role=navigation + a label      several bars on one page need telling apart
                               (site's job — tabs() returns the view, you
                                place it and class it)

do NOT add                     because
─────────────────────────────  ────────────────────────────────────────────
role="tab" / role="tablist"    lies: these navigate, and they are links
aria-selected                  duplicates aria-current, and disagrees on
                               reload if anything ever drifts
roving tabindex                12 tabs would become 1 tab stop plus a
                               keyboard convention nobody was told about
aria-controls                  poor AT support; the href already says it`, "the whole recommendation");
			},
		});
	},

	content(){

		p("A bar of `<a href>` that looks like a tab bar. This is the most contested question in the assignment, and it is a real dilemma, not an oversight.").ac("note");

		this.$tabs = this.tabs("links aria verdict");

		focus_log();

		section("What is actually rendered");

		transcript(`
<div class="tab-bar">
  <a class="tab in-path" href="/tabs/">Overview</a>
  <a class="tab active"  href="/tabs/api/">api</a>
  <a class="tab"         href="/tabs/guide/">guide</a>
</div>
<div class="tab-panel">
  <div class="page page-api active-page"> … </div>
</div>

no role · no aria-selected · no aria-controls · no aria-current`, "measured — /tabs/api/");

		section("The test that settles it");

		transcript(`
                              a link       a role="tab"
──────────────────────────    ─────────    ────────────
url changes                     yes          no
Back returns to it              yes          no
reload reproduces the state     yes          no
open in a new tab               yes          no
works before JS boots           yes          no
announced as openable           yes          no

Every row is a property this framework's tabs() actually HAS. The
ARIA pattern would take all six away from screen reader users while
leaving them for everyone else.`);

		p("That is the whole argument. The visual is the only thing that says \"widget\"; the url, the history entry, the reload behaviour and the markup all say \"link\", and they are right. Fixing the mismatch by lying to the accessibility tree fixes it in the wrong direction.").ac("note");

		section("Where a purist has a point");

		p("A low-vision user with residual sight, or anyone using magnification alongside a screen reader, gets a genuine mismatch: it looks like a tab strip and announces as a list of links. That is a real cost and I am not going to pretend it away.").ac("note");

		p("Two answers, and I would take the second. **Make it look like what it is** — a horizontal nav is a perfectly good look and several design systems ship exactly that. Or **accept the mismatch**, because the mismatch is only in the picture: everything the user can *do* matches the link semantics exactly. A tab bar whose tabs are real urls is better than a tab widget, and the accessibility tree should describe the better thing rather than impersonate the worse one.").ac("note");

		section("The one thing tabs DO need");

		js(function activate(page){
			// nothing tab-specific — a tab click IS a navigation, so the fix that
			// covers columns, replace and full covers this too
			if (this.chain().length) page.view.el.focus();
		}, "Router.js — the same four lines");

		transcript(`
click a.tab[href="/tabs/api/"]

  today          activeElement  a.tab.active "api"
  with the fix   activeElement  div.page.page-api.active-page
                                role=region  aria-label="API reference"`, "measured");

		p("Today the panel changes and focus stays in the bar — the single most common complaint about tab widgets, and here it comes for free from the general fix. Try it above: click a tab and watch the read-out.").ac("note");

		section("And one more, on the framework's side");

		transcript(`
this.$tabs = this.tabs("links aria verdict");   // set 1
this.$more = this.tabs("state notes");          // set 2

Two <div class="tab-bar"> with nothing to tell them apart. A screen
reader user listing the document's navigations hears two identical
things — if either of them were a navigation landmark at all.`);

		p("`tabs()` returns the view precisely so you can place and class it, so this is the site's to fix: `this.tabs(\"a b\").attr(\"role\", \"navigation\").attr(\"aria-label\", \"Sections\")`. It is not the framework's, because the framework cannot know what the set is *of*.").ac("note");

		p("Next: **Headings and landmarks** — three `<h1>`s on one screen, and why computing the level would be a bug.").ac("note");
	},
});

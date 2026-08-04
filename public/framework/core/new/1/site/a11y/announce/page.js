import { Page, p, div } from "/app.js";
import demo from "/framework/ext/demo/demo.js";
import { section } from "../../ui.js";
import { js, transcript, announce, announcer_mirror, press, announce_route } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Announcement",
	classes: "a11y-page",

	content(){

		demo(() => {
			announcer_mirror();
			div.c("row", () => {
				press("Loading…", () => announce("Loading…"));
				press("Nothing found at /nope/", () => announce("Nothing found at /nope/"));
				press("(clear)", () => announce(""));
			});
		}, "That box mirrors a real `role=status` on `<body>`. Whatever it shows is what a screen reader has just said.");

		p("`role=status` implies `aria-live=polite` and `aria-atomic=true`, so it is the whole declaration. Adding both again is redundancy this codebase charges you for.").ac("note");

		section("What a successful navigation announces: nothing");

		js(announce_route, "site/a11y/ui.js — the decision, in the file");

		transcript(`
THREE CHANNELS, ONE ANNOUNCEMENT

document.title = "Columns"           silent. Screen readers do not announce
                                     the title on a soft navigation — that is
                                     the whole reason this problem exists.
                                     It is for the tab, history, bookmarks.

focus → div.page[role=region]        "Columns, region"        ← THE announcement
                                     and it moves the user's cursor there

a live region saying the title       "Columns"                ← the same word,
                                     a second time`, "measured on /columns/ — the two strings are character-identical");

		p("So the rule is not *\"announce the page\"* — it is **announce only what focus cannot say**. Double-announcement is then avoided **by construction rather than by a guard**: the two channels never describe the same event, so there is no condition to get wrong and nothing to keep in sync.").ac("note");

		p("The rule that follows is the one worth writing down: **a live region and a focus move are alternatives, not a pair.** A site that wants the region to speak on every navigation has to stop moving focus. Doing both is the commonest way SPA announcements end up stuttering.").ac("note");

		p("Which leaves the region for exactly two events, and neither of them has anywhere to put focus: a load still in flight, and a load that failed.").ac("note");

		section("Both cases, measured");

		js(async function load(url){
			const slow = setTimeout(() => this.app.announce("Loading…"), 150);   // ← new
			const page = await this.load_segments(url);
			clearTimeout(slow);                                                   // ← new

			if (page) this.activate(page);
			this.app.announce(page ? "" : "Nothing found at " + url);             // ← new
			return !!page;
		}, "Router.load() — proposed, the whole method");

		transcript(`
/columns/page.js stalled 1400ms, then allowed through
  +  98ms   announcer ""            url /          title "new/1"
  + 415ms   announcer "Loading…"    url /          title "new/1"
  +1003ms   announcer "Loading…"    url /          title "new/1"
  +2011ms   announcer ""            url /columns/  title "Columns"

a fast navigation (no stall)
            announcer ""            ← the 150ms timer never fires`, "measured");

		p("The 150ms threshold is what keeps a normal navigation silent. Without it every click would say \"Loading\" before saying anything useful, which is worse than saying nothing.").ac("note");

		section("Today, the same two seconds");

		transcript(`
/ → /columns/ with the module stalled 2500ms
  + 158ms   url /   title "new/1"   focus a.nav-link "Columns"   live regions 0
  + 503ms   url /   title "new/1"   focus a.nav-link "Columns"   live regions 0
  +1209ms   url /   title "new/1"   focus a.nav-link "Columns"   live regions 0
  +2013ms   url /   title "new/1"   focus a.nav-link "Columns"   live regions 0

Nothing moves. Not the url — go() pushes only after the load succeeds —
not the title, not focus. A sighted user sees the old page; a screen
reader user has no signal at all that the click registered.`, "measured — the current build");

		section("Where it has to live");

		transcript(`
App.render()   ✗  site/app.js passes its OWN render() to the constructor, and
                  assign() makes that an own property that shadows the prototype.
                  Anything the framework puts in render() is gone for this site.

App.inject()   ✓  one line, not an override seam, runs once, after the chrome.

a page         ✗  a live region built and filled in the same task is not
                  announced. It has to pre-exist by a long way.`, "measured — the App patch silently did nothing until it moved");

		js(function inject(){
			this.$body.append(this.$app);
			this.$body.append(() => { this.$announcer = div.c("announcer").attr("role", "status"); });
		}, "App.js — proposed");

		js(function announce(text){
			this.$announcer?.text(text ?? "");
			return this;
		}, "App.js — the only method a caller needs");

		p("`app.announce(\"…\")` is the whole public surface. `$announcer` is named for the class it carries, and it sits on `<body>` rather than inside `.app`, which is `display: flex` — a stray child there becomes a column.").ac("note");

		section("The case it cannot cover");

		transcript(`
click a link to a url with no page.js
  Router.go()   load fails  →  location.assign(url)  →  FULL DOCUMENT RELOAD
  +200ms   announcer "Nothing found at /definitely-not-a-page/"
  +400ms   same document?  false
           the announcement was spoken into a document that was replaced`, "measured");

		p("A failed navigation is a real page load, so nothing said before it survives. The message belongs at the **destination** instead: `App.error()` already renders a page, and it should focus and name it, exactly like any other page.").ac("note");

		p("Next: **`aria-current`** — the one-line request, and the twin that is not warranted.").ac("note");
	},
});

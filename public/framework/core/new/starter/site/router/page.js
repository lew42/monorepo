import { Page, p } from "/app.js";
import { code, section, api, watch } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Router",

	content(){
		code(`
app.router.go("/nesting/deep/");     // navigate, from anywhere
page.go();                           // same thing, from a Page

a("Deep").href("/nesting/deep/");    // …or just write a link. it's upgraded for you`, "the entire caller-facing API");

		p("You almost never touch it. Links are plain anchors; one delegated listener upgrades the click.");

		section("The API");

		api([
			["go(url)", "load, and push history only if that worked", "click(), page.go()"],
			["load(url)", "find + show. returns false if nothing resolves", "go(), popstate, App.start()"],
			["load_segments(url)", "walk the segments, one child() per segment", "load()"],
			["activate(page)", "diff the chain, activate only what differs, set .active", "load()"],
			["chain()", "[root … active]. derived, never stored", "show(), mark()"],
			["mark()", "set .active-page / .active-ancestor, then mark links", "activate()"],
			["active", "the current Page. the router's ONLY state", "everything"],
		]);

		p("One field. `chain()` walks `.parent` links, so there is no array to keep in sync and no way for it to drift from the tree.").ac("note");

		section("Which path — three different \"current\" urls");

		code(`
location.pathname     what the BROWSER shows. lags: go() pushes AFTER loading
router.active.url     what is actually ON SCREEN. authoritative
this.loading          the url being resolved right now, mid-await`);

		p("This distinction is not academic — it was a live bug. `mark_links()` read `location.pathname`, but `go()` deliberately pushes history only after the load succeeds, so the browser url was still the *previous* page. Every link lit up one navigation behind.");

		code(`
go(url)
  await load(url)          ← mark_links() ran HERE, and location was still the old url
  history.pushState(url)   ← the browser only catches up HERE`, "the ordering that caused it");

		p("The fix is the rule the layout tier already follows: **ask the page, not the browser.** `mark_links(this.active.url)`. Load-before-push stays, because that's what stops a broken link from corrupting your history.").ac("note");

		section("Interception — when a click is NOT ours");

		code(`
external origin        →  let the browser go
⌘ / ctrl / shift       →  new tab
target=_blank          →  new frame
download attribute     →  a file
#hash on this path     →  the browser scrolls
/readme.md             →  has an extension, not a page`);

		p("Everything that survives that list is `preventDefault()`-ed and handed to `go()`. Everything else is a normal navigation — which is what keeps history honest.");

		section("The swap — what stays and what goes");

		code(`
/a/b/c/d/  →  /a/b/x/y/

from    [root, a, b, c, d]
to      [root, a, b, x, y]
shared   ─────────┘  3

deactivate   d, c        deepest first
activate     x, y        shallowest first
untouched    root, a, b  ← DOM never touched`);

		p("A cold load is the same code with `from = []`, so everything activates and nothing deactivates. **One code path for boot, clicks, and Back.**").ac("note");

		watch(
			"Click Nesting, then Dynamic urls, and read the from/to/shared lines.",
			"Then press the browser Back button — POPSTATE banner, same load() underneath.",
			"Note that go() never runs on Back: the browser already moved, so there is nothing to push."
		);
	}
});

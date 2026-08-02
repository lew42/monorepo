import { Page, p, a } from "/app.js";
import { code, section, watch } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Inline pages",
	children: "tabs",

	// add() during initialize(), NOT content() — the walk resolves children long
	// before anything renders, so a page added at render time is already too late.
	initialize(){
		// a function IS the content. url and title come from the name.
		this.add("alpha", () => {
			p("I was built from a function. My parent named me and derived my url.");
			p("Nothing in that file wrote a path.").ac("note");
		});

		// …or options, when you want a real title
		this.add("beta", {
			title: "Inline beta",
			content(){ p("Options form — same page, one extra line."); }
		});

		// …or a whole Page, which can carry a layout like any other
		this.add("full", new Page({
			title: "Inline takeover",
			activate(){ this.app.takeover(this); },
			deactivate(){ this.app.restore(this); },
			content(){
				p("Built inline, and it takes the whole window.");
				a.c("page-link", "← back to Inline pages").href("/inline/");
			}
		}));
	},

	content(){
		code(`
initialize(){
    this.add("alpha", () => p("hi"));                         // a content function
    this.add("beta",  { title: "Inline beta", content(){} }); // options
    this.add("full",  new Page({ … }));                       // a Page you built
}`, "inline/page.js — three shapes, cheapest first");

		p("Yes — `add()` works, and an inline page is not a second-class page. It has a url, joins the chain, deep-links, Backs, and can carry a layout.");

		this.previews();

		section("The child never writes a path");

		code(`
add(name, child){
    page.assign({
        name,
        parent: this,
        url: page.url ?? this.url + name + "/",   // ← MY url + the name I gave it
        title: page.title ?? name,
    });
}`, "Page.class.js");

		p("Move this page to `/somewhere-else/` and every inline child moves with it. A hardcoded `url: \"/inline/alpha/\"` would be a second copy of the parent's location — one to forget when the parent moves.").ac("note");

		section("initialize(), not content()");

		code(`
new Page()          constructor → declare(children) → initialize()   ← add() here
router.load()       load_segments() walks and calls child()
router.activate()   render() → content()                             ← too late`);

		p("`child(name)` checks the children map first, and that lookup happens during the walk — before any page renders. An `add()` inside `content()` would attach a page nobody could navigate to on a cold load.").ac("note");

		section("add() vs route()");

		code(`
add(name, page)     I know these children NOW. finite, named, in the map.
route(name)         I'll build one for whatever segment shows up. open-ended.`);

		p("`child()` tries the map, then the filesystem, then `route()`. `add()` fills the map; `route()` is the fallthrough — and since `child()` runs `route()`'s result through `add()`, a routed page gets its url derived too. **Dynamic urls** covers that one.");

		section("The app is assigned later, and that's fine");

		code(`
add(name, page)     → page.app = this.app   // undefined during initialize()
child(name)         → known.assign({ parent: this, app: this.app })   // set here`);

		p("A page built in `initialize()` has no `app` yet, because its parent hasn't been adopted either. The memory-hit branch of `child()` re-assigns on the way past, so by the time anything activates, it's wired.").ac("note");

		watch(
			"Open Inline alpha, then reload the browser. Identical — the walk doesn't care where a page came from.",
			"Console: page{…}.add(\"alpha\") → page{/inline/alpha/} — watch the url get filled in."
		);
	}
});

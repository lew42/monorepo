import { Page, p } from "/app.js";
import { code, section, api, watch } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Page",

	content(){
		code(`
import { Page, p } from "/app.js";

export default new Page({
    meta: import.meta,        // → this.url, derived once in the constructor
    title: "Page",
    children: "one two",      // NAMES. nothing is imported
    content(){ p("…"); }      // runs when the page is rendered
});`, "site/page/page.js — this file");

		p("A Page is data until something shows it. Constructing one renders nothing, so importing a page.js is always safe.");

		section("The API");

		api([
			["go()", "navigate to me. the twin of clicking my link()", "you"],
			["link(text)", "an `<a href>` to me. works while dormant", "you"],
			["preview()", "a card version of link()", "previews()"],
			["child(name)", "one segment → a Page. map, then filesystem, then route()", "router.load_segments()"],
			["add(name, child)", "attach a child. fn | options | Page. derives the rest", "you, in initialize()"],
			["naming()", "fill url / name / title / label from what I have", "constructor, add()"],
			["seo_title()", "site name + my title, for document.title", "router.activate()"],
			["chain()", "[root … me], walked from .parent", "router.activate()"],
			["container()", "who holds me — my parent, or the app", "activate()"],
			["activate()", "put myself in container().$pages", "router.activate()"],
			["deactivate()", "take myself back out", "router.activate()"],
			["render()", "build my DOM, once ever", "activate()"],
			["route(name)", "claim a segment with no file. optional", "child()"],
		]);

		p("Read the middle column top to bottom and the design falls out: **the Router only ever calls `child`, `chain`, `activate`, `deactivate`.** Everything above that line is for you.").ac("note");

		section("go() — the whole navigation API");

		code(`
page.go()                    // navigate to this page
page.link("Read more")       // …or render a link and let the user do it
app.router.go("/docs/")      // …or by url, from anywhere`);

		p("`go()` is `router.go(this.url)`. It loads first and pushes history only if that worked, so a page that fails to resolve leaves no broken history entry. Prefer `link()` where you can — a real `<a href>` is right-clickable, middle-clickable and crawlable, and the Router upgrades the click for free.").ac("note");

		section("What a page owes its children");

		code(`
$pages     the view my children mount into
classes    extra classes on my .page — CSS does the rest`);

		p("That's the whole layout surface. A page places **itself** — there is no `show(child)`/`hide(child)`, which also stops `Page` from shadowing `View`'s own `show()`/`hide()`. **Four layouts** is the tour.");

		section("children — names, not imports");

		code(`
children: "intro api"     // names — nothing imported, loaded when asked for
children: [intro, api]    // already-imported pages, adopted immediately
children: [intro, "api"]  // both

//  →  Map { "intro" => Page, "api" => null }
//     null just means "declared, not loaded yet"`);

		p("The string form is the one that matters at scale: a parent that merely *names* its children imports nothing, so walking through an ancestor doesn't drag its whole subtree along.");

		section("add() — children with no file");

		code(`
this.add("alpha", () => p("hi"));                          // a content function
this.add("beta",  { title: "Beta", content(){ … } });       // options
this.add("full",  new Page({ … }));                        // a Page you built`);

		p("The child writes **no path**. `add()` derives `url` from mine plus the name I gave it, and `title` from the name if there isn't one — so moving a parent moves its whole subtree. Call it from `initialize()`; see **Inline pages**.").ac("note");

		section("Which url is which");

		code(`
this.url          "/page/"          where I live
this.name         "page"            my url segment — also my directory, also my Map key
this.title        "Page"            the h1
this.label        "Page"            short form, for links and tabs
location.pathname "/page/"          the BROWSER. lags during a navigation — see Router`);

		p("All four are plain data, filled in by `naming()` — in the constructor, and again if a parent adopts me later. Nothing that does work hides behind property syntax.").ac("note");

		section("naming() — one place, both directions");

		code(`
naming(){
    this.url   ??= this.meta ? new URL(".", this.meta.url).pathname
                 : this.parent && this.name ? this.parent.url + this.name + "/"
                 : undefined;
    this.name  ??= this.url?.split("/").filter(Boolean).at(-1);
    this.title ??= this.name;
    this.label ??= this.title;
}`, "Page.class.js");

		p("A page.js starts from `meta` and works out its name; an inline page starts from its `name` and works out its url. Same method, opposite directions, every line `??=` so an explicit value always wins and running it twice changes nothing.").ac("note");

		section("name is hyphenated — and so is the alias");

		code(`
this.add("opt-in", …)

children.get("opt-in")   the Map key
/parent/opt-in/          the url segment
parent/opt-in/page.js    the directory on disk
page.opt_in              ← the JS alias, made once in add()`);

		p("`name` has to be the url segment: the router hands `child()` a raw segment and looks it up directly. The underscore form exists only so you can type `page.opt_in`, and it never overwrites a real property.").ac("note");

		section("Rendering happens once, ever");

		code(`
render(){ if (this.view) return this.view; … }`);

		p("Navigating away and back re-uses the same DOM node. That's what makes activation cheap enough to be the whole layout mechanism.");

		watch(
			"Click Nesting, then Home, then Nesting again.",
			"Second visit logs 'already built, re-using the same DOM node' — no rebuild.",
			"Then try app.router.go('/inline/') straight from the console."
		);
	}
});

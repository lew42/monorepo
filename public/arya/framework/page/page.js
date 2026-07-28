import { h2, p, strong, a } from "/app.js";
import Page from "../../lib/Page.js";
import { snippet, note, api } from "../../lib/ui.js";

export default new Page(import.meta, {

	body() {
		p("Every page on this site is a `Page`, and every link in the sidebar is a `pushState` navigation. Both are about 80 lines. Here is what made them work.");

		h2("The problem");

		p("A `page.js` that calls `p()` at the top level renders the moment it is imported. That is lovely for the page you asked for, and useless for every other purpose:");

		snippet(`// parent/page.js
import child from "./child/page.js";   // <- child just rendered itself,
                                       //    into whatever was capturing
p("see also ", child.link());`);

		p("You wanted a link. You got the entire child page, dumped wherever the capture pointer happened to be. So people work around it by exporting `{ link, render }` and hoping nobody calls the module for its side effects — but the side effects already happened at import.");

		p(strong("A page has to be data until someone asks it to render."), " That is the only requirement, and it is enough to fix navigation too.");

		h2("The class");

		snippet(`export default class Page {

    constructor(meta, config){
        this.path = Page.path_of(meta);
        Object.assign(this, find(this.path), config);
    }

    render(){                       // App/View call this, nobody else
        Router.singleton().mount(this);
    }

    content(){
        h1(this.title);
        this.body();
    }

    body(){}                        // yours

    link(text){
        return a(text ?? this.title).href(this.path);
    }

    static path_of(meta){
        return new URL(".", meta.url).pathname;   // "/a/b/page.js" -> "/a/b/"
    }
}`);

		p("A page then looks like this, and importing it does nothing at all:");

		snippet(`import Page from "../lib/Page.js";

export default new Page(import.meta, {
    title: "Flex",
    body(){
        p("...");
    }
});`);

		h2("Three things fall out of it");

		api({
			"no accidental render": "importing a page is free, so a parent can list its children",
			"no hardcoded paths": "`import.meta.url` already knows where the file is",
			"re-rendering works": "`body()` has not run yet, so it can run twice"
		});

		p("That third one is the one that matters. A module is only evaluated once no matter how many times you import it, so a page that rendered at import time can never be shown a second time. A page that renders on demand can.");

		note(p("It also hooks in with no framework changes. `View.append()` already calls `.render()` on anything that has one, so `App` appends a `Page` correctly today."));

		h2("The router");

		p("Once pages re-render, the router is mostly click handling:");

		snippet(`document.addEventListener("click", e => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const anchor = e.target?.closest?.("a[href]");
    if (!anchor || anchor.target || anchor.hasAttribute("download")) return;

    const url = new URL(anchor.href);
    if (url.origin !== location.origin) return;
    if (!url.pathname.startsWith(Router.scope)) return;

    e.preventDefault();
    this.go(url.pathname);
});

window.addEventListener("popstate", () => this.load(location.pathname));`);

		snippet(`async load(path){
    const token = ++this.token;              // a fast second click must win
    const mod = await import(App.path_to_page_url(path));
    if (token !== this.token) return;
    this.show(mod.default);
}`);

		p("`show()` calls `$main.empty().append(() => page.content())` and updates which sidebar link is active. The sidebar itself is built once and never touched again — click around and watch it not flicker.");

		h2("Four details that took the longest");

		p(strong("Where does the router start?"), " Not in a root `page.js`, because a hard load of `/arya/styles/flex/` never imports the root. It starts in `Page.render()`, so the first page to render — whichever one the URL asked for — brings up the shell.");

		p(strong("Scope."), " `Router.scope` is `\"/arya/\"`, and links outside it are left completely alone. This site runs a router inside a subtree of a site that has no idea it exists, and the Home link still does an ordinary full page load.");

		p(strong("Modifier clicks."), " Skipping `metaKey` and `ctrlKey` is what keeps open-in-new-tab working. It is two lines and everybody forgets them.");

		p(strong("Races."), " Two quick clicks start two imports, and they can finish in either order. The token counter makes the last click the one that wins.");

		h2("What I would change in the framework");

		api({
			"ship class Page": "in `framework/core/`, next to App and View",
			"App renders a Page": "if `mod.default` has a `.render()`, it already works",
			"trailing slash": "`path_to_page_url` could try `/page.js` before `.page.js`",
			"Router opt-in": "`app.router()` in a `page.js`, off by default"
		});

		p("The router is genuinely optional — nothing on this site breaks if you delete `Router.js` and let `Page.content()` render directly. But `class Page` is not optional; without it, every page is single use.");

		p("Longer list over in ", a("Suggestions").href("/arya/notes/"), ".");
	}
});

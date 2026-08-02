import { Page, p } from "/app.js";
import { code, section, api, watch } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "App",

	content(){
		code(`
export default window.app = new App({
    render(){                             // your chrome, built ONCE
        this.$app = div.c("app", () => {
            this.$sidebar = div.c("sidebar", () => { … });
            this.$main = div.c("main", () => {
                this.$pages = div.c("pages");   // ← the ONE thing a Page needs
            });
        });
    },
});`, "site/app.js — the whole App you write");

		p("One method. The App owes a Page exactly one thing: `$pages`, the view the root page mounts itself into. It has no `show()`/`hide()` — a page places **itself**.");

		section("The API");

		api([
			["new App({…})", "assigns your overrides, then calls start()", "site/app.js"],
			["start()", "render → load_root → new Router → load(url) → inject", "the constructor"],
			["render()", "build the chrome. yours to override", "start()"],
			["load_root()", "import(\"/page.js\") — the walk needs an origin", "start()"],
			["$pages", "the view the root page mounts into", "page.activate()"],
			["log_label()", "what it calls itself in the console. logging only", "page.activate()"],
		]);

		p("`$pages` and `log_label()` are the same two things every Page has. That's the whole reason the root needs no special case — **the App is just the container above the root page.**").ac("note");

		section("Boot, once per full page load");

		code(`
render()        chrome exists, but is DETACHED from <body>
load_root()     await import("/page.js")
new Router()    starts listening for clicks
load(pathname)  walk the url, render the chain
append($app)    ← first paint happens HERE, once, fully built`, "App.start()");

		p("Nothing paints until the whole chain has resolved, so there is no flash of empty layout. The cost is that `$app` is off-document while the pages render — which is why the Router marks links inside `$app` and never `document`.");

		section("Full reload vs. an intercepted click");

		code(`
FULL RELOAD  /nesting/deep/     CLICK  /nesting/deep/
─────────────────────────────   ────────────────────────────
server sends index.html         (nothing hits the server)
<script src="/app.js">          router.click(e)
new App() → start()             router.go(url)
  render()   chrome             ─────────────────────────────
  load_root()                   router.load(url)
  new Router()                    load_segments(url)
─────────────────────────────     activate(page) → swap the tail
router.load(url)                history.pushState(url)
  load_segments(url) → walk
  activate(page) → swap the tail
append($app)`);

		p("The two paths **converge** at `router.load(url)`. Everything above that line happens once per browser session; everything below happens on every navigation.").ac("note");

		watch(
			"Reload this page — you get the BOOT banner and the whole App.start sequence.",
			"Now click Page in the sidebar — you get a CLICK banner and only the bottom half.",
			"The trio ends at Router. Read it next: it owns everything below that line."
		);
	}
});

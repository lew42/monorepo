import { Page, md, h2, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "App",
	description: "Boots the page and loads whatever the URL points at.",
	content(){

		pre(`window.app = new App();`);

		md("That's the setup. `app.js` creates it once, and re-exports the framework so every page imports from one place — see [Start](/framework/start/).");

		h2("The URL is the router");

		md(`| url | loads |
|---|---|
| \`/\` | \`/page.js\` |
| \`/docs/\` | \`/docs/page.js\` |
| \`/docs/intro\` | \`/docs/intro.page.js\` |

No route table. The path *is* the file path, so adding a page registers nothing — and because the import is computed at runtime, every page is lazy-loaded for free.`);

		h2("Loading a page");

		pre(`async load_page(url = location.pathname){
    const page = await Page.load(url);      // import the module

    this.page?.deactivate?.();              // leave the old page
    this.page = page;

    if (page) this.$app.empty()
        .append(page.host?.() ?? page);     // render it

    page?.activate?.();                     // title / meta / theme
    this.mark_links();                      // .active on links to here
}`);

		md("Every call is optional (`?.`) — there is no `instanceof` in this method. A page.js can default-export a `Page`, a plain view, a function, or nothing at all. `Page` is just the richest thing you can hand it.");

		md("Everything is awaited *before* `empty()`, and `empty()` and `append()` run with nothing between them, so the browser never paints an empty app. No white flash on navigation.");

		h2("Lifecycle");

		pre(`config()      // socket, router
render()      // build $app, make it the captor
load()        // load_page() + await stylesheets & fonts
initialize()  // your hook — empty by default
inject()      // put $app in <body>
ready         // a promise, resolved`);

		md("Config is just assigned, so `new App({ nav(){ … } })` rides along as data. `app.ready` resolves once the first page is on screen.");

		h2("Assets");

		pre(`app.font("Montserrat");                      // awaited before inject
View.stylesheet(import.meta, "my-page.css"); // same`);

		md("Anything a page loads while its module runs is awaited before the app injects, so the first paint is never unstyled.");

		md.details(import.meta, "readme.md");
	}
});

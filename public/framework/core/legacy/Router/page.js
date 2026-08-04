import { Page, md, h2, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Router",
	description: "No-reload navigation, on by default.",
	content(){

		pre(`a("Docs").href("/docs/");   // or: docs_page.link()`);

		md("Write an ordinary link, get no-reload navigation. One listener on `document` catches the click — nothing to wire per link, nothing to import.");

		md("It's on by default. `new App({ router: false })` turns it off and every link goes back to a full page load.");

		h2("When it stays out of the way");

		pre(`external origin        →  full navigation
⌘ / ctrl / shift / ⌥   →  new tab
target, download       →  the browser's job
#hash on this page     →  scroll, don't re-render
unknown route          →  full navigation`);

		md("The Router only upgrades a click when it can guarantee Back will redraw: you're on a real `Page`, and the target is a page it already knows. That restraint is the feature — you can never `pushState` into a page the app can't render, so Back and Forward never strand you.");

		h2("Programmatic");

		pre(`app.router.go("/framework/core/View/");   // pushState + load
app.router.go("/path/");                 // programmatic navigation`);

		h2("Three small things");

		md(`| class | owns |
|---|---|
| **Router** | *when* to navigate |
| **App** | loading and rendering |
| **Page** | the content |

Delete the Router and the site still works — every link just reloads.`);

		md("Next: [App](/framework/core/App/) — the substrate all three sit on.");

		md.details(import.meta, "readme.md");
	}
});

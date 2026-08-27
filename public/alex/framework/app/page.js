import { Page, md, code, h2, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "App",
	description: "Boots once, owns the container, and hands the url to the Router.",
	icon: "settings",

	content(){

		toc();

		code.js(`import app from "/app.js";`);

		md("You almost never create an `App` yourself. `/app.js` does it once and exports it, so any page can import the same instance.");

		h2("How a url becomes pages");

		md("**The Router walks the pathname, one segment at a time.** It starts at the root page and asks each page for its next child:");

		code.js(`/alex/framework/app/

  /page.js                        →  root
    .child("alex")                →  /alex/page.js
      .child("framework")         →  /alex/framework/page.js
        .child("app")             →  /alex/framework/app/page.js`);

		md("Every page on that path is imported and activated, not just the last one. That is why this page has a sidebar: `/alex/` is one of its ancestors, and it built one.");

		h2("Declaring is the registration");

		code.js(`children: "app view"`);

		md("**Nothing crawls the filesystem.** A `page.js` that no parent names in its `children` is a 404, however real the file is. The names are lazy — each one is imported the first time somebody walks to it.");

		h2("What a page.js exports");

		code.js(`import { Page, md } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "App",
    children: "app view",
    content(){ md("Body copy."); },
});`);

		md("One shape: a `Page`. `meta` is what tells it its own url, so `page.link()` works without the page ever rendering.");

		md("A `Page` is **dormant** — constructing one renders nothing, so importing a page to link to it is free. It renders when the Router places it.");

		h2("Handy on every page");

		md(`| | |
|---|---|
| \`app.$pages\` | the container pages mount into |
| \`app.$app\` | \`<div class="app">\` — the whole chrome |
| \`app.$body\` | the \`<body>\` View |
| \`app.ready\` | resolves once boot has finished and the first page is on screen |
| \`app.font(name)\` | load a typeface; called from \`config()\`, it delays first paint |

Stylesheets are \`View.stylesheet(import.meta, "styles.css")\` — resolved against the *module*, never the document. The SPA fallback makes the document url the route, so a document-relative path misses.`);

		md("Next: [View](/alex/framework/view/) — the class every one of those lines is built out of.");
	},
});

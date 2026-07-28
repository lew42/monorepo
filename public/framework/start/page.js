import { Page, md, h2, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Start",
	description: "Three files, no build step, a working site.",
	content(){

		pre(`public/
    index.html
    app.js
    page.js`);

		md("A whole site. No `package.json`, no bundler, no config. Serve the folder.");

		h2("index.html");

		pre(`<!doctype html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="module" src="/app.js"></script>
</head>
<body></body>
</html>`);

		md("The body is empty, and stays empty in the file — the app fills it. This one document answers **every** url, so you never configure a route.");

		h2("app.js");

		pre(`import App from "/framework/core/App/App.js";

window.app = new App();

export * from "/framework/core/App/App.js";`);

		md("Three lines: create the app, and re-export the framework. That last line is why every page can `import { p } from \"/app.js\"` — one import, one place, and the browser hands out the same module instance to all of them.");

		h2("page.js");

		pre(`import { Page, p } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Hello",
    content(){
        p("My first page.");
    }
});`);

		md("Open `/`. That's the site.");

		h2("Add a page");
		md("Make a file. There is no step two.");

		pre(`public/
    page.js          →  /
    about/
        page.js      →  /about/
        team.page.js →  /about/team`);

		md("A folder with a `page.js` is a url. A `name.page.js` beside it is `name`. The App builds the module path from the url and imports it — so pages load only when visited, and adding one registers nothing anywhere.");

		h2("Link them");

		pre(`import about from "./about/page.js";   // dormant — nothing renders

export default new Page({
    meta: import.meta,
    title: "Hello",
    children: [about],
    content(){
        p("Read ", about.link(), ".");
    }
});`);

		md("Importing a page doesn't render it, so you can import one just to link to it. `about.link()` knows its own url from `import.meta` — you never type a path twice.");

		h2("What you just got");

		md(`| | |
|---|---|
| **no-reload navigation** | links are upgraded automatically |
| **lazy loading** | a page's code arrives when you visit it |
| **breadcrumbs, previews, active links** | from \`children\` |
| **live reload** | while \`node server.js\` is running |

None of it was configured.`);

		h2("Next");

		md("[View](/framework/core/View/) is the one class you'll use on every line. Then [Page](/framework/core/Page/), then [Pager](/framework/core/Pager/) when you want a layout.");
	}
});

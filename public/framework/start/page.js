import { Page, md, h2, pre, code } from "/app.js";

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

		code.html(`<!doctype html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="module" src="/app.js"></script>
</head>
<body></body>
</html>`);

		md("The body is empty, and stays empty in the file — the app fills it. This one document answers **every** url, so you never configure a route.");

		h2("app.js");

		code.js(`import App from "/framework/core/App/App.js";

window.app = new App();

export * from "/framework/core/App/App.js";`);

		md("Three lines: create the app, and re-export the framework. That last line is why every page can `import { p } from \"/app.js\"` — one import, one place, and the browser hands out the same module instance to all of them.");

		h2("page.js");

		code.js(`import { Page, p } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Hello",
    content(){
        p("My first page.");
    }
});`);

		md("Open `/`. That's the site.");

		h2("Add a page");
		md("A folder with a `page.js` in it is a url.");

		pre(`public/
    page.js          →  /
    about/
        page.js      →  /about/
        team/
            page.js  →  /about/team/`);

		md("Two steps, and the second is the one people forget: **make the file, then name it in its parent's `children`.** Nothing crawls the filesystem — declaring is the registration, and a page nobody declared is a 404.\n\nThat is also what makes it lazy: a `children` entry stays a *name* until someone navigates to it, and only then is it imported.");

		h2("Link them");

		code.js(`import about from "./about/page.js";   // dormant — nothing renders

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
| **previews and active links** | from \`children\` |
| **live reload** | while \`node server.js\` is running |

None of it was configured.`);

		h2("Next");

		md("[View](/framework/core/View/) is the one class you'll use on every line. Then [Page](/framework/core/Page/), then [Router](/framework/core/Router/) when you want more than one url.");
	}
});

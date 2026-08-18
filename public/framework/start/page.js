import { Page, md, h2, code, files, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Start",
	label: "Start here",
	description: "Three files, no build step, a working site.",
	icon: "flag",

	content(){

		toc();

		md("**A whole site.** Click through it — these are real files, fetched:");

		// `example/` is intentionally not in `children:` — fetched as static text, never routed. See /framework/ext/files/doc/fetched/.
		files(import.meta, "example/index.html example/app.js example/page.js example/about/page.js example/about/team/page.js");

		md("No `package.json`, no bundler, no config, no route table. Serve the folder.");

		h2("The two lines that matter");

		code.html(`<script type="module" src="/app.js"></script>`);

		md("`index.html` answers **every** url — that's the only server configuration there is, and it's one setting. The body stays empty in the file; the app fills it.");

		code.js(`window.app = new App();`);

		md("That's `app.js`. It also re-exports the framework, which is why every page can write `import { Page, p } from \"/app.js\"` — one import, one place, and the browser hands out the same module instance to all of them.");

		h2("A folder is a url");

		code.js(`public/
    page.js          →  /
    about/
        page.js      →  /about/
        team/
            page.js  →  /about/team/`);

		md("**Make the file, and the url works.** Nothing to register, nothing to route.");

		code.js(`children: "about"`);

		md("That line is the **menu**: which children this page lists, and in what order. Each one is imported when the page is built, so a card or a tab can show its real title and icon. Leave a folder out and you lose the menu entry, not the url.");

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

		md("Importing a page doesn't render it, so you can import one just to link to it. `about.link()` knows its own url from `import.meta` — **you never type a path twice.**");

		h2("What you just got");

		md(`| | |
|---|---|
| **no-reload navigation** | every link, upgraded automatically |
| **a url per folder** | \`page.js\` on disk is a page on the site |
| **preview cards and active links** | from \`children\` |
| **live reload** | while \`node server.js\` is running |

None of it was configured.`);

		h2("Next");

		md("[View](/framework/core/View/) is the one class you'll use on every line. Then [Page](/framework/core/Page/), then [Router](/framework/core/Router/) when you want more than one url.");

		md("And keep [the FAQ](/framework/faq/) open in a tab — it answers the questions you're about to have, including the five things here that fail **silently**.");
	}
});

import { Page, code, md, demo, h2, p, toc } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Highlight",
	description: "Syntax highlighting bolted onto the code element — code.js(), code.fn(), and every markdown fence.",
	icon: "code",
	content(){

		toc();

		demo(() => {
			code.js(`const sum = (a, b) => a + b;`);
		}, "`code()` and `code.c()` stay elemental. Importing the ext adds the languages: `code.js`, `code.html`, `code.css`, `code.md`, `code.json`.");

		demo(() => {
			code.fn(() => {
				const greeting = "hello";
				document.title = greeting;
			});
		}, "**`code.fn()` takes a function, not a string** — so the IDE highlights it, completes it, formats it, and catches its syntax errors. It renders the body, dedented. It never runs it.");

		demo(() => {
			p("Call ", code.js("View.body()"), " first.");
		}, "Same call, different shape. In a sentence you get a bare `<code>`; on its own you get a `<pre>`. The **captor** decides — the content never could, since `\"View.body()\"` is the same string either way.");

		demo(() => {
			md("```css\n.page { background: white }\n```");
		}, "And mostly you won't call it at all: importing the ext highlights **every markdown code fence on the site**, so a fence in any `readme.md` is already done.");

		h2("Languages");

		md("| accessor | grammar |\n| --- | --- |\n| `code.js` `code.javascript` | javascript |\n| `code.html` `code.xml` | xml |\n| `code.css` | css |\n| `code.md` `code.markdown` | markdown |\n| `code.json` | json |\n\n`code.lang(name, src)` is the general form. Anything unregistered renders as plain text — an unknown language is never an error.");

		h2("From a file");

		demo(() => code.file(import.meta, "example.js"),
			"`code.file(import.meta, url)` fetches a real file and infers the language from its extension. Like `md.file()` it returns a *promise* — `View.append` places it, and `App.load_page` can await it.");

		h2("Opting in");

		code.js(`import "/framework/ext/highlight/highlight.js";`);

		md("One import, once — this site does it in `app.js`. It enhances the `code` factory in place, so `code` still comes from `/app.js` like every other element. Drop the import and `code()` keeps working while `code.js()` disappears.");

		md("Next: [Classdoc](/framework/ext/classdoc/) — a class's methods as pages, source included.");

		md.details(import.meta, "readme.md");
	}
});

import { Doc, code, md, demo, h2, p } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Highlight",
	description: "Syntax highlighting bolted onto the code element — code.js(), code.fn(), and every markdown fence.",
	icon: "code",

	subject: code,
	methods:    "lang fn file ext",
	properties: "cache",
	notes:      "choice hooks chaining",
	files:      "highlight.js highlight.css example.js page.js readme.md editor.md "
		+ "hljs/core.min.js hljs/languages/css.min.js hljs/languages/javascript.min.js "
		+ "hljs/languages/json.min.js hljs/languages/markdown.min.js hljs/languages/xml.min.js",

	content(){

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

		h2("Labelling a block with its file");

		demo(() => {
			code.js(`import { App, Router } from "/app.js";\n\nnew App({ router: new Router() });`, "/app.js");
		}, "A trailing FILENAME argument draws a label on the block's top edge — `code.js(src, \"/app.js\")`, or the general form `code.lang(name, src, file)`. Every accessor takes it the same way: `code.css(src, file)`, `code.html(src, file)`, `code.md(src, file)` — it's the same third parameter everywhere.");

		demo(() => {
			md("```js /framework/ext/highlight/highlight.js\nView.prototype.append = function(...args){ … };\n```");
		}, "The same label from markdown — a fence's info string's **second** word (the first is still the language). [`ext/markdown`](/framework/ext/markdown/docs/file-labels/) reads it and sets the identical `data-file` attribute, so one `highlight.css` rule draws both.");

		md("Only a block that owns its own `<pre>` gets a label — one already inside a hand-built `<pre>`, or inline in a sentence, silently ignores the third argument. Why, and the one case where a label can still be lost after the fact: [Chaining](docs/chaining/).");

		h2("Languages");

		md("| accessor | grammar |\n| --- | --- |\n| `code.js` `code.javascript` | javascript |\n| `code.html` `code.xml` | xml |\n| `code.css` | css |\n| `code.md` `code.markdown` | markdown |\n| `code.json` | json |\n\n`code.lang(name, src, file)` is the general form behind all of them. Anything unregistered renders as plain text — an unknown language is never an error.");

		h2("From a file");

		demo(() => code.file(import.meta, "example.js"),
			"`code.file(import.meta, url)` fetches a real file and infers the language from its extension. Like `md.file()` it returns a *promise* — `View.append` places it, and `App.load_page` can await it.");

		h2("Opting in");

		code.js(`import "/framework/ext/highlight/highlight.js";`);

		md("One import, once — this site does it in `app.js`. It enhances the `code` factory in place, so `code` still comes from `/app.js` like every other element. Drop the import and `code()` keeps working while `code.js()` disappears.");

		h2("One sharp edge");

		code.js(`p.c("wide", "Call ", code.js("x"), "!")      // ✓ class on the sentence
p(() => code.js("x").ac("wide"))              // ✓ capture form, correct by construction`);

		md("In **argument position** inside a sentence, the captor is still the grandparent — so `code.js()` guesses \"block\", builds a `<pre>`, and that `<pre>` is discarded when `append` corrects the guess. Anything chained onto it goes with it: classes, attributes, **and `.on()` handlers**, which leaves a dead listener and nothing in the console. Full reasoning and every workaround: [Chaining](docs/chaining/).");

		md("Every method and property below reads the running program — including where an ext's own naming quirks make the API tab's banner render oddly. That's flagged where it happens, not swept under it.");

		md("Next: [Files](/framework/ext/files/) — a tree of real files, fetched.");

		md.details(import.meta, "readme.md");
	}
});

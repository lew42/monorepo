import { Page, syntax, md, demo, h2, p, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Syntax",
	description: "Syntax highlighting as a View helper — syntax(), view.syntax(), and every markdown fence.",
	content(){

		demo(() => {
			syntax("js", `const sum = (a, b) => a + b;`);
		}, "Language first, source second. `syntax()` gives you a real `<pre><code>` — captured and chainable like any other factory.");

		demo(() => {
			md("```css\n.page { background: white }\n```");
		}, "But mostly you won't call it. Importing the ext highlights **every markdown code fence on the site** — so a fence in a `readme.md` is already done.");

		demo(() => {
			p().syntax("js", "app.font('Montserrat')");
		}, "`.syntax()` sets any view's content, the way `.md()` does.");

		demo(() => {
			p("Call ", syntax.inline("js", "View.body()"), " first.");
		}, "`syntax.inline()` is the same thing without the `<pre>`, for the middle of a sentence.");

		h2("Languages");

		md("| ask for | you get |\n| --- | --- |\n| `js` `jsx` `mjs` `cjs` | javascript |\n| `html` `svg` `xml` | xml |\n| `css` | css |\n| `md` `markdown` | markdown |\n| `json` | json |\n\nAnything else renders as plain text — an unknown language is never an error.");

		h2("From a file");

		demo(() => syntax.file(import.meta, "example.js"),
			"`syntax.file(import.meta, url)` fetches a real file and infers the language from its extension. Like `md.file()`, it returns a *promise* — `View.append` places it, and `App.load_page` can await it.");

		h2("Opting in");

		pre(`import "/framework/ext/syntax/syntax.js";`);

		md("One import, once. This site does it in `app.js`, which is why `syntax` comes straight from `/app.js` above — and why the code block at the top of every `demo()` on this site is colored, including this one.");

		md.details(import.meta, "readme.md");
	}
});

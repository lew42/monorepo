import { Doc, md, demo, code, h2, p, toc } from "/app.js";

export default new Doc({
	meta: import.meta,
	title: "Markdown",
	description: "Markdown as a View addon — md(), view.md(), md.file() — plus a fence that can name its file.",
	icon: "article",

	subject: md,
	properties: "cache",
	methods:    "file details c resolve",
	notes:      "decisions sanitization relative-links file-labels proposed",
	files:      "example.md marked.esm.js md.css md.js page.js readme.md",

	content(){

		toc();

		demo(() => {
			md("**Bold**, *italic*, `code`, and a [link](/framework/).");
		}, "`md()` is a tag function that happens to speak markdown.");

		demo(() => {
			md("### A real h3");
			md("A real `<p>`.").style("color", "green");
			md("- multiple blocks\n- get wrapped\n\nin a `div.md`");
		}, "You get the element you wrote: one block in, that block out — so `md(\"Hi.\")` really is a `<p>`, and chains like one — classes go on with `.ac(\"note\")`, same as everywhere.");

		demo(() => {
			p().md("Any view can take markdown: `.md()` sets its **html**.");
		}, "Inline into an existing view. Block containers get the full parse; phrasing elements like `p` get `parseInline`, so you never nest a `<p>` in a `<p>`.");

		h2("A fence can name its file");

		demo(() => {
			md("```js /app.js\nimport App from \"/app.js\";\n```");
		}, "A fence's info string can carry a second word — the file it's from. It's kept as `data-file` on the `<pre>` and drawn as a label, same look as `code.js(src, \"/app.js\")`. Added 2026-08-15.");

		h2("From a file");

		demo(() => md.file(import.meta, "example.md"),
			"`md.file(import.meta, url)` fetches and parses a file. It returns a *promise*, which `View.append` already knows how to place — and which `App.load_page` can await before it swaps the DOM.");

		demo(() => md.file(import.meta, "does-not-exist.md"),
			"A file nobody has written yet reads as an invitation, not a fault: the 404 branch now says \"Not written yet\" instead of \"Error loading\" — this box is a live fetch against a url that really is missing.");

		code.js(`md.file(import.meta, "readme.md", { h1: false })   // as page content
md.details(import.meta, "readme.md")               // collapsed at the bottom`);

		md("Both resolve against the **module's** url, not the document's — with an SPA fallback the document url is a route, so a document-relative fetch would miss. `{ h1: false }` drops the file's own heading, since the page already renders `title` as the h1.");

		h2("Relative links in a fetched file");

		md("A link inside a fetched `.md` is rewritten to resolve against **the file**, not the document — so `[base](base/)` in `styles/readme.md` points where the author meant from any url you happen to be on. Without it, a crawl once found 40 broken routes. Full record: [Relative links](/framework/ext/markdown/doc/relative-links/).");

		md("Next: [Demo](/framework/ext/demo/) — show the code and run it, from one source. Or [ext/highlight](/framework/ext/highlight/), the other half of the file-label feature above.");

		md.details(import.meta, "readme.md");
	}
});

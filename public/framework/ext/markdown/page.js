import { Page, md, demo, h2, p, pre, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Markdown",
	description: "Markdown as a View helper — md(), view.md(), md.file().",
	content(){

		demo(() => {
			md("**Bold**, *italic*, `code`, and a [link](/framework/).");
		}, "`md()` is a tag function that happens to speak markdown.");

		demo(() => {
			md("### A real h3");
			md("A real `<p>`.").style("color", "green");
			md("- multiple blocks\n- get wrapped\n\nin a `div.md`");
		}, "You get the element you wrote: one block in, that block out — so `md(\"Hi.\")` really is a `<p>`, and chains like one.");

		demo(() => {
			p().md("Any view can take markdown: `.md()` sets its **html**.");
		}, "Inline into an existing view. Block containers get the full parse; phrasing elements like `p` get `parseInline`, so you never nest a `<p>` in a `<p>`.");

		h2("From a file");

		demo(() => md.file(import.meta, "example.md"),
			"`md.file(import.meta, url)` fetches and parses a file. It returns a *promise*, which `View.append` already knows how to place — and which `App.load_page` can await before it swaps the DOM.");

		code.js(`md.file(import.meta, "readme.md", { h1: false })   // as page content
		md("Next: [Demo](/framework/ext/demo/) — show the code and run it, from one source.");

md.details(import.meta, "readme.md")               // collapsed at the bottom`);

		md("Resolved against the **module's** url, not the document's — with an SPA fallback the document url is a route, so a document-relative fetch would miss. `{ h1: false }` drops the file's own heading, since the page already renders `title` as the h1.");

		md("A readme can be a whole page: `content(){ return md.file(import.meta, \"readme.md\", { h1: false }); }`");

		md.details(import.meta, "readme.md");
	}
});

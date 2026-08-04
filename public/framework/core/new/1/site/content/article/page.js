import { Page, div } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { show, raw, folded, section } from "../show.js";
import { order_nav } from "../list.js";

// A bounded window onto some rendered markdown, in site/ui.js's `.code` frame —
// so the A/B below sits in the same box every code sample on this site sits in.
function peek(label, view){
	return div.c("code", () => {
		div.c("code-label", label);
		div.c("content-peek").append(view);
	});
}

export default new Page({
	meta: import.meta,
	title: "A page whose content is a file",

	content(){
		show(() => {
			const article = new Page({
				meta: import.meta,
				title: "A page whose content is a file",
				content(){ return md.file(import.meta, "article.md", { h1: false }); },
			});
		}, "content/article/page.js — the whole recipe, minus the export");

		md("`md.file()` returns a **promise**. `Page.render()` captures a `div.page` synchronously, calls `content()`, and `View.append_promise` puts the parsed markdown inside a container that was parented before the fetch began. No `await` appears in the file the author wrote.");

		section("With and without { h1: false }");

		div.c("content-peeks", () => {
			peek("{ h1: false }", md.file(import.meta, "article.md", { h1: false }));
			peek("no options", md.file(import.meta, "article.md"));
		});

		md("Both windows show the same file. The right one keeps the file's own leading `# A page whose content is a file`, which the page has *already* rendered as its `<h1>` — the reader gets the title twice, same words, no explanation. `{ h1: false }` removes a **leading** h1 only; an h1 further down is content and stays.").ac("note");

		md("Two renders, **one** network request: `md.file` caches by resolved href, so the second call awaits a promise that has already settled. The parse and the DOM are per-call; only the bytes are shared.").ac("note");

		section("The article");

		div.c("article-body", md.file(import.meta, "article.md", { h1: false }));

		order_nav(this.url);

		section("The markdown behind it");

		folded("article.md, verbatim", () => raw(import.meta, "article.md"));

		folded("content/article/page.js, verbatim", () => raw(import.meta, "page.js"));
	}
});

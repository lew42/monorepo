import { Page, md, code, h3, h4, div, demo } from "/app.js";

// Reused by two of the four demos below, so the code shown and the code that ran
// are the same object — demo()/demo.app() print fn.toString(), so writing it twice
// would risk the two copies drifting apart.
const route_demo = () => new Page({
	title: "Wiki",

	route(name){
		return ["html", "css", "js"].includes(name) && {
			title: name.toUpperCase(),
			content(){ md("Built on the fly — nobody declared this page."); },
		};
	},

	content(){
		md("No `children:` at all. These links work anyway — click one:");
		["html", "css", "js"].forEach(name => md(`[${name}](${this.url + name + "/"})`));
	},
});

const folders_demo = () => new Page({
	title: "Years",

	async child(name, levels){
		if (!/^\d{4}$/.test(name)) return null;   // not a name I answer for

		return this.add(name, {
			title: name,
			content(){ md(`**${name}** — nothing on disk made this page; \`child()\` built it just now.`); },
		}).load_all_children(levels);
	},

	content(){
		md("No `children:` at all. Click a year — `child()` builds it, on the fly:");
		["2025", "2026"].forEach(name => md(`[${name}](${this.url + name + "/"})`));
	},
});

/**
 * The four ways to make a page, simplest first, code then LIVE result — the owner's
 * own rule ("show the simplest example first: the code, then what it produces,
 * live"). `demo()`/`demo.app()` run the real function beside its own printed source,
 * so what you see under each code block is not a picture of the result, it is the
 * result. A link to the same thing at its own url stays as a second line under each.
 * proposal.md rewrite order item 3.
 */
export default new Page({
	meta: import.meta,
	title: "Make a page",
	description: "Five ways to make a page, simplest first — the code, then what it produces, live.",
	icon: "add_box",

	children: "readme-page",

	content(){
		md("Five ways to make a page. Each one below shows the smallest real code for it, then the real thing running.");

		h3("1. page.js — one file");
		md("The folder is the url. `children:` is the menu, in order:");
		code.js(`export default new Page({
    meta: import.meta,
    title: "Docs",
    children: "intro guide api",
    content(){ md("Hello."); },
});`, "page.js");
		demo(() => { md("Hello."); }, "What `content()` draws — the folder and the menu are the rest of the shape.");
		md("Live: [overview/page](/framework/core/Page/overview/page/) — the smallest real one on the site.");

		h3("2. page.jsonl — the same page, as a log");
		md("Line 1 builds the page; every later line calls one method on it:");
		code.json(`{"title": "Notes"}
{"place": "note.md"}`, "page.jsonl");
		demo(() => {
			md("# A placed note\n\nThis paragraph lives in `note.md`. It is on the page because one line in `page.jsonl` says `{\"place\": \"note.md\"}`.");
		}, "What the log draws — `note.md`'s own text, placed by the second line.");
		md("Live: [jsonl](/framework/core/Page/jsonl/) — this exact two-line case. [jsonl/full](/framework/core/Page/jsonl/full/) has every line the format knows (files, a linked child, a removed file).");

		h3("3. route(name) — a url nobody declared");
		md("No `children:` at all. A name the parent never listed still resolves, the moment a reader asks for it:");
		code.js(`route(name){
    return ["html", "css", "js"].includes(name)
        && { title: name.toUpperCase(), content(){ md("Built on the fly."); } };
}`);
		demo.stage(() => demo.app(route_demo())).ac("toc-skip");
		md("Live: [overview/route](/framework/core/Page/overview/route/) — the same textbook case, at its own url.");

		h3("4. folders — an index with no folder on disk");
		md("`route()`'s biggest job: a page whose child is a *name*, read straight off disk instead of declared. This is the pattern behind `ai2/`'s day and card pages (`Card.Folder`, [`ai2/card.js`](/framework/ai2/card.js)) — the smallest real piece of it:");
		code.js(`async child(name, levels){
    if (!/^\\d{4}$/.test(name)) return null;                 // not a name I answer for
    return this.add(name, { title: name, content(){ … } })   // build it, on the fly
        .load_all_children(levels);
}`);
		demo.stage(() => demo.app(folders_demo())).ac("toc-skip");
		md("Live: [overview/folders](/framework/core/Page/overview/folders/) — the same two years, at its own url.");

		h3("5. readme.md — the page's own content");
		md("The whole page can just BE its own `readme.md`. What an AI reads is exactly what a person sees — one file, not two copies to keep in sync:");
		code.js(`content(){ return md.file(import.meta, "readme.md"); }`);
		md("Source and rendered, side by side:");
		// Two boxes captured synchronously; each promise (code.file/md.file, both
		// capture:false) is appended onto its own box explicitly — never after an
		// `await`, which would land wherever the captor had drifted to by then.
		div.c("flex gap wrap", () => {
			const left = div.c("flex-1", () => h4("readme.md — source"));
			left.append(code.file(import.meta, "readme-page/readme.md", "markdown"));

			const right = div.c("flex-1", () => h4("Rendered"));
			right.append(md.file(import.meta, "readme-page/readme.md"));
		});
		md("Where markdown falls short, in three lines: it can't take a custom module or a class on a span, it can't hold a live widget (a drag handle, a chart, anything with its own JS), and it reads as one long flow with no regions. Reach for JS `content()` instead once a page needs any of those.");
		md("Live: [make/readme-page](/framework/core/Page/make/readme-page/) — the same readme, as a real page, with one JS-built block under it.");

		md("Every child's own `label`, `title` and `icon`: [`doc/labels.md`](/framework/core/Page/doc/labels.md). Once a page exists, [structured content](/framework/ux/Content/structure/) is the vocabulary for what goes *inside* it — icon items, sections, outlines.");
	},
});

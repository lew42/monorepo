import { p, h2, pre } from "/app.js";

// Placed by the line {"place": "content.js"}: the escape hatch for anything a line
// cannot say. The box is the one the page captured for me before this file arrived.
export default function(page, box){
	p("This page has no `page.js`. It is one file, `page.jsonl`, read a line at a time: the first line builds the page, and every later line is one `set()` call. A key that names a method calls that method; any other key is stored as data.");

	h2("The file");
	const $source = pre.c("page-log-source", "…");
	fetch(page.jsonl_url).then(res => res.text()).then(text => $source.text(text.trim()));

	h2("Exists, linked, placed");
	p("A `file` line only records that a file exists. A folder holding its own `page.jsonl` is linked as a child page automatically. Nothing is drawn until a `place` line puts it on the page, so `unplaced.md` exists and is listed, but you will not read it here.");
	page.listing();
}

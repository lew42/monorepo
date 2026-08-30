import View, { div, p, pre, code, span, a, button, icon, is } from "../../core/View/View.js";
import { source, dedent } from "../../util/source/source.js";
import { markup } from "../../util/markup/markup.js";
import { stage } from "./stage.js";

/* css: `.page.standard > .demo.quoted` — the opt-out reads Page.css's own track names,
   so this import is the loading edge for it, not an annotation. */
import "../../core/Page/Page.class.js";

View.stylesheet(import.meta, "demo.css");

/**
 * demo — show the code, run it, and let the reader push it around. One box.
 *
 *   demo(() => {
 *       div.c("card", () => {
 *           h1("Title");
 *           p("Body");
 *       });
 *   });
 *
 *   demo("Label above", () => { … });
 *   demo(() => { … }, "Caption below the result.");
 *   demo(() => { … }, { html: true });      // the HTML pane open from the start
 *   demo(() => { … }).ac("stack");          // never put the panes side by side
 *   demo(() => { … }).ac("quoted");         // a quoted aside — stay on the measure
 *
 * The two halves also stand alone:
 *
 *   demo.stage(fn).ac("bleed");             // the render, full-bleed, no chrome
 *   demo.source(fn);                        // the code, open, in a named block
 *
 * A demo PAGE is `page.demo()` — one shell, in shell.js. `demo.page()`,
 * `demo.tree()`, `demo.exhibit()` (exhibit.js) and `demo.layout()` (layout.js) are
 * `children:` factories over it: page SHAPES, not a fifth way to draw a demo.
 *
 * Strings before the function label the box; strings after caption it. The
 * caption is the important one: a doc page leads with code, and the sentence
 * that explains it reads *after* you've seen it.
 *
 * The source is `fn.toString()`, so the code you read is literally the code that
 * ran. The function runs with the `.demo-render` as captor, like any capture fn,
 * so examples are written exactly the way real page code is written.
 *
 * ⚠ The stage is a DIV: a `@media` query inside an example reads the real browser
 * viewport and will not move with the handle. stage.js, doc/record.md §6.
 *
 * A demo is an exhibit, so the box carries `wide` and leaves the reading measure on
 * its own — the doctrine lives here rather than on thirty pages. doc/record.md §14.
 *
 * Design record: readme.md, and doc/record.md for the long form.
 */
export default function demo(...args){
	const i = args.findIndex(is.fn);

	// visible and non-fatal, like md-error: a broken example shouldn't take the
	// page down, but it must not fail silently either
	if (i === -1)
		return div.c("demo demo-error", "demo() needs a function");

	const fn    = args[i];
	const opts  = args.find(is.pojo) ?? {};
	const label = args.slice(0, i).filter(is.str).join(" ");
	const note  = args.slice(i + 1).filter(is.str).join(" ");

	return div.c("demo wide", $demo => {
		let $html;

		// Placed now, filled last: its controls point at things further down, and
		// `append(fn)` re-establishes the captor.
		const $bar = div.c("demo-bar");

		div.c("demo-panes", () => {
			pre.c("demo-code", () => source_code(source(fn)));
			$html = pre.c("demo-html");
		});

		// `checkered` so you can tell whether what rendered painted its own
		// background — an unpainted box shows the board through (framework.css).
		const { $render } = stage(fn, "checkered");

		if (note) caption(note);

		/* One function, so the button and the `html: true` flag cannot disagree.
		 * Read on SHOW: a demo whose content arrives from a promise has not finished
		 * building when demo() returns, and a click is always later than that. */
		let $toggle;

		const html = on => {
			$demo[on ? "ac" : "rc"]("show-html");
			$toggle[on ? "ac" : "rc"]("on");
			if (on) $html.empty(() => source_code(markup($render.el), "html"));
		};

		$bar.append(() => {
			if (label) span.c("demo-label", label);

			div.c("demo-spacer");

			$toggle = btn("<>", "The HTML this built", () => html(!$demo.hc("show-html")));

			/* A LINK, and only when the page claims `<url>full/` via `route()`, so a
			 * reload lands back on it. Filling the window is the stage's own control
			 * now — one strip below this one, and it has the render, not the box.
			 * See styles/layouts/full.js. */
			if (opts.full)
				a.c("demo-btn", () => icon("open_in_full"))
					.attr("title", "Open full size").href(opts.full.url + "full/");
		});

		if (opts.html) queueMicrotask(() => html(true));
	});
}

/**
 * demo.stage(fn) — the stage on its own: its strip, the resizable box and the width
 * readout, with no code pane and no border. This is a leaf demo page's entire
 * render; it carries `wide` like any exhibit, and `.ac("bleed")` is what takes it
 * the rest of the way to the window's edge.
 *
 * `steer`, if given, is handed the render — the box a toolbar over this stage
 * points at. `demo.exhibit()` is the caller that has one (exhibit.js).
 *
 * The pieces are stage.js's, strip included; `demo()` above composes the same ones.
 */
demo.stage = (fn, steer) => {
	const { $stage, $render } = stage(fn);

	steer?.($render);

	return $stage.ac("wide");
};

/**
 * source_block(label, body, file) — THE code surface on the site. A named header
 * (the file, a link to the whole of it, a copy button) over an open block.
 *
 * ⚠ It is not a `<details>` any more. It was, for a year, and every caller that
 * mattered wrote `.attr("open", "")` straight after — a disclosure that is always
 * disclosed, which is the worst of both. Code beside a render is half the lesson,
 * not an aside. `page.demo()` draws its peer column with this, and so does every
 * `demo.source()` below, so there is exactly one of them. demo-merge step 2.
 */
export function source_block(label, body, file){
	return div.c("demo-source", $source => {
		div.c("demo-source-head", () => {
			span(label);
			if (file) file_link(file);
			copy_btn($source);
		});

		/* ⚠ Nothing RETURNED from the callback: `append(fn)` appends whatever the
		   function hands back, so a returned box would be appended to itself. */
		div.c("demo-source-body", $body => { body($body); });
	});
}

/**
 * demo.source(fn) — the code, open, under a render.
 *
 *   demo.source(hero);                          // the header reads "Source"
 *   demo.source(hero, "The whole page");
 *   demo.source(tree, "Source", "/x/page.js");  // + the whole file, one click away
 *   demo.source(template, "Source");            // a STRING, already built
 *   demo.source.file(import.meta, "hero.js");   // the header reads "hero.js"
 *
 * What prints is the FUNCTION, which on a demo page is the lesson; the third
 * argument is the file it lives in, for the reader who wants the imports too. A
 * string prints as-is, for code a page assembled rather than ran.
 *
 * Two doors into `source_block()` above — never a second shape.
 */
demo.source = (src, label = "Source", file) =>
	source_block(label, () => source_code(is.fn(src) ? source(src) : src), file);

demo.source.file = (meta, url, label = url) =>
	source_block(label, $body => { $body.append(source_file(meta, url)); });

/* The source block is the one place code is handed over, so the copy button rides
   it rather than living beside a second code block (ui/parts.js had one).
   ⚠ Reads the rendered `<pre>` at click time, not the function: `demo.source.file`
   fetches, so there is nothing to hold until it lands — and copying what you can
   see cannot drift from it. */
const copy_btn = $source => btn(() => icon("content_copy"), "Copy the source", function(){
	navigator.clipboard.writeText($source.el.querySelector("pre")?.textContent ?? "");

	this.empty(() => icon("check")).ac("on");
	setTimeout(() => this.empty(() => icon("content_copy")).rc("on"), 1400);
}).ac("demo-copy");

/* ⚠ `target` is load-bearing: the Router ignores a link that carries one
   (`link_clicked`), and this address is a real file, not a route. */
const file_link = url => a.c("demo-file", url.split("/").at(-1))
	.href(url).attr("target", "_blank").attr("title", "The whole file");

/* One toolbar control. Every button here is a toggle, and `.on` is the pressed
 * state — the caller flips it, because the caller is what knows the state. */
function btn(content, title, fn){
	return button.c("demo-btn", content).attr("title", title).click(fn);
}

/* The caption is prose, so it wants markdown — but demo/ must not depend on
 * markdown/. Soft dependency instead: if ext/markdown has been imported it has
 * patched View.prototype.md, so use it; otherwise fall back to the backtick pass.
 *
 * ⚠ TWO elements, not one. Inside a `.demo` the caption is the box's last STRIP —
 *   tinted, hairlined, and it has to reach both edges — while the sentence in it is
 *   prose and has to stay on the measure. One element could not be both: the
 *   `max-width` that kept the line readable also stopped the tint, at 45% of the
 *   box on a 3440 homepage. demo.css says it in CSS. */
function caption(text){
	return div.c("demo-note", () => {
		const view = p.c("demo-note-text");
		view.md ? view.md(text) : view.backtick_append(text);
	});
}

/* The same deal with ext/highlight: if it's loaded the source is highlighted, if
 * not it's a plain code block, which is what this always was. The captor here is
 * a <pre>, so code.js() returns a bare <code> — exactly the element this used to
 * build by hand. */
function source_code(src, lang = "js"){
	return code[lang] ? code[lang](src) : code(src);
}

/* The same soft dependency, for a whole file. ⚠ `capture: false` and nothing built
   after the await — by then the captor has moved on. Both failure modes land in
   the box as text rather than as an unhandled rejection. */
function source_file(meta, url){
	if (code.file)
		return code.file(meta, url);

	const $pre = new View({ tag: "pre", capture: false });

	return fetch(new URL(url, meta.url))
		.then(resp => resp.ok ? resp.text() : `Error loading ${url}: ${resp.status}`, error => error.message)
		.then(text => $pre.text(text.replace(/\s+$/, "")));
}

/* source()/dedent() moved to util/source — ext/highlight's code.fn() needs the
   identical transform. Re-exported here because that's where they've always been
   imported from. */
export { source, dedent };

/* The shell, for whoever composes one: exhibit.js and layout.js build demo PAGES
   out of these, and import them so the boxes cannot drift.
   ⚠ One-way — those files import this one and patch `demo.*`. */
export { btn, caption, source_code, source_file };

export { demo };

import View, { div, p, pre, code, span, a, button, details, summary, icon, is } from "../../core/View/View.js";
import { source, dedent } from "../../util/source/source.js";
import { markup } from "../../util/markup/markup.js";
import { stage, zoom } from "./stage.js";

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
 *   demo.source(fn);                        // the code, closed, BELOW the render
 *
 * A demo PAGE is those two plus a control bar, assembled once — `demo.exhibit()`
 * in exhibit.js, which is also where `demo.page()` and `demo.tree()` live.
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
 * viewport and will not move with the handle. stage.js, readme.md §6.
 *
 * A demo is an exhibit, so the box carries `wide` and leaves the reading measure on
 * its own — the doctrine lives here rather than on thirty pages. readme.md §14.
 *
 * Design record: framework/ext/demo/readme.md.
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
		const { $render, measure } = stage(fn, "checkered");

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

			zoom($render, measure);

			$toggle = btn("<>", "The HTML this built", () => html(!$demo.hc("show-html")));

			/* A link when the page claims `<url>full/` via `route()`, so a reload lands
			 * back on it; a toggle when it doesn't. See styles/layouts/full.js. */
			if (opts.full)
				a.c("demo-btn", () => icon("open_in_full"))
					.attr("title", "Open full size").href(opts.full.url + "full/");
			else
				btn(() => icon("open_in_full"), "Fill the window", function(){
					this.tc("on");
					$demo.tc("max");
				});
		});

		if (opts.html) queueMicrotask(() => html(true));
	});
}

/**
 * demo.stage(fn) — the stage on its own: the resizable box, the width readout and
 * the zoom, with no code pane, no bar and no border. This is a leaf demo page's
 * entire render; it carries `wide` like any exhibit, and `.ac("bleed")` is what
 * takes it the rest of the way to the window's edge.
 *
 * `steer`, if given, is handed the render — the box a toolbar over this stage
 * points at. `demo.exhibit()` is the caller that has one (exhibit.js).
 *
 * The pieces are stage.js's; `demo()` above composes the same ones. ⚠ `stage()` is
 * the raw one and stays bare — exhibit.js builds its own band and must not double up.
 */
demo.stage = (fn, steer) => {
	const { $stage, $tools, $render, measure } = stage(fn);

	$tools.append(() => { zoom($render, measure); });
	steer?.($render);

	return $stage.ac("wide");
};

/**
 * demo.source(fn) — the code, closed, BELOW the render.
 *
 *   demo.source(hero);                          // summary reads "Source"
 *   demo.source(hero, "The whole page");
 *   demo.source(tree, "Source", "/x/page.js");  // + the whole file, one click away
 *   demo.source.file(import.meta, "hero.js");   // summary reads "hero.js"
 *
 * A leaf page shows the thing first and answers "how" only when asked, so this
 * opens closed and belongs under the render — never above it.
 *
 * What prints is the FUNCTION, which on a demo page is the lesson; the third
 * argument is the file it lives in, for the reader who wants the imports too.
 */
demo.source = (fn, label = "Source", file) =>
	source_details(label, () => { pre(() => { source_code(source(fn)); }); }, file);

demo.source.file = (meta, url, label = url) =>
	source_details(label, $source => { $source.append(source_file(meta, url)); });

function source_details(label, body, file){
	return details.c("demo-source", $source => {
		summary(() => { span(label); if (file) file_link(file); });
		body($source);
	});
}

/* ⚠ `target` and `stopPropagation` are both load-bearing: the Router ignores a link
   that carries a target (`link_clicked`), and a click that reached the `<summary>`
   would shut the source the reader just opened. */
const file_link = url => a.c("demo-file", url.split("/").at(-1))
	.href(url).attr("target", "_blank").attr("title", "The whole file")
	.on("click", e => e.stopPropagation());

/* One toolbar control. Every button here is a toggle, and `.on` is the pressed
 * state — the caller flips it, because the caller is what knows the state. */
function btn(content, title, fn){
	return button.c("demo-btn", content).attr("title", title).click(fn);
}

/* The caption is prose, so it wants markdown — but demo/ must not depend on
 * markdown/. Soft dependency instead: if ext/markdown has been imported it has
 * patched View.prototype.md, so use it; otherwise fall back to the backtick pass. */
function caption(text){
	const view = p.c("demo-note");
	return view.md ? view.md(text) : view.backtick_append(text);
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

/* The shell, for a sibling variant: ext/demo/responsive.js builds the same box
   with two simulated viewports in it, and imports these so the two cannot drift.
   ⚠ One-way — that file imports this one and patches `demo.responsive`. */
export { btn, caption, source_code };

export { demo };

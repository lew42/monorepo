import View, { div, p, pre, code, details, summary, is } from "../../core/View/View.js";
import { source, dedent } from "../../util/source/source.js";
import { markup } from "../../util/markup/markup.js";

View.stylesheet(import.meta, "demo.css");

/**
 * demo — show the code, run it, and show the HTML it produced. One box.
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
 *
 * Strings before the function label the box; strings after caption it. The
 * caption is the important one: a doc page leads with code, and the sentence
 * that explains it reads *after* you've seen it.
 *
 * The source is `fn.toString()`, so the code you read is literally the code that
 * ran — there is no second copy to fall out of date. The function runs with the
 * `.demo-render` as captor, like any capture fn, so examples are written exactly
 * the way real page code is written.
 *
 * Design record: framework/ext/demo/readme.md.
 */
export default function demo(...args){
	const i = args.findIndex(is.fn);

	// visible and non-fatal, like md-error: a broken example shouldn't take the
	// page down, but it must not fail silently either
	if (i === -1)
		return div.c("demo demo-error", "demo() needs a function");

	const fn = args[i];
	const label = args.slice(0, i).join(" ");
	const note = args.slice(i + 1).join(" ");

	return div.c("demo", () => {
		if (label)
			div.c("demo-label", label);

		pre.c("demo-code", () => source_code(source(fn)));

		const $render = div.c("demo-render", fn);

		html_pane($render);

		if (note)
			caption(note);
	});
}

/**
 * The third pane: the DOM the example actually built.
 *
 * Closed by default, because the answer to "what does this render" is the render —
 * the markup is the follow-up question. Read on OPEN rather than now: a demo whose
 * content arrives from a promise has not finished building when demo() returns, and
 * a click is always later than that.
 */
function html_pane($render){
	let $out;

	const $pane = details.c("demo-html", () => {
		summary("html");
		$out = pre.c("demo-html-code");
	});

	return $pane.on("toggle", function(){
		if (this.el.open)
			$out.empty(() => source_code(markup($render.el), "html"));
	});
}

/* The caption is prose, so it wants markdown — but demo/ must not depend on
 * markdown/. Soft dependency instead: if ext/markdown has been imported it has
 * patched View.prototype.md, so use it; otherwise fall back to p()'s backticks. */
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

/* source()/dedent() moved to util/source — ext/highlight's code.fn() needs the
   identical transform. Re-exported here because that's where they've always been
   imported from. */
export { source, dedent };

export { demo };

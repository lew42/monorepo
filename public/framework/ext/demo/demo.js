import View, { div, p, pre, code, is } from "../../core/View/View.js";
import { source, dedent } from "../../util/source/source.js";

View.stylesheet(import.meta, "demo.css");

/**
 * demo — show the code, then run it, in one visually grouped block.
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
 * that explains it reads *after* you've seen it — inside the same box, so
 * there's never a question of which prose belongs to which example.
 *
 * The source is `fn.toString()`, de-wrapped and dedented — so the code you read
 * is literally the code that ran. There is no second copy to fall out of date,
 * which is the whole point: a docs example can't lie.
 *
 * The function runs with the `.demo-render` as captor, like any capture fn, so
 * examples are written exactly the way real page code is written.
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
		div.c("demo-render", fn);

		if (note)
			caption(note);
	});
}

/* The caption is prose, so it wants markdown — but demo/ must not depend on
 * markdown/. Soft dependency instead: if ext/markdown has been imported it has
 * patched View.prototype.md, so use it; otherwise fall back to p()'s backticks.
 * Two exts, no coupling, better together. */
function caption(text){
	const view = p.c("demo-note");
	return view.md ? view.md(text) : view.backtick_append(text);
}

/* The same deal with ext/highlight. A demo's source is always JavaScript — it's
 * a function we just called toString() on — so there's nothing to detect. If
 * the highlighter has been imported it has added code.js(); if not, plain text,
 * which is what this always was. demo/ imports neither ext.
 *
 * The captor here is the <pre>, so code.js() detects "pre" context and returns
 * a bare <code> — exactly the element this used to build by hand. */
function source_code(src){
	return code.js ? code.js(src) : code(src);
}

/* source()/dedent() moved to util/source. ext/highlight's code.fn() needs the
   identical transform, and two copies of "where does a function body start"
   would eventually print the same function two different ways on one page.
   Re-exported here because that's where they've always been imported from. */
export { source, dedent };

export { demo };

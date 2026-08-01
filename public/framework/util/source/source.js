/**
 * source(fn) — a function's body as readable source text.
 *
 * Lives in util/ because two independent callers need to agree on it exactly:
 * `demo(fn)` renders the source above the result, and `code.fn(fn)` renders it
 * on its own. If those two disagreed about where a body starts or how far to
 * dedent, the same function would print differently in two places on the same
 * page — which is precisely the drift the whole "show real source" idea exists
 * to prevent. One copy, no coupling between ext/demo and ext/highlight.
 *
 * Writing an example as a FUNCTION rather than a string is the point: a string
 * is dead text in the editor, while a function body gets highlighting,
 * completion, formatting and syntax errors from the IDE for free.
 */

// fn.toString() minus the wrapper. `() => { body }` and `function(){ body }`
// give up their braces; a concise arrow (`() => div("x")`) keeps its expression.
export function source(fn){
	const src = String(fn);
	const arrow = src.indexOf("=>");
	const body = arrow === -1 ? null : src.slice(arrow + 2).trimStart();

	if (body && !body.startsWith("{"))
		return dedent(body);

	const open = src.indexOf("{");
	const close = src.lastIndexOf("}");

	return dedent(open === -1 || close <= open ? src : src.slice(open + 1, close));
}

// remove the leading blank line and the common indent of the remaining lines,
// so a body nested three tabs deep in a page.js reads as top-level code
export function dedent(src){
	/* Normalise CRLF first. fn.toString() hands back whatever line endings the
	   file was checked out with, so on Windows this returns "\r\n" while the
	   same text set via innerHTML comes back "\n" — the DOM normalises, the
	   string doesn't. Rendered output was fine either way, but two callers
	   comparing source() results disagreed. Deterministic is worth one regex. */
	const lines = src.replace(/\r\n?/g, "\n").replace(/^\n+/, "").replace(/\s+$/, "").split("\n");
	const indents = lines.filter(line => line.trim()).map(line => line.match(/^[\t ]*/)[0].length);
	const cut = indents.length ? Math.min(...indents) : 0;

	return lines.map(line => line.slice(cut)).join("\n");
}

export default source;

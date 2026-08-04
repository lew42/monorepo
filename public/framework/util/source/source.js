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
	const arrow = arrow_at(src);
	const body = arrow === -1 ? null : src.slice(arrow + 2).trimStart();

	if (body && !body.startsWith("{"))
		return dedent(body);

	const open = src.indexOf("{");
	const close = src.lastIndexOf("}");

	return dedent(open === -1 || close <= open ? src : src.slice(open + 1, close));
}

/* Where an arrow's parameters end and its body begins: the first `=>` at nesting
 * depth zero, skipping quoted text.
 *
 * `src.indexOf("=>")` was wrong for any ORDINARY function containing an arrow —
 * `function(){ const f = () => 1; return f; }` sliced at the inner arrow and
 * printed `1; return f; }`, a fragment. Silent: it renders as perfectly good
 * code that simply isn't the code you wrote, and it hit demo() and code.fn()
 * alike. Depth-tracking also keeps `({ a }) => body` working, which a plain
 * "is the arrow before the first brace" test would have broken.
 */
function arrow_at(src){
	let depth = 0, quote = null;

	for (let i = 0; i < src.length; i++){
		const c = src[i];

		if (quote){
			if (c === "\\") i++;
			else if (c === quote) quote = null;
		}
		else if (c === '"' || c === "'" || c === "`") quote = c;
		else if ("([{".includes(c)) depth++;
		else if (")]}".includes(c)) depth--;
		else if (c === "=" && src[i + 1] === ">" && depth === 0) return i;
	}

	return -1;
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

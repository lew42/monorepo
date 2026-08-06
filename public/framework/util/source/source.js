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

/* member(Class, name) — hold a class member's function WITHOUT calling it.
 *
 * `Class.prototype[name]` **executes a getter**. `App.get loaded()` builds a
 * `Promise.all`; read it off a bare prototype, where the instance state it
 * expects doesn't exist, and it throws "undefined is not iterable" before you
 * ever reach toString(). A descriptor is the only way to get an accessor's
 * function in your hand rather than its result.
 *
 * Statics live on the constructor, so both are searched — prototype first,
 * because that is what a reader means by "a method".
 *
 * Stringify with `dedent(String(fn))`, NOT `source(fn)`: source() strips
 * everything before the first `{`, which for a shorthand method throws away
 * `append(...args)` — the one line a reader navigating "View → append" needs to
 * confirm they're looking at the right thing. That stripping is correct for
 * `demo(fn)` and `code.fn(fn)`, whose subject is an anonymous function nobody
 * needs a signature for. It is wrong here.
 */
export function member(Class, name){
	const own = Object.getOwnPropertyDescriptor(Class.prototype, name)
	         ?? Object.getOwnPropertyDescriptor(Class, name);

	const fn = own && (own.value ?? own.get ?? own.set);

	return typeof fn === "function" ? fn : null;
}

/* Has this member been replaced at runtime by an ext?
 *
 * A shorthand method (`append(...args){}`) carries its own name. A patch —
 * `View.prototype.append = function(...args){…}` — does not: JS infers a
 * function's name from assignment to an *identifier*, never from assignment to
 * a member expression, so the replacement's `.name` is "".
 *
 * Not a defect to hide. `ext/highlight` really does replace `View.append`, and a
 * doc page that quietly showed the original would be lying about what runs.
 */
export function patched(fn, name){ return fn.name !== name; }

// remove the leading blank line and the common indent of the remaining lines,
// so a body nested three tabs deep in a page.js reads as top-level code
export function dedent(src){
	/* Normalise CRLF first. fn.toString() hands back whatever line endings the
	   file was checked out with, so on Windows this returns "\r\n" while the
	   same text set via innerHTML comes back "\n" — the DOM normalises, the
	   string doesn't. Rendered output was fine either way, but two callers
	   comparing source() results disagreed. Deterministic is worth one regex. */
	const lines = src.replace(/\r\n?/g, "\n").replace(/^\n+/, "").replace(/\s+$/, "").split("\n");

	/* The first line is only evidence if it BEGINS a line. `String(fn)` for a
	   shorthand method starts at the name — `append(...args){` — so its indent was
	   left behind in the file, it measures zero, and zero pinned the common indent
	   at zero: signature at the root, every line after it still three tabs deep.
	   Same shape for a concise arrow, whose body is trimStart()ed.

	   So: a first line with no leading whitespace knows nothing. Don't ask it. */
	const evidence = /^[\t ]/.test(lines[0]) ? lines : lines.slice(1);
	const indents = evidence.filter(line => line.trim()).map(line => line.match(/^[\t ]*/)[0].length);
	const cut = indents.length ? Math.min(...indents) : 0;

	// strip WHITESPACE only — a line shallower than the cut gives up all of its
	// indent and none of its code, however the measurement was reached
	return lines.map(line => line.replace(/^[\t ]*/, ws => ws.slice(cut))).join("\n");
}

export default source;

/**
 * source(fn) — a function's body as readable source text. `() => { body }` and
 * `function(){ body }` give up their braces; a concise arrow keeps its expression.
 *
 * Design record: util/source/readme.md.
 */
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

// ⚠ The first `=>` at depth ZERO, skipping quotes. A plain `indexOf("=>")` sliced
// an ordinary function at an arrow inside it and printed a fragment — silently,
// because a fragment renders as perfectly good code that isn't what you wrote.
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

/* Hold a member's function WITHOUT calling it. The subject is whatever owns it —
 * a class (prototype first, then statics), a function with properties (`md.file`),
 * or a plain namespace object.
 *
 * ⚠ A descriptor, because `subject.prototype[name]` EXECUTES a getter.
 * ⚠ Guard `subject.prototype`: a plain object has none, and
 *   `getOwnPropertyDescriptor(undefined, name)` throws.
 * ⚠ Stringify with `dedent(String(fn))`, never `source(fn)` — source() strips
 *   everything before the first `{`, which throws away a method's signature.
 */
export function member(subject, name){
	const own = (subject.prototype && Object.getOwnPropertyDescriptor(subject.prototype, name))
	         ?? Object.getOwnPropertyDescriptor(subject, name);

	const fn = own && (own.value ?? own.get ?? own.set);

	return typeof fn === "function" ? fn : null;
}

// Has an ext replaced this member? JS infers a function's name from assignment to
// an identifier, never to a member expression, so a patch's `.name` is "".
export function patched(fn, name){ return fn.name !== name; }

export function dedent(src){
	// ⚠ Normalise CRLF first: fn.toString() hands back the file's line endings,
	// while the same text through innerHTML comes back "\n".
	const lines = src.replace(/\r\n?/g, "\n").replace(/^\n+/, "").replace(/\s+$/, "").split("\n");

	// ⚠ The first line is only evidence if it BEGINS a line. `String(fn)` for a
	// shorthand method starts at the name, so its indent stayed in the file, it
	// measures zero, and zero pinned the common indent at zero for every line.
	const evidence = /^[\t ]/.test(lines[0]) ? lines : lines.slice(1);
	const indents = evidence.filter(line => line.trim()).map(line => line.match(/^[\t ]*/)[0].length);
	const cut = indents.length ? Math.min(...indents) : 0;

	// strip WHITESPACE only, so a line shallower than the cut keeps all its code
	return lines.map(line => line.replace(/^[\t ]*/, ws => ws.slice(cut))).join("\n");
}

export default source;

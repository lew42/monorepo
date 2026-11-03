import { BLOCKS, WIDTHS } from "./gen.js";

/**
 * THE SPEC IS THE STATE — the text format, and the only thing that may edit it.
 *
 *     <block> [width] [key=value …]        indentation is nesting
 *
 *     wall large cols=3
 *       list gap=0
 *         prose
 *
 * Every control on the page is a call to `edit()`: a chip changes one node's word
 * and hands back the WHOLE spec, which the generator re-lands through the typed-spec
 * machinery it already had. So a switched tree is a link — `#s=<encoded>` — and a
 * reload rebuilds exactly what you were looking at. Nothing anywhere writes a class
 * onto a live column and hopes it survives the next regrow.
 *
 * ⚠ `gen()` NEVER writes a `key=value`, and this file never touches a seed. A control
 *   edits text; the seed only ever drew the first draft. That is the whole reason the
 *   reproducibility proof stays green while the page is fully editable.
 */

/* Indentation is nesting. The same eight lines as space's `spec.js` — copied rather
   than imported, because that module reaches for space's own `site` parts.
   ⚠ Comments and blank lines are dropped here and never come back: `serialize()`
     rebuilds from the tree, so the first switch normalises a hand-typed spec. */
export function parse(text){
	const top = { kids: [], depth: -1 };
	const stack = [top];

	for (const raw of text.split("\n")){
		if (!raw.trim() || raw.trimStart().startsWith("#")) continue;

		const node = { line: raw.trim(), kids: [], depth: raw.search(/\S/) };

		while (stack.at(-1).depth >= node.depth) stack.pop();
		stack.at(-1).kids.push(node);
		stack.push(node);
	}

	return top.kids;
}

/* ONE LINE, taken apart. An unknown first word is `prose` — the leaf — so a typo
   renders a page rather than nothing. A token with an `=` is a setting; a bare token
   is a width word if it is one, and ignored if it is not. */
export function read(line){
	const [word, ...rest] = line.trim().split(/\s+/);
	const opt = {};
	let width = "";

	for (const token of rest){
		const [key, value] = token.split("=");

		if (value !== undefined) opt[key] = value;
		else if (WIDTHS.includes(token)) width = token;
	}

	return { block: BLOCKS.includes(word) ? word : "prose", width, opt };
}

/* …and back. An empty value DROPS its token, so "default width" and "no setting"
   are written the same way a spec with none of them is — there is one text per tree. */
export function write({ block, width, opt = {} }){
	const set = Object.keys(opt).sort().filter(key => opt[key] !== "" && opt[key] != null);

	return [block, width, ...set.map(key => key + "=" + opt[key])].filter(Boolean).join(" ");
}

/**
 * EDIT ONE NODE, named by its INDEX PATH, and get the whole spec back.
 *
 * Indices, never names: a generated page is named after its block word, so switching
 * `list` to `tabs` renames it — a name path would point at a page that no longer
 * exists the moment the switch lands. A position never moves.
 */
export function edit(text, at, change){
	const roots = parse(text);
	let node = { kids: roots };

	for (const i of at) if (!(node = node.kids[i])) return text;

	const line = read(node.line);
	node.line = write({ ...line, ...change, opt: { ...line.opt, ...change.opt } });

	return serialize(roots);
}

// Two spaces per level, always — the indent `gen()` writes and `parse()` reads back.
export function serialize(list, depth = 0){
	const out = [];

	for (const node of list){
		out.push("  ".repeat(depth) + node.line);
		if (node.kids.length) out.push(serialize(node.kids, depth + 1));
	}

	return out.join("\n");
}

export default edit;

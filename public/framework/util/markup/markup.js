/**
 * markup(el) — an element's children as readable HTML source.
 *
 *   markup(view.el)   ->   <div class="card">
 *                            <h3>Title</h3>
 *                            <p>Body</p>
 *                          </div>
 *
 * `el.innerHTML` is the same information and unreadable: one line, no indent, and
 * every whitespace text node the builder happened to leave behind. This is for a
 * reader — a doc page showing what a `div.c("card", …)` call actually produced.
 *
 * It reads the live DOM, so it reports what IS there rather than what was meant.
 * That is the whole value: a demo's HTML pane cannot drift from the demo.
 *
 * Design record: framework/util/markup/readme.md.
 */

// Elements that sit in a line of text. Their content stays on one line.
const phrasing = new Set(["A", "ABBR", "B", "BR", "BUTTON", "CITE", "CODE", "DATA", "DEL", "DFN", "EM", "I", "IMG", "INPUT", "INS", "KBD", "LABEL", "MARK", "METER", "PROGRESS", "Q", "S", "SAMP", "SELECT", "SMALL", "SPAN", "STRONG", "SUB", "SUP", "TEXTAREA", "TIME", "U", "VAR"]);

const voids = new Set(["AREA", "BASE", "BR", "COL", "EMBED", "HR", "IMG", "INPUT", "LINK", "META", "SOURCE", "TRACK", "WBR"]);

// Whitespace is content here, so these are copied verbatim — re-indenting a <pre>
// changes what it renders.
const verbatim = new Set(["PRE", "TEXTAREA", "SCRIPT", "STYLE"]);

// How long a one-line element may be before it gets broken up
const inline_max = 68;

export function markup(el, indent = ""){
	return [...el.childNodes]
		.map(node => node_markup(node, indent))
		.filter(line => line !== "")
		.join("\n");
}

function node_markup(node, indent){
	if (node.nodeType === Node.TEXT_NODE){
		const text = node.textContent.replace(/\s+/g, " ").trim();
		return text ? indent + text : "";
	}

	if (node.nodeType !== Node.ELEMENT_NODE)
		return "";

	const tag = node.tagName.toLowerCase();
	const open = `<${tag}${attributes(node)}>`;

	if (voids.has(node.tagName))
		return indent + open;

	if (verbatim.has(node.tagName))
		return `${indent}${open}${node.innerHTML}</${tag}>`;

	if (!node.hasChildNodes())
		return `${indent}${open}</${tag}>`;

	const flat = one_line(node);

	if (flat !== null && open.length + flat.length + tag.length + 3 <= inline_max)
		return `${indent}${open}${flat}</${tag}>`;

	return `${indent}${open}\n${markup(node, indent + "  ")}\n${indent}</${tag}>`;
}

/* The one-line form, or null if this element has to be broken up. Null rather
 * than a length test on innerHTML: a short `<div><p>a</p></div>` is short and
 * still wants two lines, because a block child is a new line to a reader. */
function one_line(node){
	let out = "";

	for (const child of node.childNodes){
		if (child.nodeType === Node.TEXT_NODE){
			out += child.textContent.replace(/\s+/g, " ");
			continue;
		}

		if (child.nodeType !== Node.ELEMENT_NODE)
			continue;

		if (!phrasing.has(child.tagName) || verbatim.has(child.tagName))
			return null;

		const inner = one_line(child);

		if (inner === null)
			return null;

		const tag = child.tagName.toLowerCase();

		out += voids.has(child.tagName)
			? `<${tag}${attributes(child)}>`
			: `<${tag}${attributes(child)}>${inner}</${tag}>`;
	}

	return out.trim();
}

/* Attributes in document order, which for a View is the order the chain wrote
 * them — so `div.c("card").attr("role", "note")` reads back the way it was
 * typed. A valueless attribute stays valueless.
 *
 * Nothing is escaped anywhere in this file: the result is TEXT, and every way it
 * reaches the screen escapes it once already — `code.html()` hands it to
 * hljs.highlight(), and a plain `code()` appends it as a text node. Escaping here
 * too is how you get `&amp;lt;div&amp;gt;` on the page. */
function attributes(node){
	return [...node.attributes]
		.map(attr => attr.value === "" ? ` ${attr.name}` : ` ${attr.name}="${attr.value}"`)
		.join("");
}

export default markup;

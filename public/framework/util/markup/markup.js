/**
 * markup(el) — an element's children as readable HTML source.
 *
 *   markup(view.el)   ->   <div class="card">
 *                          	<h3>Title</h3>
 *                          	<p>Body</p>
 *                          </div>
 *
 * One real tab per level, so how wide a level reads is `tab-size` at the other
 * end — 2 in a demo's html pane, 4 in a `pre.code-block`.
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

// The reading column: how long a line may get before it wraps, and the width
// wrapped lines are filled to.
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

	// A run of phrasing content never breaks STRUCTURALLY, however long — it wraps,
	// the way the text it is wraps. One chunk per line turned a sentence into a
	// column of fragments, which is the one thing this file exists to prevent.
	if (flat !== null){
		const line = `${open}${flat}</${tag}>`;
		return line.length <= inline_max ? indent + line : wrap(line, indent);
	}

	return `${indent}${open}\n${markup(node, indent + "\t")}\n${indent}</${tag}>`;
}

/* Fill to `inline_max`, breaking only at spaces OUTSIDE a tag — the one in
 * `class="a b"` is not a break point. Every break replaces a space that was already
 * there, so the wrapped form and the one-liner render identically; that is what
 * makes wrapping safe here and re-indenting a `<pre>` not. */
function wrap(line, indent){
	const words = [];
	let word = "";
	let in_tag = false;

	for (const ch of line){
		if (ch === "<") in_tag = true;
		else if (ch === ">") in_tag = false;
		else if (ch === " " && !in_tag){
			if (word) words.push(word);
			word = "";
			continue;
		}

		word += ch;
	}

	if (word) words.push(word);

	// Continuations indent, so a wrapped sentence can't be misread as siblings.
	// The budget is the CONTENT, not the content plus its indent — same as the
	// one-line test above, and a tab is a `tab-size` wide, not a character wide.
	const out = [];
	let pad = indent;
	let line_out = "";

	for (const w of words){
		if (line_out && (line_out + " " + w).length > inline_max){
			out.push(pad + line_out);
			pad = indent + "\t";
			line_out = w;
		}
		else line_out = line_out ? `${line_out} ${w}` : w;
	}

	out.push(pad + line_out);

	return out.join("\n");
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

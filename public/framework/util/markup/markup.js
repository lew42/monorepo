/**
 * markup(el) — an element's children as readable HTML source. It reads the LIVE DOM,
 * so a demo's html pane cannot drift from the demo.
 *
 * One real tab per level, so how wide a level reads is `tab-size` at the other end.
 * Design record: framework/util/markup/readme.md.
 */

// Elements that sit in a line of text. Their content stays on one line.
const phrasing = new Set(["A", "ABBR", "B", "BR", "BUTTON", "CITE", "CODE", "DATA", "DEL", "DFN", "EM", "I", "IMG", "INPUT", "INS", "KBD", "LABEL", "MARK", "METER", "PROGRESS", "Q", "S", "SAMP", "SELECT", "SMALL", "SPAN", "STRONG", "SUB", "SUP", "TEXTAREA", "TIME", "U", "VAR"]);

const voids = new Set(["AREA", "BASE", "BR", "COL", "EMBED", "HR", "IMG", "INPUT", "LINK", "META", "SOURCE", "TRACK", "WBR"]);

// ⚠ Whitespace is content in these, so they are copied verbatim — re-indenting a
// <pre> changes what it renders.
const verbatim = new Set(["PRE", "TEXTAREA", "SCRIPT", "STYLE"]);

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
	// the way the text it is wraps.
	if (flat !== null){
		const line = `${open}${flat}</${tag}>`;
		return line.length <= inline_max ? indent + line : wrap(line, indent);
	}

	return `${indent}${open}\n${markup(node, indent + "\t")}\n${indent}</${tag}>`;
}

/* ⚠ Breaks only at spaces OUTSIDE a tag — the one in `class="a b"` is not a break
 * point. Every break replaces a space that was already there, which is what makes
 * wrapping safe here and re-indenting a `<pre>` not. */
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

	// Continuations indent, so a wrapped sentence can't be misread as siblings. The
	// budget is the CONTENT, not content plus indent — a tab is `tab-size` wide.
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

// The one-line form, or null if this element has to be broken up — not a length
// test: a short `<div><p>a</p></div>` still wants two lines.
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

/* ⚠ Nothing is escaped anywhere in this file. The result is TEXT, and every route to
 * the screen escapes it once already — `code.html()` through hljs, a plain `code()`
 * as a text node. Escaping here too is how you get `&amp;lt;div&amp;gt;` on the page. */
function attributes(node){
	return [...node.attributes]
		.map(attr => attr.value === "" ? ` ${attr.name}` : ` ${attr.name}="${attr.value}"`)
		.join("");
}

export default markup;

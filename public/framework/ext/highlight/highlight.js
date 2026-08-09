import View, { code, pre } from "../../core/View/View.js";
import { source } from "../../util/source/source.js";
import hljs from "./hljs/core.min.js";
import javascript from "./hljs/languages/javascript.min.js";
import css from "./hljs/languages/css.min.js";
import xml from "./hljs/languages/xml.min.js";
import markdown from "./hljs/languages/markdown.min.js";
import json from "./hljs/languages/json.min.js";

View.stylesheet(import.meta, "highlight.css");

/**
 * highlight — syntax highlighting bolted onto the `code` element factory.
 *
 *   code.js("const x = 1")            // highlighted javascript
 *   code.fn(() => { … })              // a FUNCTION, stringified — never called
 *   code.html("<b>hi</b>")            // also .css, .md, .json
 *   code.lang("json", src)            // the general form
 *   code.file(import.meta, "x.js")    // a promise of a highlighted block
 *
 * Design record: ext/highlight/readme.md.
 */
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("json", json);

/* ⚠ Written out, never generated from hljs.listLanguages(): hljs ships a language
   called **c**, which would silently overwrite `code.c()` — the classes variant
   every page uses. Adding a language is two lines. */
const accessors = {
	js: "javascript",
	javascript: "javascript",
	html: "xml",
	xml: "xml",
	css: "css",
	md: "markdown",
	markdown: "markdown",
	json: "json",
};

// Mirrors ext/markdown's block_tags on purpose — same question, and they must not
// disagree about <li>. Copied, not imported: neither ext depends on the other.
const block_parents = new Set(["DIV", "SECTION", "ARTICLE", "MAIN", "ASIDE", "HEADER", "FOOTER", "BLOCKQUOTE", "BODY", "FIGURE", "DETAILS", "TD"]);

/**
 * ⚠ Three cases, not two. "pre" and "inline" both skip the wrapper, but an inline
 * <code> carries `white-space: nowrap`, which inside a <pre> collapses a multi-line
 * block onto one line.
 */
function context(){
	const captor = View.captor;

	if (!captor)
		return "block";

	const tag = captor.el.tagName;

	if (tag === "PRE")
		return "pre";

	return block_parents.has(tag) ? "block" : "inline";
}

// ⚠ The UN-patched setter, captured before the patch at the bottom of this file:
// our own output is already highlighted, and re-entering would re-scan it.
const set_html = View.prototype.html_unsafe;

// An unregistered language degrades to escaped plain text rather than throwing.
function render(view, lang, src){
	if (!hljs.getLanguage(lang))
		return view.ac("hljs").text(src);

	// ⚠ ignoreIllegals: a doc snippet is usually a fragment, and without it
	// highlight() throws on the first construct the grammar can't place.
	const { value } = hljs.highlight(src, { language: lang, ignoreIllegals: true });

	view.ac("hljs").ac(`language-${lang}`);
	set_html.call(view, value);

	return view;
}

// The general form. Returns the <pre> in block context and the <code> inline.
code.lang = function(name, src){
	switch (context()){
		case "pre":    return render(code(), name, src);
		case "inline": return render(code.c("code-inline"), name, src);
		default:       return pre.c("code-block", () => render(code(), name, src));
	}
};

/**
 * Guess from the captor, correct at append: arguments are evaluated before the
 * factory that receives them, so `p("x ", code.js("y"))` sees the grandparent.
 *
 * ⚠ SHARP EDGE: the correction DISCARDS the <pre>, so anything chained in ARGUMENT
 * position inside a phrasing parent is silently lost — classes, attributes and
 * `.on()` handlers, giving a dead listener with nothing in the console.
 *
 *   p("Call ", code.js("x").ac("wide"), "!")   // .wide and any handler are GONE
 *   p.c("wide", "Call ", code.js("x"), "!")    // ✓ class on the sentence
 *   p(() => code.js("x").ac("wide"))           // ✓ capture form, correct by construction
 */
const append = View.prototype.append;

View.prototype.append = function(...args){
	const tag = this.el.tagName;

	if (tag !== "PRE" && !block_parents.has(tag))
		args = args.map(inline_if_block);

	return append.call(this, ...args);
};

function inline_if_block(arg){
	if (!arg?.el?.classList?.contains("code-block"))
		return arg;

	const inner = arg.el.firstElementChild;

	if (!inner)
		return arg;

	arg.el.remove(); // the <pre> already captured into an ancestor — drop it
	inner.classList.add("code-inline");

	return inner; // a raw node; View.append hands it to el.append()
}

// A function rendered as its own body. It NEVER calls it — the difference from
// demo(), which stringifies and runs.
code.fn = function(fn){
	return code.lang("javascript", source(fn));
};

for (const [name, language] of Object.entries(accessors)){
	if (Object.hasOwn(code, name)){
		console.warn(`ext/highlight: code.${name} is already taken, skipping`);
		continue;
	}

	code[name] = src => code.lang(language, src);
}

/**
 * code.file(import.meta, "example.js") — same signature and promise contract as
 * md.file(). Language inferred from the extension unless given; always a block.
 *
 * ⚠ `capture: false`, like md.file — nothing to place until it resolves, so the
 * promise has to be returned or appended.
 */
code.file = async function(meta, url, lang){
	const href = new URL(url, meta.url).href;

	const view = new View({ tag: "pre", capture: false }).ac("code-block");
	const target = new View({ tag: "code", capture: false }).append_to(view);

	try {
		const text = await (code.cache[href] ??= fetch(href).then(resp => {
			if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
			return resp.text();
		}));

		render(target, lang ?? code.ext(url), text.replace(/\s+$/, ""));

		return view;
	} catch (error) {
		delete code.cache[href]; // don't cache the failure
		return view.ac("code-error").text(`Error loading ${url}: ${error.message}`);
	}
};

// extension -> language. Unknown ones fall through and render() degrades them.
code.ext = function(url){
	const ext = url.split("?")[0].split(".").pop().toLowerCase();

	return { htm: "html", mjs: "js", cjs: "js" }[ext] ?? ext;
};

// url -> Promise<string>. Populated by code.file.
code.cache = {};

/**
 * Highlight every markdown code fence already in a subtree.
 *
 * ⚠ The `.hljs` skip is not an optimisation detail: every View that ADOPTS an element
 * re-scans its whole subtree (see the prerender patch below), so a container holding
 * N highlighted blocks re-highlighted all N on every adoption.
 */
export function highlight(root){
	for (const el of root.querySelectorAll("pre > code[class*='language-']")){
		if (el.classList.contains("hljs"))
			continue;

		const lang = el.className.match(/language-([\w+#-]+)/)?.[1];

		if (lang && hljs.getLanguage(lang))
			render(new View({ el, capture: false }), lang, el.textContent);
	}

	return root;
}

/**
 * Hook 1 of 2: markup WRITTEN through a View.
 *
 * ⚠ Synchronous, which is why this is a patch and not a post-pass: the browser cannot
 * paint between a script setting innerHTML and that script returning. A rAF sweep, a
 * MutationObserver or an on-ready pass all run in a LATER task and flash plain code.
 */
View.prototype.html_unsafe = function(value){
	const result = set_html.call(this, value);

	// on set it returns `this`; on get, the html string
	if (result === this)
		highlight(this.el);

	return result;
};

/**
 * Hook 2 of 2: markup a View ADOPTS, which never passes through html_unsafe at all —
 * md()'s single-root-block branch builds off a `<template>` and adopts the element.
 *
 * `this.el` is truthy on entry only when the caller supplied an element, because
 * prerender is what creates it otherwise — so div()/p()/el() test one falsy property.
 */
const prerender = View.prototype.prerender;

View.prototype.prerender = function(){
	const adopted = !!this.el;

	prerender.call(this);

	// ⚠ firstElementChild, not children.length: a <code> holding only text cannot
	// contain a fence, and that is the node highlight() itself builds — this is
	// what keeps it from re-entering.
	if (adopted && this.el.firstElementChild)
		highlight(this.el);
};

export default code;
export { code, hljs };

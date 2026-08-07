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
 * Importing this module enhances core's `code()` in place. `code()` and
 * `code.c()` stay exactly what they were — elemental — and gain siblings:
 *
 *   code.js("const x = 1")            // highlighted javascript
 *   code.fn(() => { … })              // a FUNCTION, stringified — see below
 *   code.html("<b>hi</b>")            // also .css, .md, .json
 *   code.lang("json", src)            // the general form
 *   code.file(import.meta, "x.js")    // a promise of a highlighted block
 *
 * `code.fn` is the one that matters. A code example written as a string is dead
 * text in the editor — no highlighting, no completion, no formatting, no syntax
 * errors. Written as a function it is live code that happens to be rendered, so
 * the IDE checks it and the page shows exactly what the IDE checked.
 *
 * There is deliberately no View.prototype method here. `.md()` earns one
 * because prose gets *set into* an existing view constantly; code doesn't —
 * you're always making a new element, which is what a factory is for.
 */

/* highlight.js and not Shiki or Prism because it is the only mature one that vendors
   as a straight file copy — each file in hljs/ is standalone ESM, zero imports, no
   wasm. See readme. */
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("json", json);

/* Written out rather than generated from hljs.listLanguages(), which would mint a
   dozen aliases nobody types and — the real hazard — hljs ships a language called
   **c**, silently overwriting `code.c()`, the classes variant every page uses.
   Adding a language is two lines: one registerLanguage above, one entry here. */
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

/* Tags that can hold a <pre>. Mirrors ext/markdown's block_tags deliberately:
   the two exts answer the same question ("am I in a block context?") and would
   be confusing if they disagreed about <li>. Copied, not imported — neither ext
   depends on the other. */
const block_parents = new Set(["DIV", "SECTION", "ARTICLE", "MAIN", "ASIDE", "HEADER", "FOOTER", "BLOCKQUOTE", "BODY", "FIGURE", "DETAILS", "TD"]);

/**
 * Block-aware, because the content can never tell you and the context always can.
 * `"app.method()"` is the same string in every position:
 *
 *   p("Call ", code.js("app.method()"))   -> "inline": a bare <code> in the line
 *   code.js("app.method()")               -> "block":  its own <pre>
 *   pre(() => code.js(src))               -> "pre":    fill the block that exists
 *
 * Three cases, not two, and the distinction is load-bearing: "pre" and "inline" both
 * skip the wrapper, but an inline <code> carries `white-space: nowrap`, which inside
 * a <pre> would collapse a multi-line block onto one line.
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

/* The un-patched html setter, captured before the patch at the bottom: our own output
   is already highlighted, so routing it back through the patched version would
   re-scan a subtree we just built. `html_unsafe` and not `html()` for the reason
   md.js gives — the Sanitizer API doesn't exist in Safari. */
const set_html = View.prototype.html_unsafe;

// text in, highlighted markup into `view`. An unregistered language degrades to
// escaped plain text rather than throwing — a `bash` fence renders uncoloured.
function render(view, lang, src){
	if (!hljs.getLanguage(lang))
		return view.ac("hljs").text(src);

	// ignoreIllegals: a doc snippet is usually a fragment, not a valid program, and
	// without it highlight() throws on the first construct the grammar can't place.
	const { value } = hljs.highlight(src, { language: lang, ignoreIllegals: true });

	view.ac("hljs").ac(`language-${lang}`);
	set_html.call(view, value);

	return view;
}

/**
 * code.lang(name, src) — the general form, and what every accessor calls.
 *
 * Returns the <pre> in block context (so you can chain classes onto the block)
 * and the <code> inline. Either way it captures itself like any factory.
 */
code.lang = function(name, src){
	switch (context()){
		case "pre":    return render(code(), name, src);
		case "inline": return render(code.c("code-inline"), name, src);
		default:       return pre.c("code-block", () => render(code(), name, src));
	}
};

/**
 * Guess from the captor, correct at append.
 *
 * Arguments are evaluated before the factory that receives them, so in
 * `p("Call ", code.js("x"), "!")` the captor is still the *grandparent* — usually a
 * div, so context() guesses "block" and builds a <pre> about to be dropped into a
 * sentence. The guess is corrected where the real parent is finally known.
 *
 * ⚠ **SHARP EDGE:** the correction discards that <pre>, so anything chained in
 * ARGUMENT position inside a phrasing parent is silently lost — classes, attributes
 * **and `.on()` handlers**, giving you a dead listener with nothing in the console:
 *
 *   p("Call ", code.js("x").ac("wide"), "!")   // .wide and any handler are GONE
 *   p.c("wide", "Call ", code.js("x"), "!")    // ✓ class on the sentence
 *   p(() => code.js("x").ac("wide"))           // ✓ capture form, correct by construction
 *
 * Why correction rather than always building bare and wrapping at append, and why
 * listeners cannot be carried over: ext/highlight/readme.md §"SHARP EDGE".
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

/* code.fn(() => { … }) — a function, rendered as its own body. It NEVER calls the
   function; that is the whole difference from demo(), which stringifies and runs.
   Here the function is purely a way to write code the IDE can check. */
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
 * code.file(import.meta, "example.js") — fetch a real file and highlight it.
 *
 * Same (meta, url) signature and promise contract as md.file(): resolved against the
 * module's url, returns a promise so View.append_promise can place it. Language is
 * inferred from the extension unless given; text is cached per url. Always a block —
 * a file is not something you drop into a sentence.
 */
code.file = async function(meta, url, lang){
	const href = new URL(url, meta.url).href;

	// capture: false, like md.file — there is nothing to place until it
	// resolves, so the promise has to be returned or appended
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

// extension -> registered language name. Unknown extensions fall through to the
// bare extension, which render() degrades to plain text anyway.
code.ext = function(url){
	const ext = url.split("?")[0].split(".").pop().toLowerCase();

	return { htm: "html", mjs: "js", cjs: "js" }[ext] ?? ext;
};

// url -> Promise<string>. Populated by code.file.
code.cache = {};

/**
 * highlight(root) — highlight every markdown code fence already in a subtree.
 * marked emits `<pre><code class="language-js">`, which is what this looks for.
 *
 * The `.hljs` skip is not an optimization detail: every View that ADOPTS an element
 * re-scans its whole subtree (see the prerender patch), so a container holding N
 * highlighted blocks paid to highlight all N again on every adoption. Measured.
 * Idempotent is not the same as free.
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
 * Hook 1 of 2: markup WRITTEN through a View — `.md()`, `md.file()`, and md()'s
 * multi-block branch.
 *
 * Synchronous, which is the whole reason this is a patch and not a post-pass: the
 * browser cannot paint between a script setting innerHTML and that script returning,
 * so there is no frame in which un-highlighted code is on screen. A
 * requestAnimationFrame sweep, a MutationObserver, or an on-ready pass all run in a
 * LATER task and each flashes plain code for one frame.
 *
 * No coupling either way — this file never imports ext/markdown, it just recognizes
 * the class name marked emits.
 */
View.prototype.html_unsafe = function(value){
	const result = set_html.call(this, value);

	// on set html_unsafe returns `this`; on get it returns the html string
	if (result === this)
		highlight(this.el);

	return result;
};

/**
 * Hook 2 of 2: markup a View ADOPTS, which never passes through html_unsafe at all.
 *
 * md()'s single-root-block branch builds its DOM off a `<template>` and adopts the
 * element, so md("```js…```") produces a fully-built <pre> View never wrote a byte
 * of. Found by test, not by reading — which is the argument for hooking both doors.
 *
 * The guard is exact and free: `this.el` is only truthy on entry when the caller
 * supplied an element, because prerender is what creates it otherwise. So
 * div()/p()/el() — thousands of calls — test one falsy property and skip.
 */
const prerender = View.prototype.prerender;

View.prototype.prerender = function(){
	const adopted = !!this.el;

	prerender.call(this);

	// firstElementChild, not children.length: a <code> holding only text can't
	// contain a fence, and that's the node highlight() itself constructs —
	// this is the check that keeps it from re-entering.
	if (adopted && this.el.firstElementChild)
		highlight(this.el);
};

export default code;
export { code, hljs };

import View, { pre, code } from "../../core/View/View.js";
import hljs from "./hljs/core.min.js";
import javascript from "./hljs/languages/javascript.min.js";
import css from "./hljs/languages/css.min.js";
import xml from "./hljs/languages/xml.min.js";
import markdown from "./hljs/languages/markdown.min.js";
import json from "./hljs/languages/json.min.js";

View.stylesheet(import.meta, "syntax.css");

/**
 * syntax — syntax highlighting as a View addon, not a class.
 *
 * Importing this module patches View.prototype.syntax(). Same shape as
 * ext/markdown: opt-in by import, free to extend core, and nothing in core
 * imports it back.
 *
 *   p().syntax("js", "const x = 1");     // into an existing view
 *   syntax("js", "const x = 1");         // a <pre class="syntax"><code>
 *   syntax.inline("js", "const x = 1");  // a bare <code>, no <pre>
 *   syntax.c("wide", "js", src);         // classes first, like div.c()
 *   syntax.file(import.meta, "x.js");    // a promise of a highlighted block
 *
 * Not `code("js", src)`: `code` is a View.elements() factory whose args all get
 * appended, so code("js", src) already means "append both strings". Overloading
 * on arity would change what existing calls do and read like a puzzle. `syntax`
 * is a new word for a new thing, and it rhymes with md().
 */

/**
 * Why highlight.js and not Shiki (better output) or Prism (more languages):
 * it's the only mature one that vendors as a straight file copy. Each file in
 * hljs/ is standalone ESM — zero imports, no wasm, no sourcemap — so `ext/`'s
 * "vendor it, no CDN at runtime" rule costs one download per language. Shiki's
 * dependency graph needs a bundler; Prism v1 is still global-based. See readme.
 */
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("json", json);

// Each definition carries its own aliases, so registering these five also buys
// js/jsx/mjs/cjs, html/svg/xhtml/rss, and md/mkdown. Adding a language is one
// file in hljs/languages/ plus one line above.

/* The un-patched setter, captured before the patch below. Everything in here
   sets html this way: our own output is already highlighted, so routing it
   back through the patched version would re-scan a subtree we just built. */
const set_html = View.prototype.html_unsafe;

/* html_unsafe and not html(): the Sanitizer API that html() uses doesn't exist
   in Safari, where it falls back to textContent — highlighted code would render
   as literal <span> markup. Same trade md.js documents at length: this is our
   own source text, tokenized by a library, never user input. */

/**
 * The one primitive: text in, highlighted markup out, into `this`.
 *
 * An unregistered language is not an error — it degrades to escaped plain text
 * via .text(), so a `bash` fence in a readme renders correctly-but-uncolored
 * instead of throwing or (worse) injecting unescaped markup.
 */
View.prototype.syntax = function(lang, src){
	if (!hljs.getLanguage(lang))
		return this.ac("hljs").text(src);

	// ignoreIllegals: a doc snippet is usually a fragment, not a valid program.
	// Without it, highlight() throws on the first construct the grammar can't
	// place — an example ending mid-expression would take the page down.
	const { value } = hljs.highlight(src, { language: lang, ignoreIllegals: true });

	this.ac("hljs").ac(`language-${lang}`);
	set_html.call(this, value);

	return this;
};

// syntax("js", src) — the block form, <pre> included, captured & chainable
export default function syntax(lang, src){
	return pre.c("syntax", () => code().syntax(lang, src));
}

// syntax.inline("js", src) — a bare <code> for prose. No <pre>, so it sits in a
// sentence without breaking the line box.
syntax.inline = function(lang, src){
	return code.c("syntax-inline").syntax(lang, src);
};

// syntax.c("wide", "js", src) — classes first, like div.c() / md.c()
syntax.c = function(classes, lang, src){
	return syntax(lang, src).ac(classes);
};

/**
 * syntax.dom(root) — highlight every markdown code fence already in a subtree.
 *
 * marked emits <pre><code class="language-js">, which is exactly what this
 * looks for. Synchronous, so it can't FOUC — see the html_unsafe patch below.
 *
 * The .hljs skip is what keeps it from being quadratic-ish. Re-running on an
 * already-highlighted node is *correct* — hljs spans don't change textContent,
 * so it re-tokenizes the same source to the same markup — but it is pure waste,
 * and it happens more than you'd guess: every View that adopts an element
 * re-scans that whole subtree (see the prerender patch), so a container holding
 * N highlighted blocks paid to highlight all N again on every adoption.
 * Measured, not assumed. View.prototype.syntax always sets .hljs, so that class
 * is an exact "already processed" marker for both this pass and syntax() views.
 */
syntax.dom = function(root){
	for (const el of root.querySelectorAll("pre > code[class*='language-']")){
		if (el.classList.contains("hljs"))
			continue;

		const lang = el.className.match(/language-([\w+#-]+)/)?.[1];

		if (lang && hljs.getLanguage(lang))
			new View({ el, capture: false }).syntax(lang, el.textContent);
	}

	return root;
};

/**
 * Every fenced code block in every markdown file on the site, highlighted —
 * with no FOUC, and with no dependency on ext/markdown.
 *
 * This is the first of TWO hooks. It catches markup written through a View:
 * View.prototype.md, md.file(), and the multi-block branch of md(). It does NOT
 * catch a View that ADOPTS already-built markup — that's the prerender patch
 * below, and the reason there are two of these.
 *
 * The timing argument, because it's the whole reason this is a patch and not a
 * post-pass: hljs.highlight() is synchronous, and the language modules are
 * static imports at the top of this file — so the fence pass runs inside the
 * same synchronous turn as the innerHTML assignment. The browser cannot paint
 * between a script setting innerHTML and that script returning, so there is no
 * frame in which un-highlighted code is on screen. Attached or detached, it
 * cannot flash.
 *
 * That property is what rules out the obvious alternatives: a requestAnimation-
 * Frame sweep, a MutationObserver, or an "highlight the document on ready" pass
 * all run in a LATER task, and each one flashes plain code for one frame.
 *
 * And the coupling is zero in both directions: this file never imports
 * ext/markdown, it just recognizes the class name marked happens to emit. If
 * markdown was never imported, the query matches nothing and costs one
 * querySelectorAll per html_unsafe call. Two exts, no coupling, better
 * together — the same deal ext/demo makes with md().
 */
View.prototype.html_unsafe = function(value){
	const result = set_html.call(this, value);

	// on set html_unsafe returns `this`; on get it returns the html string
	if (result === this)
		syntax.dom(this.el);

	return result;
};

/**
 * The second door: markup that never passed through html_unsafe at all.
 *
 * md() has two exits. Multiple blocks get .html_unsafe(html) — covered above.
 * A SINGLE root block is adopted straight off the parse template
 * (`new View({ el: template.content.firstElementChild })`), so md("```js…```")
 * produces a fully-built <pre> that View never wrote a byte of. Found by test,
 * not by reading — which is the argument for hooking both doors rather than
 * trusting one.
 *
 * prerender() is where "a View now exists" is true for every construction path.
 * The guard is exact and free: this.el is only truthy on entry when the caller
 * supplied an element, because prerender is what creates it otherwise. So
 * div()/p()/el() — the hot path, thousands of calls — test one falsy property
 * and skip. Only adoption pays for a querySelectorAll.
 *
 * Still synchronous, still at construction time, so still no frame in which
 * un-highlighted code is on screen.
 */
const prerender = View.prototype.prerender;

View.prototype.prerender = function(){
	const adopted = !!this.el;

	prerender.call(this);

	// firstElementChild, not children.length: a <code> holding only text can't
	// contain a fence, and that's the node syntax.dom() itself constructs —
	// this is the check that keeps it from re-entering.
	if (adopted && this.el.firstElementChild)
		syntax.dom(this.el);
};

/**
 * syntax.file(import.meta, "editor.js") — fetch a source file and highlight it.
 *
 * Same (meta, url) signature and same promise contract as md.file(): resolved
 * against the module's url (the SPA fallback makes the document url a route),
 * returns a promise so View.append_promise can place it and App.load_page can
 * await it before swapping. Language is inferred from the extension unless
 * given. Text is cached per url.
 *
 *   content(){ return syntax.file(import.meta, "example.js"); }
 */
syntax.file = async function(meta, url, lang){
	const href = new URL(url, meta.url).href;

	// capture: false, like md.file — there is nothing to place until it resolves,
	// so the promise has to be returned or appended (View.append_promise does it)
	const view = new View({ tag: "pre", capture: false }).ac("syntax");
	const target = new View({ tag: "code", capture: false }).append_to(view);

	try {
		const text = await (syntax.cache[href] ??= fetch(href).then(resp => {
			if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
			return resp.text();
		}));

		target.syntax(lang ?? syntax.lang(url), text.replace(/\s+$/, ""));

		return view;
	} catch (error) {
		delete syntax.cache[href]; // don't cache the failure
		return view.ac("syntax-error").text(`Error loading ${url}: ${error.message}`);
	}
};

// extension -> registered language name. Unknown extensions fall through to the
// bare extension, which View.prototype.syntax degrades to plain text anyway.
syntax.lang = function(url){
	const ext = url.split("?")[0].split(".").pop().toLowerCase();

	return { htm: "html", mjs: "js", cjs: "js" }[ext] ?? ext;
};

// url -> Promise<string>. Populated by syntax.file.
syntax.cache = {};

export { syntax, hljs };

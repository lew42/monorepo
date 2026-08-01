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

/**
 * The accessors, written out rather than generated from hljs.listLanguages().
 *
 * Generating them would also mint `code.wsf`, `code.xjb`, `code.mkd` and a
 * dozen other aliases nobody will type, and — the real hazard — hljs ships a
 * language called **c**, which would silently overwrite `code.c()`, the classes
 * variant every page already uses. An explicit map can't do that by accident.
 *
 * Adding a language is two lines: one registerLanguage above, one entry here.
 */
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
 * Block-aware, because the content can never tell you and the context always
 * can. `"app.method()"` is the same string in every position:
 *
 *   p("Call ", code.js("app.method()"))   -> "inline": a bare <code> in the line
 *   code.js("app.method()")               -> "block":  its own <pre>
 *   pre(() => code.js(src))               -> "pre":    fill the block that exists
 *
 * The captor is the view currently collecting children, so it IS the answer to
 * "where am I being placed".
 *
 * Three cases, not two — that distinction is load-bearing. "pre" and "inline"
 * both skip the wrapper, but an inline <code> carries `white-space: nowrap` so
 * a snippet can't wrap mid-sentence, and applying that inside a <pre> would
 * collapse a multi-line block onto one line. (That is exactly what demo()'s
 * source pane would have hit.)
 *
 * No captor at all — a standalone `const v = code.js(…)` — is block: nothing is
 * wrapping it, so it stands on its own.
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

/* The un-patched html setter, captured before the patch at the bottom. Our own
   output is already highlighted, so routing it back through the patched version
   would re-scan a subtree we just built. */
const set_html = View.prototype.html_unsafe;

/* html_unsafe and not html(): the Sanitizer API that html() uses doesn't exist
   in Safari, where it falls back to textContent — highlighted code would render
   as literal <span> markup. Same trade md.js documents at length: this is our
   own source text, tokenized by a library, never user input. */

/**
 * The one primitive: text in, highlighted markup into `view`.
 *
 * An unregistered language is not an error — it degrades to escaped plain text
 * via .text(), so a `bash` fence in a readme renders correctly-but-uncolored
 * instead of throwing or (worse) injecting unescaped markup.
 */
function render(view, lang, src){
	if (!hljs.getLanguage(lang))
		return view.ac("hljs").text(src);

	// ignoreIllegals: a doc snippet is usually a fragment, not a valid program.
	// Without it, highlight() throws on the first construct the grammar can't
	// place — an example ending mid-expression would take the page down.
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
 * Argument position — the half the captor cannot see.
 *
 *   p(() => { code.js("x") })      // captor IS the p. context() works.
 *   p("Call ", code.js("x"), "!")  // captor is whatever encloses p. It doesn't.
 *
 * Arguments are evaluated before `p()` is ever called, so in the second form
 * code.js() runs while the captor is still the *grandparent* — usually a div,
 * so it guesses "block" and builds a <pre> that is about to be dropped into a
 * sentence. Measured, not theorised: this was the one failing case.
 *
 * So the guess gets corrected where the real parent is finally known — append.
 * A <pre class="code-block"> landing in a phrasing element is unwrapped to its
 * <code>, which is what the caller meant. Nothing else is touched, and block
 * parents (the common container case) return before any of this runs.
 *
 * Correction rather than deferral is deliberate: code.lang() still returns a
 * real, finished element that the caller can chain on. The alternative — always
 * build bare <code> and wrap it at append — would break `code.js(src).ac("x")`
 * in block context, since the class would land on the wrong element.
 *
 * SHARP EDGE, and the reason to read the readme before using this: correction
 * moves the chaining problem, it doesn't remove it. Anything chained in
 * ARGUMENT position inside a phrasing parent is applied to the <pre> we are
 * about to discard, and is therefore silently lost:
 *
 *   p("Call ", code.js("x").ac("wide"), "!")     // .wide is gone
 *   p("Call ", code.js("x").on("click", f), "!") // handler never fires
 *
 * Listeners can't be moved (View.on() wraps the callback and keeps no
 * registry, so there is nothing to enumerate), and copying only classes would
 * silently drop block-intent styling onto an inline element. Both workarounds
 * are one character of effort — put the class on the paragraph with p.c(), or
 * use the capture form where the captor is already correct:
 *
 *   p.c("wide", "Call ", code.js("x"), "!")
 *   p(() => { code.js("x").ac("wide"); })
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

/**
 * code.fn(() => { … }) — a function, rendered as its own body.
 *
 * The wrapper and the common indent come off (util/source), so a body nested
 * three tabs deep in a page.js reads as top-level code. Always javascript,
 * because it demonstrably is one.
 *
 * Note what this does NOT do: it never calls the function. That's `demo()`'s
 * job. Here the function is purely a way to write code the IDE can check.
 */
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
 * Same (meta, url) signature and same promise contract as md.file(): resolved
 * against the module's url (the SPA fallback makes the document url a route),
 * returns a promise so View.append_promise can place it and App.load_page can
 * await it before swapping. Language is inferred from the extension unless
 * given. Text is cached per url.
 *
 *   content(){ return code.file(import.meta, "example.js"); }
 *
 * Always a block — a file is not something you drop into a sentence.
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
 * Measured, not assumed. render() always sets .hljs, so that class is an exact
 * "already processed" marker for both this pass and code.js() views.
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
		highlight(this.el);

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
	// contain a fence, and that's the node highlight() itself constructs —
	// this is the check that keeps it from re-entering.
	if (adopted && this.el.firstElementChild)
		highlight(this.el);
};

export default code;
export { code, hljs };

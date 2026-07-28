import View, { div, details, summary } from "../../core/View/View.js";
import { marked } from "./marked.esm.js";

View.stylesheet(import.meta, "md.css");

// Tags that can hold block-level children get the full marked.parse() (which
// wraps paragraphs in <p>). Everything else — p, h1, span, li — gets
// parseInline(), so p().md("**hi**") doesn't nest a <p> inside a <p>.
const block_tags = new Set(["DIV", "SECTION", "ARTICLE", "MAIN", "ASIDE", "HEADER", "FOOTER", "BLOCKQUOTE", "BODY", "FIGURE", "DETAILS", "TD"]);

/**
 * md — markdown as a View addon, not a class.
 *
 * Importing this module patches View.prototype.md(). That's what `ext/` is for:
 * opt-in modules that may extend core. Nothing in app.js imports it, so pages
 * that don't use markdown never load marked.
 *
 *   p().md("Some **inline** markdown");     // into an existing view
 *   md("Hi.").ac("note");                   // a real <p>, chainable
 *   md.c("note", "Hi.");                    // classes first, like div.c()
 *   md("# Title");                          // a real <h1>
 *   md("Multi\n\nblock");                   // a captured div.md
 *   md.file(import.meta, "readme.md");      // a promise of a div.md
 */

/**
 * Why html_unsafe() and not html() throughout this module:
 *
 * View.html() routes through the Sanitizer API (Element.setHTML), which Safari
 * does not implement in any version — desktop or iOS. On those browsers html()
 * falls back to textContent, so every doc page would render as literal markup
 * (`<h2>`, `**bold**`) for ~a third of visitors and 100% of Apple devices.
 *
 * That trade is only worth making for untrusted input. Everything parsed here
 * is the repo's own content: string literals in page.js and .md files fetched
 * from our own origin. The trust boundary is commit access — the same boundary
 * that already lets someone add malicious JS directly — so sanitizing buys
 * nothing here while costing correctness everywhere Apple ships.
 *
 * View.html() stays fail-closed for callers who *can't* vouch for their input.
 * If markdown ever arrives from a user (comment box, url param, CMS), this
 * decision has to be revisited — sanitize at that entry point, or vendor
 * DOMPurify as a fallback in core (see readme).
 */

// Inline markdown into any existing view. Tag-aware (see block_tags).
View.prototype.md = function(content){
	const parse = block_tags.has(this.el.tagName) ? marked.parse : marked.parseInline;
	return this.html_unsafe(parse(content));
};

// You get the element you wrote: content is parsed, and a single root block
// (<p>, <h1>, <table>, …) is adopted directly — so md("Hi.") behaves like p()
// and chains. Multiple blocks are wrapped in a div. Either way the View captures
// itself into View.captor like any other factory, and either way it carries the
// `md` class, so md.css can reach generated markup whichever shape it took.
export default function md(content){
	const html = marked.parse(content).trim();
	const template = document.createElement("template");
	template.innerHTML = html;

	if (template.content.children.length === 1)
		return new View({ el: template.content.firstElementChild }).ac("md");

	return new View().ac("md").html_unsafe(html);
}

// md.c("note", "Some **md**") — classes first, like div.c() / p.c()
md.c = function(classes, content){
	return md(content).ac(classes);
};

/**
 * md.file(import.meta, "readme.md") — fetch a markdown file and parse it.
 *
 * Resolved against the *module's* url, never the document's: with the SPA
 * fallback the document url is the route (/framework/core/x has no trailing
 * slash), so a document-relative fetch would miss. Same (meta, url) signature
 * as View.stylesheet() and View.load().
 *
 * Returns a PROMISE of a div.md, deliberately — not a view that fills itself
 * later. A promise composes with what the framework already has:
 *
 *   content(){ return md.file(import.meta, "readme.md"); }   // View.append_promise
 *
 * and it can be awaited, so App.load_page can finish loading before it swaps
 * the DOM (that's the no-flash guarantee in App.load_page). The text is cached
 * per url, so re-visiting a page re-parses but doesn't re-fetch.
 *
 * The trade for being awaitable: it does NOT capture itself (there's nothing to
 * place until it resolves), so the promise has to be returned or appended.
 * `md.details()` below is the batteries-included version.
 *
 * `{ h1: false }` drops a leading <h1>. A readme opens with its own title and a
 * Page renders `title` as an h1, so rendering a readme as page content would
 * otherwise show it twice.
 */
md.file = async function(meta, url, options = {}){
	const href = new URL(url, meta.url).href;
	const view = new View({ capture: false }).ac("md");

	try {
		const text = await (md.cache[href] ??= fetch(href).then(resp => {
			if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
			return resp.text();
		}));

		view.html_unsafe(marked.parse(text));

		if (options.h1 === false && view.el.firstElementChild?.tagName === "H1")
			view.el.firstElementChild.remove();

		return view;
	} catch (error) {
		delete md.cache[href]; // don't cache the failure
		return view.ac("md-error").text(`Error loading ${url}: ${error.message}`);
	}
};

/**
 * md.details(import.meta, "readme.md") — the same file, collapsed.
 *
 * A doc page should stay calm: examples first, no wall of architecture. The
 * technical record still belongs *with* the page, so it goes here — one click
 * away, closed by default. Nothing is awaited: it's collapsed, so it can fill
 * in a moment later.
 */
md.details = function(meta, url, text = "Design notes"){
	return details.c("md-details", () => {
		summary(text);
		div.c("md-details-body").append(md.file(meta, url, { h1: false }));
	});
};

// url -> Promise<string>. Populated by md.file.
md.cache = {};

export { md, marked };

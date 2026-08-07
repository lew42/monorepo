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
 * opt-in modules that may extend core.
 *
 *   p().md("Some **inline** markdown");     // into an existing view
 *   md("Hi.").ac("note");                   // a real <p>, chainable
 *   md.c("note", "Hi.");                    // classes first, like div.c()
 *   md("# Title");                          // a real <h1>
 *   md("Multi\n\nblock");                   // a captured div.md
 *   md.file(import.meta, "readme.md");      // a promise of a div.md
 *
 * `html_unsafe` throughout, never `html`: the Sanitizer API that `html()` uses does
 * not exist in Safari, where it falls back to textContent — so every doc page would
 * render as literal markup on every Apple device. Everything parsed here is the
 * repo's own content and the trust boundary is commit access. **If markdown ever
 * arrives from a user, this decision has to be revisited.** Full reasoning:
 * ext/markdown/readme.md.
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

	// `flow`: a multi-block md is a stack of prose, and EMITTING the class is what
	// lets core's flow rules stop naming `.md` — an ext class core can't import.
	return new View().ac("md flow").html_unsafe(html);
}

// md.c("note", "Some **md**") — classes first, like div.c() / p.c()
md.c = function(classes, content){
	return md(content).ac(classes);
};

/**
 * md.file(import.meta, "readme.md") — fetch a markdown file and parse it.
 *
 * Resolved against the MODULE's url, never the document's: the SPA fallback makes
 * the document url a route, so a document-relative fetch would miss.
 *
 * Returns a PROMISE of a div.md, deliberately — a promise composes with what the
 * framework already has, and can be awaited before a swap:
 *
 *   content(){ return md.file(import.meta, "readme.md"); }   // View.append_promise
 *
 * The trade for being awaitable: it does NOT capture itself, so the promise has to
 * be returned or appended. `md.details()` below is the batteries-included version.
 *
 * `{ h1: false }` drops a leading <h1>, since a Page already renders `title` as one.
 */
md.file = async function(meta, url, options = {}){
	const href = new URL(url, meta.url).href;
	const view = new View({ capture: false }).ac("md flow");   // a file is a stack of prose

	try {
		const text = await (md.cache[href] ??= fetch(href).then(resp => {
			if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
			return resp.text();
		}));

		view.html_unsafe(marked.parse(text));
		md.resolve(view.el, href);

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

/**
 * Make a fetched file's RELATIVE links and images point where the file meant.
 *
 * A browser resolves `href="base/"` against the document — which the SPA fallback
 * makes the current *route*, not the file's directory. So `[base](base/)` in
 * `styles/readme.md` pointed at `<wherever you happen to be>/base/` and 404'd
 * everywhere except the one url that matched. Found by a link crawl, on 40 routes.
 *
 * Exactly the trap the fetch itself has, so it gets the same fix, applied to what the
 * fetch returned: resolve against the FILE, never the document. Which also means a
 * relative link is now the *right* thing to write — the same one works on GitHub.
 *
 * `pathname` and not `href`, so the Router treats it as an in-app link rather than an
 * absolute url it has to hand back to the browser.
 */
md.resolve = function(root, base){
	root.querySelectorAll("a[href]").forEach(link => {
		const href = link.getAttribute("href");

		if (/^([a-z][\w+.-]*:|\/\/|\/|#)/i.test(href)) return;   // absolute, protocol, or a fragment

		const url = new URL(href, base);
		link.setAttribute("href", url.pathname + url.search + url.hash);
	});

	root.querySelectorAll("img[src]").forEach(img => {
		const src = img.getAttribute("src");

		if (/^([a-z][\w+.-]*:|\/\/|\/)/i.test(src)) return;

		img.setAttribute("src", new URL(src, base).pathname);
	});

	return root;
};

// url -> Promise<string>. Populated by md.file.
md.cache = {};

export { md, marked };

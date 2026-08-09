import View, { div, details, summary } from "../../core/View/View.js";
import { marked } from "./marked.esm.js";

View.stylesheet(import.meta, "md.css");

// Tags that can hold block children get the full marked.parse(); everything else
// gets parseInline(), so p().md("**hi**") doesn't nest a <p> inside a <p>.
const block_tags = new Set(["DIV", "SECTION", "ARTICLE", "MAIN", "ASIDE", "HEADER", "FOOTER", "BLOCKQUOTE", "BODY", "FIGURE", "DETAILS", "TD"]);

/**
 * md — markdown as a View addon, not a class. Importing this patches View.prototype.
 *
 *   p().md("Some **inline** markdown");     // into an existing view
 *   md("Hi.").ac("note");                   // a real <p>, chainable
 *   md.c("note", "Hi.");                    // classes first, like div.c()
 *   md("Multi\n\nblock");                   // a captured div.md
 *   md.file(import.meta, "readme.md");      // a promise of a div.md
 *
 * ⚠ `html_unsafe` throughout, never `html`: the Sanitizer API `html()` uses does not
 * exist in Safari, where it falls back to textContent — every doc page would render
 * as literal markup on every Apple device. Everything parsed here is the repo's own
 * content and the trust boundary is commit access. **If markdown ever arrives from a
 * user, this has to be revisited.** ext/markdown/readme.md.
 */
View.prototype.md = function(content){
	const parse = block_tags.has(this.el.tagName) ? marked.parse : marked.parseInline;
	return this.html_unsafe(parse(content));
};

// A single root block is adopted directly, so md("Hi.") behaves like p() and
// chains; multiple blocks are wrapped in a div. Either shape carries `md`.
export default function md(content){
	const html = marked.parse(content).trim();
	const template = document.createElement("template");
	template.innerHTML = html;

	if (template.content.children.length === 1)
		return new View({ el: template.content.firstElementChild }).ac("md");

	// Emitting `flow` is what lets core's flow rules stop naming `.md`, a class core
	// cannot import.
	return new View().ac("md flow").html_unsafe(html);
}

// md.c("note", "Some **md**") — classes first, like div.c() / p.c()
md.c = function(classes, content){
	return md(content).ac(classes);
};

/**
 * md.file(import.meta, "readme.md") — a PROMISE of a div.md.
 *
 *   content(){ return md.file(import.meta, "readme.md"); }   // View.append_promise
 *
 * ⚠ Resolved against the MODULE's url, never the document's: the SPA fallback makes
 * the document url a route, so a document-relative fetch misses.
 * ⚠ It does NOT capture itself — the trade for being awaitable — so the promise has
 * to be returned or appended. `md.details()` is the batteries-included version.
 *
 * `{ h1: false }` drops a leading <h1>, since a Page already renders `title` as one.
 */
md.file = async function(meta, url, options = {}){
	const href = new URL(url, meta.url).href;
	const view = new View({ capture: false }).ac("md flow");

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

// The same file, collapsed. Nothing is awaited — it is closed, so it can fill in a
// moment later.
md.details = function(meta, url, text = "Design notes"){
	return details.c("md-details", () => {
		summary(text);
		div.c("md-details-body").append(md.file(meta, url, { h1: false }));
	});
};

/**
 * Make a fetched file's RELATIVE links and images point where the file meant.
 *
 * ⚠ A browser resolves `href="base/"` against the document, which the SPA fallback
 * makes the current *route* — so a relative link in a fetched readme 404'd everywhere
 * except the one url that happened to match. Same trap as the fetch, same fix:
 * resolve against the FILE. Which makes a relative link the right thing to write —
 * the same one works on GitHub.
 * ⚠ `pathname`, not `href`, or the Router hands it back to the browser as external.
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

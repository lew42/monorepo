import { View, Page, p, div, a, iframe } from "/app.js";
import { code, section } from "../ui.js";
import { source } from "/framework/util/source/source.js";

View.stylesheet(import.meta, "library.css");

/* ── the frame ───────────────────────────────────────────────────────────────
 *
 * A tile is an <iframe> at the real url, shrunk with `zoom`. Not a clone of the
 * page and not a screenshot — the document a visitor gets, running.
 *
 * Rendering a second copy IN this document was tried first, and cannot work:
 *
 *   1. `import()` is memoised, so `/full/left/page.js` hands every caller the
 *      SAME Page. Measured. A second tree would `add()` those shared pages and
 *      reassign `.parent` on the live ones — two trees, one set of leaves.
 *   2. `.page { display: none }` until the Router marks it, and a page rendered
 *      outside the chain is never marked. Measured: 0x0.
 *   3. `.full` is `position: fixed; inset: 0`, and a `zoom`ed ancestor does NOT
 *      contain it. Measured — it still covers the window, so one tile would
 *      black out the gallery.
 *   4. The inner layout wants a desktop viewport; a frame has its own.
 *
 * A document answers all four by being a document. The page is genuinely the
 * leaf of its own chain, so it is `.active-page` and there is no CSS to fight;
 * and it is the url that makes it, which is this framework's whole claim.
 */
function frame(url){
	return iframe.c("page-frame").attr("src", url).attr("loading", "lazy").attr("title", url);
}

/* A tile is a real document. A document inside a tile does not need tiles — and
 * if it built them, each of those would build more, forever. `/library/` renders
 * whenever any `/library/**` url is visited, because the Router activates every
 * ancestor, so this is not hypothetical. One check, where frames are made. */
const in_a_frame = () => window.self !== window.top;

/* ── the one content, arranged eight ways ────────────────────────────────────
 *
 * Every recipe gets these same three children — the same function object, not a
 * copy — so a recipe differs from its variants in exactly one thing: how it
 * arranges them. That is the claim this library exists to show, and identity
 * makes it checkable instead of merely stated.
 */
const KIDS = ["one", "two", "three"];

const kid_body = function(){
	p(`I am \`${this.name}\`. One function renders all three of us under every arrangement in the library — we differ only by the name we were adopted under.`);

	div.c("row", () => KIDS.forEach(n => a.c("page-link", n).href(this.parent.url + n + "/")));

	section("The same content, arranged otherwise");

	variants(this.name + "/");

	p(`Every entry above is \`${this.name}\` under a different arrangement, and the one you are in is marked. You keep your place: switching changes the arrangement, never the content or the position. Reload any of them and you get exactly what clicking produced.`).ac("note");

	a.c("page-link", "the arrangement's source →").href(this.parent.url);
};

/* THE SWITCHER, and the one navigation idea in this library worth stealing.
 *
 *     /library/cols/two/   ->   /library/tabs/two/
 *      ^ arrangement ^ place      ^ changed    ^ kept
 *
 * A url here is two independent facts, and the switcher varies exactly one of
 * them. That is what makes these variants rather than eight unrelated demos.
 *
 * There is no selected-state code anywhere, and no "current variant" to store:
 * every entry is a real url, so `Router.mark_links()` writes `.active` on the
 * one that matches — the same pass that lights the sidebar. Reload-identical
 * for free, because the state IS the url.
 *
 * `.row` for layout and `.tab` for the look, both the site's own. Deliberately
 * NOT `.tab-bar`: its `:not(:has(.tab.active)) > .tab:first-child` fallback
 * would light a wrong entry on any url this bar does not contain.
 *
 * Rendered by the CHILD, never the arrangement — only the child knows the place
 * to keep. That is also why every gallery tile opens a child rather than an
 * arrangement root: you land where the switcher works.
 */
function variants(place){
	return div.c("row", () => recipes.forEach(r =>
		a.c("tab", r.title).href("/library/" + r.name + "/" + place)));
}

/* route(), not initialize() + add(). An inline page's `initialize()` runs inside
 * its OWN constructor — before the `add()` that gives it a parent — so a
 * grandchild built there derives its url from a parent that has none yet, and
 * lands on "undefinedone/". route() runs on the walk, after adoption, when
 * `this.url` is real. Written up as a framework request. */
const kid = name => KIDS.includes(name) && { title: name, content: kid_body };

/* ── the recipes ─────────────────────────────────────────────────────────────
 *
 * `arrange(page)` does the ONE thing that differs — make the region, class it —
 * and returns the view that page's own notes go into. Everything else is
 * identical across all eight, which is the point.
 *
 * The source printed under each recipe is `source(arrange)`: the very function
 * that just ran. There is no second copy to fall out of date, which is the only
 * thing that makes a code sample on a live page worth reading.
 *
 * It takes `page` rather than using `this` for two reasons. It reads better —
 * the thing being arranged is named — and `util/source` mis-slices a
 * `function(){}` whose body contains an arrow: it looks for the FIRST `=>` and
 * finds the nested one, printing a fragment that starts mid-expression. Three
 * of these were displaying wrongly before it was caught. A top-level arrow is
 * cut correctly. One-line fix proposed in the report.
 */
function recipe(name, title, arrange, options = {}){
	const url = "/library/" + name + "/";

	return {
		name, title, arrange,
		...options,
		opens: url + (options.deep ?? "two") + "/",   // what the tile shows, and opens
		route: options.route ?? kid,

		// The arrangement's own page carries the SOURCE; its children carry the
		// switcher. Both, on one page, would be the same bar twice in the seven
		// arrangements that keep the parent on screen beside the child.
		content(){
			arrange(this).append(() => {
				code(source(arrange), `library/${name} — the whole arrangement`);

				div.c("row", () => {
					KIDS.forEach(n => a.c("page-link", n).href(url + n + "/"));
					a.c("page-link", "← the library").href("/library/");
				});

				p("Open a child: it carries the switcher that keeps your place across all eight arrangements.").ac("note");
			});
		},
	};
}

/* Eight functions, none longer than three lines. Each is printed verbatim on the
 * page it arranges. */

const recipes = [

	recipe("replace", "Replace", page => {
		// I claim no region, so my children land in app.$pages as my SIBLINGS —
		// and CSS takes me off screen, because I do not contain the leaf.
		return div();
	}, { blurb: "my child replaces me" }),

	recipe("cols", "Columns", page => {
		// One utility class on a div IS the arrangement. My own content goes in
		// first, so I am column 1 rather than a header above the columns.
		let $col;
		page.$pages = div.c("pages cols", () => $col = div.c("col"));
		return $col;
	}, { blurb: "equal tracks, my content first" }),

	recipe("tabs", "Tabs", page => {
		// A bar of links and the panel they mount into. Which children are tabs
		// is decided HERE, at placement — nothing on a child says "I am a tab".
		const $notes = div();
		page.$tabs = page.tabs(KIDS.join(" "));
		return $notes;
	}, { blurb: "a bar and a panel" }),

	recipe("full", "Full", page => {
		// `classes: "full"` positions me over the window; the region keeps my
		// children inside me, one at a time. A full page MUST claim a region —
		// with none, a child mounts in app.$pages BEHIND the overlay and is
		// simply invisible. See the report: one `:has()` in the site's CSS.
		const $notes = div();
		page.$pages = div.c("pages");
		return $notes;
	}, { classes: "full", blurb: "covering the window" }),

	recipe("cols-full", "Columns in full", page => {
		// The thing one `mode` property could never express: covering the window
		// and arranging a subtree are answers to different questions, so they
		// live on different elements and never compete.
		const $notes = div();
		page.$pages = div.c("pages cols");
		return $notes;
	}, { classes: "full", blurb: "columns, covering the window" }),

	recipe("tabs-cols", "Tabs in columns", page => {
		// Two claims at once: `regions` takes the two named tabs, `$pages` takes
		// whatever is left. `three` is in no bar, so it lands as a second column.
		let $notes;
		page.$pages = div.c("pages cols", () => div.c("col", () => {
			$notes = div();
			page.$tabs = page.tabs("one two");
		}));
		return $notes;
	}, { blurb: "a bar inside a column" }),

	recipe("master-detail", "Master / detail", page => {
		// `.cols` with the first track pinned instead of equal — the one line of
		// CSS this library adds that the site could not already provide.
		let $notes;
		page.$pages = div.c("pages cols master-detail", () => div.c("col", () => $notes = div()));
		return $notes;
	}, { blurb: "a pinned list beside its detail" }),

	recipe("drill", "Drill-down", page => {
		// Every level claims nothing, so `container()` walks past all of them to
		// MY region and they land as siblings — one grid, however deep you go.
		const $notes = div();
		page.$pages = div.c("pages cols");
		return $notes;
	}, { deep: "a/b/c", route: deeper, blurb: "one route(), unbounded depth" }),
];

/* One function, unbounded depth. Each level hands the SAME route() to the level
 * below, so `/library/drill/a/b/c/d/` resolves with no files and no declarations
 * — and every level lands in drill's region as one more column. */
function deeper(name){
	return {
		title: name,
		route: deeper,
		content(){
			const depth = this.chain().length - 3;

			p(`Level ${depth} — \`${this.url}\`. No file, no declaration: the same route() claimed me that claimed my parent.`);
			a.c("page-link", "deeper →").href(this.url + next(name) + "/");

			section("The same content, arranged otherwise");

			/* A switcher can only keep a place that EVERY arrangement can
			 * express. `drill` claims any name; the other seven claim one, two
			 * and three — so at the first level the place survives the hop, and
			 * below it the bar can only offer the arrangements themselves.
			 * That is the real limit on this pattern, and saying it is better
			 * than quietly linking to urls that would 404. */
			const shared = depth === 1 && KIDS.includes(name);

			variants(shared ? name + "/" : "");

			if (!shared)
				p(`Below the first level the place is drill's alone — no other arrangement claims \`${name}\` — so these link to each arrangement's own root. A switcher can only preserve what both sides can name.`).ac("note");
		},
	};
}

const next = name => String.fromCharCode(name.charCodeAt(0) + 1);

/* ── the gallery ─────────────────────────────────────────────────────────────
 *
 * A tile is `.page-preview` — the framework's own card, border and hover — with
 * a live document inside it instead of a title. That is exactly what `preview()`
 * would become if this were a framework feature; the report has the signature.
 */
function tile(url, title, note){
	return a.c("page-preview", () => {
		frame(url);
		div(title);
		if (note) div.c("note", note);
	}).href(url);
}

function tiles(list){
	return div.c("page-previews", () => list.forEach(t => tile(...t)));
}

/* The rest of a kind: real urls, NOT mounted. `preview()`'s own shape — a card
 * with a name in it — which is exactly what the framework hands you for a page
 * you have not paid to render.
 *
 * This is the curation. One promoted specimen per kind is live; its alternates
 * are one click away and cost nothing. Fifty documents became twenty by
 * deciding what to promote, which is a librarian's job and not a browser's —
 * an IntersectionObserver would have made the page lazier without making it
 * better, and machinery is the thing this codebase spends last.
 */
function alternates(list){
	return div.c("page-previews", () => list.forEach(([url, label]) =>
		a.c("page-preview", label).href(url)));
}

/* ── the catalogue ───────────────────────────────────────────────────────────
 *
 * Curated by ARRANGEMENT KIND, not by which seat wrote it: a reader arrives
 * asking "how do I do columns", never "what did Steve build". One specimen per
 * kind is promoted to a live tile; the rest are ordinary links, one click away
 * and costing nothing. That is what took this page from fifty documents to
 * twenty, and it is an editorial decision rather than a technical one.
 *
 * Hand-typed and checked against the filesystem before each run, for exactly
 * the reason site/app.js gives for the hand-typed sidebar: the alternative is
 * asking the network about urls that may not exist, and this framework designed
 * the doomed 404 out on purpose ("only declared names ever hit the network").
 * A probe over every topic was built first and reverted — it cost a 404 per
 * absent directory, indistinguishable in the console from a real failure.
 *
 * Deep urls, not topic roots: an arrangement is only itself once something is
 * actually open inside it, which is the one thing a sidebar cannot express.
 */
const KINDS = [
	{
		kind: "Replace — the default, and what you get for free",
		best: ["/nav/replace/", "Replace", "no class anywhere; the child takes the screen"],
		more: [["/replace/child/", "an eager child"], ["/deep/gap/eager/", "the .app gap"],
		       ["/nav/links/", "links"], ["/nav/chain/", "the chain"]],
	},
	{
		kind: "Columns — one region, equal tracks",
		best: ["/columns/child/grandchild/", "Columns, three deep", "one region, three lazy levels"],
		more: [["/nav/cols/", "the primitive"], ["/nav/container/", "container()"],
		       ["/library/cols/two/", "the recipe"]],
	},
	{
		kind: "Tabs — a bar of links and a panel",
		best: ["/tabs/api/", "Tabs", "two sets, one url, nothing marked on a child"],
		more: [["/nav/tabs/", "the primitive"], ["/compound/two-bars/", "two bars"],
		       ["/a11y/tabs/", "tabs and the caret"], ["/library/tabs/two/", "the recipe"]],
	},
	{
		kind: "Full — covering the window by position",
		best: ["/nav/full/", "Full", "position: fixed, and .app never changes class"],
		more: [["/deep/chrome/sealed/", "sealed chrome"], ["/compound/overlay/", "an overlay"],
		       ["/library/full/two/", "the recipe"]],
	},
	{
		kind: "Compound — two claims at once",
		best: ["/compound/tabs-in-a-column/what/deeper/", "Tabs in a column", "a region inside a region"],
		more: [["/compound/columns-in-full/left/deeper/", "columns in full"],
		       ["/compound/three-layers/left/", "three layers"],
		       ["/compound/drilling-tabs/", "drilling tabs"],
		       ["/compound/master-detail/", "master / detail"],
		       ["/full/left/deeper/", "the site's own"], ["/compound/steps/", "steps"]],
	},
	{
		kind: "Depth — how far the walk goes",
		best: ["/deep/nesting/a/b/c/d/e/", "Five deep", "every level a real url, none of them a file"],
		more: [["/perf/walk/a/b/c/d/e/", "what the walk costs"],
		       ["/deep/orphan/region/inner/", "an orphaned region"],
		       ["/deep/scale/", "many children"], ["/library/drill/a/b/c/", "the recipe"]],
	},
	{
		kind: "Dynamic — urls with no file behind them",
		best: ["/dynamic/42/", "route()", "claimed after the declaration, never after the filesystem"],
		more: [["/nav/dynamic/", "the primitive"], ["/compound/tree-from-route/", "a whole tree"],
		       ["/urls/schema/inverse/", "the url schema"]],
	},
	{
		kind: "Chrome — the part that was never layout",
		best: ["/chrome/sidebar/", "Sidebar", "built once, outside $pages, so navigation cannot touch it"],
		more: [["/chrome/topbar/", "a topbar"], ["/chrome/crumbs/", "breadcrumbs"],
		       ["/chrome/drawer/", "a drawer"], ["/chrome/palette/", "a palette"]],
	},
	{
		kind: "Async — content that arrives after the captor is gone",
		best: ["/async/arrangements/", "Async arrangements", "sync container, async fill"],
		more: [["/async/trap/", "the capture trap"], ["/async/stream/", "streaming"],
		       ["/async/inflight/", "two clicks racing"]],
	},
	{
		kind: "Applied — real information architecture",
		best: ["/patterns/docs/guide/concepts/fan-out/", "Docs IA", "five levels of navigation that mean something"],
		more: [["/patterns/dashboard/", "a dashboard"], ["/patterns/shop/", "a shop"],
		       ["/patterns/wiki/", "a wiki"], ["/content/blog/", "a blog"],
		       ["/forms/wizard/", "a wizard"]],
	},
	{
		kind: "Access and motion — the arrangement is not the whole job",
		best: ["/a11y/focus/", "Focus", "what a swap does to the caret"],
		more: [["/a11y/skip/", "skip links"], ["/a11y/current/", "aria-current"],
		       ["/motion/view-transitions/", "view transitions"], ["/motion/baseline/", "the baseline"]],
	},
];

export default new Page({
	meta: import.meta,
	title: "Layout Library",

	// Eight recipes, no files. ONE level of inline nesting is safe — add()
	// assigns the parent before anything can walk — and everything below is
	// route(), which runs late enough to have a url.
	initialize(){ recipes.forEach(r => this.add(r.name, r)); },

	content(){
		p("Every tile is the page, running — a real document at a real url, shrunk. Click one and you get that url at full size, with the source that arranged it and the other seven arrangements of the same three children.");

		if (in_a_frame()){
			p("(A library inside a frame renders no frames — that recursion has no floor.)").ac("note");
			return;
		}

		section("The eight arrangements");

		tiles(recipes.map(r => [r.opens, r.title, r.blurb]));

		p("The same three children — literally the same function object — under eight arrangements. Each tile opens that arrangement with a child already active, which is where the switcher lives — `/library/cols/two/` → `/library/tabs/two/` keeps `two` and changes only the arrangement.").ac("note");

		section("How a tile works");

		code(source(frame), "library/page.js");

		p("`zoom`, not `transform: scale()`. Measured: both keep the inner viewport at 1400px and reproduce the layout exactly, but `zoom` shrinks the box in flow, so nothing needs a fixed cell and nothing needs clipping. The `width: 1400px` is what stops a frame reflowing into the tile instead of shrinking into it.").ac("note");

		code(source(tile), "a tile is a card with a document in it");

		p("`.page-preview` is the framework's own card — its border, its hover, its place on the shelf. The only thing this library adds is a live document where the title used to be, which is exactly the change `preview()` would need to make this a framework feature rather than a page.").ac("note");

		section("The switcher");

		code(source(variants), "the one navigation idea here worth stealing");

		p("A url in this library is two independent facts — which arrangement, and which place — and the switcher varies exactly one. No selected-state code exists: every entry is a real url, so the Router's own link pass marks the current one.").ac("note");

		// ── the catalogue: one live specimen per kind, the rest as links ──
		KINDS.forEach(k => {
			section(k.kind);
			div.c("kind", () => {
				tile(...k.best);
				alternates(k.more);
			});
		});

		p("One specimen of each kind is live; the alternates are real urls that cost nothing until you click them. That curation is what keeps this page to twenty documents instead of fifty — a librarian's decision, not a browser's.").ac("note");
	},
});

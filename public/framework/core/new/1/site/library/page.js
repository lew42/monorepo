import { View, Page, p, div, a, iframe } from "/app.js";
import { code, section } from "../ui.js";
import { source } from "/framework/util/source/source.js";

View.stylesheet(import.meta, "library.css");

// history and reasons: doc/library-page-notes.md

function frame(url){
	return iframe.c("page-frame").attr("src", url).attr("loading", "lazy").attr("title", url);
}

const in_a_frame = () => window.self !== window.top;

const KIDS = ["one", "two", "three"];

const kid_body = function(){
	p(`I am \`${this.name}\`. One function renders all three of us under every arrangement in the library — we differ only by the name we were adopted under.`);

	div.c("row", () => KIDS.forEach(n => a.c("page-link", n).href(this.parent.url + n + "/")));

	section("The same content, arranged otherwise");

	variants(this.name + "/");

	p(`Every entry above is \`${this.name}\` under a different arrangement, and the one you are in is marked. You keep your place: switching changes the arrangement, never the content or the position. Reload any of them and you get exactly what clicking produced.`).ac("note");

	a.c("page-link", "the arrangement's source →").href(this.parent.url);
};

function variants(place){
	return div.c("row", () => recipes.forEach(r =>
		a.c("tab", r.title).href("/library/" + r.name + "/" + place)));
}

const kid = name => KIDS.includes(name) && { title: name, content: kid_body };

function recipe(name, title, arrange, options = {}){
	const url = "/library/" + name + "/";

	return {
		name, title, arrange,
		...options,
		opens: url + (options.deep ?? "two") + "/",
		route: options.route ?? kid,

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

const recipes = [

	recipe("replace", "Replace", page => {
		return div();
	}, { blurb: "my child replaces me" }),

	recipe("cols", "Columns", page => {
		let $col;
		page.$pages = div.c("pages cols", () => $col = div.c("col"));
		return $col;
	}, { blurb: "equal tracks, my content first" }),

	recipe("tabs", "Tabs", page => {
		const $notes = div();
		page.$tabs = page.tabs(KIDS.join(" "));
		return $notes;
	}, { blurb: "a bar and a panel" }),

	recipe("full", "Full", page => {
		const $notes = div();
		page.$pages = div.c("pages");
		return $notes;
	}, { classes: "full", blurb: "covering the window" }),

	recipe("cols-full", "Columns in full", page => {
		const $notes = div();
		page.$pages = div.c("pages cols");
		return $notes;
	}, { classes: "full", blurb: "columns, covering the window" }),

	recipe("tabs-cols", "Tabs in columns", page => {
		let $notes;
		page.$pages = div.c("pages cols", () => div.c("col", () => {
			$notes = div();
			page.$tabs = page.tabs("one two");
		}));
		return $notes;
	}, { blurb: "a bar inside a column" }),

	recipe("master-detail", "Master / detail", page => {
		let $notes;
		page.$pages = div.c("pages cols master-detail", () => div.c("col", () => $notes = div()));
		return $notes;
	}, { blurb: "a pinned list beside its detail" }),

	recipe("drill", "Drill-down", page => {
		const $notes = div();
		page.$pages = div.c("pages cols");
		return $notes;
	}, { deep: "a/b/c", route: deeper, blurb: "one route(), unbounded depth" }),
];

function deeper(name){
	return {
		title: name,
		route: deeper,
		content(){
			const depth = this.chain().length - 3;

			p(`Level ${depth} — \`${this.url}\`. No file, no declaration: the same route() claimed me that claimed my parent.`);
			a.c("page-link", "deeper →").href(this.url + next(name) + "/");

			section("The same content, arranged otherwise");

			const shared = depth === 1 && KIDS.includes(name);

			variants(shared ? name + "/" : "");

			if (!shared)
				p(`Below the first level the place is drill's alone — no other arrangement claims \`${name}\` — so these link to each arrangement's own root. A switcher can only preserve what both sides can name.`).ac("note");
		},
	};
}

const next = name => String.fromCharCode(name.charCodeAt(0) + 1);

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

function alternates(list){
	return div.c("page-previews", () => list.forEach(([url, label]) =>
		a.c("page-preview", label).href(url)));
}

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

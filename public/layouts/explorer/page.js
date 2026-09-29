import { Page, View, div, a, span, p, h2, h3, b, icon, iframe } from "/app.js";
import Layout, { load as load_layouts, find as find_layout } from "/layouts/Layout.js";

View.stylesheet(import.meta, "explorer.css");

/* ── /layouts/explorer/ — every layout on the site, walked as one tree ──────────

   WHAT THIS PAGE IS FOR. The owner: "a left preview rail that activates the main
   ... in the right sidebar, by default, we show alternates ... as you're browsing
   this tree ... the right sidebar becomes the left [and] the currently selected
   one becomes the main view." This page IS exactly that, three regions:

       LEFT    the current level's items (this node's siblings, itself included)
       CENTRE  the selected item, large — its real page, or the layout standard's
               own drawing when it has no page of its own
       RIGHT   the selected item's children — click one and it becomes the centre,
               the old right becomes the new left. A url per step; reload and back
               both land in the same place.

   ONE PAGE, NOT NESTED PAGES. The HTML study (`/framework/ai/2026/09/29/
   layout-explorer-3-columns-and-a-study-of/html-study.md`) found that a Finder-style
   `columns()` host keeps every ancestor mounted just to show a window three wide —
   so this page does not use `columns()`. It stays ONE routed page per url (route()
   below, recursing over explorer.json), and every render reads the SAME data file
   for whichever url it is — never a tree of framework Page objects walked eagerly.

   ⚠ `render()` IS OVERRIDDEN (the same move `core/Page/layout/floating/` makes) —
     core's own default draws an `<h1>` and a "Folder" link above whatever `content()`
     returns, which is a whole screen's worth of scroll before the three regions even
     start (round 1's own screenshots). The breadcrumb below IS the page's one header
     line; the explanation sentence moved to its own `title=` tooltip. The three
     regions then fill the rest of `100dvh`, each one scrolling on its own.

   THE DATA IS explorer.json, THE ONLY COPY. A preview card never renders a live
   child page (a wall of a hundred live modules would crawl — the layout skill's own
   rule) — it draws the layout standard's OWN wireframe (Layout.js, already used by
   /layouts/ and /layouts/browse/) for an id that has one, or a lazy `<iframe>` of
   the real page otherwise, shrunk with the same container-query `zoom` trick
   Layout.js's own `.std-frame`/`.std-draw` uses — never a screenshot, so what you
   see is the real page. Reused: `Layout.frame()` (the wire drawing), `layouts.json`
   via `Layout.js`'s own `load()`/`find()`, and the `std-` prefix already registered
   for `/layouts`.

   ⚠ No DOM after an `await`: every box below is captured synchronously and filled
     inside `.append(callback)`, the framework's own rule (`core/View/doc/capturing.md`). */

const BASE = new URL(".", import.meta.url).pathname;

// The tree — resolved once, at module eval, the same "cold deep link" reason
// /layouts/page.js loads layouts.json this way.
const TREE = await fetch(new URL("./explorer.json", import.meta.url)).then(res => res.json());

const HELP = "Left: this level's items. Centre: the one you picked, real size. Right: its variants — click one and it slides into the centre, and the old right becomes the new left.";

// A url segment chain (e.g. ["two-columns", "2-sidebar"]) → this page's own url for it.
const href = chain => BASE + chain.filter(Boolean).join("/") + (chain.length ? "/" : "");

// Walk the tree by a chain of ids, root first. Always succeeds when the chain came
// from `route()` below, because that is the only place a chain is ever built.
function resolve(chain){
	let node = TREE;
	for (const id of chain) node = (node.children ?? []).find(kid => kid.id === id);
	return node;
}

// A node's OWN picture: itself, if it has a `wire` or a `url` — otherwise (a pure
// category, like "Two columns") its first child's, recursively. Round 2's own rule:
// "a category card is a preview, not a folder icon" — the owner's "you see the most
// basic version of it in the main area" applies to a category's centre the same way.
function effective(node){
	if (!node) return null;
	if (node.wire || node.url) return node;
	return node.children?.length ? effective(node.children[0]) : null;
}

/* ⚠ THE SPACE THIS PAGE OWNS. `route()` sees undeclared names only (core's own
   rule — `child()`, Page.class.js), so it can never shadow `doc`. Everything else
   under /layouts/explorer/ is a chain into explorer.json, walked one segment at a
   time exactly the way /layouts/tag/<tag>/ walks one name — this just keeps doing
   it, because each answer carries its own `route()` for the segment after it. */
export default new Page({
	meta: import.meta,
	title: "Explorer",
	icon: "view_carousel",
	description: "Every layout on the site, walked as one tree: siblings on the left, the one you picked large in the middle, its variants on the right.",
	children: "doc",

	route(name){
		if (name.includes(".")) return;
		const child = TREE.children.find(kid => kid.id === name);
		return child && node_page(child, [name]);
	},

	render(){
		if (this.view) return this.view;
		this.view = div.c("page std-explorer-page", () => { body(TREE, []); });
		return this.view;
	},
});

// One tree node, as the thing `route()` (above, or a level down) hands to `add()`.
// Its OWN `route()` is how the walk goes another level deeper — the same shape,
// called again, never a nested `columns()` page.
function node_page(node, chain){
	return {
		title: node.title,
		description: node.description,
		render(){
			if (this.view) return this.view;
			this.view = div.c("page std-explorer-page", () => { body(node, chain); });
			return this.view;
		},
		route(name){
			if (name.includes(".")) return;
			const child = (node.children ?? []).find(kid => kid.id === name);
			return child && node_page(child, [...chain, name]);
		},
	};
}

/* ── THE BODY ── one call per url: the header row, then the three regions filling
   the rest of the screen. `chain` is this url's own id path from the root; `node`
   is what it resolves to.

   ROUND 2, DELIVERABLE 2 — the bare /layouts/explorer/ url (chain === []) has no
   parent, so nothing is "selected" by the url itself. The owner: "you select one
   of these categories ... and then you see the most basic version of it." So this
   render ALSO auto-selects the first category for what it SHOWS — never a
   `history.pushState`, never a `route()` claim, just what `selected` computes to
   on this one call. Reloading /layouts/explorer/ makes the exact same choice again,
   which is what "no history entry" means here. */
function body(node, chain){
	const parent_chain = chain.slice(0, -1);
	const parent = chain.length ? resolve(parent_chain) : null;

	const selected = parent ? node : (node.children?.[0] ?? null);
	const selected_chain = parent ? chain : (selected ? [selected.id] : []);

	const left_base = parent ? parent_chain : chain;   // [] either way at the root
	const left_items = parent ? (parent.children ?? []) : (node.children ?? []);
	const right_items = selected ? (selected.children ?? []) : [];

	div.c("std-explorer-head", () => { crumbs(chain); });

	div.c("std-explorer-body", () => {
		div.c("std-explorer-rail", () => {
			// ROUND 3, DELIVERABLE 3 — "Categories" whenever this rail IS the top-level
			// list (`parent` is the tree's own root, or there is no parent at all, the
			// root state); the parent's own name otherwise, matching the right rail's
			// "Inside X" exactly, rather than the root's fixed label "Explorer" one
			// level down.
			h3(!parent || parent === TREE ? "Categories" : "Inside " + parent.title);
			rail(left_items, left_base, selected?.id, "Nothing here.");
		});

		div.c("std-explorer-centre", () => { centre(selected); });

		div.c("std-explorer-rail", () => {
			h3(selected ? "Inside " + selected.title : "Variants");
			rail(right_items, selected_chain, null,
				selected ? "No variants yet — this is as deep as this branch goes." : "Pick something on the left first.");
		});
	});
}

// THE HEADER — the breadcrumb IS the header now (round 2: the old h1 + "Folder"
// link + paragraph pushed the three regions ~450px down the page). The explanation
// sentence that used to sit under them is a hover tooltip on the (i), instead of a
// permanent line — deliverable 7's same "the drawer has no hook this fence reaches"
// reasoning applies here too, so it stays on the page rather than in the ☰ drawer.
function crumbs(chain){
	div.c("std-explorer-crumbs", () => {
		a.c("std-explorer-crumb").href(BASE).append(() => { icon("view_carousel"); span("Explorer"); });

		let running = [];
		chain.forEach(id => {
			running = [...running, id];
			const at = resolve(running);
			icon("chevron_right");
			a.c("std-explorer-crumb").href(href(running)).append(() => span(at?.title ?? id));
		});

		icon("info").ac("std-explorer-info").attr("title", HELP);
	});
}

// A rail of cards. `base` is the chain to this rail's PARENT, so each item's own
// url is `base + item.id`. `active_id` marks the one that is also the centre.
function rail(items, base, active_id, empty_message){
	if (!items.length) return void p.c("muted", empty_message);

	div.c("std-explorer-cards", () => items.forEach(item =>
		card(item, [...base, item.id], item.id === active_id)));
}

// ONE CARD — round 2: a category card shows its own most-basic child's picture
// (never a folder icon), and the count moves INTO the one-line caption so it is
// never said twice. The whole card is the link; the picture inside it never
// receives the click (explorer.css turns off pointer-events on it).
function card(item, chain, active){
	return a.c("std-explorer-card" + (active ? " is-active" : "")).href(href(chain)).append(() => {
		const eff = effective(item);
		if (eff) picture(eff, false); else div.c("std-explorer-pic std-explorer-pic-cat", () => { icon("folder_open"); });

		span.c("std-explorer-card-title",
			item.title + (item.children?.length ? " · " + item.children.length + " inside" : ""));
	});
}

// THE CENTRE — the selected node, large: its real page, or the layout standard's
// own drawing, or (a pure category) its first child's — `effective()`, the same
// rule a card's own picture follows. `null` (nothing at all, which no longer
// happens at the bare url — see `body()` — kept as the honest fallback) is the
// one caption-only state.
function centre(node){
	if (!node) return void div.c("std-explorer-empty", () => { p.c("muted", "Pick something on the left."); });

	h2.c("std-explorer-centre-title", node.title);

	const eff = effective(node);
	if (eff) picture(eff, true); else p.c("muted", "Nothing to draw here yet.");

	properties(node);
}

// A DRAWING (this id already has one in layouts.json) or a lazy IFRAME of the real
// page — never a screenshot. `big` changes loading eagerness, the picture's own
// aspect (the centre is closer to a real screen; a card is shorter — round 2,
// deliverable 4, "aim for ~6 visible at 1920") and a class the CSS sizes
// differently. The same function draws a thumbnail card and the centre.
//
// ROUND 3, DELIVERABLE 1 — a card KEEPS the fixed 1920x760 aspect (it is a small,
// uniform thumbnail; nothing about it needs to fill anything). The CENTRE does
// not: it is "the selected item, LARGE, real size", so its box's `--w`/`--h` are
// re-measured off its own real, rendered pixels (`fit_frame`, below) the instant
// it has a size — never a fixed 1920x1080 — so the drawing (or the iframe) grows
// to fill BOTH the column's width and the viewport's height, not just one.
function picture(item, big){
	const size = big ? { w: 1920, h: 1080 } : { w: 1920, h: 760 };
	const cls = "std-explorer-pic" + (big ? " std-explorer-pic-big" : "");

	if (item.wire) return div.c(cls, $pic => {
		load_layouts().then(data => {
			const entry = find_layout(data, item.wire);
			$pic.append(() => {
				if (!entry) return;
				const $frame = new Layout({ wire: entry.wire, id: entry.id }).frame(size);
				if (big) fit_frame($pic, $frame);
			});
		});
	});

	if (item.url) return div.c(cls, $pic => {
		const $frame = div.c("std-explorer-frame", () => {
			div.c("std-explorer-draw", () => {
				iframe().attr("src", item.url).attr("title", item.title).attr("loading", big ? "eager" : "lazy");
			});
		}).style({ "--w": size.w, "--h": size.h });
		if (big) fit_frame($pic, $frame);
	});

	return div.c(cls + " std-explorer-pic-cat", () => { icon("folder_open"); });
}

// THE CENTRE'S OWN SIZE, fed back into the frame it holds. `$box` is the flex
// item the CSS already grows to fill the centre column (`.std-explorer-pic-big`,
// `flex: 1 1 auto` in explorer.css) — this only reads its real width and height
// once they exist and writes them as the frame's `--w`/`--h`, so the frame's own
// `aspect-ratio: var(--w) / var(--h)` becomes exactly the box's own ratio and the
// drawing fills it exactly, at every viewport, not just a fixed 16∶9 slice of it.
function fit_frame($box, $frame){
	const fit = () => {
		const w = $box.el.clientWidth, h = $box.el.clientHeight;
		if (w > 40 && h > 40) $frame.style({ "--w": w, "--h": h });
	};

	new ResizeObserver(fit).observe($box.el);
	fit();
}

// DELIVERABLE 7's fallback — title, the real address (or the drawing's id),
// description, child count. Lives INSIDE the centre now (round 2), so it scrolls
// with it rather than adding a fourth block under the fixed-height three regions.
function properties(node){
	const eff = effective(node);

	div.c("std-explorer-props flow", () => {
		p.c("muted", "Properties");
		p(() => { b("Title — "); span(node.title); });
		p(() => {
			b("Address — ");
			if (node.url) return void a(node.url).href(node.url);
			if (node.wire) return void span("a drawing, /layouts/" + node.wire + "/");
			if (eff) return void span("a category — pictured here via its first child, " + (eff.url ?? "/layouts/" + eff.wire + "/"));
			span("none yet");
		});
		if (node.description) p(() => { b("What it is — "); span(node.description); });
		p(() => { b("Children — "); span(String(node.children?.length ?? 0)); });
	});
}

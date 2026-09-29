import { Page, View, div, a, span, p, h2, h3, b, md, icon, iframe } from "/app.js";
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

   THE DATA IS explorer.json, THE ONLY COPY. A preview card never renders a live
   child page (a wall of a hundred live modules would crawl — the layout skill's own
   rule) — it draws the layout standard's OWN wireframe (Layout.js, already used by
   /layouts/ and /layouts/browse/) for an id that has one, or a lazy `<iframe>` of
   the real page otherwise, shrunk with the same container-query `zoom` trick
   Layout.js's own `.std-frame`/`.std-draw` uses — never a screenshot, so what you
   see is the real page. Reused: `Layout.frame()` (the wire drawing), `layouts.json`
   via `Layout.js`'s own `load()`/`find()`, the layout skill's "one screen, shown not
   told" shape, and the `std-` prefix already registered for `/layouts`.

   ⚠ No DOM after an `await`: every box below is captured synchronously and filled
     inside `.append(callback)`, the framework's own rule (`core/View/doc/capturing.md`). */

const BASE = new URL(".", import.meta.url).pathname;

// The tree — resolved once, at module eval, the same "cold deep link" reason
// /layouts/page.js loads layouts.json this way.
const TREE = await fetch(new URL("./explorer.json", import.meta.url)).then(res => res.json());

// A url segment chain (e.g. ["two-columns", "2-sidebar"]) → this page's own url for it.
const href = chain => BASE + chain.filter(Boolean).join("/") + (chain.length ? "/" : "");

// Walk the tree by a chain of ids, root first. Always succeeds when the chain came
// from `route()` below, because that is the only place a chain is ever built.
function resolve(chain){
	let node = TREE;
	for (const id of chain) node = (node.children ?? []).find(kid => kid.id === id);
	return node;
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

	content(){ draw(TREE, []); },
});

// One tree node, as the thing `route()` (above, or a level down) hands to `add()`.
// Its OWN `route()` is how the walk goes another level deeper — the same shape,
// called again, never a nested `columns()` page.
function node_page(node, chain){
	return {
		title: node.title,
		description: node.description,
		content(){ draw(node, chain); },
		route(name){
			if (name.includes(".")) return;
			const child = (node.children ?? []).find(kid => kid.id === name);
			return child && node_page(child, [...chain, name]);
		},
	};
}

/* ── THE DRAW ── one call per url. `chain` is this url's own id path from the
   root; `node` is what it resolves to. Left is the PARENT's children (my level,
   me included) — at the very root there is no parent, so left falls back to my
   OWN children, which is exactly the owner's "at the top level these are
   categories" (requirements.md). */
function draw(node, chain){
	const parent_chain = chain.slice(0, -1);
	const parent = chain.length ? resolve(parent_chain) : null;

	const left_base = parent ? parent_chain : chain;
	const left_items = parent ? (parent.children ?? []) : (node.children ?? []);
	const selected = parent ? node : null;
	const right_items = selected ? (selected.children ?? []) : [];

	crumbs(chain);

	md("**A tree of every layout the site owns, three columns at a time.** Left: this level's items. Centre: the one you picked, real size. Right: its variants — click one and it slides into the centre, and the old right becomes the new left.");

	div.c("std-explorer wide", () => {
		div.c("std-explorer-rail", () => {
			h3(parent ? parent.title : "Categories");
			rail(left_items, left_base, node.id, "Nothing here.");
		});

		div.c("std-explorer-centre", () => { centre(selected); });

		div.c("std-explorer-rail", () => {
			h3(selected ? "Inside " + selected.title : "Variants");
			rail(right_items, chain, null,
				selected ? "No variants yet — this is as deep as this branch goes." : "Pick something on the left first.");
		});
	});

	// DELIVERABLE 7 — the ☰ drawer has no hook this task's fence reaches to add a
	// page's own content to it (ext/drawer's tabs are a fixed, registered list —
	// see the final report), so the properties live here instead, as the brief's
	// own fallback says to.
	if (selected) properties(selected);
}

// The breadcrumb — one link per level, so "go up" is always one click, and it is
// itself the way this page proves every step has a real url.
function crumbs(chain){
	div.c("std-explorer-crumbs", () => {
		a.c("std-explorer-crumb").href(BASE).append(() => { icon("view_carousel"); span("Explorer"); });

		let running = [];
		chain.forEach(id => {
			running = [...running, id];
			const node = resolve(running);
			icon("chevron_right");
			a.c("std-explorer-crumb").href(href(running)).append(() => span(node?.title ?? id));
		});
	});
}

// A rail of cards. `base` is the chain to this rail's PARENT, so each item's own
// url is `base + item.id`. `active_id` marks the one that is also the centre.
function rail(items, base, active_id, empty_message){
	if (!items.length) return void p.c("muted", empty_message);

	div.c("std-explorer-cards", () => items.forEach(item =>
		card(item, [...base, item.id], item.id === active_id)));
}

// ONE CARD — a picture, its title, and (a category has no page of its own) how
// many things are inside. The whole card is the link; a wire or an iframe inside
// it never receives the click (explorer.css turns off pointer-events on both).
function card(item, chain, active){
	return a.c("std-explorer-card" + (active ? " is-active" : "")).href(href(chain)).append(() => {
		picture(item, false);
		div.c("std-explorer-card-label", () => {
			span.c("std-explorer-card-title", item.title);
			if (item.children?.length) span.c("std-explorer-card-count", String(item.children.length) + " inside");
		});
	});
}

// THE CENTRE — the selected node, large: its real page, or the layout standard's
// own drawing when this id is a wire rather than a built page. `null` (nothing
// selected — the bare /layouts/explorer/ url) is the one caption-only state.
function centre(node){
	if (!node) return void div.c("std-explorer-empty", () => { p.c("muted", "Pick a category on the left to begin."); });

	div.c("std-explorer-centre-head", () => {
		h2(node.title);
		if (node.description) p(node.description);
	});

	if (node.wire || node.url) return void picture(node, true);
	p.c("muted", "This is a category — every real layout in it is one click to the right.");
}

// A DRAWING (this id already has one in layouts.json) or a lazy IFRAME of the real
// page — never a screenshot. `big` only changes loading eagerness and a class the
// CSS sizes differently; the same function draws a thumbnail card and the centre.
function picture(item, big){
	const size = { w: 1920, h: 1080 };
	const cls = "std-explorer-pic" + (big ? " std-explorer-pic-big" : "");

	if (item.wire) return div.c(cls, $pic => {
		load_layouts().then(data => {
			const entry = find_layout(data, item.wire);
			$pic.append(() => { if (entry) new Layout({ wire: entry.wire, id: entry.id }).frame(size); });
		});
	});

	if (item.url) return div.c(cls, () => {
		div.c("std-explorer-frame", () => {
			div.c("std-explorer-draw", () => {
				iframe().attr("src", item.url).attr("title", item.title).attr("loading", big ? "eager" : "lazy");
			});
		}).style({ "--w": size.w, "--h": size.h });
	});

	return div.c(cls + " std-explorer-pic-cat", () => {
		icon("folder_open");
		span(String(item.children?.length ?? 0) + " inside");
	});
}

// DELIVERABLE 7's fallback — title, the real address (or the drawing's id),
// description, child count.
function properties(node){
	div.c("std-explorer-props flow", () => {
		p.c("muted", "Properties — shown here, not in the ☰ drawer: see the final report for why.");
		p(() => { b("Title — "); span(node.title); });
		p(() => { b("Address — "); node.url ? a(node.url).href(node.url) : span("a drawing, /layouts/" + node.wire + "/"); });
		if (node.description) p(() => { b("What it is — "); span(node.description); });
		p(() => { b("Children — "); span(String(node.children?.length ?? 0)); });
	});
}

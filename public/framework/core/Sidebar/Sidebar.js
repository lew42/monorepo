import { View, div, a, span, img, icon, button, is } from "../View/View.js";
import { Page } from "../Page/Page.class.js";
import Tree from "../../ux/Tree/Tree.js";
import Filter from "../../ux/Filter/Filter.js";
import grip from "../../ext/grip/grip.js";

/* css: .mode-btn — the footer restyles the button this module emits. */
import mode from "../App/mode.js";

View.stylesheet(import.meta, "Sidebar.css");

/**
 * Sidebar — [ 🖼 Brand ] over a TREE of links, over a footer that stays put, in a
 * track that never moves when the page beside it scrolls.
 *
 *   new Sidebar({ brand: "Lew42", root: this });                     a live page's whole tree
 *   new Sidebar({ brand: "Lew42", pages: [{ title, url }] });        a flat list (back-compat)
 *
 *   brand / brand_url   text beside the logo, and where it points  (default "/")
 *   logo / logo_url     image url (default: the document's icon), and where it points
 *   root                a real Page — its `children`, walked live and lazily by
 *                       `ux/Tree`, become the rows; folds to whichever branch you
 *                       are on and re-runs Router.mark_links() once they exist
 *   pages               POJO fallback — {title|label, url, icon}, or an entry with
 *                       its own `pages` for a group — converted to the same tree
 *   app                 lets the footer render the colour-scheme toggle
 *   header / footer     passed as a function, REPLACES the method (`footer: null` for none)
 *
 * A search box (`ux/Filter`, search-only) sits above the tree: typing narrows the
 * rows to titles that match, keeping every ancestor of a match visible so the path
 * to it never disappears; clearing the box (or pressing Escape) puts back whichever
 * branches were open before the first keystroke.
 *
 * Resizable by its own right edge, 12rem to half the room, remembered under one
 * localStorage key shared by every Sidebar on the site — it is one piece of
 * persistent chrome, not a per-page setting. Double-click the edge to reset. The
 * gesture itself is `ext/grip`, shared with `/layouts/shell/`'s own rail.
 *
 * Design record: core/Sidebar/readme.md, doc/decisions.md.
 */
export class Sidebar extends View {

	render(){
		this.size(this.store().get({ px: null }).px, false);

		this.$rail = div.c("sidebar-rail", () => {
			this.bar();
			this.menu();
		});

		this.grab();

		this.on("keydown", e => {
			if (e.key === "Escape" && this.hc("open")){
				this.open(false);
				this.$toggle.el.focus();
			}
		});

		window.addEventListener("popstate", () => this.reveal());
	}

	// [ header | ☰ ] — the whole sidebar on a narrow screen, the top strip of it wide
	bar(){
		return div.c("sidebar-bar", () => {
			this.header();
			this.toggle();
		});
	}

	// ⚠ Named header(), not brand(), so it cannot collide with the `brand` property.
	header(){
		return div.c("brand", () => {
			const logo = this.logo ?? Sidebar.favicon();

			if (logo)
				a(() => img().attr("src", logo).attr("alt", ""))
					.href(this.logo_url ?? "/").ac("brand-logo");

			if (this.brand)
				a(this.brand).href(this.brand_url ?? "/").ac("brand-title");
		});
	}

	// Always in the DOM; the media query decides when it shows, so no resize listener.
	toggle(){
		return this.$toggle = button.c("sidebar-toggle", () => {
			span.c("sidebar-toggle-bar");
			span.c("sidebar-toggle-bar");
			span.c("sidebar-toggle-bar");
		})
			.attr("aria-label", "Menu")
			.attr("aria-expanded", "false")
			.click(() => this.open(!this.hc("open")));
	}

	open(on){
		this[on ? "ac" : "rc"]("open");
		this.$toggle.attr("aria-expanded", String(on));
		return this;
	}

	// Filter over nav over footer, one box — so the narrow menu is a single thing to
	// show and hide.
	menu(){
		return div.c("sidebar-menu", () => {
			this.filter();
			this.nav();
			this.footer?.();
		}).on("click", e => e.target.closest("a") && this.open(false));
	}

	// THE FILTER. `ux/Filter`, composed with no segments — this rail has one fact to
	// narrow by (a title), not a category, so the segment row `ux/Filter` would
	// otherwise draw never gets a second button and stays empty. `search_field:
	// "text"` reads straight off a `ux/Tree` node (`{ text, href, children }`), so
	// `filtered()` below can hand the tree's own nodes to the predicate with no
	// reshaping. `changed(predicate)` is the one wire (`ux/Filter/readme.md`) —
	// Filter never touches the tree itself.
	//
	// ⚠ `chrome: false` and `.darken-2` are the two halves of ONE look: the Filter
	// stops drawing its own `.surface.pad` card (a card inside a rail reads as a
	// broken box), and framework's `.darken-2` gives the bar its ground AND the
	// `--field-bg` that turns the field white on it. Neither is a local override —
	// both are words the system owns, so a second UI bar anywhere gets the same pair.
	// The owner's direction, 2026-09-19; Sidebar.css says the rest.
	// ⚠ `-2` (16%), not `-1` (8%), and that was decided by looking at both: at 8% the
	// bar barely read as a band, and the field's own 32% hairline was DARKER than the
	// ground it sat on, which is backwards. At 16% the bar is plainly a bar and the
	// white field is the brightest thing on it, which is the whole point of the pair.
	filter(){
		return this.$filter = new Filter({
			segments: [], chrome: false, search_field: "text", placeholder: "Filter pages…",
			onChange: predicate => this.filtered(predicate),
		}).ac("sidebar-filter darken-2");
	}

	// THE TREE. `root`: the live thing, walked lazily by `ux/Tree` — a branch's
	// children fetch the first time it opens, so a fifty-page section costs one row
	// until you ask. `pages`: the same shape flattened ahead of time, for a caller
	// with no real Page (a demo, a hand-typed list). Either way this is the ONE
	// place rows get built — `group()`/`link()` are gone, `ux/Tree` draws every row.
	nav(){
		return div.c("sidebar-nav", () => {
			if (this.root){
				this.$tree = new Tree({ nodes: [], adapt: true });
				Tree.nodes_of(this.root).then(nodes => this.$tree.draw(nodes))
					.then(() => this.reveal())
					// ⚠ A slow load racing a fast typist: nodes that arrive after the
					// reader has already started filtering would otherwise all show,
					// unfiltered. Re-runs the CURRENT predicate against the just-drawn
					// rows, only when there is one.
					.then(() => this.$filter.needle.trim() && this.filtered(this.$filter.predicate()));
			} else {
				this.$tree = new Tree({ nodes: this.tree_nodes(this.pages), adapt: true });
				this.reveal();
			}
		});
	}

	// THE WIRE. `predicate` is a plain function, fresh from `ux/Filter` — never a DOM
	// read (its own readme's rule). Sidebar owns the two things a tree-filter needs
	// that a generic `Filter` has no idea about: which branches were open before the
	// reader typed anything, and opening the ones that lead to a match so it is not
	// hidden inside a shut branch. `this.$tree.rows` (node → its `ux/Tree` Row view)
	// is `ux/Tree`'s own public map — consumed here, not edited, per this task's fence.
	filtered(predicate){
		if (!this.$tree) return;

		if (this.$filter.needle.trim()){
			this.folded ??= this.fold_state();
			this.apply_filter(this.$tree.nodes, predicate);
		} else if (this.folded){
			this.restore_fold();
		}
	}

	// A row shows if its OWN title matches, or if something under it does — so the
	// path to a hit never disappears and nothing floats with no context above it.
	// Only ever searches into children `ux/Tree` has already LOADED (`is.arr`): an
	// unopened lazy branch's `children` is still a function (core/Page/doc/
	// data-children.md), and asking one to search itself would fetch a whole subtree
	// on every keystroke — it is judged by its own title alone, same as a leaf. Left
	// open for the same reason: a lazy branch that never gets opened can hide a real
	// match forever; there is no cheap fix without `ux/Tree` fetching eagerly, which
	// would cost every OTHER keystroke a network round trip to find out.
	// Returns whether anything under `nodes` is now showing, so the caller one level
	// up knows whether to open ITS OWN branch.
	apply_filter(nodes, predicate){
		let any = false;

		nodes.forEach(node => {
			const deeper = is.arr(node.children) && this.apply_filter(node.children, predicate);
			const show = predicate(node) || deeper;
			const row = this.$tree.rows.get(node);

			row?.[show ? "show" : "hide"]();
			if (deeper) row.item.open();

			any = any || show;
		});

		return any;
	}

	// One snapshot, taken the moment the reader's FIRST keystroke starts a search —
	// every row's own open/closed fact. `??=` in `filtered()` is what keeps this from
	// overwriting itself on the second keystroke, so what comes back on clear is
	// always "how it looked before you typed anything," never "a moment ago."
	fold_state(){
		const state = new Map();
		this.$tree.rows.forEach((row, node) => state.set(node, row.item.opened()));
		return state;
	}

	// Every row back on screen, every branch back to the fact this took down.
	restore_fold(){
		this.$tree.rows.forEach((row, node) => {
			row.show();
			row.item[this.folded.get(node) ? "open" : "close"]();
		});
		this.folded = null;
	}

	// One entry → one Tree node. A group (an entry with its own `pages`) becomes a
	// branch with no `href` — a heading you can fold, not a link, same as today.
	// ⚠ `ux/Tree` has no idea a page can be `leaf: true` (core/Page/doc/data-children.md)
	// — it would draw a leaf section as an expandable branch instead of the flat link
	// `sections()` gives it today. Not fixable here: `ux/Tree` is consumed, not edited.
	tree_nodes(pages){
		return (pages || []).map(page => ({
			text: page.label ?? page.title,
			href: page.pages ? undefined : page.url,
			icon: page.icon ? () => icon(page.icon) : undefined,
			children: page.pages ? this.tree_nodes(page.pages) : undefined,
		}));
	}

	// Cold load: open the branches down to the page you are ON — its siblings and
	// its own children — so a five-level site reads as a short list from the first
	// paint, not only after a click inside the tree. `Router.mark_links()` has
	// usually already run and missed these rows (they did not exist yet, ⚠ doc's
	// own "Watch out"); this re-runs it once they do. Walking further than 10 levels
	// never happens on this site; the cap is only so a bad match can't loop forever.
	async reveal(){
		const here = this.app?.router?.active?.url ?? location.pathname;
		let nodes = this.$tree.nodes, last = null;

		for (let depth = 0; depth < 10; depth++){
			const node = nodes.find(n => n.href ? here.startsWith(n.href) : this.under(n, here));
			if (!node) break;

			last = node;
			if (here === node.href) break;

			const item = this.$tree.rows.get(node)?.item;
			if (!item?.kids) break;

			await item.open().growing;
			nodes = is.arr(node.children) ? node.children : [];
		}

		this.$tree.adapt_to(last);
		this.app?.router?.mark_links();
	}

	// A `pages:` GROUP (`tree_nodes()`) has no `href` of its own — it is a heading,
	// not a page — so `reveal()` can't tell by prefix whether `here` is inside it.
	// This is the one-level lookahead that answers instead: does it hold a child
	// (grandchild, in `sections()`'s two-level shape) whose OWN href matches?
	// ⚠ Only ever asked of an already-resolved array — a `root:` tree never reaches
	// here, because a real Page's node always carries its own href (Tree.node_of()).
	under(node, here){
		return is.arr(node.children) && node.children.some(c => (c.href && here.startsWith(c.href)) || this.under(c, here));
	}

	// The pinned strip under the nav. `mode()` styles `app.$app`, so the toggle is
	// quietly absent when the sidebar wasn't given an app.
	// ⚠ No `$mode` handle — doc/views.md measured it assigned and never read, same
	// as `$bar`/`$menu` above (gone now that `bar()`/`menu()` return their box
	// directly); this adopts that recommendation while the file was already open.
	footer(){
		return div.c("sidebar-footer", () => {
			if (this.app) mode(this.app);
			div.c("sidebar-avatar").attr("title", "Account");
		});
	}

	// THE HANDLE. `ext/grip`, shared with `/layouts/shell/`'s own rail (this file's
	// copy and Shell's merged into it, 2026-09-18) — pointer capture, so the drag
	// survives leaving the strip, and a double-click resets. `write` sets the token
	// only (`false` — see `size()`); `done` saves the ONE width the pointer let go of,
	// not every frame of the drag. The clamp lives in CSS
	// (`clamp(12rem, var(--sidebar-w), 50%)`), never here, so it stays right when the
	// WINDOW changes size mid-drag rather than the width that was last asked for.
	// `from: "start"` — this rail is docked at the screen's start and drags its own
	// INLINE-END edge (`ext/grip/readme.md`'s whole point about `from`).
	grab(){
		return grip({
			from: "start",
			write: px => this.size(px, false),
			done: width => this.store().patch({ px: width }),
			reset: () => this.size(null),
		});
	}

	// The width, in one place: sets the token, remembers it. `null` (double-click,
	// or nothing ever saved) removes the override and CSS's own default — 20em,
	// doc/decisions.md says why — answers instead.
	// ⚠ `setProperty(prop, "")` REMOVES the declaration (Shell.js's own note) —
	// that is what makes `size(null)` a true reset rather than a stored "no value".
	size(px, save = true){
		const width = px ? Math.round(px) : null;

		this.style("--sidebar-w", width ? width + "px" : "");
		if (save) this.store().patch({ px: width });

		return width;
	}

	// One key, shared by every Sidebar on the site: it is one piece of persistent
	// chrome, not a per-page setting, so resizing it on one topic remembers for all
	// of them. `Page.store()` is keyed on a PAGE's own url; `id: "sidebar"` is the
	// seam `Page.Store` gained for exactly this (merged 2026-09-18, doc/decisions.md)
	// — the same `lew42:sidebar` key this file always wrote, now with no second
	// copy of the read/write/JSON-parse/catch it takes to get there.
	store(){ return new Page.Store({ id: "sidebar" }); }

	// The document already declares the site's icon; don't hardcode an asset path.
	static favicon(){
		return document.querySelector('link[rel~="icon"]')?.href;
	}
}

export default Sidebar;

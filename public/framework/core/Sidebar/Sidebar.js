import { View, div, a, span, img, icon, button, is } from "../View/View.js";
import { Page } from "../Page/Page.class.js";
import Tree from "../../ux/Tree/Tree.js";
import Filter from "../../ux/Filter/Filter.js";
import grip from "../../ext/grip/grip.js";

/* css: .mode-btn — the footer restyles the button this module emits. */
import mode from "../App/mode.js";

View.stylesheet(import.meta, "Sidebar.css");

// Design and architecture: doc/sidebar-notes.md, doc/decisions.md
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

	bar(){
		return div.c("sidebar-bar", () => {
			this.header();
			this.toggle();
		});
	}

	// ⚠ header(), not brand(), to avoid colliding with brand property
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

	menu(){
		return div.c("sidebar-menu", () => {
			this.filter();
			this.nav();
			this.restore_query();
			this.footer?.();
		}).on("click", e => e.target.closest("a") && this.open(false));
	}

	// Filter setup: doc/sidebar-notes.md. ⚠ chrome: false + .darken-2 are one pair
	filter(){
		const f = this.$filter = new Filter({
			segments: [], chrome: false, search_field: "text", placeholder: "Filter pages…",
			onChange: predicate => this.filtered(predicate),
		}).ac("sidebar-filter darken-2");
		f.$field.on("keydown", e => this.arrow(e, "field"));
		return f;
	}

	// A reload keeps the query: `?q=` goes back into the box and runs.
	restore_query(){
		const q = new URLSearchParams(location.search).get("q");
		if (!q) return;
		this.$filter.$field.el.value = q;
		this.$filter.query(q);
	}

	// Tree navigation: doc/sidebar-notes.md
	nav(){
		return div.c("sidebar-nav", () => {
			if (this.root){
				this.$tree = new Tree({ nodes: [], adapt: true });
				this.$drawn = Tree.nodes_of(this.root).then(nodes => this.visible_nodes(this.root, nodes)).then(nodes => this.$tree.draw(nodes))
					.then(() => this.reveal())
					// ⚠ A slow load racing a fast typist: nodes that arrive after the
					// reader has already started filtering would otherwise all show,
					// unfiltered. Re-runs the CURRENT predicate against the just-drawn
					// rows, only when there is one.
					.then(() => this.$filter.needle.trim() && this.filtered(this.$filter.predicate()));

				// A `tab`/`file`/`settings` line anywhere in the tree bubbles up
				// through `nav_redraw()` (ext/tabs/tabs.js) to the ROOT page — the
				// only page every bubble reaches — so registering here, once, is
				// how the rail hears about ANY of them with no reload (2026-09-29
				// fix round, finding 5). Cheap even though it rebuilds from the
				// top: `ux/Tree` only ever re-fetches a branch a reader had opened.
				(this.root._tab_redraws ??= new Set()).add(() => this.refresh_nav());
			} else {
				this.$tree = new Tree({ nodes: this.tree_nodes(this.pages), adapt: true });
				this.reveal();
			}
			this.results();
		});
	}

	// Tree update: doc/sidebar-notes.md. ⚠ draw() then reveal(); order matters
	refresh_nav(){
		if (!this.$tree) return;
		Tree.nodes_of(this.root).then(nodes => this.visible_nodes(this.root, nodes)).then(nodes => this.$tree.draw(nodes))
			.then(() => this.reveal());
	}

	// Visibility rules and filters: doc/sidebar-notes.md
	// ⚠ ASYNC for cold-load race; ⚠ Tree nodes by index; ⚠ Deeper branches open lazily
	async visible_nodes(page, nodes){
		const visible = await Promise.all(nodes.map(node => page.nav_ready(node.name)));   // by name: a leaf's `pinned` list is a subset of its children

		return nodes
			.filter((node, i) => visible[i])
			.map(node => !node.children ? node : {
				...node,
				children: () => Promise.resolve(node.children()).then(kids => this.visible_nodes(node.page, kids)),
			});
	}

	// Search index: doc/sidebar-notes.md
	filtered(predicate){
		if (!this.$tree) return;
		const q = this.$filter.needle.trim();

		this.remember(q);
		this.$tree.el.style.display = q ? "none" : "";
		this.$results.el.style.display = q ? "" : "none";
		if (!q) return;

		const ask = this.asked = {};
		this.$results.el.textContent = "Searching…";
		this.index().then(list => {
			if (this.asked !== ask) return;                 // a newer keystroke won
			this.show_results(this.ranked(list.filter(predicate), q));
		});
	}

	remember(q){
		const url = new URL(location.href);
		q ? url.searchParams.set("q", q) : url.searchParams.delete("q");
		history.replaceState(history.state, "", url);
	}

	index(){
		return this._index ??= (async () => {
			const out = [], seen = new Set();
			const walk = async (nodes, trail) => {
				await Promise.all(nodes.map(async node => {
					// Once per url, and only urls that stay under their parent (a page whose child resolves back up the tree would loop).
					if (node.href && (seen.has(node.href) || node.href.includes("//"))) return;
					if (node.href) seen.add(node.href);
					if (node.href) out.push({ text: node.text, href: node.href, trail: trail.join(" › ") });
					let kids = is.fn(node.children) ? await node.children() : node.children;
					// A `leaf: true` page (ui/, ...) draws flat in the rail but its declared children are still pages; data-fed ones (ai/ days) stay out.
					// ⚠ Every child, even when the leaf draws a few `pinned` ones: the filter still finds the rest.
					if (node.page?.leaf && node.page.children.size && !node.page.child_source)
						kids = await this.visible_nodes(node.page, await Tree.nodes_of(node.page));
					if (is.arr(kids)) await walk(kids, [...trail, node.text]);
				}));
			};
			await this.$drawn;                               // the first level exists only once drawn
			await walk(this.$tree.nodes, []);
			return out;
		})();
	}

	ranked(list, q){
		const n = q.toLowerCase(), depth = h => h.split("/").filter(Boolean).length;
		const score = h => { const t = h.text.toLowerCase(); return t === n ? 0 : t.startsWith(n) ? 1 : t.includes(n) ? 2 : 3; };
		return [...list].sort((a, b) => score(a) - score(b) || depth(a.href) - depth(b.href) || a.text.localeCompare(b.text));
	}

	show_results(list){
		const box = this.$results.el;
		box.textContent = "";
		if (!list.length){ box.textContent = "No page matches."; return; }

		for (const hit of list.slice(0, 100)){
			const link = document.createElement("a");
			link.href = hit.href;
			link.className = "sidebar-result";
			link.innerHTML = "<b></b><small></small>";
			link.firstChild.textContent = hit.text;
			link.lastChild.textContent = hit.trail;
			box.append(link);
		}
	}

	results(){
		return this.$results = div.c("sidebar-results")
			.style("display", "none")
			.on("click", e => {
				if (!e.target.closest("a")) return;
				setTimeout(() => { this.$filter.clear_query(); this.reveal(); }, 0);
			})
			.on("keydown", e => this.arrow(e, "results"));
	}

	arrow(e, from){
		const links = [...this.$results.el.querySelectorAll("a")];
		const i = links.indexOf(document.activeElement);
		if (e.key === "ArrowDown") links[i + 1]?.focus();
		else if (e.key === "ArrowUp") (i > 0 ? links[i - 1] : this.$filter.$field.el).focus();
		else if (e.key === "Enter" && from === "field") links[0]?.click();
		else return;
		e.preventDefault();
	}

	// ⚠ leaf: true not in ux/Tree; it's consumed, not edited
	tree_nodes(pages){
		return (pages || []).map(page => ({
			text: page.label ?? page.title,
			href: page.pages ? undefined : page.url,
			icon: page.icon ? () => icon(page.icon) : undefined,
			children: page.pages ? this.tree_nodes(page.pages) : undefined,
		}));
	}

	// Cold load: open branches to current page. ⚠ mark_links() may have missed new rows
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

	// Group lookahead: does it hold a child whose href matches?
	// ⚠ Only asked of already-resolved arrays; root trees have href always
	under(node, here){
		return is.arr(node.children) && node.children.some(c => (c.href && here.startsWith(c.href)) || this.under(c, here));
	}

	// Footer with mode toggle. ⚠ No $mode handle; doc/views.md measured it unused
	footer(){
		return div.c("sidebar-footer", () => {
			if (this.app) mode(this.app);
			div.c("sidebar-avatar").attr("title", "Account");
		});
	}

	// Resize grip: doc/sidebar-notes.md. Clamp lives in CSS, not code
	grab(){
		return grip({
			from: "start",
			write: px => this.size(px, false),
			done: width => this.store().patch({ px: width }),
			reset: () => this.size(null),
		});
	}

	// Width in one place. ⚠ setProperty("", "") removes the declaration, true reset
	size(px, save = true){
		const width = px ? Math.round(px) : null;

		this.style("--sidebar-w", width ? width + "px" : "");
		if (save) this.store().patch({ px: width });

		return width;
	}

	// One shared persistent key for all Sidebars
	store(){ return new Page.Prefs({ id: "sidebar" }); }

	static favicon(){
		return document.querySelector('link[rel~="icon"]')?.href;
	}
}

export default Sidebar;

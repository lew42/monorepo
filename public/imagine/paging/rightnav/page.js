import { Page, View, div, a, span, icon, p, h2, button, md, is } from "/app.js";
import { NS } from "../words.js";

View.stylesheet(import.meta, "rightnav.css");

/* SwapPage — the escape core/Page/doc/columns.md documents: `/imagine/` is a
   columns HOST, and `column_host()` finds the SHALLOWEST columnar ancestor, so
   every descendant renders as a column of that ONE outer row unless it draws its
   own view (imagine/shells/Shell.js is the precedent, overriding render()). A row
   of THIS tree's children must not become more columns — a leaf is content that
   SWAPS into the root's own centre box. Only render() is overridden; container()
   is left alone — the default walk-up-the-parent-chain already finds the root's
   `$pages` (set in centre(), below), at any depth. */
class SwapPage extends Page {
	render(){
		return this.view ??= div.c("page flow", () => {
			if (this.title) h2(this.title);
			return is.fn(this.content) ? this.content() : this.content;
		}).ac(this.name && "page--" + this.name);
	}
}

/* Three sizes the deliverable asks for (s/m/xl), plus two grouped under "Guides"
   to prove a nested branch expanding in place. Real pages, real urls — `group` is
   the same field previews() already reads for a heading run. */
const LEAVES = [
	{ name: "word", title: "Word", icon: "short_text", group: null,
		content(){ p.c("paging-line", "One line — the smallest a page can say."); } },

	{ name: "paragraph", title: "Paragraph", icon: "notes", group: null,
		content(){ p("A paragraph of real prose, so switching means more than a label change — the tree beside it never moved; only this box's content did."); } },

	{ name: "wall", title: "Wall", icon: "grid_view", group: null,
		content(){
			div.c("paging-wall wide", () => {
				for (let n = 1; n <= 12; n++)
					div.c("paging-brick", () => {
						span.c("paging-brick-n", String(n).padStart(2, "0"));
						p("A wall — the content that earns a wide box.");
					});
			});
		} },

	{ name: "contract", title: "Contract", icon: "gavel", group: "Guides",
		content(){ p("A `.page` is hidden unless it is marked — the same arrangement contract this tree's centre reads to swap in whichever leaf is active."); } },

	{ name: "seams", title: "Seams", icon: "push_pin", group: "Guides",
		content(){ p("This tree never redraws on a swap — only the centre's child changes, because the tree lives outside the region the router touches."); } },
];

const VARIANTS = { width: ["narrow", "wide"], side: ["right", "left"], placement: ["inside", "outside"] };

export default new Page({
	meta: import.meta,
	title: "Right nav",
	description: "A persistent tree on the right; the centre swaps to whatever you clicked, and the tree never moves.",
	icon: "view_sidebar",
	width: "full",
	index: true,

	/* ⚠ THE REALM'S ONE STORAGE NAMESPACE, claimed by hand. This page is a plain
	     `Page`, so it does not inherit `Paging.store()`'s stamp — without this line
	     its three variant picks land at `lew42:/imagine/paging/rightnav/`, OUTSIDE
	     `lew42:paging:`, and the hub's RESET would leave them behind while claiming
	     to have cleared them. doc/persistence.md. */
	initialize(){ this.store_key = NS + this.url; },

	children: LEAVES.map(leaf => new SwapPage({
		name: leaf.name, title: leaf.title, icon: leaf.icon, group: leaf.group, content: leaf.content,
	})),

	// ════ THE SYSTEM ═══════════════════════════════════════════════════════════

	content(){
		md("**A tree that stays put on the right, and a centre that swaps to whatever you click in it.** The tree never redraws and never moves — only the middle changes. The chips below try the variants (narrow or wide, left or right, inside a card or on the floor) without needing more pages.").ac("paging-lede");

		this.mode = this.store().get({ width: "narrow", side: "right", placement: "inside", open: [] });

		// A deep link into a grouped leaf arrives with its branch already open.
		const active = this.app?.router?.active;
		if (active?.group && !this.mode.open.includes(active.group))
			this.mode.open = [...this.mode.open, active.group];

		this.toolbar();

		div.c("paging-rightnav", $outer => {
			this.$outer = $outer;
			div.c("paging-rightnav-inner", $inner => {
				this.$inner = $inner;
				div.c("paging-rightnav-body", $body => {
					this.$body = $body;
					this.centre();
					this.tree();
				});
			});
		});

		this.apply_mode();
	},

	// ── the centre: a plain box a real page mounts into, by url ────────────────
	centre(){
		const $centre = this.$centre = div.c("paging-rightnav-centre");

		const first = this.children.values().next().value?.assign({ app: this.app });
		if (first) $centre.append(first.render().ac("default"));

		this.app?.router?.mark_links();
		return $centre;
	},

	// ⚠ /imagine/ is a columns HOST and `column_host()` finds ME too (the shallowest
	//   columnar ancestor wins, doc/columns.md) — so core's OWN render_column() runs
	//   for this page, and it unconditionally OVERWRITES `this.$pages` right after
	//   `content()` returns (its own default-column mechanism). `container()`'s
	//   walk-up reads `page.$pages` on every ancestor, so a clobbered field would
	//   send every leaf here into core's `page-column-pages` box instead of mine —
	//   measured: `.page--paragraph` landed there, never inside `.paging-rightnav-
	//   centre` (2026-09-04). Calling through and re-asserting `$centre` after is
	//   the whole fix; `super` is unavailable here (`Page` is a plain config
	//   object, not a subclass), so this calls the prototype method directly.
	render(){
		const view = Page.prototype.render.call(this);
		if (this.$centre) this.$pages = this.$centre;
		return view;
	},

	// ── the tree: persistent, never rebuilt by a swap ───────────────────────────
	tree(){
		return div.c("paging-rightnav-tree", $tree => {
			this.$tree = $tree;
			this.rows();
		});
	},

	rows(){
		const drawn = new Set();

		[...this.children.values()].forEach(child => {
			if (!child.group) return this.leaf(child);
			if (drawn.has(child.group)) return;
			drawn.add(child.group);
			this.branch(child.group, [...this.children.values()].filter(c => c.group === child.group));
		});
	},

	// A real link — Router.mark_links() keeps `.active`/`.in-path` in step on
	// every navigation, so "current" costs nothing extra here.
	leaf(child){
		const nav = this.nav_for(child.name);

		return a.c("paging-item").href(nav.url).append(() => {
			if (nav.icon) icon(nav.icon);
			span.c("paging-item-words", nav.label);
			icon("swap_horiz").ac("paging-sign");
		});
	},

	// `expand` — opens BELOW, in place; nothing else moves. Pure disclosure, no
	// url of its own, so it never competes with a leaf's own swap.
	branch(name, items){
		const open = this.mode.open.includes(name);

		return div.c("paging-rightnav-branch", () => {
			button.c("paging-item").attr("aria-expanded", String(open)).append(() => {
				icon("folder");
				span.c("paging-item-words", name);
				icon("expand_more").ac("paging-sign", open && "paging-rightnav-open");
			}).click(() => this.toggle_branch(name));

			if (open) div.c("paging-panel", () => items.forEach(child => this.leaf(child)));
		});
	},

	toggle_branch(name){
		this.mode.open = this.mode.open.includes(name)
			? this.mode.open.filter(n => n !== name)
			: [...this.mode.open, name];

		this.store().set(this.mode);
		this.$tree?.empty(() => this.rows());
	},

	// ── the mode toolbar: three axes, remembered by url ─────────────────────────
	toolbar(){
		return this.$toolbar = div.c("paging-toolbar", () => this.chips());
	},

	chips(){
		Object.entries(VARIANTS).forEach(([axis, values]) => {
			div.c("paging-group", () => {
				span.c("paging-axis", axis);
				values.forEach(value => this.chip(axis, value));
			});
		});
	},

	chip(axis, value){
		const on = this.mode[axis] === value;

		return button.c("paging-chip").ac(on && "on").attr("aria-pressed", String(on))
			.append(() => span(value))
			.click(() => this.pick(axis, value));
	},

	pick(axis, value){
		this.mode[axis] = value;
		this.store().set(this.mode);
		this.$toolbar?.empty(() => this.chips());
		this.apply_mode();
	},

	// The one seam every chip click and the initial paint both run through.
	apply_mode(){
		const { width, side, placement } = this.mode;

		this.$outer?.rc("paging-card").ac(placement === "inside" && "paging-card");
		this.$inner?.rc("paging-box").ac(placement === "inside" && "paging-box");

		this.$body
			?.style("--paging-rightnav-w", width === "wide" ? "22em" : "14em")
			.rc("side-left").ac(side === "left" && "side-left");
	},
});

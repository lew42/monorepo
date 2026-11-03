import { Page, div, p, md } from "/app.js";

// Container: data/'s row. Size: `large` — three panes side by side. Own layout:
// a hand-built master/master/detail, `bleed` to the column's edge. Regions: one.
// Selection (`treeGroup`, `treeItem`) is LOCAL state — no url, nothing to bookmark.
// ⚠ Named away from the bare `group` core's `previews()` already reads as a
//   category label (doc/method) — a field named `group` would only collide if some
//   ancestor ever called `previews()` over this page, but the name is free either way.

export default new Page({
	meta: import.meta,
	title: "Tree",
	description: "Type, then building, then its facts — three panes, one selection each.",
	icon: "account_tree",
	width: "large",

	treeGroup: null,
	treeItem: null,

	content(){
		md("Pick a type, then a building. The third pane is its detail.");

		const $tree = div.c("feeds-tree bleed flex");

		const draw = () => $tree.empty(() => {
			const rows = this.parent.filtered();

			if (rows === null) return p.c("muted", "Loading…");
			if (!rows.length) return p.c("muted", "Nothing matches.");

			const groups = [...new Set(rows.map(r => r.type))].sort();
			if (!groups.includes(this.treeGroup)) this.treeGroup = groups[0];

			const items = rows.filter(r => r.type === this.treeGroup);
			if (!items.some(r => r.name === this.treeItem)) this.treeItem = items[0]?.name ?? null;

			const detail = items.find(r => r.name === this.treeItem);

			div.c("feeds-tree-col", () => {
				div.c("feeds-tree-head", `Type (${groups.length})`);
				groups.forEach(g => div.c("feeds-tree-row").ac(g === this.treeGroup && "feeds-tree-on")
					.text(g).on("click", () => { this.treeGroup = g; this.treeItem = null; draw(); }));
			});

			div.c("feeds-tree-col", () => {
				div.c("feeds-tree-head", `Building (${items.length})`);
				items.forEach(r => div.c("feeds-tree-row").ac(r.name === this.treeItem && "feeds-tree-on")
					.text(r.name).on("click", () => { this.treeItem = r.name; draw(); }));
			});

			div.c("feeds-tree-col", () => {
				div.c("feeds-tree-head", "Detail");
				if (!detail) return void div.c("feeds-tree-empty", "Pick a building.");
				div.c("feeds-tree-detail", () => {
					p(detail.name);
					p(detail.place);
					p(detail.year + " · " + detail.height_m + "m");
					p(detail.architect);
				});
			});
		});

		this.parent.watch(draw);

		md("**Verdict:** three panes and two fields of local state — cheaper than three more real pages for a selection nobody needs to link to.");
	},
});

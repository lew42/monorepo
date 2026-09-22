import { Page, md, demo, div, span, input, ul, li, a } from "/app.js";

/* Static markup only — the SHAPE the `.ui-tree-*` CSS styles, baked from `open` /
 * `selected` in the data. No click listeners: expand/collapse and select are
 * `ux/Tree`'s job now (`content()` below, "The behavior graduated"). */
const row_list = list => list.forEach(node => {
	const kids = node.children?.length > 0;

	li.c("ui-tree-item" + (kids && node.open ? " ui-tree-open" : ""), () => {
		const row_tag = !kids && node.href ? a : div;

		const $row = row_tag.c("ui-tree-row" + (node.selected ? " ui-tree-selected" : ""), () => {
			span.c("ui-tree-toggle", kids ? "▸" : "");
			span.c("ui-tree-icon", $icon => { if (node.icon != null) $icon.append(node.icon); });
			span.c("ui-tree-text", node.text);
		});

		if (!kids && node.href) $row.href(node.href);
		if (kids) ul.c("ui-tree-children", () => row_list(node.children));
	});
});

const static_tree = (nodes, indent) => {
	const $root = ul.c("ui-tree").style("--ui-tree-indent", indent ?? "1.25em");
	return $root.append(() => row_list(nodes));
};

// 1. Navigation — the framework's own map. `core` open, `ext` closed — baked into
// the data now, not toggled by a click. Only leaves with `href` still navigate.
const nav_nodes = [
	{ icon: "▣", text: "core", open: true, children: [
		{ icon: "▪", text: "View", href: "/framework/core/View/" },
		{ icon: "▪", text: "Page", href: "/framework/core/Page/" },
	]},
	{ icon: "▣", text: "ext", children: [
		{ icon: "▪", text: "Doc", href: "/framework/ext/Doc/" },
		{ icon: "▪", text: "demo", href: "/framework/ext/demo/" },
	]},
	{ icon: "▣", text: "ui", href: "/framework/ui/" },
];
const sitemap = () => static_tree(nav_nodes, "1.25em");

// 2. Layers — a Figma-like stack, some rows with no icon. `Box 3` is marked
// `selected` in the data, to show what `.ui-tree-selected` looks like.
const box1 = { text: "Box 1", path: "Frame / Flex / Box 1" };
const box2 = { text: "Box 2", path: "Frame / Flex / Box 2" };
const box3 = { icon: "▪", text: "Box 3", path: "Frame / Flex / Box 3", selected: true };
const flexbox = { icon: "▤", text: "Flex", open: true, path: "Frame / Flex", children: [box1, box2, box3] };
const frame = { icon: "▣", text: "Frame", open: true, path: "Frame", children: [flexbox] };

const layers = () => {
	static_tree([frame], "1.25em");
	div.c("muted", box3.path + " — baked selected, not clicked");
};

// 3. The indent knob — a range input writing `--ui-tree-indent` live. Pure CSS
// custom-property write, so it needs no behavior from the retired `tree()`.
const knob = () => {
	const $t = static_tree(nav_nodes, "1.25em");
	div.c("flex v-center gap", () => {
		span.c("muted", "--ui-tree-indent");
		let $out;
		input().attr("type", "range").attr("min", "0.5").attr("max", "3").attr("step", "0.25").attr("value", "1.25")
			.on("input", function(){ $t.style("--ui-tree-indent", this.el.value + "em"); $out.text(this.el.value + "em"); });
		$out = span.c("muted", "1.25em");
	}).style("--gap", "0.5em");
};

export default new Page({
	meta: import.meta,
	title: "Tree",
	description: "Icon + text rows, indented once per nesting level — a sidebar for layers, navigation, anything with children.",
	icon: "account_tree",

	children: [
		demo.page("layers", layers, {
			note: "A branch is selectable too — a Frame layer is still a layer, which is why `.ui-tree-selected` isn't reserved for leaves. `Box 1` and `Box 2` carry no `icon`, and the icon slot reserves its width anyway so `Box 3`'s text lines up with theirs. `Box 3` is baked selected in the data here — a click doing that live is `ux/Tree`'s job." }),

		demo.page("knob", knob, {
			note: "`--ui-tree-indent` is a plain custom property on the root `<ul>`, read by every nested `.ui-tree-children` — the knob just writes it. The second `indent` argument sets the same thing once, at build time." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(sitemap, steer).ac("bleed"),
			def: sitemap,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**`core` and `ext` are branches, not links** — `core` renders open, `ext` closed, baked into the data. `View`, `Page`, `Doc` and `demo` are leaves with an `href`, so those still navigate. `ui` is a leaf with no children at all. Click-to-select and click-to-expand are `ux/Tree`'s job now.",
		});

		md("## The behavior graduated, then retired here");

		md("This is the **template**: the `.ui-tree-*` rules above, and the markup they shape. `ui/tree` was the one component of twenty that also held *state* — a rows Map and a selection kept across renders, two click listeners, an `update()`/`select()` lifecycle — all in a closure, which is a class written in the one shape nothing can subclass. On 2026-08-21 that half became [`class Tree`](/framework/ux/Tree/), with keyboard roving as a named subclass beside it. **New code takes the class.**");

		md("**The CSS did not move, and that is the rule.** A rule about a relationship or a state is exactly what `ui/` is for, and a `ux` that took the stylesheet would fork the look the day this one changed — so the class wears these same classes. The `tree()` function stayed byte-compatible while `ext/Playground` still called it, and retired the same day that caller moved to `ux/Tree` — this page now hand-writes the same markup instead. [`doc/decisions.md`](./doc/decisions.md) has the split argued, and [`ux/`](/framework/ux/) has the rule it followed.");

		md("## Nesting, not a depth counter");

		md("Each level is a real nested `<ul>`, and every `.ui-tree-children` adds one `--ui-tree-indent` of its own padding — depth 3 sits behind three paddings, not a computed `depth × indent`. `Tree.draw(nodes)` (the class) empties the root and rebuilds, so a stale depth can't drift from the data. Full reasoning, and where the icon and toggle slots came from, in [`doc/decisions.md`](./doc/decisions.md).");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", sitemap)); },
});

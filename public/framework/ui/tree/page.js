import { Page, md, demo, div, span, input } from "/app.js";
import { tree } from "./tree.js";

// 1. Navigation — the framework's own map. Branches select; only leaves link.
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
const sitemap = () => tree(nav_nodes, { indent: "1.25em" });

// 2. Layers — a Figma-like stack, some rows with no icon. Every row is selectable,
// branch or leaf, and the selected one's path prints below.
const box1 = { text: "Box 1", path: "Frame / Flex / Box 1" };
const box2 = { text: "Box 2", path: "Frame / Flex / Box 2" };
const box3 = { icon: "▪", text: "Box 3", path: "Frame / Flex / Box 3" };
const flexbox = { icon: "▤", text: "Flex", open: true, path: "Frame / Flex", children: [box1, box2, box3] };
const frame = { icon: "▣", text: "Frame", open: true, path: "Frame", children: [flexbox] };

const layers = () => {
	let $out;
	tree([frame], { onSelect: node => $out.text(node.path) });
	$out = div.c("muted", "Nothing selected.");
};

// 3. The indent knob — a range input writing `--ui-tree-indent` live.
const knob = () => {
	const $t = tree(nav_nodes, {});
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
			note: "Every row is selectable, **branch or leaf** — a Frame layer is still a layer. `Box 1` and `Box 2` carry no `icon`, and the icon slot reserves its width anyway so `Box 3`'s text lines up with theirs. The path below is the demo's own bookkeeping, not part of the component." }),

		demo.page("knob", knob, {
			note: "`--ui-tree-indent` is a plain custom property on the root `<ul>`, read by every nested `.ui-tree-children` — the knob just writes it. `opts.indent` sets the same thing once, at build time." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(sitemap, steer).ac("bleed"),
			def: sitemap,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**`core` and `ext` are branches, not links** — click the row to select, click the `▸` to expand. `View`, `Page`, `Doc` and `demo` are leaves with an `href`, so those navigate. `ui` is a leaf with no children at all.",
		});

		md("## Nesting, not a depth counter");

		md("Each level is a real nested `<ul>`, and every `.ui-tree-children` adds one `--ui-tree-indent` of its own padding — depth 3 sits behind three paddings, not a computed `depth × indent`. `t.update(nodes)` empties the root and rebuilds, so a stale depth can't drift from the data. Full reasoning, and where the icon and toggle slots came from, in [`doc/decisions.md`](./doc/decisions.md).");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", sitemap)); },
});

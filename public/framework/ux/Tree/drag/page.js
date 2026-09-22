import { Page, md, div, span, pre, icon } from "/app.js";
import Tree from "../Tree.js";

/* Same builders as the parent page — built fresh per call, because `move()` mutates
 * this array in place and a Page caches its view. */
const dir = (text, children, open) => ({ icon: () => icon("folder"), text, open, children });
const file = (text, glyph) => ({ icon: () => icon(glyph), text });

const project = () => [
	dir("src", [
		file("index.js", "code"),
		file("app.js", "code"),
		dir("components", [ file("Button.js", "code"), file("Card.js", "code") ], true),
	], true),
	dir("docs", [ file("readme.md", "article") ]),
	file("package.json", "data_object"),
];

/* The array holding `node` and its owning node (null at the root) — the four lines
 * every consumer of `move()` writes, shown rather than hidden. */
const locate = (nodes, node, parent = null) => {
	if (nodes.includes(node)) return { array: nodes, parent };

	for (const n of nodes){
		const found = n.children && locate(n.children, node, n);
		if (found) return found;
	}
	return null;
};

const dragdemo = () => {
	const nodes = project();
	let $tree, $log;

	// THE ONE WIRE. The tree reports where a row landed; this does the splice. `index`
	// is already counted WITHOUT the dragged node in it, so nothing here corrects for
	// its own shift — and the tree itself never touched `nodes`.
	const move = ({ node, into, index }) => {
		const { array } = locate(nodes, node);

		array.splice(array.indexOf(node), 1);
		(into ? (into.children ??= []) : nodes).splice(index, 0, node);

		$tree.rows.forEach(($row, n) => n.open = $row.item.opened());
		$tree.draw(nodes);
		$log.text(JSON.stringify({ node: node.text, into: into?.text ?? null, index }, null, 1));
	};

	return div.c("flex wrap gap", () => {
		div.c("rail surface pad", () => { $tree = new Tree({ nodes, drag: true, onMove: move }); });

		div.c("flex-1 surface pad flex v gap-50", () => {
			span.c("h4 muted", "move({ node, into, index })");
			$log = pre.c("ux-tree-log", "(drag a row by its grip)");
		});
	});
};

export default new Page({
	meta: import.meta,
	title: "Drag",
	description: "Three targets on every row — above it, inside it, below it — and one event.",

	content(){
		md("Grab a row's **⠿** grip. **A row is three targets, and which one you get is where on it you let go:**");

		md("- its **top edge** — land above it, as its sibling\n- its **middle** — land inside it, as its last child\n- its **bottom edge** — land below it, as its sibling");

		dragdemo();

		md("**The edge is a third of the row, capped at 10px**, so the middle — nesting, which is what a tree is for — is always the biggest of the three. That cap is a measurement, not a taste: the page CMS tried it the other way first, with \"anywhere on a row means inside it\", and the only place left to say *before it* was the 4px gap between two rows. A file that cannot hold children (`holds()` says so) has no middle at all — the row splits in half, so you can still reorder against a leaf.");

		md("**Escape cancels** mid-drag and commits nothing, and a row can never be dropped inside its own descendant. `Tree` reports `move({ node, into, index })` and stops there; the splice above is this page's, in six lines you can read.");

		md.details(import.meta, "../readme.md", "Tree readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => new Tree({ nodes: project(), drag: true }))); },
});

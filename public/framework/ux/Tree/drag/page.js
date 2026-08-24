import { Page, md, div, span, pre, icon } from "/app.js";
import TreeDrag from "../TreeDrag.js";

/* Same two node builders as the parent explorer (Tree/page.js) — built fresh per call,
 * because `moved()` mutates this array in place and a Page caches its view. */
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

/* The array holding `node` and its owning node (null at the root) — the demo mutates
 * with this rather than re-deriving it, so it reads the same as `TreeDrag.js`'s own. */
const locate_parent = (nodes, node, parent = null) => {
	if (nodes.includes(node)) return { array: nodes, parent };

	for (const n of nodes){
		const found = n.children && locate_parent(n.children, node, n);
		if (found) return found;
	}
	return null;
};

const dragdemo = () => {
	const nodes = project();
	let $tree, $log;

	// The one wire, live on the page: TreeDrag reports (node, into, at); the demo does
	// the actual splice — TreeDrag itself never touches `nodes`.
	const moved = (node, into, at) => {
		const { array } = locate_parent(nodes, node);
		array.splice(array.indexOf(node), 1);
		(into ? (into.children ??= []) : nodes).splice(at, 0, node);

		$tree.draw(nodes);
		$log.text(JSON.stringify({ node: node.text, into: into?.text ?? null, at }, null, 1));
	};

	return div.c("flex wrap gap", () => {
		div.c("rail surface pad", () => { $tree = new TreeDrag({ nodes, onMoved: moved }); });

		div.c("flex-1 surface pad flex v gap", () => {
			span.c("h4 muted", "moved(node, into, at)");
			$log = pre.c("ux-tree-drag-log", "(drag a row by its grip)");
		});
	});
};

export default new Page({
	meta: import.meta,
	title: "Drag",
	description: "Drag-reorder — a grip handle, drop into a folder or between rows, Escape cancels.",

	content(){
		md("Grab a row's **⠿** grip. Drop it in the middle of a folder to append inside; drop it above or below a row to land there. **Escape** cancels mid-drag and commits nothing — `TreeDrag` never touches `nodes` itself, only reports `moved(node, into, at)` below.");

		dragdemo();

		md.details(import.meta, "../readme.md", "Tree readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => new TreeDrag({ nodes: project() }))); },
});

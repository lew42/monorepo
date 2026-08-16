import { div, span } from "../../core/View/View.js";
import MemorySaver from "../Saver/MemorySaver.js";
import Panel from "../Panel/Panel.js";
import { workspace, repaint } from "../Panel/workspace.js";
import { tree, source } from "./files.js";

/* css: .file-source, .file-about, .file-blank — all in files.css, which the `files.js`
   import above loads. `.panel-workspace` is workspace.js's, imported beside it. */

/**
 * The browser as panels: the tree, the prose, the source — one ext/Panel leaf each, so
 * the seams between them are grips you drag and every region can be split, moved or
 * closed. `files()` is the only door; this file is what it arranges.
 *
 * ⚠ MemorySaver, deliberately: an arrangement here is exploration, not a document, so
 * every visit gets the seeded one and nothing is written anywhere.
 * Design record: framework/ext/files/readme.md.
 */
export function panels({ meta, paths, cut, about }){
	const state = { path: paths[0] };
	const trees = new Set();
	let root;

	// The mark moves without a redraw — repainting a tree throws away the scroll
	// position of the row just clicked. A tree that left the DOM drops out here.
	const mark = () => trees.forEach($tree => {
		if (!$tree.el.isConnected) return trees.delete($tree);
		$tree.el.querySelectorAll(".file-name").forEach(row =>
			row.classList.toggle("selected", row.dataset.path === state.path));
	});

	// Walked rather than held: two source panels side by side both track the selection,
	// and a region the reader closed is simply not there to repaint.
	const show = path => {
		state.path = path;
		root.walk(item => { if (READS.has(item.get("template"))) repaint(item); });
		mark();
	};

	const REGIONS = {
		blank: { icon: "check_box_outline_blank", draw(){ span.c("file-blank muted", "Empty — pick a region from T."); } },
		// ⚠ `panel-controls` — the tree's top edge is a click target, and the hover bar is
		// an overlay: without it the bar lands on the first file in the list. Prose and
		// source abstain, the way ext/editor's canvas does; they are documents.
		tree: { icon: "account_tree", draw(){ trees.add(tree(paths, cut, state.path).ac("panel-controls")); } },
		source: { icon: "code", draw(){ div.c("file-source", () => source(meta, state.path)); } },
	};

	// Two regions or three: the prose pane exists only where a caller wrote prose.
	if (about) REGIONS.about = { icon: "notes", draw(){ div.c("file-about", () => about(state.path)); } };

	// ⚠ The axis is chosen at SEED time, never by a query: a split holds its axis at every
	// width (ext/Panel), so a phone is answered by seeding a column instead. A stacked
	// tree claims more of the block than a column of it claims of the row — measured, one
	// share left the list 82px tall, under three files of it.
	const seed = made => {
		const stacked = window.innerWidth < STACK;

		root = made.set("dir", stacked ? "col" : "row");
		made.add(
			pane("tree", stacked ? 3 : 1.5),
			...(about ? [pane("about", stacked ? 3 : 2)] : []),
			pane("source", stacked ? 5 : 4.5));
	};

	// One delegated listener for every tree panel there will ever be, present or split
	// off later — the row carries the path, so nothing here holds a view.
	return workspace({ saver: new MemorySaver(), templates: REGIONS, seed }).on("click", e => {
		const row = e.target.closest(".file-name");
		if (row) show(row.dataset.path);
	});
}

// The regions that draw the SELECTED file, and so redraw when the selection moves.
const READS = new Set(["about", "source"]);

const STACK = 640;

const pane = (template, grow) => new Panel({ data: { template, align: "tl", grow } });

export default panels;

import { div, span, iframe, button, icon } from "../../core/View/View.js";
import MemorySaver from "../Saver/MemorySaver.js";
import Panel from "../Panel/Panel.js";
import { workspace, repaint } from "../Panel/workspace.js";
import { tree, source } from "./files.js";

/* css: .file-source, .file-about, .file-blank, .files-bar, .file-rendered — all in files.css,
   which the `files.js` import above loads. `.panel-workspace` is workspace.js's. */

/**
 * The browser as panels: the tree, the prose, the source — one ext/Panel leaf each, so
 * the seams between them are grips you drag and every region can be split, moved or
 * closed. `files()` is the only door; this file is what it arranges.
 *
 * Three more things live here, all small:
 *   - columns: a bar above the panels picks 1 code column, 2, or code + rendered. An extra
 *     column is one more Panel leaf, added or closed — nothing else is rearranged.
 *   - routing: the selection is in the url (?file=a.js&file2=b.js&cols=2).
 *   - shift-click a file (in 2-column mode) to read it in the right column.
 *
 * ⚠ MemorySaver, deliberately: an arrangement here is exploration, not a document, so
 * every visit gets the seeded one and nothing is written anywhere.
 * Design record: framework/ext/files/readme.md.
 */
export function panels({ meta, paths, cut, about, columns, route = "file" }){
	const state = { path: paths[0], mode: MODES.includes(String(columns)) ? String(columns) : "1" };
	const trees = new Set();
	const me = { born: Date.now() };                                  // this browser's claim on the url query
	let root;

	const short = path => path.slice(cut);
	const full = name => paths.find(path => short(path) === name);

	// Only ONE files() per page may own the query: the first one drawn, until it leaves the
	// DOM. Any other keeps its selection to itself instead of fighting over ?file=.
	const owns = () => {
		if (!route) return false;
		const held = claim.me;
		if (held?.el?.isConnected) held.seen = true;
		const stale = !held || (!held.el?.isConnected && (held.seen || Date.now() - held.born > 3000));
		if (held === me || stale) claim.me = me;
		return claim.me === me;
	};

	const read = () => {
		const q = new URLSearchParams(location.search);
		state.path = full(q.get(route)) ?? state.path;
		state.path2 = full(q.get(route + "2")) ?? state.path2;
		const cols = q.get("cols");
		state.mode = MODES.includes(cols) ? cols : q.get(route + "2") ? "2" : state.mode;
	};

	const write = () => {
		if (!owns()) return;
		const q = new URLSearchParams(location.search);
		const now = {
			[route]: state.path === paths[0] ? "" : short(state.path),
			[route + "2"]: state.mode === "2" && state.path2 ? short(state.path2) : "",
			cols: state.mode === "1" ? "" : state.mode,
		};
		Object.entries(now).forEach(([key, value]) => value ? q.set(key, value) : q.delete(key));
		const url = location.pathname + (q.size ? "?" + q : "") + location.hash;
		if (url !== location.pathname + location.search + location.hash) history.pushState(history.state, "", url);
	};

	if (owns()) read();

	// The mark moves without a redraw — repainting a tree throws away the scroll
	// position of the row just clicked. A tree that left the DOM drops out here.
	const mark = () => trees.forEach($tree => {
		if (!$tree.el.isConnected) return trees.delete($tree);
		$tree.el.querySelectorAll(".file-name").forEach(row => {
			row.classList.toggle("selected", row.dataset.path === state.path);
			row.classList.toggle("pinned", state.mode === "2" && row.dataset.path === state.path2);
		});
	});

	// Walked rather than held: two source panels side by side both track the selection,
	// and a region the reader closed is simply not there to repaint.
	const redraw = () => {
		root.walk(item => { if (READS.has(item.get("template"))) repaint(item); });
		mark();
	};

	const show = (path, second) => {
		if (second) state.path2 = path; else state.path = path;
		write();
		redraw();
	};

	// One code column, two, or code beside its rendered page. The extra column is closed
	// or added; the tree and the first source keep their places.
	const setMode = mode => {
		state.mode = mode;
		const extra = [];
		root.walk(item => { if (item.leaf() && EXTRA.has(item.get("template"))) extra.push(item); });
		extra.forEach(item => item.close());
		if (mode !== "1") root.add(pane(mode === "2" ? "source2" : "render", 4.5));
		write();
		bar();
		redraw();
	};

	const REGIONS = {
		blank: { icon: "check_box_outline_blank", draw(){ span.c("file-blank muted", "Empty — pick a region from T."); } },
		// ⚠ `panel-controls` — the tree's top edge is a click target, and the hover bar is
		// an overlay: without it the bar lands on the first file in the list. Prose and
		// source abstain, the way ext/editor's canvas does; they are documents.
		tree: { icon: "account_tree", draw(){ trees.add(tree(paths, cut, state.path).ac("panel-controls")); } },
		source: { icon: "code", draw(){ div.c("file-source", () => source(meta, state.path)); } },
		source2: { icon: "vertical_split", draw(){
			div.c("file-source", () => state.path2 ? source(meta, state.path2)
				: span.c("file-blank muted", "Shift-click a file in the tree to read it here."));
		} },
		render: { icon: "preview", draw(){ div.c("file-rendered", $view => { rendered($view, meta, state.path); }); } },
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
			pane("source", stacked ? 5 : 4.5),
			...(state.mode === "1" ? [] : [pane(state.mode === "2" ? "source2" : "render", stacked ? 5 : 4.5)]));
	};

	// ⚠ The bar is built before the workspace so it sits above it in the box.
	const $bar = div.c("files-bar");
	const bar = () => $bar.empty(() => {
		MODES.forEach(mode => button.c("files-mode", () => { icon(MODE_ICON[mode]); span(MODE_LABEL[mode]); })
			.ac(mode === state.mode && "selected").on("click", () => setMode(mode)));
		if (state.mode === "2") span.c("muted files-hint", "shift-click a file to fill the right column");
	});
	bar();

	// One delegated listener for every tree panel there will ever be, present or split
	// off later — the row carries the path, so nothing here holds a view.
	const $work = workspace({ saver: new MemorySaver(), templates: REGIONS, seed }).on("click", e => {
		const row = e.target.closest(".file-name");
		if (row) show(row.dataset.path, e.shiftKey && state.mode === "2");
	});

	me.el = $work.el;
	window.addEventListener("popstate", () => {
		if (!$work.el.isConnected || !owns()) return;
		read();
		setMode(state.mode);
	});

	return $work;
}

// The rendered half of "code + rendered": prose as prose, a page as a live iframe.
function rendered($view, meta, path){
	if (/\.md$/i.test(path))
		return import("../markdown/md.js").then(({ default: md }) => $view.append(() => md.file(meta, path, { h1: false })));
	if (/\.html?$/i.test(path))
		return $view.append(() => iframe.c("file-frame").attr("src", new URL(path, meta.url).href));
	return $view.append(() => span.c("file-blank muted", `Nothing to render for ${path.split("/").pop()} — pick a .md or .html file.`));
}

// The regions that draw the SELECTED file, and so redraw when the selection moves.
const READS = new Set(["about", "source", "source2", "render"]);
const EXTRA = new Set(["source2", "render"]);
const MODES = ["1", "2", "render"];
const MODE_ICON = { 1: "crop_portrait", 2: "vertical_split", render: "preview" };
const MODE_LABEL = { 1: "1 column", 2: "2 columns", render: "code + rendered" };

const claim = {};

const STACK = 640;

const pane = (template, grow) => new Panel({ data: { template, align: "tl", grow } });

export default panels;

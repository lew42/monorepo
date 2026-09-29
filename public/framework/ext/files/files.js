import View, { div, span, pre, code, icon } from "../../core/View/View.js";
import grip from "../grip/grip.js";

View.stylesheet(import.meta, "files.css");

/**
 * files — a small file browser: a tree of real files, and the one you clicked, side by
 * side. A folder opens and closes on click; the seam between two columns drags to
 * resize the one on its left.
 *
 *   files(import.meta, "example/index.html example/app.js example/page.js")
 *   files(import.meta, names, { about: path => md.file(meta, `doc/file/${path}.md`) })
 *
 * Options:
 *   about  — anything to render BESIDE the source, called once per shown path with a
 *            view or a promise of one; given one, the browser is three columns
 *            (tree | about | source) instead of two. `ext/Doc`'s Files tab passes this.
 *   route  — the url query key for the selection (default "file"); `route: false` keeps
 *            the url alone.
 *   fill   — the box fills its parent's height instead of a fixed max, so the COLUMNS
 *            scroll and the page does not. For a full-screen host (minion B's /fs).
 *   open   — folders open down to this depth at start (default: every folder, as
 *            before). A folder past that depth builds its rows on first click, not
 *            before — for a tree of thousands of paths.
 *
 * The selection lives in the url — ?file=a.js — for the first files() on a page.
 *
 * The files are FETCHED, so what you read is what is on disk. The longest common
 * directory is stripped for display, so a doc folder reads as a project.
 *
 * ⚠ Paths resolve against `import.meta`, never the document — the SPA fallback makes
 * the document url a route. Design record: framework/ext/files/readme.md.
 */
export default function files(meta, names, { about, route = "file", fill, open = Infinity } = {}){
	const paths = names.trim().split(/\s+/).filter(Boolean);
	const cut = common_dir(paths);
	const state = { path: paths[0] };
	const me = { born: Date.now() };

	const short = path => path.slice(cut);
	const full = name => paths.find(path => short(path) === name);

	// Only ONE files() per page may own the url query: the first one drawn, until it
	// leaves the DOM. Any other keeps its selection to itself instead of fighting over it.
	const owns = () => {
		if (!route) return false;
		const held = claim.me;
		if (held?.el?.isConnected) held.seen = true;
		const stale = !held || (!held.el?.isConnected && (held.seen || Date.now() - held.born > 3000));
		if (held === me || stale) claim.me = me;
		return claim.me === me;
	};

	const read = () => { state.path = full(new URLSearchParams(location.search).get(route)) ?? state.path; };

	const write = () => {
		if (!owns()) return;
		const q = new URLSearchParams(location.search);
		const value = state.path === paths[0] ? "" : short(state.path);
		value ? q.set(route, value) : q.delete(route);
		const url = location.pathname + (q.size ? "?" + q : "") + location.hash;
		if (url !== location.pathname + location.search + location.hash) history.pushState(history.state, "", url);
	};

	if (owns()) read();

	let $tree, $source, $about;

	// The mark moves without a redraw — repainting the tree would throw away the scroll
	// position of the row just clicked.
	const mark = () => $tree.el.isConnected && $tree.el.querySelectorAll(".file-name")
		.forEach(row => row.classList.toggle("selected", row.dataset.path === state.path));

	const draw_source = () => {
		$source.empty(() => source(meta, state.path));
		if (about) $about.empty(() => about(state.path));
	};

	const show = path => {
		state.path = path;
		write();
		mark();
		draw_source();
	};

	const $box = div.c("files", () => {
		div.c("files-row", () => {
			div.c("files-col files-col-tree", $col => {
				$tree = tree(paths, cut, state.path, open);
				grip({ from: "start", write: px => { $col.style("--files-col-w", px + "px"); return px; } });
			}).on("click", e => {
				const row = e.target.closest(".file-name");
				if (row) show(row.dataset.path);
			});

			if (about) div.c("files-col files-col-about", $col => {
				$about = div.c("file-about", () => about(state.path));
				grip({ from: "start", write: px => { $col.style("--files-col-w", px + "px"); return px; } });
			});

			div.c("files-col files-col-source", () => {
				$source = div.c("file-source", () => source(meta, state.path));
			});
		});
	}).ac(fill && "files-fill");

	me.el = $box.el;
	window.addEventListener("popstate", () => {
		if (!$box.el.isConnected || !owns()) return;
		read();
		mark();
		draw_source();
	});

	return $box;
}

/* The tree, marked with the file that is showing. A row carries the DECLARED path
 * rather than an index into the list: `nest()` groups by directory, so tree order stops
 * being declaration order the moment two paths interleave folders. `open` folders open
 * eagerly to that depth; a folder past it opens — and builds its rows — on first click,
 * and stays open at every ancestor of the selected file so a deep link is never hidden. */
export const tree = (paths, cut, selected, open = Infinity) => {
	const to = selected ? selected.slice(cut) : null;
	return div.c("file-tree", () => rows(nest(paths, cut), selected, to, 0, open, ""));
};

function rows(node, selected, to, depth, open, prefix){
	for (const [name, child] of Object.entries(node)){
		if (typeof child === "string"){
			div.c("file-name", () => { icon("description"); span.c("file-label", name); })
				.attr("data-path", child).ac(child === selected && "selected");
			continue;
		}

		const path = prefix + name + "/";
		const opened = depth < open || (to && to.startsWith(path));
		let built = false;
		let $body;

		div.c("file-dir" + (opened ? " open" : ""), $dir => {
			div.c("file-dir-name", () => { icon("chevron_right"); span.c("file-label", name); })
				.on("click", () => {
					if ($dir.tc("open").hc("open") && !built){
						built = true;
						$body.append(() => rows(child, selected, to, depth + 1, open, path));
					}
				});

			$body = div.c("file-dir-body");
			if (opened){
				built = true;
				$body.append(() => rows(child, selected, to, depth + 1, open, path));
			}
		});
	}
}

/* ext/highlight, softly — the same deal demo() and ext/Doc make. With it loaded a file
 * arrives highlighted and cached; without it, the text in a <pre>. An ext may lean on
 * an ext; only core may never. */
export function source(meta, path){
	if (code.file)
		return code.file(meta, path);

	return pre.c("code-block", () => code().append(
		fetch(new URL(path, meta.url).href)
			.then(resp => resp.ok ? resp.text() : `Error loading ${path}: ${resp.status} ${resp.statusText}`)));
}

/* How much of the front of every path is the same directory. Character-wise would
 * happily cut "app" out of "app.js" and "app2.js", so this compares whole segments
 * and only ever cuts at a slash. */
function common_dir(paths){
	const dirs = paths.map(path => path.split("/").slice(0, -1));
	let shared = 0;

	while (dirs.length && dirs.every(dir => dir[shared] && dir[shared] === dirs[0][shared]))
		shared++;

	return (dirs[0] ?? []).slice(0, shared).reduce((n, seg) => n + seg.length + 1, 0);
}

/* ["ex/app.js", "ex/about/page.js"] -> { "app.js": "ex/app.js", about: { … } }
 *
 * A string leaf is a file and holds its FETCHABLE path; an object is a directory.
 * Insertion order is declaration order, which is the order the author wants them
 * read in.
 *
 * Exported (2026-09-28) so ext/Doc can group nested note names the same way, for its
 * own tree of real routed pages — additive only, `files()`'s own signature and
 * behavior are unchanged. */
export function nest(paths, cut){
	const root = {};

	paths.forEach(path => {
		const segments = path.slice(cut).split("/");
		const file = segments.pop();
		let node = root;

		segments.forEach(dir => node = node[dir] ??= {});
		node[file] = path;
	});

	return root;
}

const claim = {};

export { files };

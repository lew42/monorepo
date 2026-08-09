import View, { div, span, pre, code, icon } from "../../core/View/View.js";

/* css: .basis — framework.css's fixed-track utility, worn by `.file-tree` below. */
View.stylesheet(import.meta, "files.css");

/**
 * files — a small file browser: a tree of real files, and the one you clicked.
 *
 *   files(import.meta, "example/index.html example/app.js example/page.js")
 *
 * The files are FETCHED, so what you read is what is on disk. The longest common
 * directory is stripped for display, so a doc folder reads as a project.
 *
 * ⚠ Paths resolve against `import.meta`, never the document — the SPA fallback makes
 * the document url a route. Design record: framework/ext/files/readme.md.
 */
export default function files(meta, names){
	const paths = names.trim().split(/\s+/).filter(Boolean);
	const cut = common_dir(paths);

	let $pane, $tree;

	const view = div.c("files", () => {
		$tree = div.c("file-tree basis", () => tree(nest(paths, cut)));
		$pane = div.c("file-pane");
	});

	// ⚠ Reads the path off the row, never an index into `paths`: nest() groups by
	// directory, so tree order stops being declaration order the moment two paths
	// interleave folders.
	$tree.on("click", e => {
		const row = e.target.closest(".file-name");
		if (row) show(row.dataset.path);
	});

	function show(path){
		$tree.el.querySelectorAll(".file-name")
			.forEach(row => row.classList.toggle("selected", row.dataset.path === path));

		$pane.empty(() => file_pane(meta, path));
	}

	show(paths[0]);

	return view;
}

/* ext/highlight, softly — the same deal demo() and classdoc make. With it loaded
 * a file arrives highlighted and cached; without it, the text in a <pre>. An ext
 * may lean on an ext; only core may never. */
function file_pane(meta, path){
	if (code.file)
		return code.file(meta, path);

	return pre.c("code-block", () => code().append(
		fetch(new URL(path, meta.url).href).then(resp => resp.text())));
}

/* How much of the front of every path is the same directory. Character-wise
 * would happily cut "app" out of "app.js" and "app2.js", so this compares whole
 * segments and only ever cuts at a slash. */
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
 * read in. */
function nest(paths, cut){
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

function tree(node){
	for (const [name, child] of Object.entries(node)){
		if (typeof child === "string")
			div.c("file-name", () => {
				icon("description");
				span.c("file-label", name);
			}).attr("data-path", child);
		else
			div.c("file-dir", () => {
				div.c("file-dir-name", () => {
					icon("folder");
					span.c("file-label", name);
				});
				div.c("file-dir-body", () => tree(child));
			});
	}
}

export { files };

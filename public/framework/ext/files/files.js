import View, { div, span, pre, code, icon } from "../../core/View/View.js";

View.stylesheet(import.meta, "files.css");

/**
 * files — a small file browser: a tree of real files, and the one you clicked, each
 * region a panel you can resize, drag, split or close.
 *
 *   files(import.meta, "example/index.html example/app.js example/page.js")
 *   files(import.meta, names, { about: path => md.file(meta, `doc/file/${path}.md`) })
 *
 * The files are FETCHED, so what you read is what is on disk. The longest common
 * directory is stripped for display, so a doc folder reads as a project.
 *
 * `about` is anything to render BESIDE the source — a view or a promise of one, per
 * path. Given one, the browser is three panels rather than two. ext/Doc's Files tab
 * passes the `.md` written about each file.
 *
 * ⚠ Paths resolve against `import.meta`, never the document — the SPA fallback makes
 * the document url a route. Design record: framework/ext/files/readme.md.
 */
export default function files(meta, names, { about } = {}){
	const paths = names.trim().split(/\s+/).filter(Boolean);
	const cut = common_dir(paths);

	// ⚠ The box is placed NOW and the arrangement arrives in a callback — a factory call
	// after the await appends wherever the captor has since drifted. Lazy because the
	// Panel stack is a dozen modules and app.js re-exports this door on every page.
	return div.c("files", () =>
		import("./panels.js").then(m => () => m.panels({ meta, paths, cut, about })));
}

/* The tree, marked with the file that is showing. A row carries the DECLARED path
 * rather than an index into the list: nest() groups by directory, so tree order stops
 * being declaration order the moment two paths interleave folders. */
export const tree = (paths, cut, selected) => div.c("file-tree", () => rows(nest(paths, cut), selected));

/* ext/highlight, softly — the same deal demo() and ext/Doc make. With it loaded a file
 * arrives highlighted and cached; without it, the text in a <pre>. An ext may lean on
 * an ext; only core may never. */
export function source(meta, path){
	if (code.file)
		return code.file(meta, path);

	// ⚠ `resp.ok`, which code.file() and md.file() both check and this branch did not:
	// a missing file falls through to the SPA fallback, so `resp.text()` alone renders
	// index.html AS THOUGH IT WERE THE FILE. Masked on this site — app.js always loads
	// ext/highlight, so this branch never runs — which is exactly why it stayed wrong.
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

function rows(node, selected){
	for (const [name, child] of Object.entries(node)){
		if (typeof child === "string")
			div.c("file-name", () => {
				icon("description");
				span.c("file-label", name);
			}).attr("data-path", child).ac(child === selected && "selected");
		else
			div.c("file-dir", () => {
				div.c("file-dir-name", () => {
					icon("folder");
					span.c("file-label", name);
				});
				div.c("file-dir-body", () => rows(child, selected));
			});
	}
}

export { files };

import View, { div, pre, code } from "../../core/View/View.js";
import grip from "../grip/grip.js";
import FsFile from "../filesystem/FsFile.js";
import Dir from "../filesystem/Dir.js";
import { context_menu } from "../filesystem/menu.js";

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
 *   select — pre-select this exact path (one of the values in `names`) on first draw,
 *            instead of `paths[0]` — `ext/files/fs.js`'s `PageFiles` passes this so a
 *            `file_link()` url opens `/fs/` with that file already showing. `?file=`
 *            in the url (if `route` is on) still wins once the visitor clicks around.
 *   lines  — the source column gets a line-number gutter (`ext/highlight`'s
 *            `code.file(…, { lines: true })`), and `#L42` / `#L40-L48` in the url
 *            scrolls to and highlights those lines — `mark_lines()` below, also
 *            exported so `ext/files/fs.js`'s v2 explorer (several code columns, not
 *            one) can wire the same behavior itself. Off by default: a plain
 *            two-column caller (`/framework/start/`, most `about` callers) is
 *            unchanged.
 *
 * The selection lives in the url — ?file=a.js — for the first files() on a page.
 *
 * A row's right-click opens a small menu (`ext/filesystem/menu.js`): Copy path, Open in /fs,
 * Open raw.
 *
 * The files are FETCHED, so what you read is what is on disk. The longest common
 * directory is stripped for display, so a doc folder reads as a project.
 *
 * ⚠ Paths resolve against `import.meta`, never the document — the SPA fallback makes
 * the document url a route. Design record: framework/ext/files/readme.md.
 */
export default function files(meta, names, { about, route = "file", fill, open = Infinity, select, lines } = {}){
	const paths = names.trim().split(/\s+/).filter(Boolean);
	const cut = common_dir(paths);
	const state = { path: (select && paths.includes(select)) ? select : paths[0] };
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
		const drawn = source(meta, state.path, lines);
		$source.empty(() => drawn);
		if (about) $about.empty(() => about(state.path));
		if (lines) Promise.resolve(drawn).then(() => requestAnimationFrame(() => mark_lines($source)));
		if (lines) watch_lines($source);
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
			}).on("contextmenu", e => {
				const row = e.target.closest(".file-name");
				if (!row) return;
				e.preventDefault();
				// `row.dataset.path` is the DECLARED path — relative to THIS caller's own
				// `meta.url`, same as what `source()` fetches with (`new URL(path,
				// meta.url)`). The menu wants a site-ROOT path (what `file_link()` and a
				// raw fetch both take), so it's resolved here, once, the same way.
				const root_path = new URL(row.dataset.path, meta.url).pathname.replace(/^\/+/, "");
				context_menu(root_path, e.clientX, e.clientY);
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

// Each row's markup is drawn by `FsFile.render()` / `Dir.render()` (ext/filesystem) — one
// place owns "what a file/directory row looks like". `FsFile.render()` already wears
// `ui/item`'s row; `Dir.render()` doesn't yet (see its own comment for why: `rows()`
// below owns lazy open/close, a behavior `ui/item`'s tree mode doesn't have a hook for).
// `rows()` still owns the tree-widget part those classes don't know about either way:
// which folders start open, and building a folder's children only on first click.
//
// ⚠ `nest()` below keeps its plain `{ "name": "path", dir: {…} }` shape ON PURPOSE —
// `ext/Doc`'s own `note_tree()` (Doc.js) imports `nest()` too, for a tree of routed
// note PAGES rather than files, and reads that exact shape with `Object.entries` +
// `typeof child === "string"`. Rebuilding `nest()` itself into `Dir`/`FsFile`
// instances would silently break Doc's tree — so the new classes are built HERE,
// per row, from the same plain node `nest()` already produces.
function rows(node, selected, to, depth, open, prefix){
	for (const [name, child] of Object.entries(node)){
		if (typeof child === "string"){
			new FsFile({ name, path: child }).render().ac(child === selected && "selected");
			continue;
		}

		const path = prefix + name + "/";
		const opened = depth < open || (to && to.startsWith(path));
		let built = false;
		let $body;

		div.c("file-dir" + (opened ? " open" : ""), $dir => {
			new Dir({ name, path }).render()
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
 * an ext; only core may never.
 *
 * `lines` asks `code.file()` for the gutter (ext/highlight's own `{ lines: true }`
 * option) — silently ignored on the no-highlight fallback below, since a plain
 * fetched <pre> has no `.code-line`s for `#L42` to find; the file still shows, just
 * without the anchor. */
export function source(meta, path, lines){
	if (code.file)
		return code.file(meta, path, { lines });

	return pre.c("code-block", () => code().append(
		fetch(new URL(path, meta.url).href)
			.then(resp => resp.ok ? resp.text() : `Error loading ${path}: ${resp.status} ${resp.statusText}`)));
}

/* #L42 or #L40-L48 in the url → the matching `.code-line`s (built by ext/highlight's
 * `code.file(…, { lines: true })`) get `.line-hit` and the first one scrolls into
 * view. `$host` is whatever box holds ONE such code block — `files()` above passes
 * its own `$source`; `ext/files/fs.js`'s v2 explorer, which can have several code
 * columns open at once, calls this once per column, and each call only ever touches
 * the `.code-line`s inside ITS OWN `$host`, so two open files never cross-highlight.
 *
 * ⚠ Open item: if the hash's line NUMBER happens to exist in more than one open
 *   column, every one of them lights up — there is nothing in `#L42` alone that says
 *   which file it means once more than one is on screen. Harmless (nothing breaks,
 *   nothing is lost), just a display ambiguity a future pass could resolve by
 *   putting the file in the hash too. */
export function mark_lines($host){
	$host.el.querySelectorAll(".code-line.line-hit").forEach(el => el.classList.remove("line-hit"));

	// GitHub's own range spelling repeats the "L" (`#L40-L48`, the brief's own
	// example) — `-L?` makes it optional so `#L40-48` still works too.
	const m = location.hash.match(/^#L(\d+)(?:-L?(\d+))?$/);
	if (!m) return;

	const from = Number(m[1]);
	const to = m[2] ? Math.max(Number(m[2]), from) : from;
	let $first;

	for (let n = from; n <= to; n++){
		const el = $host.el.querySelector(`.code-line[data-line="${n}"]`);
		if (el){ el.classList.add("line-hit"); $first ??= el; }
	}

	$first?.scrollIntoView({ block: "center" });
}

// `#L42` clicked from a gutter this module (or `ext/files/fs.js`'s v2 explorer)
// already drew only changes `location.hash` — a same-page anchor, not a
// navigation, so it fires `hashchange`, never `popstate`. ONE listener for the
// whole module, registered exactly once at import time and never removed — what
// would need removing, per host, per render, is the SET MEMBERSHIP instead:
// every `$host` this is called with goes into `hosts`, and a disconnected one is
// pruned the moment the listener next runs, so nothing accumulates the way a
// fresh `addEventListener` per `files()` call (or per v2 explorer render) used
// to (review finding 10, 2026-09-29: "files.js adds a hashchange listener on
// every `lines: true` call… neither is ever removed").
const hosts = new Set();
let wired = false;

export function watch_lines($host){
	hosts.add($host);
	if (wired) return;
	wired = true;

	window.addEventListener("hashchange", () => {
		for (const $h of hosts){
			// ⚠ `isConnected` alone is not "on screen": `ext/files/explorer.js`'s v2
			// keeps a folder's own bare page mounted (hidden, `display: none`) once
			// a file inside it has been opened — Page.css's arrangement contract
			// hides it, `isConnected` does not agree (measured live, 2026-09-29: a
			// gutter click marked the SAME line number in both the visible file and
			// the hidden folder page's own default selection). `checkVisibility()`
			// is the one DOM primitive that reads the CSS, not just the tree.
			if (!$h.el.isConnected) hosts.delete($h);
			else if ($h.el.checkVisibility ? $h.el.checkVisibility() : $h.el.offsetParent !== null) mark_lines($h);
		}
	});
}

/* How much of the front of every path is the same directory. Character-wise would
 * happily cut "app" out of "app.js" and "app2.js", so this compares whole segments
 * and only ever cuts at a slash.
 *
 * Exported (2026-09-29) for the same reason `nest()` was: `ext/files/fs.js`'s v2
 * explorer builds its OWN multi-column source area on top of this module's tree, and
 * wants the identical shortened display path `files()` already computes — one rule,
 * not two copies that could drift. */
export function common_dir(paths){
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

		// A path ENDING in "/" (a bare directory marker, no file after it — e.g.
		// core/Page's own `{"file": "Inbox/"}` line) splits to a trailing "" here.
		// The `forEach` above already made the directory node exist; writing an
		// empty-named leaf INTO it was an unlabelled row with no name and nothing
		// to click (found 2026-09-30, core/Page/ext/'s own file tree, under
		// "Inbox"). A real file never has an empty name, so this guard only ever
		// catches the bare-directory case.
		if (file) node[file] = path;
	});

	return root;
}

const claim = {};

export { files };

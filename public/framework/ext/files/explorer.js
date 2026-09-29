import View, { div, p, a, span, button, icon } from "../../core/View/View.js";
import grip from "../grip/grip.js";
import item from "../../ui/item/item.js";
import PageFiles from "./fs.js";
import { nest, common_dir, source, mark_lines, watch_lines } from "./files.js";
import { file_link } from "../filesystem/file_link.js";
import { context_menu } from "../filesystem/menu.js";

View.stylesheet(import.meta, "switcher.css");

/**
 * PageFilesExplorer — v2 of `<any path>/fs/`. `PageFiles` (fs.js) is the classic
 * full-screen view: no site chrome at all, one file at a time. This is the roomier
 * one the owner asked for: the framework's own left nav stays exactly where it is,
 * and everything to its right becomes the explorer.
 *
 * Wide: a tree, then one or more code columns. Every tree row is a real link — a
 * plain click opens it here (the router does the rest, `fs.js`'s own `route()`);
 * a small "open beside" button on each row (findable, unlike a modifier key) opens
 * it as an ADDITIONAL column without leaving the one already open, and Ctrl/Cmd-
 * click is left alone for the browser's own "open in a new tab". Narrow: the code
 * of whichever file is open fills the screen, with a sticky header showing that
 * file's name as a dropdown — tap it to open the tree and pick another file. Both
 * shapes are the SAME markup; `switcher.css`'s container query is what switches
 * between them, so a browser resize (not just a phone) redraws nothing.
 *
 * Every file is a real, routed url (`file_link()`, `PageFiles.route()`, fs.js) —
 * loads cold, and Back/Forward both work through the ordinary router, the same as
 * every other page on the site.
 *
 * `core/Page/Page.class.js`'s `fs_folder()` builds THIS class by default now and
 * `PageFiles` (v1) only when the url says `?v=1` — a page never chooses for
 * itself, same rule every other page word follows.
 *
 * Design record: readme.md, doc/decisions.md. The responsive shell itself —
 * `.switcher` — is generic on purpose: doc/switcher.md says how to reuse it.
 */
export default class PageFilesExplorer extends PageFiles {

	// `route()` and `static list()` are `PageFiles`' own (fs.js) — unchanged, so a
	// deep link two segments in (`.../fs/FsFile.js/`) still resolves the same way
	// and still lands back on THIS class (`new this.constructor(...)`, fs.js).
	//
	// ⚠ `container()` — every OTHER page mounts into its parent's own NAMED
	// REGION first (`Page.container()`, core/Page/Page.class.js): for a page
	// whose parent is an `ext/Doc` module (every `<module>/fs/` is exactly that),
	// the region is the Doc's OWN tab panel — so a plain override of `render()`
	// alone left this explorer nested one level inside the Doc's title-and-tab
	// band, squeezed to the panel's own width, `FS` sitting as a stray extra tab
	// next to Overview (measured live, 2026-09-29, screenshots in this task's own
	// `shots/`). `v1` (fs.js) never had this problem because `.layout-full` is
	// `position: fixed`, which escapes DOM nesting by force — but it takes the
	// whole viewport BECAUSE of that, covering the framework's own left nav along
	// with everything else, which is the one thing v2 exists to stop doing.
	//
	// The fix is `Page.prototype.container()`'s OWN SECOND branch, copied
	// verbatim: skip straight past "my parent's named region" to "the nearest
	// ANCESTOR that owns a `$pages` of its own" — for a page under `/framework/`
	// that is the framework section's own root, whose `$pages` sits beside its
	// `Sidebar` (the left nav). Jumping straight to `app.$pages` instead (tried
	// first) skipped past THAT too, since the sidebar lives inside the framework
	// root's own layout, not the app shell's — losing the sidebar rather than
	// keeping it. `Page.css`'s own arrangement contract already has a rule for a
	// leaf mounting as a sibling of one of its own ancestors ("an ancestor is
	// REPLACED BY a SIBLING") — the Doc page, still an ancestor in the chain,
	// simply stops being shown the moment this later sibling in the SAME
	// container is active. This is also what makes `fs.js`'s `route()` safe to
	// build a FRESH page per file again (fs.js's own top comment has the story):
	// the folder page and the file page both land in this same container, and
	// the arrangement contract picks the right one.
	container(){
		for (let page = this.parent; page; page = page.parent)
			if (page.$pages) return this.mounts_in(page.$pages, `$pages of ${page.log_label()} (v2 escapes the Doc tab panel between us)`);

		return this.mounts_in(this.app.$pages, "app.$pages");
	}

	render(){
		return this.view ??= div.c("page fs-explorer", () => {
			div.c("fs-explorer-head", () => {
				span.c("fs-explorer-head-title", () => {
					icon("folder_open");
					span((this.folder ?? this.url ?? "/").replace(/^\/+|\/+$/g, "") || "/");
				});
			});

			return this.constructor.list(this.folder ?? this.url).then(names => () => {
				if (names === null)
					return void p.c("muted", "This server has no file list (`/directory.json`) — /fs/ only works on the dev server, never on the live site.");
				if (!names.length)
					return void p.c("muted", "No files under " + (this.folder ?? this.url) + ".");

				explorer({ url: location.origin + "/" }, names, this.selected);
			});
		});
	}
}

export { PageFilesExplorer };

// The current url with one query key set — used for the "Classic view" (`?v=1`)
// escape hatch, now drawn inside the first code column's own toolbar (below) —
// not in the page head, which the site's fixed `.drawer-menu` (☰, top right,
// ext/drawer) sits directly over at 1920 and 3440 (found live from this task's
// own screenshots). A plain string join would double a `?` already there;
// `URL` does the merge for free.
function with_query(key, value){
	const url = new URL(location.href);
	url.searchParams.set(key, value);
	return url.pathname + url.search + url.hash;
}

/**
 * explorer(meta, paths, select) — the tree (drawn with `ui/item`, real `<a
 * href>` leaves — native open/close, no click-routing script of its own, unlike
 * `ext/files`' own hand-rolled tree) inside `.switcher-nav`, and one or more code
 * columns inside `.switcher-panel`.
 *
 * Every row is an ORDINARY link: a plain click opens it the ordinary way (the
 * router re-renders this whole page with the new file selected, `fs.js`'s own
 * `route()`), and Ctrl/Cmd-click is left alone for the browser's own "open in a
 * new tab" — this component never calls `preventDefault()` on a plain row click.
 * The one thing a plain link can't do — open a file as an ADDITIONAL column
 * beside the one already open — gets its own small button on the row instead of
 * hijacking a modifier key nothing on screen advertises.
 */
function explorer(meta, paths, select){
	const cut = common_dir(paths);
	const first = (select && paths.includes(select)) ? select : paths[0];
	const state = { columns: [first] };

	let $panel, $nav;

	const draw_panel = () => $panel.empty(() => state.columns.forEach((path, i) => column(path, i)));

	// Which rows are currently open, so `switcher.css` can show a row's "open
	// beside" button without a hover or a keyboard focus — the owner's own ask
	// (2026-09-29, after seeing every row's button all the time on Servex's own
	// copy of this tree, "so the tree is a column of icons"): reveal it on
	// hover/focus, and ALWAYS on a row that is already open (a phone has no
	// hover, so that row is the only one a touch reader ever sees a button on).
	const mark = () => $nav?.el.querySelectorAll("a.item").forEach(row => {
		const href = row.getAttribute("href");
		row.classList.toggle("fs-explorer-open-row", state.columns.some(path => file_link(path) === href));
	});

	// The one extra thing a row can do besides being a link: open THIS file as a
	// new column without leaving the one already open — the only way to more
	// than one column now that Ctrl/Cmd-click is the browser's own (readme.md's
	// "two versions" section says why).
	const open_beside = path => {
		if (!state.columns.includes(path)) state.columns.push(path);
		draw_panel();
		mark();
	};

	// One column: its own toolbar (path, copy, raw, close — the ONE toolbar a
	// column gets, never a second one stacked above it) and its own code block.
	// The FIRST column also carries the "Classic view" (v1) escape hatch — one
	// per explorer, not one per column, but a column's own toolbar is the only
	// row left that the site's own fixed chrome (the ☰ menu, top right) never
	// covers, at any width this was checked at (400/1920/3440).
	// `source()` is called once and both PLACED (`div.c(cls, () => drawn)`) and
	// WATCHED (`Promise.resolve(drawn).then(...)`) from that one value — the same
	// split `ext/files/files.js`'s own `draw_source()` uses — so a `.code-line`
	// gutter already exists in the DOM by the time `mark_lines()` goes looking.
	const column = (path, i) => {
		const last = i === state.columns.length - 1;

		div.c("files-col files-col-source fs-explorer-col", $col => {
			div.c("fs-explorer-bar", () => {
				span.c("fs-explorer-path", path.slice(cut));
				if (i === 0) a.c("fs-explorer-btn fs-explorer-v1").attr("title", "Classic view (v1)").href(with_query("v", "1")).append(() => icon("undo"));
				button.c("fs-explorer-btn").attr("title", "Copy path").on("click", () => navigator.clipboard?.writeText("/" + path)).append(() => icon("content_copy"));
				a.c("fs-explorer-btn").attr("title", "Open raw").href("/" + path).append(() => icon("description"));
				if (state.columns.length > 1)
					button.c("fs-explorer-btn").attr("title", "Close").on("click", () => { state.columns.splice(i, 1); draw_panel(); mark(); }).append(() => icon("close"));
			});

			const drawn = source(meta, path, true);
			const $host = div.c("file-source", () => drawn);
			Promise.resolve(drawn).then(() => requestAnimationFrame(() => mark_lines($host)));
			watch_lines($host);

			if (!last) grip({ from: "start", write: px => { $col.style("--files-col-w", px + "px"); return px; } });
		});
	};

	// `.switcher-body` is the box `switcher.css`'s container query actually
	// restyles — never `.switcher` itself, which only PROVIDES the box the query
	// measures (a container can't restyle itself; switcher.css's own note says
	// why). Everything a caller of this pattern draws goes inside it.
	const $switcher = div.c("switcher fs-explorer-switcher", () => div.c("switcher-body", () => {
		div.c("switcher-header", () => {
			button.c("switcher-toggle").on("click", () => $switcher.tc("switcher-open")).append(() => {
				span.c("switcher-toggle-label", first.slice(cut));
				icon("expand_more");
			});
		});

		// Real `<a href="file_link(path)">` leaves (`item_nodes()` below) — a plain
		// click just navigates, same as any other link on the site; nothing here
		// intercepts it. `contextmenu` still needs the row's own path (the same
		// lookup `Copy path` etc. want), found by matching the clicked link's own
		// href back against every candidate rather than re-deriving `file_link()`'s
		// url shape a second time.
		$nav = div.c("switcher-nav", () => item_nodes(nest(paths, cut), open_beside).forEach(node => item(node)))
			.on("contextmenu", e => {
				const row = e.target.closest("a.item");
				if (!row) return;

				const href = row.getAttribute("href");
				const path = paths.find(candidate => file_link(candidate) === href);
				if (!path) return;

				e.preventDefault();
				context_menu(path, e.clientX, e.clientY);
			});

		$panel = div.c("switcher-panel files-row");
		draw_panel();
	}));

	mark();

	return $switcher;
}

// `nest(paths, cut)`'s plain `{ "a.js": "path", dir: {…} }` shape (ext/files, exported
// for exactly this kind of second reader) → `ui/item`'s own `{ icon, name, href,
// end, children }` node shape. A file becomes a real routed link (`file_link()`)
// plus a small "open beside" button (`end`, the same slot `item()`'s own "menu"
// case uses — its `stopPropagation()` is what keeps the button's own click from
// also firing the row's link); a folder becomes an `open` branch — every folder
// starts open, the same default `ext/files` itself uses.
function item_nodes(node, open_beside){
	return Object.entries(node).map(([name, child]) => typeof child === "string"
		? {
			icon: "description", name, href: file_link(child),
			end: () => button.c("item-end").attr("type", "button").attr("title", "Open beside").attr("aria-label", "Open beside " + name)
				.on("click", e => { e.preventDefault(); e.stopPropagation(); open_beside(child); })
				.append(() => icon("splitscreen_add")),
		}
		: { icon: "folder", name, open: true, children: item_nodes(child, open_beside) });
}

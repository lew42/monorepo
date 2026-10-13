import View, { div, p, a, span, button, icon } from "../../core/View/View.js";
import grip from "../grip/grip.js";
import item from "../../ui/item/item.js";
import PageFiles from "./fs.js";
import { nest, common_dir, source, mark_lines, watch_lines } from "./files.js";
import { file_link } from "../filesystem/file_link.js";
import { context_menu } from "../filesystem/menu.js";

View.stylesheet(import.meta, "switcher.css");

// v2 file explorer: left nav + code columns (v1 = fs.js). Design: doc/explorer-notes.md, readme.md, doc/decisions.md, doc/switcher.md.
export default class PageFilesExplorer extends PageFiles {

	// ⚠ Jump to nearest ancestor with $pages, not parent's region — escapes the Doc tab panel. Details: doc/explorer-notes.md.
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

// Current URL with one query key set for "Classic view" escape hatch (toolbars). Details: doc/explorer-notes.md.
function with_query(key, value){
	const url = new URL(location.href);
	url.searchParams.set(key, value);
	return url.pathname + url.search + url.hash;
}

// Tree + code columns; plain links for rows, "open beside" button for new columns. Details: doc/explorer-notes.md.
function explorer(meta, paths, select){
	const cut = common_dir(paths);
	const first = (select && paths.includes(select)) ? select : paths[0];
	const state = { columns: [first] };

	let $panel, $nav;

	const draw_panel = () => $panel.empty(() => state.columns.forEach((path, i) => column(path, i)));

	// Mark open rows so switcher.css reveals button on hover/focus and always on open rows.
	const mark = () => $nav?.el.querySelectorAll("a.item").forEach(row => {
		const href = row.getAttribute("href");
		row.classList.toggle("fs-explorer-open-row", state.columns.some(path => file_link(path) === href));
	});

	// Open file as new column without leaving current one. Details: doc/explorer-notes.md, readme.md.
	const open_beside = path => {
		if (!state.columns.includes(path)) state.columns.push(path);
		draw_panel();
		mark();
	};

	// Toolbar + code block; source() called once, both placed and watched. Details: doc/explorer-notes.md.
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

	// ⚠ Container query restyles .switcher-body, not .switcher itself — a container can't restyle itself.
	const $switcher = div.c("switcher fs-explorer-switcher", () => div.c("switcher-body", () => {
		div.c("switcher-header", () => {
			button.c("switcher-toggle").on("click", () => $switcher.tc("switcher-open")).append(() => {
				span.c("switcher-toggle-label", first.slice(cut));
				icon("expand_more");
			});
		});

		// Real <a> leaves; contextmenu finds path by href lookup. Details: doc/explorer-notes.md.
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

// Transform nest(paths) to ui/item shape: files→links + open-beside button, folders→open branches. Details: doc/explorer-notes.md.
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

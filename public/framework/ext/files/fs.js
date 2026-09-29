import { Page } from "../../core/Page/Page.class.js";
import { div, p, a, icon } from "../../core/View/View.js";
import { files } from "./files.js";
import PageMarkdown from "../../core/Page/Markdown.js";

/* fs — `<any path>/fs/`, that directory's real files, full screen: no sidebar, no
 * page padding. Owner, 2026-09-28: "any path slash fs just loads the file system
 * in full screen mode showing you just the files in that directory ... you could
 * even have a little link to it from any page template."
 *
 * No `page.js` anywhere makes this url exist. `Page.child()`'s `fs_folder()` seam
 * (`core/Page/Page.class.js`) builds one of these the moment anyone asks for a
 * page's own "fs" child — the same shape `md_folder()` already uses for `md/`.
 *
 * ⚠ `.layout-full`, not the newer `width: "full"` word. `core/Page/words.js` says
 *   "`full` is `.page.solo`", but nothing paints `.page-w-full` today — checked
 *   2026-09-28, there is not one CSS rule for it anywhere on the site — so saying
 *   `width: "full"` would not, in fact, remove the site's own left sidebar.
 *   `.layout-full` does (`position: fixed`, `styles/layouts/layouts.css`) and is
 *   already worn by `styles/layouts/full.js` and `ext/Panel/playground` — reused
 *   here, not invented. Its `.layout-close` button is the "way back at the top"
 *   `words.js` already promises for `full`.
 */
export default class PageFiles extends Page {

	// No `title`, so no `h1` — like `styles/layouts/full.js`, nothing sits above
	// the file browser. The files box (or the message in its place) ends up the
	// LAST child of `.page.layout-full`, which is what makes
	// `.layout-full > :last-child { flex: 1 1 auto; min-height: 0 }` — already in
	// `layouts.css` — give it the rest of the window. No new CSS.
	render(){
		return this.view ??= div.c("page layout-full", $page => {
			a.c("layout-close", () => icon("close")).href(this.parent?.url ?? "/");

			// First paint is this folder's own files (one request); the whole tree, a
			// folder's file list (files.jsonl) at a time, then replaces it. `this.selected` (set by
			// `route()` below) rides along on BOTH paints, so a deep link shows the
			// right file selected even in the fast, partial first paint.
			const dir = this.folder ?? this.url;
			let $shown;
			const show = names => $page.append(() => { $shown?.el.remove(); $shown = this.draw_files(names, dir); });
			this.constructor.list(dir, 1).then(first => {
				if (first?.length) show(first);
				if (first === null) return show(null);
				this.constructor.list(dir).then(all => { if (all.length > first.length || !first.length) show(all); });
			});
		});
	}

	draw_files(names, dir){
		if (names === null)
			return p.c("muted", "This server has no file list (no `files.jsonl`, no `/directory.json`) — /fs/ only works on the dev server, never on the live site.");
		if (!names.length)
			return p.c("muted", "No files under " + dir + ".");
		return files({ url: location.origin + "/" }, names.join(" "), { fill: true, open: 1, select: this.selected });
	}

	// Every url segment after `fs/`, ONE AT A TIME (`Page.child()`'s own contract —
	// Router.js never parses a whole url). A segment that looks like a FILE (has a
	// `.extension`) selects it; anything else is a SUBFOLDER segment that needs one
	// more hop before a file shows up — `/fs/doc/tree.md/`, `/fs/doc/file/
	// files.js.md/`, any depth. Both forms are real: `file_link()` always anchors at
	// a file's own IMMEDIATE parent (`ext/filesystem/file_link.js`), but `ext/Doc`'s
	// own "Open full screen" link opens the whole MODULE's `/fs/` — a click two or
	// three levels into that module's own subfolders reaches here through more than
	// one segment.
	//
	// ⚠ The accumulated path lives on the NEW page's own `fs_prefix` field, set
	// ONCE at construction and never mutated afterward. An earlier version
	// (2026-09-29, minion-fs-data) instead appended to `this.fs_prefix` on the SAME
	// cached page every subfolder segment reused — so a second deep link into a
	// DIFFERENT subfolder inherited the first one's leftover prefix (review finding
	// 6, `ai/2026-09-29/file-system/review.md`). Every subfolder segment here gets
	// its OWN fresh page instead; `Page.child()`'s generic path already adopts it as
	// a real child (`this.add(name, claimed)`), so the SAME subfolder visited twice
	// reuses that SAME child object next time, same as any other page on the site —
	// nothing here needs to remember a visit itself.
	//
	// ⚠ A NEW page per FILE too (`new this.constructor(...)`), not `this` reused. A
	// version that returned `this` for every file existed because an EARLIER
	// version of THIS SAME method put both the folder page and the file page in the
	// DOM at once, the folder one hidden but still showing its own unrelated
	// default selection — but reusing `this` traded that bug for a worse one:
	// `Router.activate()` diffs the active chain by OBJECT IDENTITY, and a page
	// that returns itself for every file looks unchanged to it, so an in-app click
	// from one file to another updated the url and left the old file's code on
	// screen. `PageFilesExplorer.container()` (explorer.js, v2) is the real fix for
	// the ORIGINAL bug: every page in this chain now mounts as a SIBLING in the
	// nearest ancestor's own `$pages`, where `Page.css`'s arrangement contract ("an
	// ancestor is REPLACED BY a SIBLING") hides whichever one isn't the active
	// leaf — so a fresh page per segment is safe again, and the router does the
	// re-rendering it already knows how to do for every other page on the site.
	route(name){
		const is_file = /\.[^./]+$/.test(name);
		const prefix = (this.fs_prefix ?? "") + decodeURIComponent(name) + (is_file ? "" : "/");

		if (!is_file) return new this.constructor({ folder: this.folder, fs_prefix: prefix });

		const base = (this.folder ?? this.url).replace(/^\/+/, "");
		return new this.constructor({ folder: this.folder, selected: base + prefix });
	}

	// Every real file under `dir` (a site-root path, e.g. "/framework/ext/files/"),
	// as paths relative to the site root — what `files()` wants when handed
	// `{ url: location.origin + "/" }` instead of a page's own `import.meta`. The
	// same walk `PageMarkdown` does (`core/Page/Markdown.js`): each folder's own
	// file list (files.jsonl, or a jsonl page's page.jsonl), a level at a time in parallel up to `PageMarkdown.budget` folders
	// (the rest from one directory.json read), into child pages too, and every
	// file, not only the markdown ones. `depth` is what makes the two-step paint in
	// `render()` above possible — `1` for "just this folder, fast", nothing for
	// "the whole tree".
	// ⚠ `null` (no file list at all — production, no page.jsonl and no
	//   directory.json) reads differently from `[]` (nothing here): the caller
	//   shows a different message for each.
	static async list(dir, depth){
		const found = await PageMarkdown.walk(dir, { pages: true, depth });
		if (found === undefined) return null;

		const root = dir.replace(/^\/+/, "");
		return found.map(name => root + name)
			.sort((x, y) => x.split("/").length - y.split("/").length || x.localeCompare(y));
	}
}

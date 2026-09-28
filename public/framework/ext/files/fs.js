import { Page } from "../../core/Page/Page.class.js";
import PageMarkdown from "../../core/Page/Markdown.js";
import { div, p, a, icon } from "../../core/View/View.js";
import { files } from "./files.js";

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
		return this.view ??= div.c("page layout-full", () => {
			a.c("layout-close", () => icon("close")).href(this.parent?.url ?? "/");

			return this.constructor.list(this.folder ?? this.url).then(names => () => {
				if (names === null)
					return void p.c("muted", "This server has no file list (`/directory.json`) — /fs/ only works on the dev server, never on the live site.");
				if (!names.length)
					return void p.c("muted", "No files under " + (this.folder ?? this.url) + ".");

				files({ url: location.origin + "/" }, names.join(" "), { fill: true, open: 1 });
			});
		});
	}

	// Every real file under `dir` (a site-root path, e.g. "/framework/ext/files/"),
	// as paths relative to the site root — what `files()` wants when handed
	// `{ url: location.origin + "/" }` instead of a page's own `import.meta`. Walks
	// the same `/directory.json` tree `PageMarkdown` already reads
	// (`core/Page/Markdown.js`), just without its `.md`-only filter — every file,
	// not only the markdown ones.
	// ⚠ `undefined` (no `/directory.json` at all — production, no dev server) reads
	//   differently from `null` (the folder itself isn't in the tree): the caller
	//   shows a different message for each.
	static async list(dir){
		const node = await PageMarkdown.node(dir);
		if (node === undefined) return null;
		if (!node) return [];

		const root = dir.replace(/^\/+/, "");
		const found = [];

		const walk = (node, rel) => (node?.children ?? []).forEach(child => {
			if (child.type === "file") found.push(root + rel + child.name);
			else if (child.type === "dir") walk(child, rel + child.name + "/");
		});
		walk(node, "");

		return found.sort((x, y) => x.split("/").length - y.split("/").length || x.localeCompare(y));
	}
}

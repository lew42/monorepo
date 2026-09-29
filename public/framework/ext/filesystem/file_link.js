import { root, resolved } from "./tree.js";
import FsDir from "./FsDir.js";

/**
 * file_link(path, line?) — a link to a file, opened inside `/fs/` with the tree already
 * open to it: `<the deepest ancestor folder with a real page.js>/fs/<the rest of the
 * path>/#L<line>`.
 *
 *   file_link("framework/ext/filesystem/FsFile.js")
 *     "/framework/ext/filesystem/fs/FsFile.js/"
 *   file_link("framework/ext/filesystem/FsFile.js", 42)
 *     "/framework/ext/filesystem/fs/FsFile.js/#L42"
 *   file_link("framework/ext/files/doc/file/files.js.md")
 *     "/framework/ext/files/fs/doc/file/files.js.md/"   — see "Anchoring" below
 *
 * `path` is site-root relative, leading slash optional either way. Still SYNCHRONOUS
 * (returns a string, not a Promise) — `ext/files/explorer.js` calls this once per row
 * while building a whole tree, so switching to async would mean awaiting hundreds of
 * calls in a loop, across files this module doesn't own. `ext/files/fs.js`'s
 * `PageFiles.child()` is the other half: it reads the trailing path back off a url
 * built this way and pre-selects that file, one segment at a time.
 *
 * ── Anchoring (2026-09-29) ──────────────────────────────────────────────────────────
 * `/fs/` is NOT always put right after the file's own immediate folder — a folder can
 * be a real thing on disk with no page of its own (`ext/files/doc/file/`, the per-file
 * doc notes) or SHADOWED by a page's own special child name (`ext/Doc`'s "doc" tab
 * intercepts a literal `doc/` subfolder the same way `md`/`fs` are reserved
 * everywhere) — either way, `Page.child()` never reaches a real page for that
 * directory, so a link anchored there always 404s. This walks UP from the file's own
 * folder to the DEEPEST ancestor that has a real `page.js`, which is always a real,
 * resolvable page — so its own `fs/` seam (`core/Page/Page.class.js`'s `fs_folder()`)
 * is always reachable, and `PageFiles.child()`'s multi-segment handling (fs.js) shows
 * the rest of the path as a subfolder inside it.
 *
 * ⚠ Reads the shared site tree (`ext/filesystem/tree.js`'s `root()`/`resolved()`) to
 * find that ancestor — the one thing this file needed a fetch for. Since this function
 * must stay synchronous, it answers with the OLD (immediate-parent) anchor until that
 * tree has resolved at least once IN THIS TAB; every later call, anywhere on the site,
 * gets the correct one. In practice this covers every real caller: `ext/files/fs.js`'s
 * `PageFiles` (and `explorer.js`, built on it) always `await`s `list()` — which itself
 * `await`s `root()` — before it ever calls `file_link()` to build a row, so by the time
 * a file tree calls this in a loop, `resolved()` is already set from THAT SAME await,
 * not a second, racing fetch of its own.
 *
 * ⚠ The TRAILING SLASH after the path is load-bearing, not decoration — every page url
 * on this site already ends in one, and `Server/Server.js` also now falls through to
 * the app for any url CONTAINING `/fs/`, slash or not (2026-09-29), for a url typed by
 * hand rather than built by this function.
 *
 * ⚠ Not the whole story: this only chooses which file is SELECTED. Line highlighting —
 * scrolling to and marking `#L42` once the page is open — is built in `ext/files`
 * (`code.file(…, { lines: true })`'s gutter, `mark_lines()`), not here.
 *
 * ── Servex/ and Server/ (2026-09-29) ────────────────────────────────────────────────
 * Those two run this site from OUTSIDE `public/`, so `/directory.json` (and this whole
 * ancestor walk) never lists them and no per-folder `/fs/` seam can ever reach them.
 * `/framework/servex/fs/` is the one page that browses both — `Server/plugins/
 * DevSource.js` (dev only) — selecting with the SAME `?file=` query `files()` already
 * reads everywhere else, not a `<dir>/fs/<name>/` path (`servex/fs/page.js`'s own
 * comment has the full reasoning). `file_link("Servex/Servex.js", 40)` reaches it.
 */
function anchor_dir(clean){
	const segments = clean.split("/").slice(0, -1);
	root();   // starts the fetch if nobody has yet — a no-op once it has (memoized)

	const site = resolved();
	if (site instanceof FsDir)
		for (let i = segments.length; i > 0; i--){
			const dir = segments.slice(0, i).join("/");
			const node = site.find(dir);
			if (node?.children?.some(child => child.name === "page.js")) return dir + "/";
		}

	return segments.length ? segments.join("/") + "/" : "";
}

export function file_link(path, line){
	const clean = path.replace(/^\/+/, "");

	if (/^(Servex|Server)\//.test(clean))
		return "/framework/servex/fs/?file=" + encodeURIComponent(clean) + (line ? "#L" + line : "");

	const dir = anchor_dir(clean);
	const rel = clean.slice(dir.length);
	return "/" + dir + "fs/" + rel + "/" + (line ? "#L" + line : "");
}

export default file_link;

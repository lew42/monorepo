# files.js — history and reasons

## API and behavior (lines 9–50)

`files()` — a small file browser: a tree of real files, and the one you clicked, side by side. A folder opens and closes on click; the seam between two columns drags to resize the one on its left.

Examples:
```
files(import.meta, "example/index.html example/app.js example/page.js")
files(import.meta, names, { about: path => md.file(meta, `doc/file/${path}.md`) })
```

Options:
- `about` — anything to render BESIDE the source, called once per shown path with a view or a promise of one; given one, the browser is three columns (tree | about | source) instead of two. `ext/Doc`'s Files tab passes this.
- `route` — the url query key for the selection (default "file"); `route: false` keeps the url alone.
- `fill` — the box fills its parent's height instead of a fixed max, so the COLUMNS scroll and the page does not. For a full-screen host (minion B's /fs).
- `open` — folders open down to this depth at start (default: every folder). A folder past that depth builds its rows on first click, not before — for a tree of thousands of paths.
- `select` — pre-select this exact path on first draw instead of `paths[0]`. `ext/files/fs.js`'s `PageFiles` passes this so a `file_link()` url opens `/fs/` with that file already showing. `?file=` in the url (if `route` is on) still wins once the visitor clicks around.
- `lines` — the source column gets a line-number gutter (`ext/highlight`'s `code.file(…, { lines: true })`), and `#L42` / `#L40-L48` in the url scrolls to and highlights those lines (see `mark_lines()`, also exported so `ext/files/fs.js`'s v2 explorer can wire the same behavior). Off by default: a plain two-column caller is unchanged.

The selection lives in the url — ?file=a.js — for the first files() on a page.

A row's right-click opens a small menu (`ext/filesystem/menu.js`): Copy path, Open in /fs, Open raw.

The files are FETCHED, so what you read is what is on disk. The longest common directory is stripped for display, so a doc folder reads as a project.

⚠ Paths resolve against `import.meta`, never the document — the SPA fallback makes the document url a route. Design record: framework/ext/files/readme.md.

## URL ownership — one files() per page (lines 60–69)

Only ONE files() per page may own the url query: the first one drawn, until it leaves the DOM. Any other keeps its selection to itself instead of fighting over it.

## tree() and rows() — lazy opening and marked row (lines 148–170)

The tree is marked with the file that is showing. A row carries the DECLARED path rather than an index into the list: `nest()` groups by directory, so tree order stops being declaration order the moment two paths interleave folders. `open` folders open eagerly to that depth; a folder past it opens — and builds its rows — on first click, and stays open at every ancestor of the selected file so a deep link is never hidden.

Each row's markup is drawn by `FsFile.render()` / `Dir.render()` (`ext/filesystem`) — one place owns "what a file/directory row looks like". `FsFile.render()` already wears `ui/item`'s row; `Dir.render()` doesn't yet. `rows()` owns the tree-widget part those classes don't know about: which folders start open, and building a folder's children only on first click.

⚠ `nest()` keeps its plain `{ "name": "path", dir: {…} }` shape ON PURPOSE — `ext/Doc`'s own `note_tree()` (Doc.js) imports `nest()` too, for a tree of routed note PAGES rather than files, and reads that exact shape with `Object.entries` + `typeof child === "string"`. Rebuilding `nest()` itself into `Dir`/`FsFile` instances would silently break Doc's tree — so the new classes are built HERE, per row, from the same plain node `nest()` already produces.

## contextmenu handler — path resolution (lines 118–122)

`row.dataset.path` is the DECLARED path — relative to THIS caller's own `meta.url`, same as what `source()` fetches with (`new URL(path, meta.url)`). The menu wants a site-ROOT path (what `file_link()` and a raw fetch both take), so it's resolved here, once, the same way.

## source() — optional ext/highlight (lines 201–208)

`ext/highlight`, softly — the same deal demo() and `ext/Doc` make. With it loaded a file arrives highlighted and cached; without it, the text in a `<pre>`. An ext may lean on an ext; only core may never.

`lines` asks `code.file()` for the gutter (ext/highlight's own `{ lines: true }` option) — silently ignored on the no-highlight fallback below, since a plain fetched `<pre>` has no `.code-line`s for `#L42` to find; the file still shows, just without the anchor.

## mark_lines() — hash anchors and line hits (lines 218–229)

`#L42` or `#L40-L48` in the url → the matching `.code-line`s (built by ext/highlight's `code.file(…, { lines: true })`) get `.line-hit` and the first one scrolls into view. `$host` is whatever box holds ONE such code block — `files()` above passes its own `$source`; `ext/files/fs.js`'s v2 explorer, which can have several code columns open at once, calls this once per column, and each call only ever touches the `.code-line`s inside ITS OWN `$host`, so two open files never cross-highlight.

⚠ Open item: if the hash's line NUMBER happens to exist in more than one open column, every one of them lights up — there is nothing in `#L42` alone that says which file it means once more than one is on screen. Harmless (nothing breaks, nothing is lost), just a display ambiguity a future pass could resolve by putting the file in the hash too.

GitHub's own range spelling repeats the "L" (`#L40-L48`, the brief's own example) — `-L?` makes it optional so `#L40-48` still works too.

## watch_lines() — hashchange listener and measured behavior (lines 250–281)

`#L42` clicked from a gutter this module (or `ext/files/fs.js`'s v2 explorer) already drew only changes `location.hash` — a same-page anchor, not a navigation, so it fires `hashchange`, never `popstate`. ONE listener for the whole module, registered exactly once at import time and never removed — what would need removing, per host, per render, is the SET MEMBERSHIP instead: every `$host` this is called with goes into `hosts`, and a disconnected one is pruned the moment the listener next runs, so nothing accumulates the way a fresh `addEventListener` per `files()` call (or per v2 explorer render) used to.

Review finding 10 (2026-09-29): "files.js adds a hashchange listener on every `lines: true` call… neither is ever removed" — solved by the set-membership pattern above.

⚠ `isConnected` alone is not "on screen": `ext/files/explorer.js`'s v2 keeps a folder's own bare page mounted (hidden, `display: none`) once a file inside it has been opened — Page.css's arrangement contract hides it, `isConnected` does not agree (measured live, 2026-09-29: a gutter click marked the SAME line number in both the visible file and the hidden folder page's own default selection). `checkVisibility()` is the one DOM primitive that reads the CSS, not just the tree.

## common_dir() — shared path prefix (lines 283–299)

How much of the front of every path is the same directory. Character-wise would happily cut "app" out of "app.js" and "app2.js", so this compares whole segments and only ever cuts at a slash.

Exported (2026-09-29) for the same reason `nest()` was: `ext/files/fs.js`'s v2 explorer builds its OWN multi-column source area on top of this module's tree, and wants the identical shortened display path `files()` already computes — one rule, not two copies that could drift.

## nest() — plain object tree structure (lines 301–345)

`nest()` transforms a flat list of paths into a tree structure:
```
["ex/app.js", "ex/about/page.js"] -> { "app.js": "ex/app.js", about: { … } }
```

A string leaf is a file and holds its FETCHABLE path; an object is a directory. Insertion order is declaration order, which is the order the author wants them read in.

When paths contain ".." stepping outside the base folder, they are normalized relative to the common ancestor instead of creating nested ".." tree rows.

Exported (2026-09-28) so ext/Doc can group nested note names the same way, for its own tree of real routed pages — additive only, `files()`'s own signature and behavior are unchanged.

A path ENDING in "/" (a bare directory marker, no file after it — e.g. core/Page's own `{"file": "Inbox/"}` line) splits to a trailing "" here. The `forEach` above already made the directory node exist; writing an empty-named leaf INTO it was an unlabelled row with no name and nothing to click (found 2026-09-30, core/Page/ext/'s own file tree, under "Inbox"). A real file never has an empty name, so this guard only ever catches the bare-directory case.

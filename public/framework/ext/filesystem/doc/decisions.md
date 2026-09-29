# ext/filesystem — decisions

Brief: `public/framework/ai/2026-09-29/file-system/minion-a/requirements.md`. Owner's own
words: `../owner-words.md` in that task's folder.

## Names: `FsFile` / `FsDir`, not `File` / `Directory`

The owner's own words named a "file and directory" data structure, and the brief flagged
the obvious short names, `File`/`Directory`, as worth weighing because `File` is also the
browser's real global (what a `<input type=file>` or a drop hands you). Nothing on this
site uses the native `File` API today — checked, no `instanceof File`, no `new File(`
anywhere in `public/framework` — so the collision is not live yet. It costs two extra
characters to remove it for good rather than leave it for whichever future feature (a
drag-drop upload, most likely) needs the real `File` in the same file that also imports
ours. `FsFile`/`FsDir` — prefixed with the ext's own name, same idea as `PagingStage` or
`PagingSwapper` carrying their realm's prefix (`code` skill §4).

## The url form: `<file's own parent dir>/fs/<file name>/#L<line>`

`file_link("framework/ext/filesystem/FsFile.js", 42)` → `/framework/ext/filesystem/fs/FsFile.js/#L42`.
The directory in the url is always the file's own IMMEDIATE parent, never a shorter or
longer prefix — that keeps `PageFiles.route()` (`ext/files/fs.js`) simple: a trailing url
segment that looks like a filename (has a `.extension`) is always a direct file of the
folder that `/fs/` is already showing, never a path with more slashes in it.

⚠ **The trailing slash after the file name is required, found the hard way by the smoke
test.** `Server/Server.js`'s SPA fallback refuses any url ending in a real
`.extension` — it 404s outright rather than serving the app — so `.../fs/FsFile.js`
with nothing after it never reaches the router at all. `.../fs/FsFile.js/` does.
`file_link()` always adds it; nothing that reads the url needs to know why.

Minion B builds scrolling to and highlighting the `#L` line itself — this only makes sure
the right FILE is selected when the link is opened. That's `PageFiles.route()` (new) +
`files()`'s new `select` option (`ext/files/files.js`) — see "What's reused" below.

## `nest()` keeps its old shape on purpose

`ext/files/files.js`'s exported `nest()` builds a plain `{ "name.js": "path", dir: {…} }`
tree from a flat path list. The obvious reading of deliverable 5 ("`files()`'s tree use
the new objects") is: rebuild `nest()` itself out of `FsFile`/`FsDir`. That would have
broken a caller outside this task's fence: `ext/Doc/Doc.js`'s `note_tree()` imports
`nest()` too, for its OWN tree of routed note pages, and reads the exact plain shape with
`Object.entries` + `typeof child === "string"`.

So `nest()`'s return value is untouched, and `files.js`'s `rows()` — the ONE place that
draws a file-browser row from that tree — builds a `new FsFile(...)`/`new FsDir(...)` per
row, on the fly, just to call `.render()` for the markup. Same visible result, same
`nest()` contract for every caller, and the row markup now lives in one place (`ext/filesystem`)
that a later pass can swap to `ui/item` by changing two methods.

## `ui/item` for the file row, not the folder row (2026-09-29, after `michael/dev` merged `worktree/item-ui`)

`FsFile.render()` now draws its row with `ui/item`'s `item({ icon, name })` instead of
hand-rolled markup — `ui/item/doc/reuse.md` (written by the item-ui task, independently)
found the exact same split this module already needed: a leaf row is a free, no-behavior
swap, but a FOLDER row is not, because `ext/files/files.js`'s `rows()` opens/closes and
lazily builds a folder's children by hand, and `ui/item`'s tree mode hands that job to the
browser's own `<details>`/`<summary>` instead — adopting it for folders means rewriting
that click-routing, not just changing a class. `FsDir.render()` stays hand-rolled. If a
later task rewrites `rows()`'s folder handling around `<details>`, folders can make the
same swap then.

## What's reused

- `core/Page/Markdown.js`'s `tree()` is the one `/directory.json` fetch — `ext/filesystem/tree.js`'s
  `root()` builds its `FsDir` tree from that same cached promise, never fetches twice.
- `ext/Saver/FileSaver.js`'s socket `write` rpc and `ext/Ask/edit.js`'s `edit()` gate —
  `FsFile.write(text)` calls the rpc directly (raw text, not `FileSaver`'s JSON-stringify,
  since a source file isn't a saved document) but the "am I even allowed to write" check
  is the same one every other editor control on the site uses.
- `ext/files/fs.js`'s own file-walking loop (duplicated from `Markdown.js`, per the audit)
  is gone — it now calls `FsDir.find()` + `.walk()`.

## Open

- **`css-scopes.txt` is outside this task's fence** (fence: `ext/filesystem/**`, `ext/files/**`,
  the `fs_folder()` seam, one export line in `app.js`, one line in `ext/page.js`). The
  reservation this task needs, for whoever can write that file next:
  ```
  fs-          ext/filesystem (the right-click menu, .fs-menu/.fs-menu-item — file- above stays ext/files')
  ```
- The `fs_folder()` seam in `core/Page/Page.class.js` needed no change for THIS task —
  `Page.child()` already tries `this.route(name)` before falling through to `Page.load()`,
  so `PageFiles.route()` (new, in `ext/files/fs.js`) was enough on its own. It changed
  later, 2026-09-29, for a different reason: `fs_folder()` now picks between two
  CLASSES (`ext/files/fs.js`'s `PageFiles`, `ext/files/explorer.js`'s `PageFilesExplorer`)
  by the url's own `?v=1` — the v1/v2 explorer split, `ext/files/doc/decisions.md`.
- `file_link()`'s url also still works with `ext/files/files.js`'s existing `?file=`
  query selection — clicking around after opening a `file_link()` sets `?file=` on top of
  the path-based selection. A visitor sees both forms in the address bar depending on how
  they got there; not reconciled, and not asked for.
- No narrow-screen layout pass on the right-click menu — it can open partly off the right
  edge of a narrow viewport. `ext/files`' tree itself has the same kind of gap already
  (doc/columns.md there); left for whoever does a pass on both.

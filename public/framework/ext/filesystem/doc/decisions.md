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

## `FsDir` → `Dir`, 2026-10-02

Brief: `public/framework/ai/2026-10-02/page-extends-item/page-on-item/requirements.md`
(deliverable 11, "the file classes in ext/filesystem become the file half of the design").

`FsDir` became `Dir` — the owner's own plain word, same as the original naming pass
(above) weighed and rejected for `FsFile` only because of the live `File` global.
`Directory` has no such collision (checked again: no `instanceof Directory`, no
`new Directory(` anywhere in `public/framework`), so there was nothing left to
protect against by keeping the `Fs` prefix on this one. `FsFile` is UNCHANGED and
stays prefixed — `File` is the browser's own built-in for a picked upload (drag-drop,
`<input type=file>`), and renaming to the shorter `File` would shadow it silently in
the first file that needs both.

`FsDir.js` is now a one-line re-export (`export { default } from "./Dir.js";`) so any
import still written against the old name keeps working — nobody has to chase down
every caller before a page.js description or a doc link gets this file's name right.

Every REAL usage (import, `instanceof`, `new`, JSDoc mention) was grepped across
`ext/filesystem/**` and `ext/files/**` and moved to `Dir`: `tree.js`, `file_link.js`,
`ext/files/files.js`, plus the JSDoc comments in `FsFile.js` that named the class it
sits beside. Two files in the brief's own list of seven turned out to need no code
change at all: `ext/files/explorer.js` never imports `FsDir` (it only reaches
`file_link()`/`context_menu()`, never the class itself), and `FsFile.js` never
imported it either — just mentioned it in prose, now updated. `page.js`'s own file
list and description were updated too, so the Doc page shows `Dir.js` (where the real
class now lives) rather than the thin shim.

## `FsFile.append(line)` + a lazy `store` getter, 2026-10-02

Same brief, same deliverable. `FsFile` gained two members so a `.jsonl` file can be
appended to without a caller hand-rolling the socket RPC:

- `get store()` — `Item.Store.for(this.url)` (`core/Item/Store.js`) for a `.jsonl`
  path, `undefined` otherwise. `Item.Store.for()` already caches one instance per url,
  so two `FsFile`s built for the same path (a fresh instance per tree row, same as
  `Dir`) still share the one writer and its one echo-skip list — never a second
  reader racing the first.
- `append(line)` — validates `line` is a plain object (not an array, not a string;
  the same shape check `core/Item/Item.js`'s own `is_plain` uses), validates the path
  ends in `.jsonl`, checks the same `edit()` gate `write()` already does (no dev
  socket → warn once, return `false`), then calls `this.store.append(line)` and
  returns `true`. It does NOT call `Socket.singleton().async_rpc("append", ...)`
  directly — `Item.Store.append()`/`flush()` (`core/Item/Store.js`) already does
  exactly that, queued and batched one microtask later, and is the path `ext/JSONL`
  itself writes through. Hand-rolling a second call here would give a `.jsonl` file
  two writers that don't know about each other's `sent` echo-skip list — the bug
  `Store.js`'s own top comment says it exists to prevent.
- `store.append()`/`flush()` are fire-and-forget (no promise worth awaiting, no
  return value) — so `append()` returns `true` right after queuing, once validation
  and the `edit()` gate both pass, rather than awaiting a flush that resolves to
  nothing.

`Item` is imported statically at the top of `FsFile.js` (`import Item from
"../../core/Item/Item.js"`) rather than lazily like `write()`'s own `edit()`/`Socket`
— `ext/` importing `core/` is always fine, only the reverse never is, and
`core/Item/Item.js` touches no DOM at module load (unlike `core/View/View.js`, which
is why `write()` keeps its own imports lazy).

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

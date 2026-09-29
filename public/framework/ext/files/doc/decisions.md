# files — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance. Rewritten 2026-09-28
when `ext/Panel` came out — see [columns](./columns.md) for that decision in full.*

A small file browser: a tree of real files on disk, fetched, the prose written about the
one you clicked (when a caller passes `about`), and its source — two or three plain flex
columns in a row, resized by dragging the seam between them
([`ext/grip`](/framework/ext/grip/)). `files()` is still the only door; everything now
builds in the one file, `files.js` — the second file, `panels.js`, that used to hold the
arrangement is deleted.

## Fetched, not literal

The files are `fetch`ed at view time, never pasted in as string literals — a literal rots
the moment the real file changes and nobody notices. The cost is a directory of files
nobody imports; the payment is that the shown file cannot be wrong. Full record,
including why the example files still don't become routes: [fetched](./fetched.md).

## The tree

Paths are grouped into a nested object, the longest shared directory is stripped so
`example/app.js` reads as `app.js`, and a click is resolved by reading `data-path` off
the row rather than an index into the declared list — the index approach broke the
moment two paths interleaved directories. Folders open and close on click, and a folder
past the `open` option's depth doesn't build its rows until the first click on it — added
2026-09-28 because `ext/files/fs.js` can hand this browser a whole directory. Full
record: [tree](./tree.md).

## The columns

Two flex children, or three when `about` is given, each carrying its own `ext/grip` seam
on its right edge except the last. The selection is the only shared state: a click
anywhere in the tree reads `data-path` off the row, and the source (and `about`, if any)
column re-draws itself from that one variable. Full record, including what `ext/Panel`
used to do here and why it came out: [columns](./columns.md).

## `about` — prose beside the source

`about` is called once per shown path and its return — a view, or a promise of one —
fills the `about` column. It is optional (`{ about } = {}`), so every existing caller is
unaffected. Full record, including the "returned, not called" capture trap:
[about](./about.md).

## Built on `ext/filesystem` (2026-09-29)

`ext/filesystem`'s `FsFile`/`FsDir` are the data structures behind every file on the site now
(`/framework/ext/filesystem/`); this module is the browsing UI on top of them, not the other way
around. Two changes: `rows()` builds a `FsFile`/`FsDir` per row and calls its `render()`
for the markup, so the row's look lives in one place that can switch to `ui/item` later;
and `files()` grew a `select` option so a caller can open with a specific path
pre-selected instead of always defaulting to the first name in the list — `ext/files/fs.js`'s
`PageFiles` passes this so a `file_link()` url opens `/fs/` with the right file showing.

`nest()`'s own return shape (a plain `{ "a.js": "path", dir: {…} }` object) is UNCHANGED —
`ext/Doc/Doc.js`'s `note_tree()` imports `nest()` too, for its own tree of routed note
pages, and reads that exact shape. Rebuilding `nest()` itself into `FsFile`/`FsDir` would
have broken it silently. Full reasoning: [`ext/filesystem/doc/decisions.md`](/framework/ext/filesystem/doc/decisions/).

A row's right-click now opens a small menu (`ext/filesystem/menu.js`): Copy path, Open in /fs,
Open raw.

## Decisions

- **Fetch real files, never string literals.** See [fetched](./fetched.md).
- **A tree, not tabs.** Tabs cannot show nesting, and nesting — "a folder with a
  `page.js` is a url" — is the thing this module exists to teach. Peers-only
  tab bars are already served by `Page.tabs()`.
- **Folders open and close, lazily past a depth (2026-09-28).** Superseded the earlier
  "no expand/collapse, these trees are small by construction" verdict the moment a real
  filesystem became a caller. [tree](./tree.md) has the full record.
- **`ext/Panel` came out, replaced by plain flex + `ext/grip` (2026-09-28, the owner's
  call).** The panel arrangement bought a drag-to-resize seam but shipped it bundled with
  a second, unrelated toolbar (`Workspace`'s own add/fullscreen/zoom bar) and a
  split/move/close vocabulary nobody used for a two-or-three-pane browser. [columns](./columns.md)
  has the full argument, including what was deliberately not replaced (the narrow-screen
  stacking axis).
- **No saver, still.** Every visit gets the same seeded column widths; nothing is written
  anywhere. Arranging here is exploring, not authoring — unchanged in spirit from the
  panel version's `MemorySaver`, just without a `Panel` document underneath it.

## Traps

- **⚠ Paths resolve against `import.meta`, never the document.** The SPA
  fallback makes the document url a *route*, so a document-relative fetch
  misses.
- **⚠ A click reads `data-path` off the row, never an index into the declared
  list.** `nest()` groups by directory, so tree order stops being declaration
  order the moment two paths interleave folders. [tree](./tree.md) has the
  bug this replaced.
- **⚠ The tree is never repainted on a selection — only its mark moves.** A
  redraw throws away the scroll position of the row just clicked, so `mark()`
  toggles the class directly on the DOM instead of rebuilding it.
- **⚠ A closed folder's body is `display: none`, not removed**, so a folder built once
  (past `open`'s depth, or an ancestor of the selected file) keeps its rows across a
  close and a reopen instead of rebuilding them.
- **⚠ Only ONE `files()` per page owns `?file=`.** A second call on the same page reads
  the url once but writes nothing back — it keeps its own selection private rather than
  fighting the first one for the query string.

## `<any path>/fs/`, v2: framework nav kept, `#L` line anchors (2026-09-29)

`files()` grew `lines: true` (passed straight to `ext/highlight`'s `code.file(meta, url,
{ lines: true })`) and three exports, `mark_lines($host)`, `watch_lines($host)` and
`common_dir(paths)`, so a second reader of this module's own tree/source machinery
didn't have to re-derive any of them. `watch_lines()` is the ONE `hashchange` listener
for the whole module (registered exactly once, at import time) — every host that wants
`#L42` to move its own highlight adds itself to a shared `Set` instead of each getting
its own listener, which is what a review caught piling up unbounded (finding 10,
2026-09-29). `ext/files/fs.js`'s `v1` (the plain full-screen view, `.layout-full`, no
site nav) is unchanged; a sibling file, `ext/files/explorer.js`, is `v2` — the default
now (`core/Page/Page.class.js`'s `fs_folder()` picks by `?v=1`) — the framework's own
left nav stays, a tree plus one or more code columns fill the rest on a wide screen, a
`.switcher`-pattern dropdown on a narrow one. Every tree row is an ORDINARY link: a
plain click navigates the ordinary way (the router re-renders via `fs.js`'s own
`route()`), Ctrl/Cmd-click is left to the browser's own "open in a new tab", and a
small visible "open beside" button on each file row is the one way to a SECOND code
column, findable without a hidden modifier (review finding 9). Right-click still opens
the same menu `ext/filesystem/menu.js` gives every other file row on the site (finding
1). Full record, including two real bugs found building it (a stale `#L` regex, and a
page that stopped re-rendering on an in-app file-to-file click until `fs.js`'s own
`route()` and this page's `container()` override worked together to fix it for real):
[switcher.md](./switcher.md) and `explorer.js`'s / `fs.js`'s own top-of-file comments —
the decisions live beside the code they explain, not duplicated a second time here.

**`PageFilesExplorer` overrides `container()`, not just `render()`.** Every page mounts
into its own parent's NAMED REGION first (`Page.container()`) — for a page whose parent
is an `ext/Doc` module (every `<module>/fs/` is exactly that), the region is the Doc's
own tab panel, so a plain `render()` override alone left v2 nested one level inside the
Doc's own title-and-tab band, squeezed to the panel's width, "FS" sitting as a stray
extra tab beside Overview (found live, screenshots in `ai/2026-09-29/file-system/
minion-b/shots/`). `container()` now walks to the nearest ANCESTOR that owns a `$pages`
of its own — `Page.prototype.container()`'s own second branch, copied rather than
`app.$pages` (tried first: it skipped past the framework section's own sidebar+content
layout too, since the sidebar lives inside THAT page's render, not the app shell's).

## Open

- **A file's own folder page always builds too, hidden.** Visiting `.../fs/FsFile.js/`
  makes the router walk through the bare `.../fs/` page FIRST (`Page.child()`'s generic
  seam, `core/Page/Page.class.js`) before `route()` (fs.js) builds the file page — so
  the bare folder page renders its OWN default explorer (fetches and highlights
  whichever file sorts first) even though `container()`'s "ancestor replaced by a
  sibling" rule immediately hides it. Harmless to what's ON SCREEN (confirmed:
  `display: none` is real hiding, not a visual bug) and to accessibility (a screen
  reader skips a `display: none` subtree same as a sighted reader), but it is a real
  wasted fetch+highlight on every single file visit, and it is why `document.
  querySelector(".fs-explorer-path")` (or any other single-match query) can return the
  WRONG, hidden copy — found live building this task's own Playwright checks, worked
  around there by filtering for `checkVisibility()`. A real fix would make the bare
  folder page's own `render()` lazy until something actually needs to show it; not
  attempted here — the risk of an under-tested change outweighed the cost of one
  wasted fetch, this task's own budget considered.
- **No narrow-screen stacking.** The old seeded axis (a column below 640px, a row above)
  left with `ext/Panel`; a narrow box now scrolls the whole row sideways instead, the
  same trade `core/Page`'s own columns make. Not yet driven with a pointer at a real
  phone width. [files.css.md](./file/files.css.md) has the open item.
- ~~`css-scopes.txt` needs three lines~~ **Done** (2026-09-29, review finding, now in
  fence): `files-` (this module's columns, `columns.md`'s own Open section has the
  line), `fs-explorer-` (v2's toolbar/head) and `switcher-` (the generic responsive
  shell — deliberately unprefixed, since a reused component keeping its birth
  module's prefix would be the wrong name the moment it moves).
- ~~A deep link to a FILE exists now — a deep link to a LINE does not yet.~~ **Done**
  (2026-09-29): `lines: true` + `mark_lines()` (this file) and `code.file()`'s gutter
  (`ext/highlight`) together read `#L42` / `#L40-L48` back and scroll/highlight it. See
  the v2 section above.

## Who uses it

- [`/framework/start/`](/framework/start/) — the "three real files, no build
  step" walkthrough. No `about`, so two columns.
- `ext/Doc`'s Files tab (`Doc.browser()` in
  [`ext/Doc/Doc.js`](/framework/ext/Doc/)) — every `Doc` module page's Files
  tab, `about` wired to `doc/file/<path>.md`. This page's own Files tab is an
  instance of it, documenting itself.
- `core/Page/Log.js`'s `draw_folder()` — a `page.jsonl` page's own folder, plain (no
  `about`). This is also what every **AI 2 card**'s attached files draw with, since AI 2
  cards are built on `Page.jsonl`.
- `ext/files/fs.js` — the `<any path>/fs` full-screen route, v1 (2026-09-28), which is
  the reason `fill` and `open` exist.
- `ext/files/explorer.js` — the same route, v2 (2026-09-29, the default): reuses `nest()`,
  `common_dir()`, `source()` and `mark_lines()` directly rather than calling `files()`
  itself, because it needs more than one source column at once, which `files()` was
  never built for.

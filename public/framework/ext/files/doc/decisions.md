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

## Open

- **No narrow-screen stacking.** The old seeded axis (a column below 640px, a row above)
  left with `ext/Panel`; a narrow box now scrolls the whole row sideways instead, the
  same trade `core/Page`'s own columns make. Not yet driven with a pointer at a real
  phone width. [files.css.md](./file/files.css.md) has the open item.
- **`css-scopes.txt` needs a `files-` line** (a second namespace beside this module's
  existing `file-`), added by this task's own new columns classes. That file is outside
  this task's write fence; the exact line to add is recorded in [columns](./columns.md)'s
  own Open section.
- No line numbers, and no deep link to a line — wanted the moment a file is
  long enough to discuss a specific line, not wanted yet.

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
- `ext/files/fs.js` — the `<any path>/fs` full-screen route (minion B's half of this
  task), which is the reason `fill` and `open` exist.

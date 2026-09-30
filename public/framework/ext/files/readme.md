# files — a tree of real files on disk, fetched, beside the one you clicked; for pages that teach a directory

**Looking for the full-screen `<any path>/fs/` browser?** That's two other files,
`fs.js` (v1) and `explorer.js` (v2, see below) — this page (`files.js`) is the small
embeddable widget both of them are built on.

## Use

```js
files(import.meta, "example/index.html example/app.js example/page.js")
files(import.meta, names, { about: path => md.file(import.meta, `doc/file/${path}.md`) })
```

Two columns (tree, source); pass `about` and it is three (tree, prose, source) — how
`ext/Doc`'s Files tab works. A folder opens and closes on click. Options: `route: false`
keeps the selection out of the url; `fill: true` makes the box fill its parent's height
instead of a fixed max (for a full-screen host); `open: <n>` opens folders only to depth
`n` at start (default: every folder, as always) — a folder past that depth builds its
rows on first click, not before, so a caller can hand this thousands of paths; `select:
<path>` pre-selects that path instead of the first name in the list; `lines: true` gives
the source a line-number gutter (`ext/highlight`'s own `{ lines: true }`) and makes
`#L42` / `#L40-L48` in the url scroll to and highlight those lines — the v2 explorer,
next, is what turns this on.

## `<any path>/fs/` — two versions

Every folder on the site has a full-screen browser at its own `fs/` (`Page.fs_folder()`,
core/Page/Page.class.js). **v2 is the default** — the framework's own left nav stays,
a tree plus one or more code columns fill the rest on a wide screen, a sticky dropdown
plus one full-width code column on a narrow one (`explorer.js`, built on the generic
[`.switcher`](./doc/switcher.md) pattern). **v1** (`fs.js`), the plain full-screen view
with no site chrome at all, is still one click away — `?v=1` in the url, or the small
"Classic view" (↶) icon in the first code column's own toolbar (not the page head,
which the site's fixed ☰ menu, top right, sits directly over at 1920 and 3440).
`file_link(path, line?)` (`ext/filesystem`) is what most pages link with; it always
opens whichever version the url's own `?v=1` says, same as typing the url by hand.

Every tree row is an ORDINARY `<a href>` (`ui/item`) — a click, a cold load, a shared
link and a screen reader all work the plain way, through the site's own router (a fresh
page per file, `fs.js`'s own `route()`), and Ctrl/Cmd-click is left alone for the
browser's own "open in a new tab". A second CODE COLUMN — the one thing a plain link
can't do — opens from a small **✂ "open beside" button** on the row itself, ONE button,
not a hidden modifier key: it puts that file in a new column without leaving the one
already open. It stays out of the way until you need it — hidden until you hover or
keyboard-focus that row, and always shown on whichever row is already open as a column
(a phone has no hover, so that row is the only one a touch reader ever sees a button
on) — the owner's own fix, 2026-09-29, after seeing it on every row at once made the
tree "a column of icons."

**This `fs/` (and `core/Page`'s own `md/`) is a "path extension"** — every page gains
this url whether it asks for it or not, the opposite of `core/Page/ext`'s opt-in
`{"ext": "Name"}` lines. The full census of this kind, and why neither moved onto
that opt-in system: [`core/Page/ext/doc/path-extensions.md`](/framework/core/Page/ext/doc/path-extensions.md).

Right-click a row for a small menu: Copy path, Open in /fs, Open raw
([`ext/filesystem`](/framework/ext/filesystem/)). Every file and directory here is now an `FsFile`/`FsDir`
from `ext/filesystem` — the data structures behind every file on the site — and `file_link(path,
line?)` (also exported from `/app.js`) makes a link that opens `/fs/` with a specific
file already selected.

Drag the seam between two columns (an [`ext/grip`](/framework/ext/grip/) strip) to
resize the one on its left, plain flex — no panels underneath it as of 2026-09-28.

## Watch out

- Paths resolve against `import.meta`, never the document — a document-relative fetch
  hits the SPA fallback. [doc/decisions.md](./doc/decisions.md)
- A click reads `data-path` off the row, never an index into the declared list — nesting
  reorders. [doc/tree.md](./doc/tree.md)
- The tree is never repainted on a selection, only its mark moves — a redraw loses the
  scroll. [doc/decisions.md](./doc/decisions.md)
- A closed folder builds its rows on first click, not before; the chain of folders
  holding the *selected* file force-opens regardless of `open`, so a deep link is never
  hidden. [doc/tree.md](./doc/tree.md)
- `about` must *return* its view (or a promise); calling a factory instead renders
  nothing, silently. [doc/about.md](./doc/about.md)
- No narrow-screen stacking yet in the plain embeddable `files()` widget — a tight box
  scrolls the whole row sideways rather than stacking a column. [doc/columns.md](./doc/columns.md)
  The `<any path>/fs/` explorer (v2) solves this a different way, with the
  [`.switcher`](./doc/switcher.md) dropdown pattern — it is not (yet) the same fix folded
  back into `files()` itself.
- The first `files()` on a page owns the url query (`?file=a.js`); later ones keep their
  choice private. [doc/decisions.md](./doc/decisions.md)
- `#L42` line anchors only work where `lines: true` was passed (`code.file()`'s own
  gutter option, `ext/highlight`) — without it a file still shows, just with no line
  numbers to anchor to. [doc/decisions.md](./doc/decisions.md)
- A container query cannot restyle the element that establishes it — `switcher.css`'s
  own top comment has the trap, found live building v2. [doc/switcher.md](./doc/switcher.md)

## Later

- A per-file readme in a third column (the owner: not now).
- The 2-column "code + rendered page" mode and its switcher bar (1 column / 2 columns / code +
  rendered) were cut outright along with `ext/Panel`, not just re-plumbed onto plain columns —
  it can come back on request.

## More

- [Overview](/framework/ext/files/) · [doc/decisions.md](./doc/decisions.md) — the record: decisions, traps, open items, who uses it
- [doc/fetched.md](./doc/fetched.md) — why real files, never string literals; why the examples aren't routes
- [doc/tree.md](./doc/tree.md) — nesting, the shortened display path, selection by `data-path`, open/close
- [doc/columns.md](./doc/columns.md) — why `ext/Panel` came out, what plain flex + `ext/grip` replaced it with
- [doc/about.md](./doc/about.md) — the prose hook's contract, placement, capture trap
- [doc/switcher.md](./doc/switcher.md) — the v2 explorer's responsive shell, and how to reuse it elsewhere
- `doc/file/<path>.md` — one note per source file, shown in the Files tab
- Files that matter: `files.js` (the embeddable widget: door, tree, columns, `#L` marking),
  `files.css` (frame, columns, tree rows), `fs.js` (v1, full screen, no site nav),
  `explorer.js` (v2, the default — framework nav kept, tree + code columns / mobile
  switcher), `switcher.css` (the generic responsive shell v2 is built on)

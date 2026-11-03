# files — detail (moved from the readme)

<!-- moved verbatim from readme.md lines 28-91, 2026-10-12 readme audit -->

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


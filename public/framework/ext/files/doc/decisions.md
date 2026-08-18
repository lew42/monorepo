# files — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

A small file browser: a tree of real files on disk, fetched, the prose written
about the one you clicked, and its source. Since 2026-08-16 those three are
**[ext/Panel](/framework/ext/Panel/) leaves** rather than flex columns, so the
seams between them are grips you drag and any region can be split, moved or
closed. `files()` is still the only door; `panels.js` is what it arranges.

Two regions or three: the prose pane exists only where a caller passed `about`,
which is how `ext/Doc`'s Files tab turns a module's directory into a pseudo-IDE.

## Fetched, not literal

The files are `fetch`ed at view time, never pasted in as string literals — a
literal rots the moment the real file changes and nobody notices. The cost is a
directory of files nobody imports; the payment is that the shown file cannot be
wrong. Full record, including why the example files still don't become routes:
[fetched](./fetched.md).

## The tree

Paths are grouped into a nested object, the longest shared directory is
stripped so `example/app.js` reads as `app.js`, and a click is resolved by
reading `data-path` off the row rather than an index into the declared list —
the index approach broke the moment two paths interleaved directories. Folders
render open and stay open; there is no expand/collapse. Full record:
[tree](./tree.md).

## The panels

One workspace, seeded once per call and saved nowhere. The selection is the
only shared state: a click anywhere in the workspace reads `data-path` off the
row and `repaint()`s every leaf that draws the selected file, so two source
panels side by side both track it. Full record, including the axis question a
phone asks: [panels](./panels.md).

## `about` — prose beside the source

`about` is called once per shown path and its return — a view, or a promise of
one — fills the `about` region. It is optional (`{ about } = {}`), so every
existing caller is unaffected. Full record, including the "returned, not
called" capture trap: [about](./about.md).

## Decisions

- **Fetch real files, never string literals.** See [fetched](./fetched.md).
- **A tree, not tabs.** Tabs cannot show nesting, and nesting — "a folder with a
  `page.js` is a url" — is the thing this module exists to teach. Peers-only
  tab bars are already served by `Page.tabs()`.
- **No expand/collapse.** These trees run three to six entries by construction;
  a doc example that needs collapsing is too big for one. `<details>` already
  does this with no JS, the day one genuinely does.
- **Panels replaced the flex columns everywhere, not just on `Doc`**
  (2026-08-16, the owner's call). The ask was `ext/Doc`'s Files tab; keeping the old
  arrangement for `/framework/start/` would have left two ways to spell one
  browser, and the CSS that went — a container query, a media query, two
  `max-height`s and four `min-width: 0`s — was all of it answering questions
  ext/Panel answers by construction. What a reader gains is a resizable seam on
  a page that always wanted one; what the module loses is 40 lines of layout.
- **`panels.js` is a second file, and it is imported lazily.** `app.js`
  re-exports `files` for the whole site, so a static import would have loaded
  the dozen-module Panel stack on every page to serve the handful that draw a
  browser. `files()` places its box synchronously and fills it from
  `import("./panels.js")` — which is also what keeps this file under a screen.
- **No saver.** `MemorySaver`, so a rearrangement lives as long as the page and
  every visit gets the seeded one. A persisted layout would mean a document per
  module (or one shared by all of them, which `Page`'s view cache makes a
  last-writer-wins race — ext/Panel's own open issue). Arranging is exploring
  here, not authoring.
- **The tree wears `panel-controls`; the prose and the source do not.** The bar
  is an overlay that lights on hover, and the tree's top edge is a click target
  — without the class the bar lands on the first file in the list, measured.
  The other two abstain for the reason `ext/editor`'s canvas does: they are
  documents, not control surfaces.

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
  toggles the class across every live tree instead. A tree that left the DOM
  drops out of the set on the next pass.
- **⚠ The plain-text fallback pane never checks `resp.ok`.** `code.file()` (the
  `ext/highlight` path) does; the fallback in `source()` does not, so a missing
  file renders whatever the SPA fallback served — usually `index.html`'s
  markup — as if it were the file's contents, with no error. Masked today
  because `app.js` always imports `ext/highlight`; not masked for a caller who
  uses `files()` without it. See
  [file/files.js.md](./file/files.js.md).
- **⚠ A region name that is not in `REGIONS` draws nothing and warns** —
  `blank` exists solely because `Panel.defaults.template` is `"blank"` and a
  reader who splits a panel would otherwise get a silent void.

## Open

- **The axis is chosen once, at seed time.** A browser seeded wide and then
  dragged narrow keeps its three columns, because a split holds its axis at
  every width (ext/Panel's decision, not this module's). The reader can drag;
  nothing re-rolls.
- No line numbers, and no deep link to a line — wanted the moment a file is
  long enough to discuss a specific line, not wanted yet.
- The tree's share of the row is a fraction (`1.5` of `8`), so on a 3440 screen
  it is 560px of file names. Every declared filename on the site fits at 1440
  with room to spare (measured), and a cap would be a second sizing currency
  beside `grow` — reopen if a wide screen starts reading as wasted.

## Who uses it

- [`/framework/start/`](/framework/start/) — the "three real files, no build
  step" walkthrough. No `about`, so two regions.
- `ext/Doc`'s Files tab (`Doc.browser()` in
  [`ext/Doc/Doc.js`](/framework/ext/Doc/)) — every `Doc` module page's Files
  tab, `about` wired to `doc/file/<path>.md`. This page's own Files tab is an
  instance of it, documenting itself.

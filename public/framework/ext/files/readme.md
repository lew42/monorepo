# files — a tree of real files on disk, fetched, beside the one you clicked; for pages that teach a directory

> **⚠ Converge (the owner, 2026-10-02):** file and saving code is scattered across [ext/Saver](/framework/ext/Saver/) (whole-JSON rewrites), [ext/filesystem](/framework/ext/filesystem/) (`FsFile`, `FsDir` → `Dir`), [ext/files](/framework/ext/files/) (the tree UI), [ext/JSONL](/framework/ext/JSONL/), and about 15 direct `Socket` `"append"`/`"write"` calls. Before adding to any of them, consider consolidating: ONE file object (`FsFile`: `read`, `write`, `append`, and a `store` for .jsonl) as the only caller of the dev socket. Logs are appended one line at a time, never rewritten. A `LiveList`'s change events are both the view update and the line that gets appended. Design: [page-item-design.md](/framework/ai/sessions/2026/09/30/proposal-flow/page-item-design.md).

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
- Moved verbatim to [doc/readme-full-2026-10-12.md](./doc/readme-full-2026-10-12.md): detail.
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

- Notes: [doc/explorer-notes.md](doc/explorer-notes.md) — history and lessons moved out of the code comments.

- Notes: [doc/files-notes.md](doc/files-notes.md) — history and lessons moved out of the code comments.

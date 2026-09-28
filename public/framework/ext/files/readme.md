# files — a tree of real files on disk, fetched, beside the one you clicked; for pages that teach a directory

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
rows on first click, not before, so a caller can hand this thousands of paths.

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
- No narrow-screen stacking yet — a tight box scrolls the whole row sideways rather than
  stacking a column. [doc/columns.md](./doc/columns.md)
- The first `files()` on a page owns the url query (`?file=a.js`); later ones keep their
  choice private. [doc/decisions.md](./doc/decisions.md)

## Later

- A per-file readme in a third column (the owner: not now).

## More

- [Overview](/framework/ext/files/) · [doc/decisions.md](./doc/decisions.md) — the record: decisions, traps, open items, who uses it
- [doc/fetched.md](./doc/fetched.md) — why real files, never string literals; why the examples aren't routes
- [doc/tree.md](./doc/tree.md) — nesting, the shortened display path, selection by `data-path`, open/close
- [doc/columns.md](./doc/columns.md) — why `ext/Panel` came out, what plain flex + `ext/grip` replaced it with
- [doc/about.md](./doc/about.md) — the prose hook's contract, placement, capture trap
- `doc/file/<path>.md` — one note per source file, shown in the Files tab
- Files that matter: `files.js` (the door, the tree, the columns, the routing — one file now), `files.css` (frame, columns, tree rows)

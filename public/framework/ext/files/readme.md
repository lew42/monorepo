# files — a tree of real files on disk, fetched, beside the one you clicked; for pages that teach a directory

## Use

```js
files(import.meta, "example/index.html example/app.js example/page.js")
files(import.meta, names, { about: path => md.file(import.meta, `doc/file/${path}.md`) })
```

Two panels (tree, source); pass `about` and it is three (tree, prose, source) — how `ext/Doc`'s Files tab works.

## Watch out

- Paths resolve against `import.meta`, never the document — a document-relative fetch hits the SPA fallback. [doc/decisions.md](./doc/decisions.md)
- A click reads `data-path` off the row, never an index into the declared list — nesting reorders. [doc/tree.md](./doc/tree.md)
- The tree is never repainted on a selection, only its mark moves — a redraw loses the scroll. [doc/panels.md](./doc/panels.md)
- Without `ext/highlight`, the plain-text fallback never checks `resp.ok` — a missing file renders `index.html` as source. [doc/file/files.js.md](./doc/file/files.js.md)
- `about` must *return* its view (or a promise); calling a factory instead renders nothing, silently. [doc/about.md](./doc/about.md)
- The split axis is seeded once — column below 640px, row above — and dragging narrow never re-rolls it. [doc/panels.md](./doc/panels.md)

## More

- [Overview](/framework/ext/files/) · [doc/decisions.md](./doc/decisions.md) — the record: decisions, traps, open items, who uses it
- [doc/fetched.md](./doc/fetched.md) — why real files, never string literals; why the examples aren't routes
- [doc/tree.md](./doc/tree.md) — nesting, the shortened display path, selection by `data-path`
- [doc/panels.md](./doc/panels.md) — three ext/Panel regions, no saver, `blank`, the seeded axis
- [doc/about.md](./doc/about.md) — the prose hook's contract, placement, capture trap
- `doc/file/<path>.md` — one note per source file, shown in the Files tab
- Files that matter: `files.js` (the door), `panels.js` (lazy Panel workspace), `files.css` (frame, tree, panes)

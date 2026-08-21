# Documents are files

`documents.js` owns one Saver per document and the index that lists them — the same
mechanism dev and static, no server route on either side. design.md §4.

## The layout

```
/data/panels.json              the DEFAULT document — unmoved, zero migration
/data/panels/index.json        { names: ["default", "untitled", …] } — the Workspace writes it
/data/panels/<name>.json       every OTHER document
```

Static hosting (off localhost): `LocalStorageSaver({ key: "panels" })` for `default`,
`{ key: "panels/index" }` for the index, `{ key: "panels/<name>" }` for the rest — the exact
mirror of the `FileSaver` paths above, picked by the same `dev` test `workspace.js` always
used.

## `default` never moved

`ext/Panel`'s own page has opened `/data/panels.json` since before this module existed.
Renaming it into `/data/panels/default.json` would be a migration — a one-time write every
existing visitor's browser would need to make, for a page that keeps working exactly as it
is otherwise. `documents.open("default")` special-cases the path instead; every other name
follows the `/data/panels/<name>.json` pattern.

## The index is seeded, not migrated

`list()` reads `/data/panels/index.json`. A MISSING file is not an error — it is every
install before the first `create()` — and the fallback is `["default"]`, not `[]`: the
default document exists whether or not anything has ever written the index. Nothing writes
the file just to seed it; `create()`/`remove()` are the only writers, and the first one to
run persists `default` alongside whatever it adds.

## Not the directory listing

`Server/plugins/Directory.js:21` ignores every `.json` it sees, by design — the file watcher
that rebuilds `directory.json` is for pages, not data. A new document would never appear in
it, and reading `directory.json` for this list would go stale with nothing thrown. The index
is a document like any other: a `Saver`, JSON, `{ names: [] }` shape — the same mechanism as
every panel tree in this module, not a second one.

## `create()` and `remove()`

```js
const name = await create();          // untitled, untitled-2… — a blank leaf, mode: document
const named = await create("mine");   // your own name, if the caller already knows it is free
await remove(named);                  // FileSaver.delete() exists; three lines, no new method
```

`create()` does not seed content — that is `workspace()`'s own `scatter` default for a
*fresh* document, not what a "+" mint should do. A newly created document is one blank leaf,
same as `new Panel()` on its own.

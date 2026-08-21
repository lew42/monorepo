# Schema — the wire format

Every document, every layout, every clipboard payload is the same shape: an
[`Item`](/framework/core/Item/) tree, serialized by `Item.toJSON()`.

## The four-key envelope

```json
{ "type": "Flex", "id": "b2", "data": { "label": "header", "justify": "space-between" },
  "items": [ { "type": "Box", "id": "c3", "data": { "label": "logo", "width": "8em" } } ] }
```

- `type` — the registered name (`Item.register`); an unknown type round-trips unchanged.
- `id` — a `crypto.randomUUID()`; `Item.hydrate` strips a duplicate and mints a fresh one.
- `data` — flat strings, CSS values verbatim. `""` or absent means "don't write the declaration".
- `items` — child nodes, same shape, recursively; omitted when empty.

**The JSON *is* the clipboard format.** Copy = `JSON.stringify(item)`. Paste strips every
`id` recursively (`strip_ids`, `documents.js`) and re-hydrates — fresh ids all round, so
pasting the same subtree twice never collides.

## Data keys → CSS (as shipped, `items.js`)

Every item carries **box** + **child** keys; `Flex`/`Grid` add their own.

| group | keys | → CSS |
|---|---|---|
| box | `width height padding` | same property names |
| box (tree only) | `label` | never CSS — the tree row's text |
| child | `grow shrink basis self order` | `flex-grow flex-shrink flex-basis align-self order` |
| child (grid) | `colSpan rowSpan area` | `grid-column: span N`, `grid-row: span N`, `grid-area` |
| `Flex` | `direction wrap justify align gap` | `display:flex` + `flex-direction flex-wrap justify-content align-items gap` |
| `Grid` | `columns rows areas flow gap` | `display:grid` + `grid-template-columns/-rows/-areas grid-auto-flow gap` |

`Box`/`Flex`/`Grid` are the only three shipped types (design §3); anything else is a
preset of these or its own design problem.

## On disk

- `/data/playground/<slug>.json` — one document, one `Item` tree, root = whatever
  container you started with.
- `/data/playground/index.json` — the document list, itself a document: children carry
  `data: {name, slug}`. Needed because `Server/plugins/Directory.js:21` ignores every
  `.json`, so a saved document never reaches `directory.json` — and a static host has no
  listing at all.
- `/data/playground/layouts/<name>.json` + its own `layouts/index.json` — a layout *is*
  a document, id-stripped on the way in and out (`documents.js`).

More: [`doc/decisions.md`](/framework/ext/Playground/doc/decisions.md) ·
[design.md](/framework/ai/2026-08-19/playground-design/design.md) §3

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

Every item carries **box** + **child** keys, whichever type it is — `gap`/`bg`/`padding`/
`width`/`height` sit outside flex/grid on purpose (pg-sidebar brief), so they survive a
`convert()` between types; `Flex`/`Grid` add only their own container-specific keys.

| group | keys | → CSS |
|---|---|---|
| box | `bg gap` | `background-color gap` |
| box | `padding` | `padding`, calibrated — `""`/absent/`"0"` all render `0.25em` (never literal 0) |
| box | `width height` | `hug \| fill \| <length>`, read against the PARENT — see below |
| box (tree only) | `label` | never CSS — the tree row's text |
| child ("in parent", shown only when the parent is Flex) | `grow shrink basis self order` | `flex-grow flex-shrink flex-basis align-self order` |
| child ("in parent", shown only when the parent is Grid) | `colSpan rowSpan area` | `grid-column: span N`, `grid-row: span N`, `grid-area` |
| `Flex` config | `direction wrap justify align` | `display:flex` + `flex-direction flex-wrap justify-content align-items` |
| `Grid` config | `columns rows areas flow` | `display:grid` + `grid-template-columns/-rows/-areas grid-auto-flow` |

`width`/`height` are per-axis `hug \| fill \| <length>`. In a flex parent the MAIN axis
carries the flex shorthand (`fill` → `flex: 1 1 0`, `hug` → `flex: 0 0 auto`, a length →
`flex: 0 0 <length>`) and the CROSS axis carries `align-self` (`fill` → `stretch`, else
`flex-start`); in a grid parent the same three states use `justify-self`/`align-self`;
outside flex/grid, width can fill (`width: 100%`) or hug (`width: fit-content`), but
height-`fill` has no definite parent height to resolve against and silently degrades to
hug — not fought, `doc/decisions.md`'s pg-sidebar entry has the proof.

`Box`/`Flex`/`Grid` are the only three shipped types (design §3); anything else is a
preset of these or its own design problem. A type toggle in the sidebar **converts** a
node between them in place — same id, same data, same children — `Playground.js#convert`,
`doc/decisions.md`.

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

# ext/Playground — a layout lab: documents of real flex/grid DOM you can poke

One idea: **an `Item` tree rendered as the real thing** — its `data` IS the CSS, its wire JSON IS the copy-paste format, one saved subtree IS a reusable layout. Nothing translates, so nothing drifts.

## 1 · Shell

```
┌ /framework/ext/Playground/ ────────────────────────────────────────────────────────┐
│ untitled ▾ │ + flex + grid + box │ ⧉ ✕ │ {} copy paste │ 400 768 1280 ⤢ │ save     │ toolbar
├────────────┬────────────────────────────────────────────────────┬──────────────────┤
│ TREE       │ CANVAS                                             │ PROPERTIES       │
│ ▾ Flex col │   ┌──────────────────────────────────────────┐     │ Flex "header"    │
│  ▾ Flex row│   │ ┌────┐ ┌─────────────┐ ┌────┐            │     │ direction ▮▯     │
│    · Box   │   │ │Box │ │  Flex col   │ │Box │ real DOM   │     │ justify  ▮▯▯▯    │
│    · Box   │   │ └────┘ └─────────────┘ └────┘            │     │ gap [1em]        │
│  ▪ Grid    │   └────── width = the viewport preset ───────┘     ├──────────────────┤
│  16em  ⇕grip                                            grip⇕   │ display:flex 18em│
└────────────┴────────────────────────────────────────────────────┴──────────────────┘
```

Sizing: a route page, `classes: "full solo flex"` — `solo` is `align-self:stretch; overflow:auto;
min-height:100%` and the shell inside it needs `flex-1; min-height: 0`, or the columns have no height; one
flex row, three regions, no nesting; the `ext/` preview is a still png. At **400** the canvas is the whole
tool, the rails overlay sheets (`@container pg (width < 48em)`); at **1920/3440 the rails stay clamped and
the canvas absorbs everything** — widening a rail is never the fix.

| column | width | scrolls |
|---|---|---|
| tree | `clamp(11em, var(--pg-tree, 16em), 30em)` | yes, wanted (long layer list) |
| canvas | `flex: 1; min-width: 0` | yes, wanted (a layout wider than the room) |
| properties | `clamp(13em, var(--pg-props, 18em), 34em)` | yes, wanted (many controls) |

Three deliberate scrollports; the page itself must not scroll. Both grips ride `ext/grip`, which
measures `parent.right - clientX` — right for the properties rail, **mirrored for the tree**: ask it for
a 3-line `from: "start"` option (`edge = rect.left; px = clientX - edge`). The two widths live in
`--pg-tree` / `--pg-props` + one `localStorage` key — a room is not a document.

## 2 · Documents

`/data/playground/<slug>.json`, one `Item` document each, root = whichever container you started with.
**The list is itself a document** — `/data/playground/index.json`, children `data:{name, slug}` — because the
dev server's `Directory` watcher ignores files ending `.json` (`Server/plugins/Directory.js:21`), so a freshly
saved document never reaches `directory.json`, and a static host has no listing at all. `FileSaver` writes on
localhost, `LocalStorageSaver` (`playground:<slug>`) off it (`ext/Saver/doc/backends.md`). New = seed a `Flex`
root + append; delete = `saver.delete()` + drop the entry; open = one `swap()` — saver, listener, canvas and
selection move onto the new tree together (`ext/editor`).

## 3 · Item types

Brainstormed: frame · flex · grid · box · text · image · spacer · stack · group · slot · layout-ref · viewport ·
scroller · sticky · overlay · repeat · component · breakpoint-variant · note. **The MVP ships three: `Flex`,
`Grid`, `Box`** — the rest is a preset of these, content, or its own design problem. A root is just a container.

| group | `data` keys | → CSS |
|---|---|---|
| box — *every* item | `width height padding` · `label` | same names · the tree row's text, never CSS |
| child — *every* item | `grow shrink basis self order` · `colSpan rowSpan area` | `flex-*`, `align-self`, `order` · `grid-column: span N`, `grid-row: span N`, `grid-area` |
| `Flex` | `direction wrap justify align gap` | `display:flex` + `flex-direction flex-wrap justify-content align-items gap` |
| `Grid` | `columns rows areas flow gap` | `display:grid` + `grid-template-columns/-rows/-areas grid-auto-flow gap` |

**Every value is the CSS value verbatim, as a string; `""` or absent means "don't write the declaration".**
The panel writes what you read, an unknown value still round-trips (Item's rule for unknown types), and the
JSON reads like CSS. One document — which is also the clipboard format:

```json
{ "type": "Flex", "id": "a1", "data": { "label": "page", "direction": "column", "gap": "1em", "padding": "2em" }, "items": [
  { "type": "Flex", "id": "b2", "data": { "label": "header", "justify": "space-between", "align": "center" }, "items": [
    { "type": "Box", "id": "c3", "data": { "label": "logo", "width": "8em", "height": "2em" } },
    { "type": "Box", "id": "c4", "data": { "label": "nav", "grow": "1", "height": "2em" } } ] },
  { "type": "Grid", "id": "b6", "data": { "label": "cards", "gap": "1em", "grow": "1",
    "columns": "repeat(auto-fill, minmax(12em, 1fr))" } } ] }
```

## 4 · Workspace

`render(item)` → `div.c("pg-node").attr("data-id", item.id)` + **inline style**, recursively — never a
framework class: inline beats every `@layer`, where `.flex > * { margin: 0 }`, `max-width: 100%` and util-layer
`:first-child` rules would restyle the canvas behind your back. It also makes the readout free — it is
literally the node's `style` attribute. One listener at the root (core/List's rule):

| event | what happens |
|---|---|
| `add` / `remove` | repaint canvas + tree, keep the selected id, save |
| `change` | **no repaint** — write that one property onto the live node, refresh the readout, save |

A `change` repaint replaces the element the properties panel is holding (`ext/editor`'s scar). Selection is an
**id**, never a node — a reload hydrates a new tree and every held object is detached; a click in either column
sets it and both wear the mark. The canvas box is `width:` the current viewport preset, centred.

## 5 · Properties

No engine. Each class declares `static fields` — `[key, control, options?]` — and `properties.js` draws three
controls: `seg` (segmented buttons, for enums), `text` (templates, `gap`), `num` (number + unit). Each writes
`item.set(key, value)`; the root emits; §4's `change` row does the rest. The readout sits under the controls.

## 6 · Toolbar

Over the canvas, one row: `document ▾ (new · open · delete · save as layout)` · `+ flex + grid + box` ·
`⧉ duplicate` `✕ remove` · `{} copy` `paste` · `save` · the viewport presets. **Add rule:** into the selection if
it is a container, else beside it. Copy = `JSON.stringify(item)`; paste = strip every `id` recursively, then
`Item.hydrate` — it keeps ids, and `seen` dedups within one call only, so a same-document paste would duplicate.

## 7 · Reusable layouts — the owner's "more than anything"

A layout is a document; a document is a layout — same four-key envelope, no second format, at
`/data/playground/layouts/<name>.json` + its own `index.json`. **Save as layout** writes the selected subtree;
**insert** puts it under the selection (id-stripped, as paste); **open** makes it the root. "See how it responds"
= the viewport presets. "Different content" waits; the hook is a `Slot` type — a `Box` with `data.slot: "hero"`.

## 8 · The learning UX

MVP: the live CSS readout · a two-tone outline (the selection, and its *parent* in a second colour — the
container is what did it) · tree hover lights the canvas node and back · the viewport presets · seeded layouts
(holy grail, sidebar, card wall) in `layouts/`. Waits: an x-ray toggle painting padding and gaps, "why did it
do that" hints, copy-as-CSS.

## 9 · File map — `public/framework/ext/Playground/`

`Playground.js` (shell, selection, repaint; `static Canvas` holds `render`) · `items.js` (Flex, Grid, Box:
`static fields`, `styles()`, `Item.register`) · `properties.js` · `toolbar.js` · `documents.js` (index,
new/open/delete, the saver idiom) · `playground.css` · `page.js` · `readme.md` · `doc/schema.md` +
`doc/decisions.md`. Each ≤ ~150 lines; `Canvas` splits into `canvas.js` if it passes. Prefix `pg-` is free, so
`styles/css-scopes.txt` gains one line.

## 10 · Build order (Sonnet, 30–60 min each; the mastermind loads the page between every task)

| # | task | files it owns | proves, headless |
|---|---|---|---|
| 1 | **MVP that opens**: shell + grips + tree + document + `Flex`/`Box` + add/remove + save | `Playground.js` `items.js` `documents.js` `playground.css` `page.js` · `ext/page.js` (`children:` + `Playground`) · `styles/css-scopes.txt` (+`pg-`) · `ext/grip/grip.js` (+`from:"start"`, 3 lines) + its `doc/decisions.md` line | three columns at 1280 (16em · rest · 18em, measured); a Flex with two Boxes computes `display:flex` with two real children; `/data/playground/untitled.json` on disk with the four-key envelope |
| 2 | **Properties + readout** | `properties.js` · `Playground.js` (the change path) · `playground.css` | setting `justify` → `space-between` changes the canvas node's computed `justify-content` **while the properties DOM node identity is unchanged**; readout text === the node's `style` attribute |
| 3 | **Grid + toolbar** (add/remove/duplicate/copy/paste JSON) | `items.js` (Grid) · `toolbar.js` · `Playground.js` (wiring) | `columns: "repeat(3,1fr)"` computes three px tracks; copy→paste yields a different `id`, identical `data` |
| 4 | **Documents UI + layout library + viewport presets** | `documents.js` · `toolbar.js` · `Playground.js` · `playground.css` · `/data/playground/layouts/*` | new document appends to `index.json` and swaps the root; insert-layout lands a subtree under the selection; the 400 preset makes the canvas 400px and a flex row wraps (children's vertical ranges stop overlapping) |
| 5 | **Docs + the 4-width pass** | `readme.md` `doc/*` `page.js` | zero console errors at 400/1280/1920/3440; every `overflow:auto` box listed and wanted; a png in the task dir |

## 11 · Not now

Content (text/image/slot fills) · keyboard · undo (the hook: `ext/editor/History.js` snapshots this same
envelope) · drag inside the canvas (tree drag first) · multi-select · breakpoint variants · absolute
positioning · components/symbols · export to HTML/CSS · media queries.

## § Asks of `ui/tree`

1 · unknown keys on a node round-trip to `onSelect` (we carry `id`). 2 · `onHover(node)` — the
tree↔canvas highlight is half the learning UX. 3 · inline rename (`onRename`); MVP falls back to the
`label` field in properties. 4 · drag-reorder emitting `onMove(node, parent, before)` — `Sortable` is the
engine and `item.move(parent, before)` the exact verb. 5 · a trailing per-row slot (a type badge).

## § Borrowed / Avoided

`../panel-insight/insight.md` did not exist when this landed — written without it, by design.

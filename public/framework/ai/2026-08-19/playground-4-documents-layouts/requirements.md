# playground-4-documents-layouts — ext/Playground task 4: documents UI, layout library, viewport presets

Protocol: read `../playground-mastermind/protocol.md` first. Group `playground`. Model: Sonnet.
**The spec is [`../playground-design/design.md`](../playground-design/design.md) §2 (documents), §6 (the
document ▾ + presets slots), §7 (reusable layouts — the owner's "more than anything"), §10 row 4.** Read
the last lines of the three prior playground task.jsonl files and the code they built.
**Length budget:** every file stays ≤ ~150 lines; report one screen.

## Build

- **Documents UI** (`documents.js` + the toolbar's `document ▾`): the dropdown lists `index.json`'s
  children by name — new (mints `untitled-2`, seeds a Flex root + two Boxes, appends to the index,
  swaps the root) · open (one `swap()`: saver, listener, canvas, tree, selection move together — the
  design names `ext/editor`'s idiom) · delete (saver.delete + drop the entry; never the last document) ·
  **save as layout** (the selected subtree → `/data/playground/layouts/<name>.json` + the layouts index).
- **Layout library**: an `insert ▾` (or the design's word) listing `/data/playground/layouts/index.json` —
  insert puts the id-stripped subtree under the selection (a container) or beside it; seed the library
  with THREE layouts built from the schema by hand: `holy-grail` (Flex column: header / Flex row
  (nav · main(grow) · aside) / footer), `sidebar` (Flex row: nav 14em · main grow), `card-wall`
  (Grid, `repeat(auto-fill, minmax(12em, 1fr))`, six Boxes).
- **Viewport presets** in the toolbar: `400 · 768 · 1280 · ⤢` (full) — sets the canvas box width
  (design §4: the canvas box is `width:` the preset, centred); the current preset is lit; ⤢ is default.
- `Playground.js`: wiring only. `playground.css`: `pg-` rules in a layer.

## Prove (headless; log the numbers)

- New document: `index.json` gains the entry, the canvas swaps to the fresh seed, the tree follows;
  reload on `/framework/ext/Playground/` still opens the LAST document you had open (decide how —
  localStorage — and log it), or the default; say which you shipped.
- Open the first document again: the canvas shows its tree (id-match the root).
- Insert `holy-grail` under the root: the subtree lands id-stripped (no id collisions with a second
  insert of the same layout — insert it twice and prove all ids unique).
- The 400 preset: canvas box measures 400px; the holy-grail's Flex row with `wrap: "wrap"` set via
  properties wraps (children's vertical ranges stop overlapping — the design's own test).
- Delete the probe documents at the end; `index.json` back to what you started plus nothing.
- Zero console errors; a png (dropdown open or the library inserted) in this dir.

## Fence

Own: `ext/Playground/documents.js` `toolbar.js` `Playground.js` `playground.css` ·
`public/data/playground/**` (including `layouts/`) · this task dir. Nothing else; not items.js beyond
reading, not properties.js, not ui/tree, not ext/Panel, not ext/grip.

## Added: leave the default document clean

`untitled.json` currently carries residue from tasks 2–3's proofs (a pasted duplicate Flex, two probe
Grids, a stray `justify`). Before landing, reset it to the clean seed — one Flex root
(`label: "page"`, `direction: "column"`, `gap: "1em"`, `padding: "2em"`) holding two Boxes — or to a
small curated demo if you built one; say which. Every OTHER probe document you mint gets deleted.

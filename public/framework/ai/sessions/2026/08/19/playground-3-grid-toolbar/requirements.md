# playground-3-grid-toolbar — ext/Playground task 3: Grid + the toolbar

Protocol: read `../playground-mastermind/protocol.md` first. Group `playground`. Model: Sonnet.
**The spec is [`../playground-design/design.md`](../playground-design/design.md) §3 (Grid's data keys),
§6 (the toolbar row + the add rule + copy/paste), §10 row 3.** Read the last lines of
`../playground-1-mvp/task.jsonl` and `../playground-2-properties/task.jsonl` and the code they built.
**Length budget:** `toolbar.js` ≤ 150 lines; report one screen.

## Build

- `items.js`: `Grid` — `columns rows areas flow gap` (+ the shared box/child keys), `static fields`,
  registered. Grid children get the `colSpan rowSpan area` keys' CSS (design §3 child row).
- `toolbar.js`: one row over the canvas — `+ flex + grid + box` · `⧉ duplicate` · `✕ remove` ·
  `{} copy` · `paste` (document ▾ and viewport presets are task 4's; leave a slot). Add rule: into the
  selection if it is a container, else beside it. Copy = `JSON.stringify(item)` to the clipboard
  (headless: also expose the string — `navigator.clipboard` needs permissions; decide and log it).
  Paste = strip every `id` recursively, then hydrate (design §6 names the duplicate-id trap: Item.hydrate
  keeps ids and `seen` dedups within one call only). Duplicate = copy+paste in one verb, lands beside.
  Remove keeps a selection (the parent). The MVP's minimal add/remove buttons fold into this and die.
- `Playground.js`: wiring only.

## Prove (headless; log the numbers)

- Add grid → `columns: "repeat(3,1fr)"` via properties → the canvas node computes three px tracks
  (`getComputedStyle(...).gridTemplateColumns` prints three px values; say them).
- Copy the seeded Flex, paste: the new subtree has all-new `id`s (list old vs new), identical `data`
  (deep-equal), and sits beside the original; the saved json holds both.
- Duplicate ×1: same proof, one verb. Remove: the node leaves the canvas, tree and json; selection
  moves to the parent.
- A Box inside the Grid with `colSpan: "2"` computes `grid-column: span 2` (or its used equivalent).
- Zero console errors; a png (grid + toolbar visible) in this dir.

## Fence

Own: `ext/Playground/items.js` `toolbar.js` `Playground.js` `playground.css` · `public/data/playground/**` ·
this task dir. Nothing else; not properties.js beyond reading it, not ui/tree, not ext/Panel, not ext/grip.

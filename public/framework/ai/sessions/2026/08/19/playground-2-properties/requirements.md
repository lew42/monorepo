# playground-2-properties — ext/Playground task 2: properties + readout

Protocol: read `../playground-mastermind/protocol.md` first. Group `playground`. Model: Sonnet.
**The spec is [`../playground-design/design.md`](../playground-design/design.md) §5 (properties), §4's
`change` row (no repaint — write the one property onto the live node), §3 (the field tables).** Read
the MVP's landing line (last line of `../playground-1-mvp/task.jsonl`) and the code it built.
**Length budget:** `properties.js` ≤ 150 lines; report one screen.

## Build

`ext/Playground/properties.js` — no engine: each Item class declares `static fields = [[key, control,
options?], …]` (add them in `items.js`: Flex gets `direction wrap justify align gap` + the shared box/child
keys per design §3; Box the box/child keys) and properties.js draws three controls: `seg` (segmented
buttons for enums), `text`, `num` (number + unit). Each control writes `item.set(key, value)` → the root
emits `change` → `Playground.js` writes that ONE property onto the live canvas node (no repaint), refreshes
the readout, saves. The readout under the controls IS the selected node's `style` attribute text. Selection
change redraws the properties column for the new item; a `change` never rebuilds the controls (the DOM node
identity stays — the design's own proof). Empty selection → the muted hint. `playground.css` may grow
(`pg-` rules, in a layer).

## Prove (headless; log the numbers)

- Select the seeded Flex; set `justify` → `space-between`: the canvas node's computed `justify-content`
  changes WHILE `document.querySelector(".pg-properties-body")`'s element identity is unchanged (hold a
  reference across the change, compare `===`).
- Readout text === the node's `getAttribute("style")`.
- The saved json on disk gains `"justify": "space-between"` and nothing else changed (diff the file).
- Reload: the control shows the saved value.
- Zero console errors on `/framework/ext/Playground/`; a png (properties column populated) in this dir.

## Fence

Own: `ext/Playground/properties.js` · `ext/Playground/items.js` (the `static fields` tables) ·
`ext/Playground/Playground.js` (the change path + wiring the column) · `ext/Playground/playground.css` ·
`public/data/playground/**` · this task dir. Nothing else; not ui/tree, not ext/Panel, not ext/grip.

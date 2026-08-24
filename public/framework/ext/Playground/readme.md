# ext/Playground — a layout lab: documents of real flex/grid DOM you can poke

An `Item` tree rendered as the real thing — its `data` IS the CSS, its wire JSON IS the copy-paste format, one saved subtree IS a reusable layout.

## Use

Open [`/framework/ext/Playground/`](/framework/ext/Playground/) — or embed it:
```js
import Playground from "/framework/ext/Playground/Playground.js";
new Playground({ slug: "untitled" }).build();
```

Hover any box to reveal its own `+` and click to add a child in place — every box, not
just Flex/Grid; **Shift-click adds a Flex instead of a Box**, same on the toolbar's own
`+` (which lands beside the selection, or into it if the selection is a container).
[`doc/decisions.md`](./doc/decisions.md)

## Watch out

- A brand-new slug 404s once — the fetch that discovers it's new; `open()` seeds and saves it right after. Harmless.
- The canvas never reads a framework class — inline style beats every `@layer`, so the readout is literally `node.style`. [`doc/decisions.md`](./doc/decisions.md)
- Paste strips every `id` first, always — the same subtree pasted twice must never collide. [`doc/schema.md`](./doc/schema.md)
- A toolbar/seg button can lose its padding to the theme's generic `button` style (same `@layer`, same specificity) — needs a two-class selector, not an edit to that file. [`doc/decisions.md`](./doc/decisions.md)
- Making a Grid still costs two gestures (add, then the sidebar's `type` toggle) — the toolbar's old `+FLEX`/`+GRID`/`+BOX` collapsed to one `+`. A Flex is back to one gesture via Shift-click; Grid has no modifier (a third state needs more than one held key). [`doc/decisions.md`](./doc/decisions.md)
- Which document reopens on reload is `localStorage["lew42-pg-last"]`, not the constructor's `slug` — that's only the first-ever default.
- The right sidebar is minimal by construction: 7 fields for a plain Box (label, type, gap, pad, width, height, bg), more only when the selection is Flex/Grid or its PARENT is. [`doc/decisions.md`](./doc/decisions.md)
- `width`/`height` are `hug | fill | <length>`, read against the parent — a `fill` with nothing to grow into (an overcommitted row, a hugging column) renders unchanged; that's the CSS, not a bug. [`doc/decisions.md`](./doc/decisions.md)
- A length on the flex MAIN axis and `grow` both set is a real conflict — the axis control's `flex: 0 0 <len>` shorthand overwrites `flex-grow` when it draws later in the string. [`doc/decisions.md`](./doc/decisions.md)
- Slim resize handles sit in the gaps between adjacent Flex children (`position: absolute`, zero flow space) and, as of pg-geometry, between Grid columns/rows too — Flex drag redistributes `grow` (or a fixed flank's own length in sidebar layouts); Grid drag writes the `columns`/`rows` template directly, only for a template that's all-length or all-`fr` (an `auto`/`minmax()`/`repeat()` template draws no handles — ambiguous, not guessed). An unequal grow ratio's re-rendered pixels carry a small, pre-existing `.pg-node` `min-width` skew (measured ~8px at a ~10:1 drag, isolated from a separate hover quirk below) — the live drag itself still tracks the pointer exactly, and the floor itself is now what the drag clamps against. A **wrapped** Flex row draws no handles at all — adjacent DOM children can land on different visual lines, so the pairing math would grab the wrong boxes. [`doc/decisions.md`](./doc/decisions.md)
- A dead dev server no longer hangs a save — every doc load races `Socket.ready` ~2s, then saves to this browser only (toolbar's `● saving locally` pip) until reload; newest save time wins on the next server-up open, nothing is ever deleted. [`doc/decisions.md`](./doc/decisions.md)

## More

- [Open the tool](/framework/ext/Playground/) · [`doc/schema.md`](./doc/schema.md) — the wire format · [`doc/decisions.md`](./doc/decisions.md) — why
- Files: `Playground.js` (shell/selection/repaint) · `canvas.js` (the canvas column) · `items.js` (`Flex`/`Grid`/`Box`) · `documents.js` · `properties.js` · `toolbar.js` · `playground.css`

## Left

Content (text/image/slot fills) · keyboard · undo (the hook: `ext/editor/History.js` snapshots this same envelope) · drag inside the canvas (tree drag first) · multi-select · breakpoint variants · absolute positioning · components/symbols · export to HTML/CSS · media queries · row-line clustering for wrapped-flex handles (disabled instead, `doc/decisions.md`) · a handle re-orienting live if `direction` toggles mid-session without a repaint.

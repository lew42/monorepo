# ext/Playground — a layout lab: documents of real flex/grid DOM you can poke

An `Item` tree rendered as the real thing — its `data` IS the CSS, its wire JSON IS the copy-paste format, one saved subtree IS a reusable layout.

## Use

Open [`/framework/ext/Playground/`](/framework/ext/Playground/) — or embed it:
```js
import Playground from "/framework/ext/Playground/Playground.js";
new Playground({ slug: "untitled" }).build();
```

A new document opens on a **holy grail** — page / header / nav · main · aside / footer — where
nothing declares a height: the page is a plain box that hugs and grows with its content,
default div behavior. The only size words are the rails' widths. That is the point: the
defaults do it.

**Select a box, then point at it: five targets, one meaning each.** The `+` in the middle adds
a child. Each of the four **edges** adds a sibling on that side — and *which pair* of edges you
use is the direction, so a row never costs a separate gesture:

> An edge inserts a sibling on that side. If the parent doesn't already flow that way, the
> parent is made to — **converted** if the node stands alone, **wrapping just this node** if it
> has siblings that must stay put.

The new sibling copies the clicked box's `width`/`height` words, so a row of cards is equal by
construction. **Shift-click adds a Flex instead of a Box**, on every add path. The slim handle in
a gap does both jobs: **drag it to resize, click it to insert between**.
[`doc/decisions.md`](./doc/decisions.md)

## Watch out

- A brand-new slug 404s once — the fetch that discovers it's new; `open()` seeds and saves it right after. Harmless.
- The canvas never reads a framework class — inline style beats every `@layer`, so the readout is literally `node.style`. [`doc/decisions.md`](./doc/decisions.md)
- Paste strips every `id` first, always — the same subtree pasted twice must never collide. [`doc/schema.md`](./doc/schema.md)
- A toolbar/seg button can lose its padding to the theme's generic `button` style (same `@layer`, same specificity) — needs a two-class selector, not an edit to that file. [`doc/decisions.md`](./doc/decisions.md)
- Making a Grid still costs two gestures (add, then the sidebar's `type` toggle) — but choosing `grid` now **writes `1fr 1fr` into `columns`**, so the template is on screen with a real value to edit rather than an empty field. A Flex is one gesture via Shift-click; Grid has no modifier (a third state needs more than one held key). [`doc/decisions.md`](./doc/decisions.md)
- All node chrome is `position: absolute` and moves only `opacity` — revealing any of it shifts **0.00px**, measured across a ten-point hover sweep. ⚠ The one exception is the in-flow `+` in a stack, which must stay `static`: making it positioned puts a full-width block over the node's whole top edge and the chips under it stop taking clicks. [`doc/decisions.md`](./doc/decisions.md)
- `⧉` and `✕` are chips on the selected box itself, not toolbar buttons; `copy`/`paste` are methods with no button at all (`pg.copy()`, `pg.paste()`). `duplicate()` lands **beside** the original, not inside it. [`doc/decisions.md`](./doc/decisions.md)
- The readout is one line per declaration and highlights whatever the last change actually wrote — including saying so when a word writes **no CSS at all**, which is true of six of the eighteen size cells. [`doc/decisions.md`](./doc/decisions.md)
- The right rail's **outer** width never moves on a selection switch (`flex: 0 0 clamp()`, grow and shrink both 0 — measured identical at 1280 and 3440 under six conditions). What used to move was the column *inside* it: the field count crosses the overflow boundary between a Box and a Flex/Grid, so the scrollbar toggled and took ~15px of content width with it. `scrollbar-gutter: stable` pays that 15px always. ⚠ Headless Chromium has overlay scrollbars and cannot see this bug at all. [`doc/decisions.md`](./doc/decisions.md)
- The properties column still **scrolls** past ~900px tall with a Flex-inside-a-Flex selected. `align` is on screen (y=842, was 956); the readout below it is not. Moving `justify`/`align` onto the canvas axis they control is the fix, and it is waiting on you. [`doc/decisions.md`](./doc/decisions.md)
- Which document reopens on reload is `localStorage["lew42-pg-last"]`, not the constructor's `slug` — that's only the first-ever default.
- The right sidebar is minimal by construction: 7 fields for a plain Box (label, type, gap, pad, width, height, bg), more only when the selection is Flex/Grid or its PARENT is. [`doc/decisions.md`](./doc/decisions.md)
- `width`/`height` are `hug | fill | <length>`, read against the parent — and most of those states now write **no CSS at all**: the default already does it, so `hug` and "never touched" are finally the same thing. A `fill` with nothing to grow into still renders unchanged; that's the CSS. Truth table, every cell measured: [`doc/decisions.md`](./doc/decisions.md)
- `pad` and `gap` in the toolbar are **viewing floors**, not data — on by default so a 0 still shows 0.25em; off is a real 0. They floor, never override, and reset on reload like the viewport preset. [`doc/decisions.md`](./doc/decisions.md)
- A length on the flex MAIN axis and `grow` both set is a real conflict — the axis control's `flex: 0 0 <len>` shorthand overwrites `flex-grow` when it draws later in the string. A plain `width: <len>` would end it at the same one-declaration cost, but changes how `untitled` renders today, so it waits for you. [`doc/decisions.md`](./doc/decisions.md)
- Slim resize handles sit in the gaps between adjacent Flex children (`position: absolute`, zero flow space) and, as of pg-geometry, between Grid columns/rows too — Flex drag redistributes `grow` (or a fixed flank's own length in sidebar layouts); Grid drag writes the `columns`/`rows` template directly, only for a template that's all-length or all-`fr` (an `auto`/`minmax()`/`repeat()` template draws no handles — ambiguous, not guessed). A press that travels under **5px** is a click, not a drag: it inserts a box between the pair, and commits no resize at all. **Grid handles are drag-only** — a grid's DOM-adjacent children are not track-adjacent. An unequal grow ratio's re-rendered pixels carry a small, pre-existing `.pg-node` `min-width` skew (measured ~8px at a ~10:1 drag, isolated from a separate hover quirk below) — the live drag itself still tracks the pointer exactly, and the floor itself is now what the drag clamps against. A **wrapped** Flex row draws no handles at all — adjacent DOM children can land on different visual lines, so the pairing math would grab the wrong boxes. [`doc/decisions.md`](./doc/decisions.md)
- A dead dev server no longer hangs a save — every doc load races `Socket.ready` ~2s, then saves to this browser only (toolbar's `● saving locally` pip) until reload; newest save time wins on the next server-up open, nothing is ever deleted. [`doc/decisions.md`](./doc/decisions.md)

## More

- [Open the tool](/framework/ext/Playground/) · [`doc/schema.md`](./doc/schema.md) — the wire format · [`doc/decisions.md`](./doc/decisions.md) — why
- Files: `Playground.js` (shell/selection/repaint) · `canvas.js` (the canvas column) · `items.js` (`Flex`/`Grid`/`Box`) · `documents.js` · `properties.js` · `toolbar.js` · `playground.css`

## Left

**Waiting on you:** axis chips on the edges — a Flex's `direction`/`justify` on its own main-axis edge, `align` on the cross, so you learn which axis a property owns by where its control sits. It is also what finally brings the properties column inside a 900px window.

Content (text/image/slot fills) · keyboard verbs for `copy`/`paste` · undo (the hook: `ext/editor/History.js` snapshots this same envelope) · drag inside the canvas (tree drag first) · multi-select · breakpoint variants · absolute positioning · components/symbols · export to HTML/CSS · media queries · row-line clustering for wrapped-flex handles (disabled instead, `doc/decisions.md`) · insert-between on Grid gap handles · swapping the flex MAIN axis length to a plain `width: <len>` to end the length-vs-`grow` collision (your call — it moves `untitled`).

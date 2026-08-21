# ext/Playground — a layout lab: documents of real flex/grid DOM you can poke

An `Item` tree rendered as the real thing — its `data` IS the CSS, its wire JSON IS the copy-paste format, one saved subtree IS a reusable layout.

## Use

Open [`/framework/ext/Playground/`](/framework/ext/Playground/) — or embed it:
```js
import Playground from "/framework/ext/Playground/Playground.js";
new Playground({ slug: "untitled" }).build();
```

## Watch out

- A brand-new slug 404s once — the fetch that discovers it's new; `open()` seeds and saves it right after. Harmless.
- The canvas never reads a framework class — inline style beats every `@layer`, so the readout is literally `node.style`. [`doc/decisions.md`](./doc/decisions.md)
- Paste strips every `id` first, always — the same subtree pasted twice must never collide. [`doc/schema.md`](./doc/schema.md)
- A toolbar/seg button can lose its padding to the theme's generic `button` style (same `@layer`, same specificity) — needs a two-class selector, not an edit to that file. [`doc/decisions.md`](./doc/decisions.md)
- Which document reopens on reload is `localStorage["lew42-pg-last"]`, not the constructor's `slug` — that's only the first-ever default.

## More

- [Open the tool](/framework/ext/Playground/) · [`doc/schema.md`](./doc/schema.md) — the wire format · [`doc/decisions.md`](./doc/decisions.md) — why
- Files: `Playground.js` (shell/selection/repaint) · `canvas.js` (the canvas column) · `items.js` (`Flex`/`Grid`/`Box`) · `documents.js` · `properties.js` · `toolbar.js` · `playground.css`

## Left

Content (text/image/slot fills) · keyboard · undo (the hook: `ext/editor/History.js` snapshots this same envelope) · drag inside the canvas (tree drag first) · multi-select · breakpoint variants · absolute positioning · components/symbols · export to HTML/CSS · media queries.

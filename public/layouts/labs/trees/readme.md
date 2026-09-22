# Trees — one seeded tree, drawn three ways, no canvas and no coordinate math

**A tree generator makes labels like `a`, `a1`, `a1a`, `a1b`, and this lab draws the same
tree three ways** — a family tree, a flow chart, a brainstorm map — at
[`/layouts/labs/trees/`](/layouts/labs/trees/). Every connector line is a CSS border sitting
wherever flexbox or grid put the edge of a box; nothing here is a `<canvas>`, an SVG, or a
pixel this page calculated. This is the owner's own spatial-layout idea (2026-09-18), built
small enough to see in one page rather than described.

## Use

```js
import { gen } from "./gen.js";                       // a seed → { label, children }
import { family_tree, flow_chart, brainstorm } from "./draw.js";

const tree = gen(7, /* depth */ 3, /* breadth */ 3);   // "a" → "a1" → "a1a" …
family_tree(tree, new Set(), node => {});              // a View — append it anywhere
```

`gen(seed, depth, breadth)` is a 20-line seeded generator (`gen.js`) — **not**
`core/Page/generator/gen.js`, which draws PAGE trees (`tabs vtabs list wall prose`, never a
label); it didn't fit, so this lab wrote its own, copying only the mulberry32 random-number
function that file already uses. `draw.js`'s three functions take the same tree and a `Set`
of folded labels and return a `View`; `page.js` owns the controls, the pan/fullscreen chrome,
and the fold/scroll behaviour around them.

## The three drawings

| | how | connector |
|---|---|---|
| **Family tree** | top-down: each generation a centred flex row | the classic pure-CSS org-chart trick — every box draws its own stub up to one shared border |
| **Flow chart** | left to right: a 2-column grid per node, `align-items: center` | a border on the children column, one stub per child |
| **Brainstorm** | root in the middle | two real flow charts either side, one of them built back-to-front (`mirror`) — no `transform`, no `rtl` |

Click any node to fold or unfold its branch; the node you clicked scrolls to the centre of
its canvas. The root is always one press of the **⌂** button away. Fold state is one `Set`,
shared by all three drawings — it really is the same tree, so folding a branch in the flow
chart folds it in the family tree too.

## Full screen and pinch-zoom

Each drawing's **⤢** button calls the real `requestFullscreen()` API, not `ext/demo`'s own
"fill the window" (`stage.js`'s `filler()` — a CSS toggle that leaves the page scrolling
behind it). Inside real fullscreen the page is gone, so a swipe on the pan area can only ever
be a pan — the owner's "two scrolls" problem, solved by removing the second scroll rather
than coordinating two. Escape leaves; the browser handles that on its own.

**Pinch-zoom is left to the browser on purpose.** The pan area's `touch-action` is never set
— the default, `auto`, already gives a scrollable box both one-finger panning and two-finger
pinch for free. `pan-x pan-y` (the value you'd reach for to be "explicit" about panning)
actually *removes* pinch-zoom, because naming the gestures you want switches off the ones you
didn't. A hand-built pinch-to-zoom — tracking two pointers, computing a scale, clamping it,
keeping the point under your fingers still under your fingers — is real, fiddly code for a
feature `auto` already gives away free.

## Mobile framing — decided

Under 40rem the drawings switch from centred to top-left aligned. Centred, a tall tree puts
its root at the vertical middle of the whole drawing — arriving at the top of the pan area on
a phone shows blank space until you scroll about halfway down to find anything, exactly the
problem the owner named out loud. Measured at 400px width, a depth-4 tree (seed 2, breadth
4 — 40 nodes, hit the generator's own cap): **centred, the root sat 465px down inside a 946px
scrollable area (the 308px-tall window shows none of it at rest); top-aligned, 14px down (the
first thing you see)**. The alternative — stay centred and add a "start" scroll-to-root on
load — was considered and rejected: it still shows a blank frame for one paint before the
scroll runs, and it needs script where a two-line media query needs none. Numbers, the
alternative, and why: [`doc/decisions.md`](./doc/decisions.md).

## Watch out

- **A `<button>` is heavily themed here** (`framework.css`'s `theme-lew42` rule: uppercase,
  bold, 0.7em/1.4em padding, sized for a call to action) — thirty of those read as thirty
  CTAs shouting at once. `trees.css`'s `.std-trees-node.std-trees-node` doubled-class trick
  matches that rule's own specificity inside the same `theme` layer to reset it; the honest
  alternative was a `<div role="button">`, and a real button keeps Enter/Space and focus for
  nothing.
- **Centring an overflowing child with `justify-content: center` breaks scroll on its start
  side** — a well-known flexbox trap, and a canvas that pans both directions would have hit
  it immediately. The fix is `margin: auto` on the one child instead, which centres a small
  drawing and stays fully scrollable once the drawing is bigger than its window.
- **A one-line bug shipped first and was caught by the `demo.steps()` proof, not by eye**: the
  fold/unfold custom event fired backwards (folding a branch dispatched `"unfold"`), so the
  actual fold state was always correct — verified by screenshot, it looked right — but the
  first two tutorial steps checked off in the wrong order. `doc/decisions.md` has the fix.
- **`Page.depth`** (how many levels of children `load_all_children()` preloads) **is already a
  reserved field.** This page's own depth control is `tree_depth`, never bare `depth`.

## More

- [`doc/decisions.md`](./doc/decisions.md) — the full record: alternatives considered for the
  generator, the connector CSS, fullscreen, and the mobile framing measurement.
- Files: `gen.js` (the generator), `draw.js` (the three drawings, no coordinate math),
  `trees.css` (every connector, the canvas chrome, the mobile media query), `page.js` (the
  page: controls, `demo.steps()` first screen, fold/scroll, fullscreen).
- Parent: [`/layouts/labs/`](/layouts/labs/).

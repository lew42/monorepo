# Spatial trees — brief

Minion task. Dated 2026-09-18. Owner's words below are suggestions, not laws — the smallest
lab that lets the owner see the idea, with the open questions decided by whoever builds it
and the alternatives written down.

## The owner's words (2026-09-18, 15:00)

> spatial layouts, kind of like flow charts, automatic layouts where you can add items —
> Whimsical does a good job. I don't know if canvas or SVG or absolute positioning and a
> bunch of math is right; maybe just vertical centering, normal CSS layouts. A vertically
> and horizontally infinite canvas area [...] on mobile you could swipe right and left,
> even pinch to zoom; clicking on an item could reposition the canvas to that item and its
> children, or expand and collapse. [...] if everything was vertically centred, on mobile
> the first column would be empty until you scroll halfway down — maybe on mobile it
> switches to top aligned. [...] maybe a full screen experience where swiping is a pan
> only, so there are not two separate scrolls. [...] first, a tree generator — a, a1,
> a1a, a1b — and display those family-tree style, flow-chart style, brainstorm style.

## What exists — reuse

- `core/Page/generator/` (`gen.js`) — a seeded page-tree generator. Read it: if it makes a
  labelled tree, use it, else write a 20-line seeded one.
- `ux/Tree` — the fold/adapt model and the one `move` event, not the drawing.
- `/layouts/labs/` — the home of shape labs since today; its `page.js` lists children.
- the design-system tokens (`/framework/styles/system/`)
- `demo.steps()` if it has landed today in `ext/demo` — use it for the lab's first screen
  if so.

## Deliverables

1. `/layouts/labs/trees/` — one page (add `trees` to `/layouts/labs/page.js` `children:`
   and one visible line). A seeded generator control (depth 2–5, breadth 1–4, seed)
   producing labels `a`, `a1`, `a1a` … The SAME tree drawn three ways with plain CSS and
   no coordinate math:
   - **family tree** (top-down): each level a centred flex row, a parent centred over its
     children with a 1px connector drawn by borders or a single pseudo-element per node.
   - **flow chart** (left-to-right): each level a column, children vertically centred
     beside their parent — `grid` with `align-items: center`.
   - **brainstorm**: a root in the middle, children split left and right as two flow
     charts mirrored.
2. The canvas: each drawing sits in a pan area that scrolls both axes (`overflow: auto`),
   with a **full screen** button (the Fullscreen API; inside it the page scroll is gone so
   a swipe is a pan only — the owner's two-scrolls problem — and Escape returns);
   pinch-zoom left to the browser (say why in the doc: `touch-action` and the cost of a
   custom zoom).
3. Click a node: its subtree folds or unfolds, and the node scrolls into view centred
   (`scrollIntoView({ inline: "center", block: "center" })`); the root is reachable with
   one "home" button.
4. The mobile framing, decided: under 40rem the drawings switch to top-left alignment
   (root first, no blank half-page) — measure at 400 how far down the root sits centred
   vs top-aligned with a depth-4 tree, and write the numbers and the alternative (stay
   centred, add a "start" scroll) in the page's `decisions.md`.
5. Verify headless on the private server (`PORT=8130 node server.js`, background, killed
   by its real Windows PID): 400 / 1280 / 1920, the three drawings for a depth-3
   breadth-3 tree, fold and unfold one node, zero console errors; one shot per drawing at
   1280 and one at 400.

## Fence

`public/layouts/labs/trees/**` (new), one `children:` word + one line in
`public/layouts/labs/page.js`, this task dir. Nothing else — `core/Page/generator` is
read, not edited.

## Final report shape

One screen: the link, the four shot paths, the mobile-framing numbers and decision, what
the generator was (reused or new), what was left and why.

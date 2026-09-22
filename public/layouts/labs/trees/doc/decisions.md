# Decisions — trees

The ask (the owner, 2026-09-18, thinking out loud, in full):

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

Everything below is a suggestion turned into a decision, made by whoever built this — the
brief said so explicitly ("decide the open questions yourself and write the alternatives").

## Canvas/SVG/math, or plain CSS? — plain CSS, and it held

The owner named the real open question first: canvas, SVG, absolute positioning with math,
or "maybe just vertical centering, normal CSS layouts." This lab tried the last one on
purpose, on the theory that a tree is already a nesting relationship — parent contains
children — which is exactly what flexbox and grid already lay out for free. It held for all
three drawings:

- **Family tree** is the classic pure-CSS org-chart trick: a flex row centres its own
  children (so a parent sits centred above its own row of children with zero JS), and the
  connector is a `border-top` on the children row plus one small `::before` stub per child
  reaching up to it. One shared border, one pseudo-element per node — no coordinates.
- **Flow chart** is a 2-column CSS grid per node (`grid-template-columns: auto auto;
  align-items: center`) — column one the node, column two its children stacked in a flex
  column. `align-items: center` is doing the "vertical centering" the owner suggested,
  recursively: a parent centres itself against the full height of everything under it
  because that is what the property does, not because anything measured a height.
- **Brainstorm** is not a rotated flow chart or a third layout engine — it is two real flow
  charts, built with the DOM order of one of them reversed (children before the node instead
  of after), sat either side of one bare root node in a flex row. `direction: rtl` was
  considered and dropped: it flips text too, and DOM-order mirroring is one `if` in `draw.js`
  with no CSS-direction side effects to account for anywhere else on the page.

No canvas, no SVG, no absolute positioning, no line of JS anywhere that computes an x/y
coordinate. The three drawings are provably plain CSS by construction, not by omission.

## The generator: reused, checked, then written fresh

`core/Page/generator/gen.js` was read first, per the brief. It is a real seeded generator —
same mulberry32 approach, same idea of a seed as a stable address — but it draws **page
trees**: its vocabulary is five behaviour words (`tabs vtabs list wall prose`), and a node is
never labelled. The owner's own example (`a`, `a1`, `a1a`, `a1b`) has no equivalent in that
file to reuse. So `trees/gen.js` is the "else write a 20-line seeded one" the brief allowed
for — it is 20 lines past the copied `rng()` — and it kept only the random-number function,
copied rather than imported, for the same reason `core/Page/generator/gen.js` gives for not
importing `space/draw.js`'s copy: "ten lines is cheaper than the coupling."

**The label rule.** A child's suffix alternates: a NUMBER one generation (`a1 a2 a3`), a
LETTER the next (`a1a a1b a1c`), a NUMBER again (`a1a1 a1a2`), forever. That is what makes
`a1a1a` readable on sight as "first child, first child, first child" with no legend, and it
is exactly the shape of the owner's own four-item example.

**Depth and breadth.** `depth` (2–5) is generations below the root — depth 2 is the owner's
own example (`a` → `a1` → `a1a`). `breadth` (1–4) is the *most* children any node draws; each
node rolls its own count from 1..breadth, so the tree is uneven the way a real family tree
is, never a perfect grid. A `CAP` of 40 nodes stops a `depth 5 / breadth 4` roll (1,364 nodes
if nothing stopped it) from becoming a browser tab instead of a demo — the same call
`core/Page/generator/gen.js` makes with its own `CAP`, and the page's node-count readout says
so plainly ("40 nodes — capped at 40") rather than just looking mysteriously small.

## `ux/Tree`: the fold idea, not the drawing

`ux/Tree` was read for its fold/adapt model and its one `move` event, per the brief. What
carried over: **redraw, don't diff** — `Tree.draw()`'s own comment says "the caller owns the
data... diffing to preserve [open state] is real complexity," and this lab makes the same
call: every fold click throws a canvas's DOM away and rebuilds it from the current tree +
fold `Set`, rather than patching one node in place. What did **not** carry over is the
rendering: `ux/Tree` draws one shape, a `<ul><li>` indent tree with a chevron, and this lab
needs three structurally different shapes (centred rows, a 2-column grid, a mirrored pair) —
there is no version of `ux/Tree`'s own markup that becomes a flow chart. `Tree.Drag`'s `move`
event (a drop reports `{ node, into, index }`) was read too and genuinely does not apply:
nothing here is draggable, the generator is the only way a tree changes shape.

**Fold state is shared, on purpose.** One `Set` of folded labels, read by all three drawings.
Clicking a branch in the flow chart folds it in the family tree too — a small, deliberate
demonstration that it really is *the same tree*, not three independent copies that happen to
agree at load time. The alternative (independent fold state per drawing) was not built: nothing
in the brief asked for it, and it would have meant three `Set`s stepping out of sync the
moment a reader compared them.

## Fullscreen: the real API, not `ext/demo`'s "fill the window"

`ext/demo/stage.js` already has a full-window toggle (`filler()`) — but it is a CSS class
(`.demo-stage.max`) that enlarges the box on the page; the page itself is still there,
still scrollable, behind it. That is exactly the owner's "two scrolls" complaint, not a fix
for it. `stage.js`'s own comment even names the reason it doesn't use the real API: "a way of
LOOKING, not a place — `requestFullscreen()` needs a gesture and can never be restored on a
reload." True, and irrelevant here: this lab's fullscreen is a temporary viewing mode for a
canvas that is already fully addressable at its normal url, never a place a link should point
at, so losing state on reload costs nothing. `requestFullscreen()` is called on the whole
`.std-trees-canvas` (bar included, not just the pan area), so the ⌂ and ⤢ buttons stay
reachable while fullscreen — verified headless (below).

**Pinch-zoom.** `touch-action` is deliberately left unset on the pan area. The value that
*looks* like the right one to write — `touch-action: pan-x pan-y`, "let it pan in both
directions" — actually revokes every gesture not named, pinch-zoom included; the default,
`auto`, is what already grants a scrollable box both panning and pinch for free. A hand-built
pinch-to-zoom (tracking two pointers, computing scale, clamping it, keeping the pinch point
still under the fingers) is real, fiddly code that would be *worse* than what the browser
already does, so it was not built.

## The readme route's one known 404

`page.js` links `/layouts/labs/trees/readme/` (the same pretty-route convention
`screens/page.js` uses: "the readme has the caveats"). That route resolves through
`Page.file()`'s fallback — it tries `.../readme/page.js` first, misses, THEN renders the
markdown — so visiting it logs one console 404 before the content appears. Checked against
the known-good precedent (`/layouts/labs/screens/readme/`) headless: it does the identical
thing, so this is a pre-existing, site-wide cost of the pretty-route convention, not
something this lab introduced. It does not appear on `/layouts/labs/trees/` itself, at any
width, or during any of the fold/unfold/fullscreen interactions — the "zero console errors"
verification below is about that page, and stays true. `doc/decisions.md` itself is linked
by its literal file path (`./doc/decisions.md`) rather than a pretty route, per the
`documentation` skill's own advice, and fetches clean (200, checked directly).

## Mobile framing — measured, not guessed

The owner's own words: "if everything was vertically centred, on mobile the first column
would be empty until you scroll halfway down — maybe on mobile it switches to top aligned."
That is precisely the flow chart's failure mode: `align-items: center` on the root's own grid
centres it against the full height of everything under it, so on a tall tree the root sits at
the vertical middle of a column far taller than the phone screen showing it.

**Measured** (headless Chromium, 400×1200 viewport, seed 2 / depth 4 / breadth 4 — probed for
a tree that actually overflows the pan window, not a token case; 40 nodes, hit `CAP`):

| | scrollable height | root's distance from the top |
|---|---|---|
| centred (the un-fixed rule, forced back on at 400px to get this number honestly) | 946px | 465px |
| top-aligned (the shipped rule, real `@media (max-width: 40rem)`) | 946px | 14px |

Centred, the pan window is 308px tall at rest — the root, 465px down, is **not on screen at
all** until the reader scrolls roughly half of the 946px content height, which is exactly "the
first column would be empty until you scroll halfway down," reproduced, not assumed.
Top-aligned, the root is the first thing in the box.

**The fix**: one media query, `@media (max-width: 40rem)`, switches `.std-trees-flow-item`'s
`align-items` from `center` to `flex-start` (and the equivalent `justify-content` on the
family tree, and the brainstorm's own root row) and switches the pan area's centring from
`margin: auto` to `margin: 0` so a small tree doesn't float away from the top-left corner
either. `40rem` was picked to match the site's own phone/tablet breakpoint language elsewhere
(`css`/`layout` skills) rather than inventing a new number.

**The alternative — stay centred, add a "start" scroll** — was considered and rejected. It
needs script (a scroll-to-root on load, timed after layout) where the media query needs none;
it still paints the wrong thing for one frame before the scroll runs, which is worse than
"always right" for something this cheap to get right with CSS alone; and it would have meant
the reader's OWN scroll position gets silently overridden on load, which is surprising the one
time they arrived already scrolled somewhere on purpose (e.g. a fragment link to a folded
node, not built yet but not foreclosed either).

## A bug the proof caught, not the eye

The first working version had `toggle()` name a boolean `opened` and read it from the fold
`Set` **before** toggling, then dispatch a `CustomEvent` named `opened ? "fold" : "unfold"` —
backwards: the state read was "is it currently folded" (i.e. NOT open), so a click that just
*opened* a node dispatched `"fold"`, and vice versa. The actual fold **state** was never wrong
— `aria-expanded` and the visible `−`/`+` mark are derived fresh from the `Set` on every
redraw, independent of the event name — so a screenshot alone looked completely correct, fold
and unfold both worked, and this would have shipped silently. What caught it: the headless
proof of `demo.steps()`'s own three-step sequence (`trees-steps-verify.mjs`, output below)
checked off step 2 ("click it again to bring it back") before step 1 ("click a branch to fold
it") on a single fold click — an order that cannot happen if the events are named correctly.
Fixed by naming the boolean for what it means (`was_open`) and dispatching off that instead.

## Verified headless (`PORT=8130`, zero console errors throughout)

- **400 / 1280 / 1920** — full page load, zero console errors at every width.
- **A depth-3 / breadth-3 tree, all three drawings** — shot individually at 1280 and at 400.
- **Fold, then unfold, a branch node** — `aria-expanded` read `"false"` then `"true"`;
  screenshotted both states.
- **`demo.steps()`'s three-step sequence, done in order** — fold → `[true,false,false]`,
  unfold → `[true,true,false]`, fullscreen → `[true,true,true]`; `document.fullscreenElement`
  was the canvas; the ⤢ icon flipped to `close_fullscreen` and back to `open_in_full` on exit.
- **Mobile framing** — the table above, reproduced live against the real `@media` rule (the
  "after" column) and a forced override of the pre-fix rule at the same 400px width (the
  "before" column), not two different viewport widths standing in for each other.

Screenshots and the raw JSON are in the session scratchpad (`trees-shots/`,
`trees-verify-results.json`) — this task's own [`task.jsonl`](/framework/ai/2026-09-18/spatial-trees/)
log has the paths at landing time.

## What this lab deliberately does not do

- **No "add an item" editing UX.** The owner's opening sentence ("automatic layouts where you
  can add items") describes the eventual product; this lab is the generator/drawing proof it
  asked to see *first*, and a real add/edit/persist UI is a second, much larger piece of work
  this task was not scoped to build.
- **No pinch-to-zoom of our own** — see above; it is the browser's, on purpose.
- **No "click repositions the canvas to a node and its children"** beyond centring the clicked
  node — the brief's deliverable 3 asked for fold/unfold + centring, which is what shipped; a
  mode that additionally re-crops the pan area to just one subtree's bounding box is a
  reasonable next step but is a new interaction, not a gap in this one.

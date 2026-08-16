# The remaining waves

What waves 1–3 landed, and the design for 4–6 against what the research actually
found. Written 2026-08-16.

## Landed

**Chrome.** The bar has no background, no blur and no rule under it; its icons sit
at `opacity: 0.3` and come up under the pointer. The bar's own **box** no longer
hit-tests — only what is drawn in it — because an invisible full-width strip across
every panel was eating the clicks meant for the edge beneath it.

**The 3×3 is an overlay, not a popover.** Nine buttons on the body at the nine
places they name: a grid cell *is* its placement, so each button's alignment inside
its own cell is the code it carries and nothing computes a position. The grid's
padding is what holds a corner arrow off the corner. The container never hit-tests;
only the nine buttons do.

**Edge split.** Clicking an edge starts a preview — half the panel, on the side the
pointer is on, flipping across the midline. Left click commits, right click or
Escape cancels.

**Selection → the rail.** `panel-focus` was already announced on the document;
`tools.js` listens and opens `ext/drawer` with the panel's words.

### The collision that shaped the edge geometry

The grip's target straddles a seam by `0.625rem` either way. Measured, it won
**three of four edges** and the bar's own centred button won the fourth — a click
on an edge reached nothing at all. Dragging a seam to resize and clicking an edge
to split are both worth keeping, so they get **bands, not a z-order fight**: the
outer `0.7rem` stays the grip's, the split strip starts after it, and the top strip
starts below the bar. This is the "child's edge is the same as the parent's edge"
adjustment, and it is spatial.

## Wave 4 — smart insert

A `+` that tracks the pointer and fills the natural content area: a **wide bar
between rows**, a **tall bar between columns**. The shape is already proved twice
in this module — the grip's pill rides the pointer along a seam, and the split
ghost flips across a midline — so this is the same mechanic aimed at the gaps
*between a body's children* rather than at a panel's own edges.

- It must not make anything jump, so it is `position: absolute` over the gap it
  would insert into, never in the flow.
- The gap it names is the one nearest the pointer: walk the body's children, take
  the boundary with the smallest distance on the axis the container runs.
- **The axis comes from the container, not from a guess** — a `flex` row inserts a
  vertical bar between columns, a column or ordinary flow inserts a horizontal one.
- A repeating list or grid gets the same `+` at its end, which is the one case
  where the insert point is not between two things.

## Wave 5 — flex vs grid, made visible

`display` becomes a panel word (`block | flex | grid`), and **the control set
follows the mode** — Mike's framing, and better than picking one model for
`.panel-items` forever. What each mode should draw over the body:

| mode | what the overlay shows |
|---|---|
| `flex` | the main axis as an arrow; each child's `flex-grow` as a number on its own box; the gap as a draggable band |
| `grid` | the track lines, with each track's `fr` on it; a `+` at the end of each axis to add a track |
| `block` | nothing but the insert bar — there are no tracks to show |

⚠ **The asymmetry is real and must be shown, not hidden.** Flex has `align-self`
but **no `justify-self`**, so in a flex row a child owns its cross-axis placement
and the parent owns the main axis — reversed when the split stacks. Grid gives the
child both. So the 3×3 is fully live in `grid`, and in `flex` one axis of it
belongs to the parent; the overlay should say so rather than offer nine buttons of
which three do nothing.

## Wave 6 — text layers, and master + live duplicates

### Text layers

The research found **no typography control anywhere on the site** and **no
`contenteditable` in use**. It also found the wall: `pointed()` (`ext/layout/layout.js:69`)
stops at the children of a `flex`/`grid` and never descends into a paragraph, so a
text run is not selectable today by design — *"or every span in a sentence would be
a target."*

`ext/Panel` deliberately depends on `ext/layout` for **nothing**, so extending
`layout.words` is the wrong layer. The Panel-native seam is the one already
recorded: a selection announced on the document, drawn in the rail. So —

- a leaf whose body holds prose gets a **text** section in the rail: level
  (`h1`–`h4`/body), weight, tracking, measure;
- selection descends one step further **only inside a panel body**, so the site's
  general rule is untouched;
- the scale is `framework.css`'s six levels, which are already available as classes
  (`.h1`–`.h4`) — so a level control writes a class, and invents no font-size.
  **Never invent a font-size** is a standing rule and this is exactly where it would
  get broken.

### Master + live duplicates

The research settled the architecture by ruling one out. **A literal shared `Item`
is impossible**: `parent` is a single scalar (`List.js:17`) and `views` is a
one-entry-per-`Item` `WeakMap` (`workspace.js:207`), so one item cannot have two
parents or two live mounts without corrupting both. **Shared `data` by reference
dies at the saver** — `toJSON` writes `data` inline per item, so a reload produces
two independent objects and the link silently disappears.

What is left is an **id reference**: `data.mirror = "<master id>"`, with `get()`
delegating to `root().find(id)`. It round-trips as a plain string. Three things it
needs, none of which exist yet:

- a redraw on `change`, which currently **never** redraws (only `add`/`remove` do);
- an **echo guard**, or `set → emit → repaint → set` loops;
- a **dangling-master guard** — `find()` returns undefined once the master is
  closed, and every read has to survive that.

Alt-drag is the trigger: nothing in `Draggable`/`Sortable`/`PanelDrag` reads a
modifier key today, so `Draggable.grab()` samples `e.altKey` and `PanelDrag.release()`
branches beside its existing edge check.

## Everything is on, and stays switchable

`TOOLS` in `tools.js` and `SPLIT` in `split.js` are the plumbing: every surface is
`true` today because Mike wants to feel the whole tool before anything hides, and
turning one off is one word rather than an edit.

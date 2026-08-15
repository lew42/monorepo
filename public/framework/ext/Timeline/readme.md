# ext/Timeline

A general-purpose h/v timeline. One `Timeline` view, positioned entirely by
two CSS custom properties — `--t` (hours since the domain start) per item,
`--em-per-hour` on the root — so zoom and orientation are property/class
writes, never re-renders. `readme.md` here is the maintainer record;
`page.js` is the reader's introduction.

## The three decisions that shape it

- **Positioning is CSS, not layout math.** `render()` computes `--t`/`--d`
  once per item and writes them as inline custom properties; every `left`,
  `top`, `width`, `height` is a `calc()` off them. Zooming is one property
  write on the root; flipping orientation is one class swap.
- **Lanes are greedy interval packing** (`lay()`): sort by start, place each
  in the first lane whose last item has already ended. Sequential work reads
  as one lane; parallel work stacks. A named `lane: "<string>"` pins related
  items to one shared track regardless of overlap.
- **`.reverse` flips via the opposite inset** (`right`/`bottom` instead of
  `left`/`top`), scoped to `.timeline-track > .timeline-item` only — nested
  children live in their own un-reversed local box (the parent bar already
  flipped itself), so `.timeline-item-children > .timeline-item` never reads
  `.reverse` at all. A CSS `scaleY(-1)` trick would collapse the four
  left/right/top/bottom variants into one rule, but it's the kind of clever
  a reader can't see from the file — explicit duplication won the "no black
  magic" call.

## Phase 2 (deferred, not built)

- **A live control surface.** `page.js`'s "two zooms" demo shows two fixed
  `Timeline`s side by side rather than one slider — that IS the dilemma:
  Timeline exposes `zoom`/orientation as plain properties, but the h/v toggle
  and zoom slider themselves belong to `ext/layout` (the one interactive
  control surface, five-block rule), not built here.
- **Container-query auto-flip** — `.h` collapsing to vertical below ~40em
  inline size. Design record's "Responsive" section calls for it; not MVP.
- **Nested-children mini-packing.** A fan-out's agent slivers/log dots inside
  one bar are NOT packed — they can overlap when a fork's children collide in
  time. The `lay()` algorithm is already the right shape to reuse recursively;
  not done yet.
- **Deep-link scroll-into-view.** `ext/catalog`'s `reveal()` looks for
  `.page-preview` in the rail to scroll it into view; a Timeline rail has none
  of those, so navigating straight to a task's url leaves the rail wherever it
  was, unlike a card rail.
- **Historical window bands.** MVP renders one flat band at the CURRENT 5h
  percent. A stepped fill from `ai/usage.jsonl`'s snapshot history — and past,
  spent windows staying on the timeline as their own bands — needs that log
  actually accumulating a few days of history first.
- **Agent slivers in `ai.js`.** Dispatched agents have no `at` timestamp
  today (only `task.jsonl`'s `logs`/`actions` do), so `ai_timeline()` renders
  those as child dots and skips agents entirely.

## Item shape

```js
{ at }                 // instant — a dot
{ from, to }           // span — a bar; `to` omitted = open, runs to "now"
+ { label, kind, url, lane, children }
```

`kind` becomes a CSS class (`task`, `agent`, `log`, `action`, `window`,
`day`) — skinning stays in `Timeline.css`, off the single `--prim` accent at
different mix percentages, matching the rest of the site's restraint.
`window`/`day` span the whole cross axis and take no lane. `url` renders the
item as a real `<a>`, so `Router.mark_links()` and catalog routing treat a
timeline bar exactly like a preview card.

# ext/Timeline

A general-purpose h/v timeline. One `Timeline` view, positioned entirely by
two CSS custom properties — `--t` (hours since the domain start) per item,
`--em-per-hour` on the root — so zoom and orientation are property/class
writes, never re-renders. `readme.md` here is the maintainer record;
`page.js` is the reader's introduction.

Not to be confused with [`ui.timeline()`](/framework/ui/timeline/) — a
different component with the same English name. That one is a vertical list
of dated entries (a changelog band); it has no time axis, no scale, no
lanes, and shares no code with this module. Both earn their place; see
"Where this module overlaps others" in the [audit report](/framework/audit/modules/ext-Timeline.md)
for the full case.

## Decisions

**Positioning is CSS, not layout math.** `render()` computes `--t`/`--d` once
per item and writes them as inline custom properties; every `left`, `top`,
`width`, `height` is a `calc()` off them. Zooming is one property write on the
root; flipping orientation is one class swap. The trade: `zoom`/`orientation`
are read once, inside the construction-time `render()` — there is no live
setter, so "zooming" a mounted instance means writing `--em-per-hour`
yourself via `.style()`, or building a second `Timeline`. `page.js`'s "two
zooms" demo shows the latter, deliberately — the live slider is `ext/layout`'s
job (phase 2), not this class's.

**Lanes are greedy interval packing** (`lay()`): sort by start, place each in
the first lane whose last item has already ended. Sequential work reads as
one lane; parallel work stacks. A named `lane: "<string>"` pins related items
to one shared track regardless of overlap. ⚠ That item-level `lane` is a
*different thing* from the constructor's own `lane` property (em-per-lane
sizing, a number, default 2.2) — same word, two meanings. Detail:
[`doc/property/lane.md`](doc/property/lane.md).

**An item's end is one method, called from both places that need it.**
`end(it, start)` says where an item stops: an instant at its own start, a
closed span at `to`, an open (`to`-less) span at "now". `item()` calls it to
size the bar; `lay()` calls it to know when the lane frees. They used to
compute this separately, and drifted — see Traps.

**`.reverse` flips via the opposite inset** (`right`/`bottom` instead of
`left`/`top`), scoped to `.timeline-track > .timeline-item` only — nested
children live in their own un-reversed local box (the parent bar already
flipped itself), so `.timeline-item-children > .timeline-item` never reads
`.reverse` at all. A CSS `scaleY(-1)` trick would collapse the four
left/right/top/bottom variants into one rule, but it's the kind of clever a
reader can't see from the file — explicit duplication won the "no black
magic" call.

## Item shape

```js
{ at }                 // instant — a dot
{ from, to }           // span — a bar; `to` omitted = open, runs to "now"
+ { label, kind, url, lane, children }
```

`kind` becomes a CSS class (`task`, `agent`, `log`, `action`, `window`,
`day`) — skinning stays in `Timeline.css`, off the single `--prim` accent at
different mix percentages. `window` bypasses `lay()` entirely — drawn
straight onto lane 0, never competing for a slot; `day` does **not** — it is
packed like an ordinary item even though its CSS spans the full cross axis
regardless of `--lane`, so a `day` marker can consume a lane slot it never
visually uses (see Open, below). `url` renders the item as a real `<a>`, so
`Router.mark_links()` and catalog routing treat a timeline bar exactly like a
preview card.

## Used by

- **`framework/ext/page.js`** — declares `Timeline` in `children:`, so
  [`/framework/ext/Timeline/`](/framework/ext/Timeline/) is a real nav entry
  under Extensions.
- **`ext/Timeline/ai.js`**, this module's own AI-log adapter — imports
  `Timeline` to build `ai_timeline(page)`. It has **zero callers itself**
  today; see below.
- **Nothing renders a live `Timeline` anywhere else on the site.**
  `framework/ai/page.js` used `ai_timeline()` as its `previews()` for several
  hours on 2026-08-14 (built in
  [`ai-page`](/framework/ai/2026-08-14/ai-page/), replaced the same day by
  [`ai-dashboard`](/framework/ai/2026-08-14/ai-dashboard/) — Mike wanted
  step/cost cards over a time axis for that page). `framework/ai/page.js`
  now calls `ext/AITask`'s `rail()` instead. `ai.js` was left in place,
  correct and importable, wired to nothing — a module with no callers is
  itself a finding; detail at
  [`doc/file/ai.js.md`](doc/file/ai.js.md).

## Phase 2

Deferred, not built: a live zoom/orientation control surface, container-query
auto-flip, mini-packing for nested children, deep-link scroll-into-view, and
a stepped (not flat) window-band fill once usage history accumulates. Full
list, with the reasoning for each deferral:
[`doc/phase-2.md`](doc/phase-2.md).

## Traps

- **⚠ Don't re-inline `end()`'s ternary into `lay()` or `item()`.** They used
  to each compute an item's end time separately, and drifted: `lay()` freed a
  still-running item's lane at its own start instead of "now", so a later
  item could pack into a lane whose bar was still visually open. If a future
  change needs item-specific end-time logic, extend `end()` — don't fork it.
- **⚠ `lane` is two different things** depending on where you write it — see
  Decisions, above.
- **⚠ `zoom`/`orientation`/`reverse` are read once, at `render()`.** No live
  setters — see Decisions, above.

## Open

- **Should `day` bypass `lay()` the way `window` does?** Both render
  full-width regardless of `--lane`; today only `window` skips the packer.
  Unresolved — nobody has hit it in practice, because `ai.js` emits at most
  one `day` marker per day, rarely time-adjacent to a real task bar.

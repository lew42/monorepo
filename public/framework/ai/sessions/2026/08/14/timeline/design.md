# ext/Timeline — design

**Verdict up front.** One `Timeline` view class positioned entirely by two CSS
custom properties (`--t` per item, `--em-per-hour` on the root), so zoom and
orientation are property/class writes, never re-renders. Lanes come from greedy
interval packing — parallel work stacks, sequential work shares a lane. The 5h
window is just an item (`kind: "window"`) spanning `[resets_at − 5h, resets_at]`,
drawn as a band behind the lanes. `framework/ai/` becomes a catalog page whose
rail is the timeline — split-screen paging costs **zero new machinery**, because
catalog's rail is `this.previews()` and a page may override its own `previews()`.
Rename `AISession` → `AITask`. Build in three waves, gated on Mike's read.

## The three sizing questions

- **The thing itself:** full/fill — `bleed`, the page is the instrument.
- **Preview on a parent:** the ai index's tile on `/framework/` stays `glance()`
  counts; a miniature timeline thumb is a later nicety, not this design.
- **3440:** horizontal mode turns width directly into time resolution (a 5h
  window at 8em/h ≈ 40em — three windows fit). Vertical mode spends width on
  lanes and labels instead. Nothing stacks; both modes are auto-grid-free
  because the axis IS the layout.

## Data model — items, not tasks

Timeline knows nothing about AI tasks. An item is:

```js
{ at }                 // instant  — a dot
{ from, to }           // span     — a bar; open span: to omitted = "now"
+ { label, kind, url, lane, children }
```

- `kind` is a CSS class (`task`, `agent`, `log`, `action`, `window`, `now`) —
  skinning stays in the stylesheet, per the ladder.
- `lane` (optional string) pins related items to one track; unset items are
  packed automatically.
- `children` nests: an agent span or log dot rides *inside* its task's bar.
- `url` makes the bar a link — which is what lets catalog's `mark_links()` and
  the router treat timeline bars exactly like preview cards.

## API sketch

```js
import { Timeline } from "/framework/ext/Timeline/Timeline.js";

new Timeline({
	orientation: "h",        // "h" | "v" — a class swap, .timeline.h / .timeline.v
	zoom: 8,                 // em per hour along the time axis → --em-per-hour
	lane: 2.2,               // em per lane across it → --em-per-lane
	from, to,                // visible domain; defaults to data extent, padded
	items: [ … ],
});
```

- **Scale = CSS, not layout math.** Each item gets `--t` (hours since `from`)
  and `--d` (duration in hours) once, at render. Position and size resolve in
  CSS: `.h` maps `--t` to `inset-inline-start: calc(var(--t) * var(--em-per-hour))`,
  `.v` maps it to block-start; lanes map to the cross axis. Zooming writes one
  property on the root; flipping orientation swaps one class. This is the whole
  video-editor requirement — both axes have a knob, and neither knob re-renders.
- **Ruler:** hour ticks from a `repeating-linear-gradient` on the track
  background (cheap, zoom-aware since it's em-based), labels only at major
  ticks. A `now` marker is one absolutely-positioned line, nudged by a 60s
  timer while the page is visible.
- **Controls:** the zoom slider and h/v toggle belong to **ext/layout** — the
  one interactive control surface (five-block rule). Timeline exposes the two
  properties; layout's panel writes them. No bespoke toolbar.
- **Responsive:** container query on `.timeline` — below ~40em inline size,
  `.h` auto-flips to vertical (`.timeline.h.narrow` behaves as `.v`). Vertical
  is the phone-native mode; horizontal is the widescreen instrument.

## Lanes — parallel vs sequential

Greedy interval partitioning, the classic: sort spans by `from`, place each in
the first lane whose last `to` ≤ this `from`, else open a new lane. So:

- **Sequential tasks share one lane** — a day of one-tab work reads as one
  clean row/column of bars.
- **Parallel sessions stack** — two tabs at once become two lanes for exactly
  the overlap's duration. The stack depth *is* the parallelism display.
- **Within a task**, `children` render inside the bar: agent spans as slivers
  (their own mini-packing when a fan-out overlaps), `log`/`action` instants as
  dots. A fork fan-out is then visibly a comb: one bar, nine slivers.

## The 5h window band

`usage.json` already carries `five_hour.resets_at` — the window region is
`[resets_at − 5h, resets_at]`, rendered as a `kind: "window"` background band
spanning all lanes, its label showing the current percent. **Progression over
time needs history we don't keep yet:** the fix is one line per snapshot
appended to `ai/usage.jsonl` (`{"log": {"at", "session", "weekly_all",
"weekly_scoped", "resets_at"}}`) — written by the same checkpoint refreshes the
new-task skill already mandates, read back by base `JSONL`. With history, the
band gets a stepped fill (percent at each snapshot); until then, a flat fill at
the current percent. Past windows stay on the timeline as spent bands — the
"where did the day's budget go" view Mike keeps reconstructing by hand.

## framework/ai/ — the split-screen page

**Question:** how does "timeline left, task right" happen?
**Options:** ext/Panel splits (heavy — persisted user layouts, wrong tool for a
fixed master–detail); hand-built flex + `$pages` (the recipe catalog exists to
retire); **catalog** (rail + routed `$pages` region + default fill +
`mark_links()`, already an ext, already proven).
**Verdict: catalog, unchanged.** Its rail is `this.previews()` — so the ai
page's own `previews()` override *becomes the timeline*, and clicking a bar
routes the task into the region beside it, exactly as preview cards do today.

```js
// framework/ai/page.js, the whole conversion
initialize(){ this.catalog(); },
previews(){ return ai_timeline(this); },   // vertical Timeline over every day's logs
```

- The rail runs **vertical** (a column is what a rail is); newest at the top,
  so the live window band sits at eye level. **Horizontal is the full-bleed
  mode** — a `layout` control on the same page flips it and the split gives
  way to timeline-on-top. Phone gets the vertical rail stacked above the task.
- `ai_timeline()` (an `ext/Timeline/ai.js` adapter, not core Timeline) builds
  items from the logs: days from `directory.json`, each task's `task.jsonl` →
  bar (`requested_at → landed_at ?? now`), its `logs`/`actions` → dots,
  `agent` lines → child slivers, usage.jsonl → window bands. Legacy
  `session.json` days render bars only — no dots, fine, they're history.
- The day dashboard stays what it is (the *day* page's view); the ai index
  trades its date-tile wall for the timeline. One thing shown once, per page.

## AITask, not AISession

Rename. A **session** is the transcript uuid — one *field* of a task, and the
thing AISession renders is the task: brief, manifest, spend, agents, replays.
Five consumers (`app.js` export, `dashboard.js`, two day pages' imports, ext
children string) — one commit, no alias needed on a site this internal. Dir
moves `ext/AISession/` → `ext/AITask/`; `dashboard.js` and `feed/replay/stats`
move with it untouched.

## Build waves (each gated, each its own log entries)

1. **Timeline core** — `Timeline.js` (<100 lines) + `Timeline.css` + `page.js`
   with h/v + zoom + lanes demos on synthetic items. No AI coupling.
2. **The ai adapter + page** — `ai.js`, `ai/page.js` catalog conversion,
   `usage.jsonl` appends added to the new-task skill's checkpoint step.
3. **AITask rename** — mechanical, last, so waves 1–2 don't churn.

## Open for Mike

1. Green-light wave 1–2 as designed? 3 also?
2. Vertical-rail default for the split view (horizontal = full-bleed mode) —
   agreed, or must the split view be horizontal too?
3. `usage.jsonl` snapshot appends at the existing ~15-min checkpoint cadence —
   any objection to that file living gitignored beside usage.json, or should
   history be committed?

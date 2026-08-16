# Timeline.js

The whole module's logic: one `View` subclass, no imports beyond `View` and
its three factories (`div`, `a`, `span`). Positions everything by writing CSS
custom properties once at `render()` and lets `Timeline.css` do every
subsequent calculation — there is no resize listener, no re-render on zoom,
no layout math in JS beyond the domain (`span()`) and lane assignment
(`lay()`).

## The one module-level helper: `stamp()`

```js
const stamp = v => typeof v === "number" ? v : Date.parse(v);
```

Accepts an ISO string (what real `task.jsonl` manifests hold) or an epoch-ms
number (what a synthetic demo hands it) — every `at`/`from`/`to` in the file
passes through this first. A malformed string yields `NaN`, silently, with
no item-shape validation anywhere in this file to catch it (see
`doc/property/items.md`).

## The seven methods, by what they own

`render()` — the pipeline; `span()` — the domain; `lay()` — lane assignment;
`end()` — where one item stops, shared by `lay()` and `item()` (see
`doc/method/end.md`); `item()` — draws one item and recurses into `children`;
`ruler()` — hour ticks; `live()` — the "now" line (leaks its interval on
unmount, see `doc/method/live.md`).

## Improvements

1. **`live()`'s `setInterval` is never cleared** — a small leak per destroyed
   instance, blocked on `core/View` growing an unmount hook. **medium,
   useful.**
2. **The two `lane`s** (constructor property vs. item field) share a name and
   nothing else — see `doc/property/lane.md`. **simple, important** (a
   rename, not a behavior change).

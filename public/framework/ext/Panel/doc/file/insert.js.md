## insert.js

The `+` a split offers at the interior gap nearest the pointer — one overlay
per split, absolutely positioned over `.panel-items`, so offering it never
nudges the layout it's offering to change. Same shape as `split.js`, aimed at
a gap between children instead of a panel's own edge.

```js insert.js
export const INSERT = { on: true };
```

## The axis comes from the data, never the DOM

```js insert.js
const row = item.get("dir") !== "col";
```

`item.get("dir")` — never a computed style, never a guess from the element's
own box — decides whether the bar stands tall and narrow (row: columns to
insert between) or lies wide and short (column: rows to insert between).

## `locate()` — interior gaps only

```js insert.js
let best;
for (let i = 1; i < els.length; i++){
	const mid = (side(els[i - 1], false) + side(els[i], true)) / 2;
	if (!best || Math.abs(mid - at) < Math.abs(best.mid - at)) best = { i, mid };
}
```

The loop starts at `i = 1` on purpose — **before the first child and after
the last are never offered.** Those two are the panel's own edges, and an
edge already means something better: clicking it opens `split.js`'s preview,
which is one gesture for the same eventual result. A `+` sitting on an edge
would hide that gesture behind a worse one (the owner, 2026-08-16).

## ⚠ Its own rAF throttle — `coalesce()` is the wrong tool here

```js insert.js
let last, frame;
$items.el.addEventListener("pointermove", e => {
	last = e;
	frame ??= requestAnimationFrame(() => { frame = null; … });
});
```

`grip.js`'s `coalesce()` is a **drag** throttle: it unbinds itself on the
first `pointerup`, which is correct for a resize gesture and wrong here — a
single click anywhere in the split would retire this bar's hover tracking
for good, since the throttle it was riding had just torn itself down.
Written this way from the start (an earlier version tried `coalesce()` and
the bug was caught before it shipped): a 240Hz mouse fires several
`pointermove`s per frame, and this keeps only the latest.

## The click

```js insert.js
return $bar.click(() => new Panel().move(item, ref));
```

`ref` is set by the last `locate()` call, closed over by the click handler —
`move(item, ref)` inserts the new panel at exactly the gap the bar was last
drawn at, which is why `locate()` writes both `ref` and the bar's own
`--insert-at` position from the same computation.

## Improvements

1. **`locate()` recomputes every child's `getBoundingClientRect()` on every
   throttled frame.** Fine at the panel counts this module is built for
   (dozens, not thousands); a split with a very large number of children
   dragged across slowly would be the case to profile. *(simple,
   speculative)*

## What this file is

The instrument, not the curriculum: the controls on top — a textarea holding
a layout spec, a seed stepper, two dials (depth and chaos) and nine presets —
a live "ruler" of that spec on five real screens at once underneath, a rating
strip under the row, and a wall of twelve seeded layouts below that. It is
the manual explorer; `hunt/` runs the same model as an automated search
(`search.js`), ranked by `ext/DesignTool`'s taste tier.

## An integer is a link

`gen(seed)` is deterministic (mulberry32, not `Math.random`), so `open(seed)`
and the url hash both encode a point in the space as a plain number — the
same seed produces the same layout forever, in any browser. That is what
makes the wall a search tool rather than a gallery: clicking a tile opens
that exact spec in the lab.

## `address()` debounces around a real platform limit

```js
this.timer = setTimeout(() =>
	history.replaceState({}, "", location.pathname + "#" + encodeURIComponent(text)), 400);
```

Written on every keystroke, debounced, because Safari rate-limits the
History API and this never fires `popstate` — the Router is untouched by
design, which is why the comment beside it says so explicitly.

## Three doors, one direction

`open(seed)` is called by the stepper (either direction), the dice, and every
wall tile — the paths that start from a **seed** and want the stepper label,
url hash and textarea all moved together. Presets skip it and call `show()`
directly, since they arrive as literal text rather than a seed; the two dials
skip it too, going through `level()` instead, because a drag changes the
*current* seed's layout without moving the seed itself.

## Two dials, one debounce, one path into the generator

`depth` and `chaos` both flow through `level()`, which merges the change,
updates both dial captions, then coalesces regeneration to one
`requestAnimationFrame` per drag — a `range` fires `input` once per pixel of
travel, and one fire would otherwise redraw five whole pages. `dialled()` is
the seam that keeps both dials reaching `gen()` as exactly one object
(`{ depth, chaos }`), shared by `tiles()` and `level()` alike. The wall is
heavier still (twelve renders, not five), so it listens on `change` (pointer
release) rather than `input`.

## The rating strip reads the same shots it sits under

`grade()` calls `ext/DesignTool`'s `taste.rate()` on each of the five
rendered shots and prints a grade beneath the row, debounced 220ms and
deferred past the paint that produced them — rating a layout before the
browser has laid it out would grade stale geometry. ⚠ Every call passes
`{ ignore: null }`: the row already carries `data-layout-ignore`
(`ruler.js`), which `rate()`'s prober honours on the root too, so the default
would silently read zero nodes.

## Five tabs, and `files:` grew by three

`children: "words compose hunt"` is now three: the reference sheet, the
panel workspace, and the search itself. `files:` grew the same way as part of
the generator's rewrite — `model.js` (the weighted tables), `draw.js` (the
chaos dial) and `search.js` (the loop) joined the six files that were already
there.

## Improvements

1. **Nothing ranked** beyond `readme.md`'s own "Open — phase 2" list
   (neighbours, promote-to-page, pins, the two-families gap) — all already
   named as the module's own next moves, not gaps this pass found.

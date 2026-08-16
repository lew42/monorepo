A score that follows a resize handle. Drag the window and the verdict changes
with it — the only way to see *where* a layout stops working, rather than
whether it works at the four widths someone thought to check. Used by
`tests/page.js` (one panel beside every corpus case) and available to any page
that wants a live self-readout.

## One run when the drag STOPS, not one per frame

A `ResizeObserver` fires dozens of times a second, and this was coalescing to
one analysis per animation frame — which is a throttle, not a debounce: the
whole gesture is spent measuring widths nobody asked about, and the only one
that matters is the width you let go at. Every event now restarts a **200ms**
timer. Measured on a 30-step shrink: the panel still reads 1282px the instant
the resize stops, and 702px 800ms later — one analysis for the drag.

Affordable either way, because `analyze()` is ~25µs/node — see
[Cost](../../docs/cost/) — but cheap is not free at 60Hz.

## It releases itself, because nothing else will

The observed box is `document.documentElement`, which never leaves the DOM — so
no amount of teardown elsewhere reaches this observer. It asks on every run
instead, about **both** ends: the panel it writes into and the element it
measures. Either detached and it disconnects. Without that, navigating away from
a page holding one left it measuring, and re-measuring, for the life of the tab;
`dev/DevBar/layout.js` wrote its own readout partly to avoid it.

## ⚠ …but "not attached yet" is not "gone"

That release test has a failure mode with no error attached, and it shipped:
`live()` is called from a page's `content()`, so the **first** run can beat the
render that puts the page in the document. Reading that as *gone* disconnects
the observer, and the panel then measures nothing, ever — an empty framed box,
no console, every library entry's live score blank (2026-08-16).

Two lines fix it. It gives up only once it has measured at least once (`seen`),
and it **observes its own panel** as the wake-up, because a `ResizeObserver`
fires the moment its element first has a box — which is exactly "the page I am
on just arrived". That observation is dropped (`unobserve`) at the first
successful run, or the panel would resize itself by writing into itself and
re-trigger forever.

## Findings point at the page

Each of the four leading issues is `aim()`ed at the element it names
(`highlight.js`) — hover to ring it, click to keep the ring.
The root the paths are resolved against is the element this panel measured, not
the document: `locate()` against anything else finds a real element at the wrong
address.

## It exempts itself from its own measurement

`data-layout-ignore` on the panel's own root, or the readout would report its
own padding and its own line lengths and then change them by doing so — a
feedback loop the panel is specifically built to watch *other* elements for.

## Improvements

1. **`watch.observe(document.documentElement)` runs even when `root` is also
   passed**, so a panel scoped to one element still recomputes on every
   viewport resize even if that element's own size never changed. Harmless
   (the coalescing absorbs it) but is one more measurement than the panel
   strictly needs. *(simple, speculative.)*
2. **Release is checked on the next resize, not at the moment of detach.** A
   panel that leaves the DOM while the window is perfectly still keeps its
   observer registered until something resizes. Harmless (one dead registration
   against `documentElement`, released the first time it is asked) but it does
   mean "disconnected" is eventually true rather than immediately true.
   *(simple, speculative.)*

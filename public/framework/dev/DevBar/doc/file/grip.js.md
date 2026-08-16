The resize edge's behaviour: pointer capture on down, one custom property
written on move, the width committed once on up. Companion file:
`grip.css`.

## One handler, two jobs, on purpose

```js
.on("pointermove", function(e){
    this.style("--grip-y", e.clientY + "px");
    if (html.classList.contains("dev-sizing")) width = rail(innerWidth - e.clientX);
});
```

Pointer capture routes every `pointermove` back to this element regardless of
whether a button is down, so the same listener both tracks the pill to the
cursor's Y (always) and resizes the rail (only while `dev-sizing` is set).
Splitting these into two listeners would need the same `dev-sizing` check
twice for no benefit.

## No `requestAnimationFrame` throttle — and that's deliberate

Unlike `ext/demo`'s `drag()`, this file writes one CSS custom property per
event rather than re-laying-out a live render, and `pointermove` is already
delivered at most once per frame by the browser. Importing the demo system's
throttling machinery for a single `style()` call would cost more than it
saves.

## Committed once, on release

`set({ width })` only runs in the `pointerup` handler, never during
`pointermove`. `rail()` (in `settings.js`) already moves the visible rail
every frame; only the width you actually let go of is worth persisting to
`localStorage`.

## Improvements

1. **A grab has no offset, so it snaps the rail's edge to the pointer.**
   `width = rail(innerWidth - e.clientX)` treats wherever you pressed as the
   new edge, so grabbing at the strip's far side lands the rail up to 12px
   narrow — 0 at the lit line, which is where the eye aims, so it rarely
   shows. Remember `e.clientX` on `pointerdown` alongside the current width
   and subtract the delta on move. *(simple, minor — the straddle had the same
   discontinuity at ±16px, so nothing regressed.)*
2. **`width` is a closure variable that only updates while `dev-sizing` is
   set, but `pointerup` checks `if (width)` unconditionally** — a drag that
   starts and ends with the pointer never entering `dev-sizing` (impossible
   today, since `pointerdown` always sets it) would silently skip the save.
   No live bug, but the guard is coupled to an invariant the file doesn't
   state. *(simple, speculative.)*

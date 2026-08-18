# depth.js

The whole ext. Exports `depth()` — which places the sliders and turns the enclosing
page into a scene — and patches `View.prototype.depth(n)`, which is how every layer
on that page declares itself.

Three functions do the work and none of them is exported: `wire()` finds the page
and switches it on, `focus()` keeps the vanishing point on the reading line, and
`lean()` slides it with the pointer.

## Why it places synchronously and wires in a microtask

`depth()` is called on the first line of a page's `content()`, so none of the layers
it will govern exist yet — and the page element itself is mid-render. The control is
therefore built **synchronously**, while `View.captor` still points where the caller
expects, and everything that needs the finished DOM happens in a `queueMicrotask`
that names its target explicitly. A microtask lands after `render()` returns and
before the browser paints, so nothing is ever on screen unwired.

This is the same shape as `ext/toc`, for the same reason, and it is the one blessed
way to do late content here. Building the control after an `await` would append it
to whatever the captor had drifted to.

## `focus()` returns its own update, on purpose

`wire()` needs it: `--depth-motion` reaches the pointer effects instantly, because
CSS reads the property — but the scroll parallax lives in a JS-computed
`--depth-focus` that is only recomputed on a scroll event. Without handing the
update back, dragging Motion and not moving the mouse looked like a dead control.

The scroll gain is `Math.max(1, motion)`. Gain 1 is exact tracking; under 1 the
origin lags the reading line and produces MORE drift, not less, so the clamp is what
keeps the slider honest about its own label.

## `focus()` — the correction that makes the ext usable

A layer's displacement is `(distance from the perspective origin) x z/(P - z)`. Left
at the element's own middle, that distance is half the document. `focus()` pins
`--depth-focus` to `scrollTop + clientHeight/2` so the origin tracks the reading
centre; displacement is then ~0 where the eye is and grows gently toward the edges.

It measures `base` (the scene's offset inside the scrolled content) and `middle`
once per resize, so the scroll handler performs **no layout reads at all** — it
writes one custom property. A `getBoundingClientRect()` per scroll event would be a
forced style recalculation per scroll event, and the property write invalidates
style, so the two together thrash.

## `lean()` — slide the camera, turn the layers

The pointer does two things, and the distinction is load-bearing. It offsets
`perspective-origin`, which reads as the camera moving. And each layer rotates about
**its own centre** by `--depth-tilt`.

What it must never do is rotate the **scene**: a `rotateX/rotateY` about the middle
of a 4000px-tall box throws its far ends hundreds of pixels in `z`, which is the
failure `focus()` exists to prevent. A single card is small enough that the same
rotation costs nothing — which is why the tilt lives on `.depth-layer` and not here.

It writes `--depth-lean-nx/ny` **normalised to -1..1**, never in px. Three things
consume the lean at three different scales - the origin slide (`--depth-lean`), the
per-layer rotation (`--depth-tilt`) and the shadow throw (`--depth-shadow`) - and a
px value would force this function to know all three. CSS multiplies; JS only says
where the pointer is.

Writes are coalesced to one per animation frame; `pointermove` fires far more often
than the page paints.

## Improvements

1. **`lean()` never detaches its `pointermove` listener.** A page that is navigated
   away from keeps a window listener writing custom properties onto a detached
   scene. Harmless today (one scene per document, and the write is cheap) but it is
   a leak per visit on a long-lived SPA session. *(simple, important)*
2. **The ResizeObserver is never disconnected**, same shape as 1. *(simple, later)*
3. **`lean()` reads its range once and never again.** Correct for cost — a
   `getComputedStyle` per `pointermove` is a style flush per `pointermove` — but it
   means a theme that changes `--depth-lean` at runtime is ignored until reload.
   Nothing does that today. *(medium, later)*
4. **No touch or gyro lean.** On a phone the effect is scroll-only, which is most of
   it, but a device-orientation lean is the obvious mobile equivalent. *(medium, later)*

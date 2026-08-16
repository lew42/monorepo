# devbar-grip-offscreen

## The ask (verbatim)

> the devbar needs to get farther off screen, the resize handle appears and
> hijacks user input

## What's actually happening

`.dev-bar` hides with `transform: translateX(100%)` — exactly its own width.
But `.dev-grip` is `position: absolute; inset-inline-start: 0; width: 2rem;
transform: translateX(-50%)`: it *straddles* the rail's inline edge, so half of
it (1rem) lives outside the bar's box. Translating the bar by its own width
lands that overhang precisely on top of the page.

Measured in the live tab (`/framework/`, rail closed, `innerWidth` 2706, rail
width 200px):

```
.dev-bar   x 2706 … 2906   (fully off screen — correct)
.dev-grip  x 2691 … 2723   (15px on screen, full viewport height)
document.elementFromPoint(innerWidth - 2, innerHeight / 2) → .dev-grip
```

So every page carries an invisible 15px `cursor: ew-resize` strip down its
right edge that swallows clicks, drags and scrollbar grabs — and `grip.js`
calls `setPointerCapture` on `pointerdown`, so the first click is not just
lost, it routes the whole gesture to the closed rail.

This also violates the readme's own stated decision, **"No handle when
closed."**

## Proposal

1. Reproduce and measure in the live tab. ✔ (above)
2. Push the closed transform past the grip's overhang in `devbar.css`, with a
   trap comment naming why `100%` alone is not enough.
3. Verify in the browser: nothing of the rail on screen when closed,
   `elementFromPoint` at the right edge returns page content, and the rail
   still opens, slides and drags correctly.
4. Check the doc set for anything the change makes stale
   (`doc/docking.md`, `doc/sizing.md`, `doc/file/devbar.css.md`, `readme.md`).
5. Land.

## Scope

`public/framework/dev/DevBar/` only — CSS plus whatever doc lines go stale. No
API change, no JS change expected. Single session, no agents.

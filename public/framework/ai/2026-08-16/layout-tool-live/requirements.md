# layout-tool-live

## The ask, verbatim

> the layout tool should rerun when devbar resizes, maybe debounced by 200ms or
> so? but wait until after the resizing stops (don't simply block subsequent
> renders by 200ms, simply queue the rerun for 200ms later, and requeue if
> another resize happens within that window). i'm seeing there's already a
> checkbox for this setting. see if there's any kind of debounce on it (many
> resize events can fire within a short period)
>
> the layout tool's report should be as clickable as possible (add an outline or
> something to the offending element(s) or region).
>
> any ext/Panel should be

The third line was cut off. Asked; answered:

> when clicked, ext/Panel should run a layout analysis. devbar needs tabs, make
> one for Layout, no need to run layout tool unless layout tab is open. the
> layout tool's target switches from the whole page, to the selected Panel, and
> back (when deselected)

Two design calls, also answered:

- **Tabs** — `page` (viewport, route, dev server, x-ray, go) · `layout` · `ai`.
- **Deselect** — Escape clears panel focus, and the layout tab shows its
  current target with a button back to the whole page. Not a click-toggle: the
  focus test fires on clicks anywhere in a panel's body, so a toggle would
  unfocus a panel the moment you used what is inside it.

## What is there now

- `DevBar/layout.js` — `follow()` coalesces to **one run per animation frame**.
  That is a throttle, not a debounce: a drag re-analyzes every frame all the way
  through, which the DevBar readme already lists as its one knob that is not
  free (~9 analyses, ~180ms for one rail-width change on a 680-node page).
- `LayoutTool/live.js` — the same rAF coalescing, same file-level claim.
- Findings are inert text in all three surfaces (`report.js`, `live.js`, the
  rail). Every issue already carries a `:nth-child()` `path` from the analysis
  root, and `mirror.js` already resolves one — with `:scope >`, the trap in
  `doc/addressing.md`.
- `ext/Panel` already has focus: an id on the root panel, `.panel.focus` in the
  DOM, taken by a click on a panel's own bar or body. Nothing outside ext/Panel
  hears about it, and nothing clears it but the panel leaving the tree.

## Steps

1. Debounce — trailing 200ms, requeued, in both `follow()` and `live.js`.
2. `highlight.js` + `address.js` — the overlay, and `locate()` shared with `mirror.js`.
3. Wire hover-outlines / click-locks into `report.js`, `live.js` and the rail.
4. DevBar tabs; the layout section renders (and measures) only while its tab is open.
5. `ext/Panel` announces focus; Escape clears it; the rail retargets to the focused panel.
6. Verify live at 390 / 1280 / 3440, on a page with a workspace and one without.
7. Docs — the two readmes, `doc/file/*`, `DevBar/doc/measuring.md`.

## Fences

One session, no agents. Files owned: `dev/DevBar/*`, `ext/LayoutTool/*`,
`ext/Panel/workspace.js` (+ its readme/doc). Nothing in `core/`.

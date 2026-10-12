# A dev toggle: label every grid/masonry/packed container on screen

You are a minion. Load the `minion` skill first. Work in the worktree at
`C:\Code\lew42\worktrees\framework-home-grids` (branch `worktree/framework-home-grids`, its
own dev server already running — ask your parent for the port if you need it).

Parent task dir (read the full ask first):
`public/framework/ai/2026-10-03/framework-home-grids/requirements.md`. Log your steps in
`public/framework/ai/2026-10-03/framework-home-grids/layout-labels/task.jsonl` (create it).

## The owner's words

> It'd be useful to see how the grids are set up: section labels that render the class
> names used on a container, what grid configuration, so I don't have to inspect to find
> the right container.

From the task's own "Do" list: "a switch (DevBar, or `?layout=1`) that puts a small label on
every container with a layout class showing its classes and the computed `display` /
`grid-template-columns` / column count. Check `ext/DesignTool` first; something like it may
exist."

## What exists — read these first (law 6, don't build a second version of a system)

- `public/framework/ext/DesignTool/highlight.js` — close, but NOT this: it draws ONE ring
  that follows whatever element you hover/click (`aim()`, `spot()`, `draw()`), for
  DesignTool's own findings list. What we need instead is a label PINNED to EVERY matching
  container at once, all the time the toggle is on — not a single hover ring. Reuse its CSS
  pattern (`data-layout-ignore` on the overlay host so DesignTool's own analysis skips it,
  `position: fixed` tracked per-frame) if it helps, but don't try to repurpose `aim()` itself
  for a many-at-once job it wasn't built for.
- `public/framework/dev/DevBar/parts.js`'s `check(text, cls, changed)` — a checkbox bound to
  a class on `<html>`, remembered across reloads via `knob()`. This is the EXACT existing
  pattern for "a DevBar switch that turns a page-wide visual overlay on/off": see
  `tools.js`'s `xray()` function (`check("outline every box", "dev-outline")`) and
  `devbar.css` line ~269 (`html.dev-outline body :not(.dev-bar, .dev-bar *) { outline: … }`)
  — that one is pure CSS because it needs no computed values. Yours needs computed
  `display`/`grid-template-columns`/column-count per element, so it needs JS, but the
  checkbox/knob wiring should look like this one.
- `public/framework/dev/DevBar/tools.js` — `export const tabs = [...]` is where a tab's
  sections are registered; `xray()`/`jump()` etc. are small functions in that same file, each
  wrapped in `section(title, fn)` (`parts.js`). Your toggle can be a line inside an existing
  tab (the `page` tab is the obvious one — general-purpose dev chrome, not the heavier
  `layout` tab which lazy-loads 45KB of DesignTool) rather than a whole new tab.

## Owner addition (2026-10-03, after this brief was first written — read this before you start)

> Add to your layout-labels toggle (owner asked how to find which container a cqi unit
> reads): each label also names the element's NEAREST size container (the closest ancestor
> whose `container-type` isn't `normal`, with its name), or "viewport" when there's none.
> Example: on the AI card detail there is no container at all, so `--gap`'s `cqi` reads the
> window.

This is now part of deliverable 1 below, not a separate thing: walk up from the labelled
element with `el.closest()` or a parent loop reading `getComputedStyle(el).containerType`
(anything other than `normal` means it IS a size container) until you find one, and read its
`container-name` (`getComputedStyle(el).containerName`) too — show both, e.g.
"nearest container: .page-previews (none)" when it has no name, or the name if it does. No
container found walking all the way to `<html>` → show "viewport" instead. Put this in the
SAME label as the class/display/grid info, not a second overlay — one label per container,
everything about it in one place.

## Do

1. Build a module (new file, e.g. `public/framework/dev/DevBar/labels.js`, or under
   `ext/DesignTool/` if you decide it truly belongs there — your call, say why) that:
   - Finds every element with a layout class: `.grid`, `.masonry`, `.packed` (the three
     explicit classes the `grid-fill` sibling task is adding alongside the existing
     `.wall`/`.page-previews` selectors — if that task hasn't landed in your worktree yet
     when you start, also match `.wall` and `.page-previews` directly so your toggle still
     works meanwhile).
   - For each one, shows a small, unobtrusive label (pinned near its top-left corner, or
     inline as a tiny tag) with: its own class list, and from `getComputedStyle()`:
     `display`, `grid-template-columns` (or a readable summary — the raw computed value is
     often a long px list; consider showing the TRACK COUNT plus one representative track
     width, e.g. "grid · 4 cols · ~220px" rather than the raw 4-value string — your call,
     optimize for "glanceable", which is the whole point of this feature).
   - Updates on resize (a container's column count changes) — a `ResizeObserver` per
     container, or one observer on the viewport that re-reads all of them, either is fine.
   - Never appears in production and costs nothing when off (same rule as `dev-outline`
     and as `layout.js`'s own comment: "imported ON DEMAND, and the TAB is the gate on
     running it at all").
2. Wire it to a DevBar checkbox (the `check()`/`knob()` pattern, so it survives a reload
   while on) AND to the URL: `?layout=1` turns it on even with the DevBar closed (useful for
   a plain screenshot). Both need to agree on one source of truth — don't let the checkbox
   and the query param fight over two different "on" states; read the query param once at
   load and seed the knob from it, or vice versa — pick one and say which in your log.
3. Mark the label overlay itself `data-layout-ignore` (same attribute `highlight.js` and the
   dev bar itself use) so DesignTool's own page analysis never measures your own labels as
   part of the page it's labelling.

## Prove it

Screenshot `/framework/` (your worktree's own port) with the toggle on, at 1920. Every grid
container visible should have a legible label near it, and nothing should look broken
(labels overlapping unreadably, or covering real content) — if it's cluttered at this
density, say so and simplify (e.g. only label the OUTERMOST container of a nested group,
not every nested `.grid` inside it) rather than shipping clutter.

## Fence

Write only: new file(s) under `public/framework/dev/DevBar/` (or `ext/DesignTool/` if you
go that route — say why in your log), `public/framework/dev/DevBar/tools.js` (one new
line/section to wire it in), `public/framework/dev/DevBar/devbar.css` (your label's own
CSS, in `@layer util` or wherever the existing dev-chrome rules sit — check the top of that
file). Don't touch `page.js` or `Page.css` — a sibling minion owns those. Commit in the
worktree when it works.

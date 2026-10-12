# devbar-grip-scrollbar

## The ask, verbatim

> devbar's draggable edge intercepts scrollbar user input.

## What was measured

`/framework/ext/Panel/`, window 2706, rail open (dragged to 760):

| thing | x-range |
|---|---|
| `.pages` scroll gutter (`offsetWidth − clientWidth` = 15px) | 1931 → 1946 |
| `.dev-grip` (`--dev-grip: 2rem`, `translateX(-50%)`) | 1931 → 1963 |

`elementFromPoint` at 1935 / 1940 / 1944 / 1946 all return `dev-grip`. Every
pixel of the region's scrollbar is under the grip.

## Cause

`grip.css` straddles the rail's inline-start edge — 16px inside the rail, 16px
out over the page. `Page.css` gives `.pages` `overflow-y: scroll`, so the
region **always** reserves a 15px gutter flush against `.app`'s content edge,
which is exactly where the rail begins. The two have collided since the grip
was built; the 2026-08-16 `devbar-grip-offscreen` fix only stopped it
happening while the rail was *closed*.

No straddle can survive this: the scrollbar owns the last 15px on the page
side, so any outward overhang lands on it.

## Decision (Mike, 2026-08-16)

**Grip moves entirely inside the rail, 12px wide.** `--dev-grip: 0.75rem`,
`transform` dropped. It lands on the dead strip the rail already has — 1px
`border-inline-start` + 11.52px `padding-inline-start` on head / tabs / body —
so no rail content loses a pixel and nothing else in DevBar changes. Rejected:
widening the rail's padding to buy a 16px target (costs content width for
4px), and pushing `.app`'s reservation out by half the grip (page loses 16px
permanently, dead strip beside the scrollbar, preset math needs an offset).

Falls out of it: the closed slide in `devbar.css` goes back to plain
`translateX(100%)` — the `+ var(--dev-grip)` existed only because half the grip
hung outside.

## Scope

`public/framework/dev/DevBar/grip.css`, `devbar.css`, and the docs that record
the straddle (`readme.md`, `doc/docking.md`, `doc/file/grip.css.md`,
`doc/file/devbar.css.md`). No agents.

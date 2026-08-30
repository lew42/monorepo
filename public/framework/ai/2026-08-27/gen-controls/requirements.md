# Generator live controls (task B, column-pages round 2)

## The ask (verbatim, from the owner via the mastermind brief)

> let's add ui controls to switch any page to any other page.
>
> create ui controls for grid and flex control: size, number of columns, whatever. study the flex/grid css utilities.
>
> add some controls to the generator's page's header, to control size (small, med, large), or whatever.

## What gets built

1. **Kind switch, per column** — on any generated page's column head, a minimal control that
   switches THAT node's word live (tabs / vtabs / list / wall; prose only where it has no
   children) and its width word (small / default / large / full). The SPEC STRING is the single
   source of truth: a switch edits the spec at that node and re-lands through the existing
   `#s=` typed-spec machinery, so every switched state is addressable, shareable, reload-safe.
2. **Grid/flex controls** — where a column is `wall` or `list`, chips for density/size
   (`--gen-cell` / column track), gap, and column count, driven by the framework.css utility
   vocabulary rather than invented CSS.
3. **Generator header controls** — global default column size (small / med / large) applied to
   the generated tree, plus one or two more of my judgment. NOT a chaos dial.

## Laws

- MODEL stays 2. A control edits the SPEC; the seed only draws the initial tree. Controls never
  reroll or shift seeds silently, and the same-seed-twice reproducibility proof stays green.
- Every CSS rule inside a layer. One backtick inside css(`...`) kills every page. No DOM after await.

## Fence

- I own `core/Page/generator/**`, and `ext/layout/**` only if I genuinely extend the shared bar.
- Siblings own `overview/**`, `columns/**`, `uses/**`. `core/Page/*` files are settled — a needed
  core hook gets logged and worked around locally.
- Dev server on :80 is the owner's: never kill or restart, browse headless read-only, never drive
  the owner's tabs, never git stash, never commit.

## Verify

Headless at 1280 / 1920 / 3440: switch one node tabs -> vtabs -> list -> wall with a screenshot of
each; width chips move the track; the header size control moves the default track globally; the url
spec round-trips after every switch (spec shown == spec parsed from url); reload restores the
switched state; zero console errors.

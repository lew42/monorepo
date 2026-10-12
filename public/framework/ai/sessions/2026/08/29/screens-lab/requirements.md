# screens-lab — full-screen experiences at /imagine/screens/

## The ask (owner, verbatim, 2026-08-29)

> try making some full screen experiences, and experiment with full screen layouts, as they pertain to navigation. for example, full screen -> split screen -> 3 equal columns. full screen title slide -> launches a document in a column on the right. large, clean, simple... iterate through all the permutations

Program context: `public/framework/ai/2026-08-29/imagine-program/requirements.md`.

## What gets built

`/imagine/screens/` — a tree of full-screen navigation experiments, previews as nav on the index.
Each experiment is its own child page with a one-line verdict.

1. Progressive division: full -> 2 equal -> 3 equal (-> 4). Both axes (columns, rows).
2. Title slide -> document in a column to the right; the inverse too.
3. Deck: full-screen slides swapped in place, a url per slide, cold-loadable.
4. Free permutations: quadrants from a full menu, uneven split (golden/thirds), a split whose
   half is a columns row.

"Iterate through all the permutations" = COVER the space with small honest tries, not polish one.

## Mechanics

`columns()` + width words (`full` `fill` `hug` `small` `large`), the panels pattern for vertical
splits, `hides-nav` for chrome-free screens, `bleed`. Large clean type, theme tokens only
(wash/tint/surface/prim; never `--well`).

## Fence

`public/imagine/screens/**` + the one `children:` line in `/imagine/page.js`. Nothing else.
Siblings own `core/Page` and `/imagine/scenes` right now.

## Known core bug (sibling is fixing)

`width: "full"` collapses the site sidebar to 0px. `hides-nav` screens dodge it; note sightings
in the log rather than working around it locally.

## Verify

Headless at 400/1920/3440: every permutation cold-loads at its own url; progressive division
proven by column counts per hop; deck slides addressable; zero console errors.

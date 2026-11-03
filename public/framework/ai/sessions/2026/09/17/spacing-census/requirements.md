# Spacing census

**The owner's words (2026-09-17, 21:10):** "why do the ai cards use custom padding? i thought we're trying to build a minimal design system. [...] WE NEED A DESIGN SYSTEM. MINIMAL TOKENS USED WHEREVER POSSIBLE... .ac("pad") -> --pad? where is this documented?"

## The deliverable

A census of every spacing value the site's CSS declares, as data and as one screen.

Scan every `.css` file and every `css(\`…\`)` / `.style({…})` spacing declaration in `.js` under `public/` EXCEPT sandboxes and personal dirs (`public/alex`, `public/arya`, `public/castin`, `public/michael`, `public/framework/core/new`, `public/framework/core/legacy`, `public/framework/ai/**`, `node_modules`) — use rg scoped to the repo, never `find /`.

For every `padding*`, `gap`, `row-gap`, `column-gap`, `margin*` declaration record: file, line, property, the raw value, and a class:

- **token** (`var(--pad|--gap|--flow)` alone)
- **token×N** (a `calc()` of one of those with a multiplier — record N)
- **control-em** (a raw em/rem value on something that reads as a control: button, chip, tag, pill, input, nav item — say why)
- **raw** (any other em/rem/px/%/vw constant)
- **zero**

Write `census.json` (the rows) and `census.md` in the task dir:
- one screen
- a table of classes with counts
- the distinct multipliers N with their counts (the owner's question is how many bespoke numbers exist)
- the ten files with the most raw values
- `ext/AITask/ai.css` on its own row set (every one of its numbers, classified)

Two numbers that must agree: rows in the json and the sum of the class counts.

No opinions in the md, only counts and lists; one line at the top saying what the table is.

## Documentation list

Read `public/framework/framework.css` lines 220-250 and 630-645 and `public/framework/styles/readme.md`, and list in the md, as plain links, every page and doc that currently documents `--pad` / `--gap` / `--flow` / `.pad` / `.gap` (`rg -l -- "--pad" public/framework/styles public/imagine/design` and the like) — the owner asked where it is documented; the answer is that list.

## Never

Never kill or restart the dev server, never drive the owner's tabs, never `git stash`, never `find /`. No server needed.

## Final report

The class-count table, the distinct-multipliers line, the ai.css line, and the documentation list — one screen, plain sentences with the two file paths.

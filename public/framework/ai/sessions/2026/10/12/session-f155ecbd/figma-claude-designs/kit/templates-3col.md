# Report: Templates · Three-column pages

Figma file `QYN0G2URSBHYH5I06MOjxU`, page `Templates · Three-column pages`. Brief: [brief-templates-3col.md](brief-templates-3col.md). Continues [templates.md](templates.md). Task log: [templates-3col/task.jsonl](templates-3col/task.jsonl).

## What is on the page
- Overview component `Page · Templates · Three-column pages` (`269:89897`, 1920) at the top left: Notes verdict, How-to, and all 12 masters as thumbnails at natural height (nothing clipped).
- 12 masters `Template / 3col / <name>` (x from 2200, four per row), each a component set with `Scheme` (Mixed, Light, Gray, Dark), `Title`, `Description` and a `Content` slot.
- Benchmarks `269:42024` (below the masters): three templates at 3440, 1920, 1000 and 400, with captions.
- Section at y 20000: `▶ PROTOTYPE` (flow `Templates 3col prototype`, three nav | list | detail screens wired by clicking a session row) and 3 filled examples (cards with filters and details, sessions table, dark transcript workspace).
- Workspace `Matched toolboxes · nav 280 · main · rail 320` (`269:89490`): a drop-target instance, and under it three dashed toolboxes, same width, ground and Text mode as the columns they feed (cloned from the columns, equal height).
- Linked from the Overview design-system card.

## Verdict
- **Most pages, five:** `nav 280 · main · rail 320` (docs, dashboards), `1/5 · 3/5 · 1/5` (reading), `nav 280 · list 440 · detail (mail)` (pick one, see it), `filters 360 · cards · detail 320` (indexes), `icon rail 80 · inner nav 280 · main` (tools, tables).
- **Special:** dark workspace (transcripts), Miller 1/4 · 1/4 · 1/2 (deep trees), 1/3 equal (compare), 240 · main · 400 inspector (editors), TOC · article · notes (long reads).
- **Benchmarks:** 3440 adds a 4th card per row (never wider text); 1000 folds the rail under the main and hides the mail nav; 400 is one column with the nav in a sheet.

## Fixed during checks
Clipped variants (set sizing), a too-short root clipping the rail, white fills on auto-layout frames, an empty DataGrid, ragged card rows (long titles shortened to one line), unequal toolbox heights.

## Not done
- Gray Stat boxes on the gray rail are low contrast; the article slot leaves space right of the 760 measure; the 1000 nav column stretches full height.
- Toolboxes are column clones with relabelled headings, not curated block sets.
- A prototype row cannot link to its own screen (Figma refuses a self-target), so the selected row has no link.
- No tokens for 64/48; values are named in layers.

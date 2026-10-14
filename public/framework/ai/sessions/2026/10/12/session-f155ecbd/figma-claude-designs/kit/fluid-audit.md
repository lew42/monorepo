# Fluid audit: fill width, auto height (2026-10-14)

Rule: [use-figma.md](/framework/ext/Figma/doc/use-figma.md) fixed-size register. Brief: [brief-fluid-audit.md](brief-fluid-audit.md).

**Headline:** the file was already almost fluid. Of 40 Claude pages scanned, 28 had zero unnamed fixed layers. The rest were deliberate width samples, which are now named `(fixed N: reason)`; 25 layers were genuinely fixable and are now FILL. The Figma tool-call limit stopped the run before two pages were renamed.

## Census (before): FRAME/COMPONENT, fixed width or height, no "fixed" in the name

Scanned: instances skipped, variants inside a component set skipped (their width is display only), phones 390 and 1900+ wrappers skipped.

| Page | Found | What they were |
|---|---|---|
| 0 found (28 pages) | 0 | DS 1, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3, 4, 5, 6, 4.1, Screens · Transcription, UI Kit, Kit · Workflows, Overview, Lab × 3, Kit · Layouts, Type · Title layouts, Colour · Permutations, others |
| Kit · Controls | 15 | 2 phones (named by register), 2 Before/After demos, 11 dropdown variants + 2 closed "Menu panel" placeholders |
| Kit · Containers | 9 | "(instances)" wrappers fixed at 1584 inside a 1146 parent: they overflowed |
| Kit · Nesting | 3 | one card sample, two table frames |
| Kit · Slots vs components | 21 | before/after card samples, mock sidebars, 44 px tree items |
| Kit · Grids | 44 | width-demo parents, 13 `Specimen`/`Row` frames |
| Lists · Sidebars, TOC & trees | 42 | screen samples at 1200/1920, article column, rails, 44 px rail buttons |
| Layouts · Two columns | 30 | `Column 768` / `Column 1200` samples |
| Templates · Two-column pages | 74 | named 1/4, 1/3, 2/5, 1/2 columns and rails |
| Templates · Three-column pages | 150 | nav 280/384/480, list 440, rail 320/384 columns |
| Kit · Mobile builder | 15 | sample columns and two named sidebars |

## Changed (after)

- **Kit · Containers:** 9 wrappers set to FILL width. They now fit their 1146 parent (were 1584) and their heights re-hug. Fixed.
- **Kit · Grids:** 13 `Specimen`/`Row` frames set to FILL width.
- **Kit · Controls:** the two "After" demos set to FILL (their parent hugs, so no size change; left). Two closed-dropdown "Menu panel" 110 placeholders named.
- **Named instead (reason in the layer name, `(fixed N: …)`):** Kit · Controls 2, Kit · Nesting 3, Kit · Slots 11 (+10 tree items renamed `fixed 44: touch target height`), Kit · Grids 31, Lists · Sidebars 42, Layouts · Two columns 30, Templates · Two-column 74. Why they stay fixed: they are the thing the page demonstrates (a column at a stated width, a 1200/1920 screen sample, a rail, a before/after screenshot).

## Not done: Figma MCP call limit hit

Still unnamed, so the census would still list them: **Templates · Three-column pages** (150 columns) and **Kit · Mobile builder** (15). Both are named-ratio template columns of the same kind as the two-column page; the same rename script applies. Rerun after the limit resets: the script is the one used for Templates · Two-column (walk the page, skip instances and component-set variants, append ` (fixed W: template column)` to each auto-layout child with a FIXED axis).

## Checks

Rows-wider-than-parent: Kit · Containers had 9 and now has 0. Clipping and screenshots of the fixed pages were not run (call limit). Prototype reactions: no node with reactions was changed, only sizing and layer names.

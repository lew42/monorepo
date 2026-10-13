# Fluid sweep: group ds (2026-10-13)

Method: one script per page. Card rows (horizontal, all children fixed width 150+) became `WRAP` with children FILL and `minWidth` = their old width, shorter siblings FILL vertically (tallest hugs). `clipsContent = false` on every frame except phone/image/avatar/icon ones. Before and after screenshots checked on Buttons, Overview, Elements, Cards, Status, Dark grounds, Sidebars, Dropdowns, Colour. Reactions counted per page before and after: unchanged everywhere. Brief item 6: no page had a `Components` frame, so nothing to move. Item 7 (Icon instances): not done, the pages' icons are Material Symbols text in specimens; left for the icon agent.

| Page | Rows made fluid | Clip off | Still fixed, and why | Reactions |
|---|---|---|---|---|
| Overview | 0 (already FILL cards) | 14 | none | 0 → 0 |
| 1 Elements | 16 | 32 | none | 0 → 0 |
| 1.2 Dark grounds | 5 (+ contrast table specimen 1680 → FILL, min 600) | 22 | none; the table inside hugs its own width | 0 → 0 |
| 2.1 Buttons | 3 | 13 | none (phone cards named in the specimens) | 0 → 0 |
| 2.2 Lists & rows | 5 | 19 | none | 0 → 0 |
| Lists · Sidebars, TOC & trees | 0 | 33 | 4 phone instances at 390 (TOC / Mobile dropdown, sheet) | 5 → 5 |
| 2.3 Cards & containers | 5 | 19 | none | 0 → 0 |
| 2.4 Inputs & controls | 7 | 25 | none | 0 → 0 |
| 2.5 Status & progress | 10 | 27 | none | 0 → 0 |
| 2.6 Dropdowns & menus | 3 | 12 | phone specimens (390) | 16 → 16 |
| 2.7 Toggles | 5 | 19 | none | 0 → 0 |
| 3 Sections | 2 | 9 | none | 0 → 0 |
| Colour · Permutations | tables A and B FILL, cells FILL min 120, label column fixed 110; Notes box FILL/HUG (it was fixed height and overflowed once unclipped) | 211 | label column 110 (fixed, a row header) | 0 → 0 |

Left open: Sidebars and Overview have rows that were already fluid and are untouched; the 2.3 and 2.5 grids still have a few unequal-height wrapped cards (tallest hugs, not a fixed named row height); icon-instance swap.

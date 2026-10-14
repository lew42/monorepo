# Report: DS pages on the section-rows template (2026-10-13)

Figma file `QYN0G2URSBHYH5I06MOjxU`. Brief: [brief-ds-rows.md](brief-ds-rows.md). Template picked in [templates.md](templates.md). Task log: [ds-rows/task.jsonl](ds-rows/task.jsonl).

## How it was built
- **Same auto layout, not a template instance** (a slot cannot hold moved nodes). Each old `Section · X` frame is now `Row · X`: a horizontal row, gap 48, left column `Head (fixed 400: 1/4 column)` (title and description), right column FILL (about 1232 wide) with the original `Tiles` frames. Nothing was copied: every specimen, Head and Tiles keeps its node id, and each `Page · DS · …` component keeps its id, so the Index still works.
- Rows with a second tile group (`Tiles on dark`, `Tiles`) stack both in a `Specimens` column (FILL, gap 16) inside the right column.
- Tiles wrap with min width 480 (specimens) and no max, so the last row stretches instead of leaving a void; phone rows (`In action`, `Phone variants`) use min 454 (a 390 phone plus its padding; narrower clipped the phone). A wrap row cannot grow its parent in the plugin API, so each row's height was re-measured by toggling HUG. Core set cards (Icons) are FILL height, so the five groups are equal.
- A script checked every Tiles frame: no last row leaves a gap at the right on any page.

## Per page (rows made, reactions before → after)
- **2.1 Buttons** (pilot, screenshotted at 100%): 3 rows; 0 → 0.
- **1 Elements**: 8 rows (Type, Grounds, Icons, Image boxes, Dividers, Chip & badge, Avatar, Progress bar); nodes only moved.
- **1.1 Icons**: 6 rows (Core set ×2, Sizes, Icon and text, List bullets, In action). Left as it was: the `Icon system` section (a different shape, not Head + Tiles) and the Notes box.
- **1.2 Dark grounds**: 6 rows; 0 → 0.
- **2.2 Lists & rows**: 5 rows; 0 → 0. **2.3 Cards & containers**: 5; 0 → 0. **2.4 Inputs & controls**: 7; 0 → 0.
- **2.5 Status & progress**: 6 rows (five with stacked light + dark tile groups); 0 → 0.
- **2.6 Dropdowns & menus**: 3 rows; 0 → 0. **2.7 Toggles**: 5 rows; 0 → 0. **3 Sections**: 2 rows; 0 → 0.
- No page had prototype reactions inside its own component, so the count stays 0 on every page counted (Elements and Icons were only moved, not counted).

## Also fixed
- **Single stat for 280 sidebars:** `Block / Stat (single · 280 sidebars)` (`277:104073`) on `Kit · Mobile builder`, below the other blocks. Its Resolution mode is Mobile, so pads are 16/24 and it fits 232 of content (tested at 232: "SESSIONS 128" on one line).
- **Overview thumbnails:** on `Page · Templates · Two-column pages` every thumbnail frame is now 314 high (the tallest master, section rows, was 313 and clipped at 250). Nothing is clipped.
- **Gray Stat on the gray rail:** the `Stat` master (`145:14027`) got a 1 px inside stroke, black at 18%, so it reads on every ground (one master edit, no overrides).

## Not done, and why
- Three-item phone rows (2.1–2.7 "In action") come out as two phones plus a full-width one, because three 454 tiles do not fit in 1232. No void, but the wide one is airy: a later pass could stack the three phones at 400 with a narrower tile padding.
- Pages are much taller (Elements 5773 → 8673, Icons 9454 → 12054) because specimens are 2-up now.
- Screenshots were read for Buttons, Sections and Inputs & controls; the other pages were checked by the void script and measured heights only. The Index was not rebuilt.

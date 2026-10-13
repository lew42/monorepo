# Kit · Mobile builder: drag, drop, done (2026-10-13)

Page `Kit · Mobile builder` in file `QYN0G2URSBHYH5I06MOjxU`; the 1920 component is `Page · Kit · Mobile builder` (`260:71518`). Brief: [brief-builder.md](brief-builder.md). Principle: [ext/Figma/doc/builder.md](/framework/ext/Figma/doc/builder.md).

## The one-switch rule, as built
- **Modes inherit; blocks set none.** A column sets its ground (fill bound to `surface`) and its Text mode together, and Resolution once. A block has no Text mode and no ground of its own, so it takes the column's. This replaces the brief's `Scheme` variant on every block; a variant is kept only where a block carries its own ground (none yet: Card is a 10% black layer, which works on every ground).
- Blocks are `FILL` width and `HUG` height, with pads and gaps bound to the Resolution tokens.
- **Test (passed):** blocks dropped from the dark toolbox into the dark column (and the gray and near-black ones) read correctly with zero clicks; on Dark BG the ink turns white, the card darkens the ground, the accent bars stay prime. Text on a near-black rail uses Dark BG plus a 50% black layer.

## What is on the page
- **27 blocks**, `Block / <kind>`, masters top level to the right of the page in five columns: Chrome (app bar, tab bar, section header, footer), Lists (list row, tree row, toggle row, nav row, profile), Content (heading, prose, card, stat pair, chart card, image + caption, empty state, alert, progress, table), Inputs (search, segmented control, button row, form field, mic bar, context pill), Chat (message bubble, transcript line). Built from the existing kit components (Row, Tree row, Button, Toggle, Stat, Segment, Chip, Tab bar, App bar, Chat bubble, Mic, Field, Alert, Progress, Grid), nothing rebuilt.
- **Notes box** at the top (how to drag in four steps, the one-switch rule, toolboxes match their column).
- **Mobile 400:** a toolbox (390, light, Mobile) beside 3 empty phone columns, then 4 example screens made only of blocks: Settings, List, Detail (list → detail), Dictation.
- **Three matched two-column workspaces**, each with a toolbox on each outer side at the exact width, ground and mode of its column: dark sidebar 280 | white main 600; gray sidebar 280 | white main 600; white main 600 | near-black rail 280. Sidebar toolboxes hold nav rows, tree, profile, search, toggle, footer; main toolboxes hold heading, prose, cards, stats, chart, image, table, alert, form.
- **Play-well strips:** light → dark → light, gray bands on white, same ground twice.
- **1920 and 3440 workspaces** (below the page, `260:71360`, `260:71439`): a dark sidebar (320 / 400) plus a main that FILLs the rest (Default / Mega), one example each, blocks unchanged.

## The play-well rule
A change of ground is its own divider: nothing goes between two bands of different ground. Two bands of the same ground are separated by the gap the blocks already carry. A card never sits flush against a ground change; the band's own padding keeps it off the edge.

## Caveats
- The 280 sidebar is too narrow for Stat pair and Context pill (they wrap or clip), so those blocks are left out of the narrow toolboxes. A single-stat variant would fix it.
- Main columns are Default resolution, so blocks are airy (36 pad). Set a main column to Mobile for a denser look.
- Two-column workspaces total 880 wide so toolboxes fit a 1920 page; the real 1000 benchmark is not drawn separately.
- Overview card: link row added under the design-system card. Three-column templates are a later brief.

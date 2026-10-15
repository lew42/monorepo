# Foundations · Cards report (2026-10-14)

Figma file `QYN0G2URSBHYH5I06MOjxU`. Brief: [brief-cards.md](brief-cards.md). Page `Foundations · Cards` (`302:108326`, after `Foundations · Type & spacing`); its 1920 component is `Page · Foundations · Cards` (`302:114678`). Built from the Essentials masters ([essentials.md](essentials.md)); no parallel copies.

- ✅ **1 Each card style, responsive** (`302:109798`): all 8 styles (Plain, Header + actions, Stat, List, Media, Feature, Callout, Context Form=Card) at 280, 400 and 520, each with its longest real title. Nothing overflows after the fixes below.
- ✅ **2 Density** (`302:113134`): a `Density` variant (Comfortable / Compact) on Plain, Stat and Feature, shown side by side. Compact pads with the `gap` token (16), not `small-pad` (12 / 6 is a button's, too tight for a card).
- ✅ **3 Grids** (`302:113320`): 3-up (row height 240) and 4-up (180), equal heights, height named in the layer, content top-aligned; one masonry of mixed cards in three columns.
- ✅ **4 Card on card** (`302:114200`): List + Plain on a 10% ground reads well; Stat cards inside a Plain card is one box too many; the fix is bare figures.
- ✅ **5 Colour last** (`302:114430`): Plain, Stat, List on the dark ground, Text mode Dark BG only.
- ✅ **6 Notes** (`302:114574`): the four cards for 80% of pages (Plain, Header + actions, Stat, List) and the master changes.

## Master changes
- `Card / Plain`, `Card / Stat`, `Card / Feature` are now component sets (`302:108077`, `302:108082`, `302:108087`); existing Essentials instances still point at the Comfortable variant.
- Empty `Content` slot on Plain and Header + actions collapses (min height 1, hug) instead of 100 px of blank.
- Header and List titles truncate after two lines (a 4-line title beside the buttons at 280).

## Open
- Not linked from `Index · full size` or the Overview card yet (same as Essentials).
- Checked at 1680 content width in Figma screenshots; the four web widths do not apply.

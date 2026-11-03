# Report: dogfood, the new pages use the Essentials cards (2026-10-14)

Figma file `QYN0G2URSBHYH5I06MOjxU`. Brief: [brief-dogfood.md](brief-dogfood.md). Cards: [essentials.md](essentials.md).

## Checklist
- ✅ **Foundations · Layouts** (`296:108171`): all 35 `Card A · Properties` stand-ins swapped in place (`swapComponent`) to `Card / Plain` (`296:107439`), keeping each title and note. Empty Content slots hidden. Meta line and button of the old card are dropped (none showed). Card grid row went from 3928 to 2360 tall, no clipping.
- ✅ **Demo · Site** (`296:106079`): footer buttons on both Reading screens (`296:106087`, `296:106088`) have the leading "+" icon hidden (the Button has no Show icon property). Right column now reads "Related" with real links (Why slots, Buttons, Cards, Layouts, Templates). It already used `Card / Stat`, `Plain`, `Feature`, so no card swap was needed.
- ✅ **Templates · Two-column**: 12 `Grid card` stand-ins in the filled examples (`261:72381`) are `Card / Plain`.
- ✅ **Templates · Three-column**: 27 `Grid card` stand-ins in the filled examples and the matched toolboxes (`269:88838`, `269:89490`) are `Card / Plain`. Masters' empty slots untouched.
- ✅ Screenshots seen at 100%: Card grid row, Split row, Why instances, both template examples. No reaction was edited (buttons only had a child hidden).

## Left
- The footer buttons still show the small arrow in their label text; that is the label, not an icon.
- Related-link rows have no prototype reaction (they had none before).

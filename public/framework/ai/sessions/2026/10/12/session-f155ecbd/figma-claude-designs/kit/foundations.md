# Foundations · Layouts report (2026-10-14)

Figma file `QYN0G2URSBHYH5I06MOjxU`: page `Foundations · Layouts` (`296:108171`, right after `Demo · Site`), its 2640-wide component `Page · Foundations · Layouts` (`296:107999`). Brief: [brief-foundations.md](brief-foundations.md). The Figma MCP call limit stopped the work before the last checks, so two things are still open (below).

## The set (simplest first, one row each, 400 / 1000 / 1920 with the same content)
| Row | Master | Row id |
|---|---|---|
| Stack | `Layout / Stack` `177:1068` | `296:108734` |
| Reading column (new, max 720 centred) | `Layout / Reading column` `296:106933` | `296:108814` |
| Split 1:1 | `Layout / Split` `177:1107` | `296:108879` |
| Section rows (title 170 + fill, three stacked) | `Layout / Two columns` `177:1092` | `296:108990` |
| Sidebar + content (rail 200 + fill) | `Layout / Sidebar + content` `177:1137` | `296:109181` |
| Header / body / footer | `Layout / Bands` `177:1159` | `296:109295` |
| Card grid (new, wrap, cards 400–520) | `Layout / Card grid` `296:106931` | `296:109408` |

Content is real: `Card A · Properties` instances (title, note, meta, button), `Button` instances, text on the `h3`/`h4`/`body` styles. Each width sits in a `Specimen` instance. At 400, Split, Section rows and Sidebar use their `Collapsed=true` variant (the existing property is the Wide / Narrow switch; I did not rename it, DS · 4.1 uses it).

## What changed in the masters
- New `Layout / Card grid` and `Layout / Reading column` on Kit · Layouts (a slot each; the grid slot wraps, the reading slot has `maxWidth` 720).
- `Layout / Two columns` (not collapsed): the Title slot is now FIXED 170 (was HUG), so rows line up as a section-row layout.
- Cut from the set (masters kept, nothing deleted): Media + text, Three columns, the charts.

## Open
- ⬜ **Dark row** (two layouts in `Ground`, Text mode only): not built, tool limit.
- ⬜ **Screenshots**: I saw only Split 1:1 (clean at all three widths); the other six rows are built and measured but not looked at. Also the card's title band renders white on the gray tile (a fill on `Card A`'s inner "Frame"): fix it in the card, or swap to the `Card / …` components when `kit/essentials.md` lands.

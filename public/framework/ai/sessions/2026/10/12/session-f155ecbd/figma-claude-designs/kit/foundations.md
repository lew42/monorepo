# Foundations · Layouts report (2026-10-14)

Figma file `QYN0G2URSBHYH5I06MOjxU`: page `Foundations · Layouts` (`296:108171`, right after `Demo · Site`), its 2640-wide component `Page · Foundations · Layouts` (`296:107999`). Brief: [brief-foundations.md](brief-foundations.md).

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

## Last pass (all seven rows and the dark row looked at at 100%)
- ✅ **Dark row** (`297:105681`, a `Ground=Dark` instance 1000 wide with a Stack and a Split inside, Text mode only): text and button read correctly, no overrides.
- ✅ **Card title band**: `Card A` and `Card C` had a hard-coded white fill on the title frame; removed in the masters (`239:31003`, `239:31027`).
- ✅ Button labels fixed (I had overwritten the icon text); Section rows now have 32 between rows; the Bands instances get 32 between bands (instance override, the master stays 0 because DS · 6 uses it); the dark ground has 48 padding.
- Checked: Stack, Reading column (centred, 720 max), Split (stacks at 400), Section rows, Sidebar (stacks at 400), Bands, Card grid (1 / 2 / 4 columns at 400 / 1000 / 1920, cards 400 to 468), dark. No clipping, overlap or void.
- Still not done: swapping the cards for the `Card / …` components when `kit/essentials.md` exists.

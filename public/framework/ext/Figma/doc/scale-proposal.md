# Scale values: a proposal to make each step grow (2026-11-16)

A **proposal only**; no token value has changed. The seven modes are named by resolution first (`360 XS`, `400 Mobile`, `600 SM`, `1000 Default`, `1600 LG`, `2600 XL`, `3440 Mega`), and a `width` token holds each mode's resolution. Background: [design-system-notes.md](./design-system-notes.md), [token-audit.md](./token-audit.md).

## Decided 2026-11-16

- **1920 Desktop values accepted as they are:** `width` 1920, `pad-x` and `pad-y` 68, `gap` 44, `radius` 8, `section-pad-x/y` 68, `button-pad-x` 24, `button-pad-y` 16, `text-gap` 12, `card-min` 432 (interpolated 32% of the way from LG to XL, rounded to a multiple of 4). Pro allows 10 modes.
- **`squeeze` is flat at 1600** in 360 XS through 1920 Desktop; 2600 XL stays 1800 and 3440 Mega 2400. This replaces the erratic list under "What is wrong now" and the squeeze row of the table below (the `max-width` rename is not done).
- **A `measure` token exists:** Scale `measure` = 720 in every mode (scope width/height). The frames named `Text (max 720: measure)` bind their max width to it. This is the reading width, separate from `squeeze` (the content maximum).
- The rest of the table below is still a proposal, not applied. It covers the other seven modes only.

## What is wrong now

- **Steps near the top are tiny.** `pad` goes 48 → 64 → 80 between 1000, 1600 and 2600, then jumps to 128 at 3440. `gap` goes 32 → 40 → 48 → 64. The 2600 mode barely differs from 1600.
- **`section-pad-x/y` equals `pad-x/y`** in every mode (except Mobile `x`), so a section has no more room than a card.
- **`button-pad-x` is not monotonic:** 1000 is 32, but 1600 is 24.
- **`squeeze` is erratic:** 1600 in four modes, 400 on Mobile, 1800 on XL, 2400 on Mega, and it is not a clear maximum width.
- `radius` goes 4, 4, 4, 6, 8, 6 (Mega is smaller than XL).

## Proposed values (current → proposed)

| token | 360 XS | 400 Mobile | 600 SM | 1000 Default | 1600 LG | 2600 XL | 3440 Mega |
|---|---|---|---|---|---|---|---|
| pad-x | 16 → 16 | 24 → 24 | 32 → 32 | 48 → 48 | 64 → **72** | 80 → **112** | 128 → **160** |
| pad-y | 16 → 16 | 32 → 24 | 32 → 32 | 48 → 48 | 64 → **72** | 80 → **112** | 128 → **160** |
| gap | 12 → 12 | 24 → **16** | 22 → **20** | 32 → 32 | 40 → **48** | 48 → **64** | 64 → **96** |
| radius | 3 → **4** | 4 → 4 | 4 → **6** | 4 → **8** | 6 → **10** | 8 → **14** | 6 → **18** |
| section-pad-x | 16 → **24** | 16 → **24** | 32 → **48** | 48 → **96** | 64 → **144** | 80 → **224** | 128 → **320** |
| section-pad-y | 16 → **32** | 32 → **40** | 32 → **56** | 48 → **96** | 64 → **144** | 80 → **224** | 128 → **320** |
| button-pad-x | 12 → 12 | 14 → 14 | 18 → 18 | 32 → **24** | 24 → **32** | 28 → **44** | 36 → **56** |
| button-pad-y | 6 → 6 | 8 → 8 | 10 → 10 | 12 → 12 | 14 → **16** | 16 → **22** | 20 → **28** |
| text-gap | 4 → 4 | 6 → 6 | 6 → **8** | 12 → 12 | 10 → **16** | 12 → **24** | 16 → **32** |
| card-min | 280 → 280 | 280 → 280 | 280 → **300** | 320 → **360** | 400 → **480** | 500 → **720** | 600 → **960** |
| squeeze → **max-width** | 1600 → **360** | 400 → **400** | 1600 → **600** | 1600 → **1000** | 1600 → **1400** | 1800 → **1800** | 2400 → **2000** |

Bold is a changed value. Rules behind the numbers: from 1000 up, `pad` grows about 1.5x per step (48, 72, 112, 160); `section-pad` is about 2x `pad` (96, 144, 224, 320), so a section is much roomier than a card; `gap`, `button-pad`, `text-gap` and `card-min` all rise every step (no dips).

## A max-width token

`squeeze` already tries to be a content maximum. The proposal is to **replace it with `max-width`**: a page's content never gets wider than it, so a 3440 page does not stretch a paragraph across the screen. Values grow slowly (equal to the page width up to 1000, then 1400, 1800, 2000). Cost: rename one token and rebind its uses (`squeeze` is bound on the card caps and the 2600 layouts); do it after the 2600 layouts are finished.

## Before this is applied

Nothing changes until it is approved. Applying it moves 150+ bindings at once (every card, section and the Page master), so the layouts being fixed on `Explore – 2600 layouts` should land first.

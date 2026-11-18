# Card tokens test: fixed card padding vs Scale card padding (2026-11-17, lab; adopted the same night, see the last section)

You said a 3440 Mega section makes every card inside it take Mega padding ([owner-words-2026-11-17-root.md](../owner-words-2026-11-17-root.md)). [modes.md](./modes.md) found that real design systems keep card padding fixed and scale only the page. This test puts the two side by side in Lew42 v2, so you can see the difference before anything is rebound.

**Where:** page [Lab · Card tokens](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=276-5443) (the last page), one `Root` (`276:5444`).

## Conclusion

1. **Fixed card tokens fix the Mega problem completely.** In a 3440 section, today's cards get 128 padding, a 64 gap and 36-wide button padding, while the text stays the same size. Each card is 933 × 528, mostly empty. The fixed copies are 933 × 312 and look like a normal card on a wide screen.
2. **At 400 the 1000 Default values are too heavy.** 48 padding on a 368-wide card is 13% of its width each side. The text column shrinks to 272 and the card grows from 281 to 341 tall. It is usable, but it is the "overly padded at 350" you already complained about.
3. **One fixed value of 32 looks right at both sizes** (tested on the same copies, then put back to 48). At Mega the card is 933 × 272. At 400 it is 368 × 301, close to today's Mobile card (24/32 padding, 281 tall). This matches Figma's Simple Design System, whose cards use a fixed 24–32.
4. **Recommendation: split the tokens, and pick 32 as the single card padding.** Scale then keeps only page tokens. It could shrink from 8 modes to 4: Mobile 400, Default 1000, Desktop 1920 and Mega 3440.

## What the page shows

| Section (Scale mode on the Root column) | (a) Today: `Card` 16:364 instances, Scale Auto | (b) Test: detached copies bound to `Lew42 v2 · Card` |
|---|---|---|
| 3440 Mega, cards 933 wide | pad 128, gap 64, radius 6, 528 tall | pad 48, gap 32, radius 4, 312 tall |
| 400 Mobile, cards 368 wide | pad 24 / 32, gap 24, 281 tall | pad 48, gap 32, 341 tall |
| Same copies with pad 32, gap 24 (shots only) | | Mega 272 tall · Mobile 301 tall |

- **The new collection:** `Lew42 v2 · Card` (`VariableCollectionId:276:4062`) has one mode, `Fixed`. It holds `card-pad-x` 48, `card-pad-y` 48, `card-gap` 32, `card-text-gap` 12, `card-radius` 4, `card-button-pad-x` 32 and `card-button-pad-y` 12. Padding and gap tokens are scoped to GAP, the radius to CORNER_RADIUS. Nothing outside the lab page is bound to it.
- **How each copy was made:** an instance of `Card`, detached together with the `Content · Text only` and `Button` instances inside it. Then 19 bindings per card were moved from Scale to Card: `pad-x`, `pad-y`, `gap`, `text-gap`, `surface-radius`, `radius` and `button-pad-x/-y`. The only bindings left are colour.
- **What changes with the Scale mode:** only the section's padding (`section-pad`) and the gap between cards. That is what [modes.md](./modes.md) recommends.

## What the test also found

- **Smaller padding makes text wider than the line-length limit.** In a 933 card with 48 padding the body line is 837 wide, over the 720 `measure`. The fix on the copies: the Text group's max width is bound to `measure`. Before adopting, the `Content · *` masters need the same fix.
- **Lint result:** I fixed the 9 errors in my own layers (text fills, line length). I did not re-run lint after that fix; counting from the first run, 42 should remain, none from my layers:
  - 24 × `pad-token`: lint's list of allowed padding tokens doesn't know `card-pad-x/y` yet. On adoption, one line in `lint.js` (`PAD_TOKENS`) fixes it.
  - 12 × `raw-value` (Actions gap 16 / 8) and 6 × `raw-fill` (a hidden white Icon): these were already wrong in the `Content · Text only` and `Button` masters. Detaching made them visible to lint, because lint skips layers inside instances.
- **Rule 18 look:** I checked a 1:1 shot of one card from each row, and the whole Mega section at 30% and the whole 400 section at 75%. No photos, nothing cut off, nothing outside Root, and the edges line up. The Mega section has a 256 gap between the two rows (`section-pad-y`), which reads as a big void. That is the Mega section padding again, not the cards.

## What adopting would take (not done)

1. **Set the Card values:** pad 32, gap 24, text-gap 12, radius 4, button 32 / 12 (or keep 48 if you prefer the roomier look at 1000).
2. **Rebind the masters,** about 10–15 of them. `Card` 16:364 (Scale page), `Card · with media`, `Card · Slot`, the `Content · *` masters (Text only, Stat, Icon + title, List section, …), `Button` 23:506 (Elements) and `Icon.Item`. The size pages' `1000 · …` sections use `section-pad`, which is page-level, so they stay.
   - **One judgment step:** `gap` serves two roles today. It is the gap inside a card (it becomes `card-gap`) and also the gap between cards in a grid (it stays Scale). The script's rule: a frame inside a card master gets `card-gap`, anything else keeps `gap`.
3. **Edit lint.js** so it allows `card-pad-x/y`, and give the `Content` masters a max width of `measure`.
4. **Cost:** about 8–12 `use_figma` calls. That is one rebind script per page that holds masters (Scale, Elements, Icons, the size pages), then lint and one shot per page. Bindings on instances follow their masters automatically. Instances that override a Scale mode keep it, but it no longer changes their padding.

## Which Scale modes could merge or go

Once cards are fixed, Scale only sets the page: `section-pad-x/y`, the gap between cards, `width`, `card-min`, `squeeze` and `measure`. The modes then differ only in page margin, so most of them are redundant:

| Mode today | section-pad | Proposal |
|---|---|---|
| 360 XS | 16 | merge into **400 Mobile** (the same 16) |
| 400 Mobile | 16 / 32 | keep |
| 600 SM | 32 | merge into 400 Mobile (or into 1000 if a two-column layout needs it) |
| 1000 Default | 48 | keep |
| 1600 LG | 64 | merge into **1920 Desktop** |
| 1920 Desktop | 72 | keep |
| 2600 XL | 120 | merge into **3440 Mega** |
| 3440 Mega | 256 | keep, but lower it to about 128 and cap the content ([modes.md](./modes.md), Q3) |

That leaves four modes: Mobile, Default, Desktop and Mega. **Caveat:** the 360, 600, 1600 and 2600 size pages use their mode's `width` for specimens and `Res.*` cards. Those pages would either go, or show a fixed-width frame using the nearest mode.

## Recommendation

**Adopt the split, with one fixed card padding of 32.** A card then looks the same in any section, and a Mega section can no longer resize it. Scale shrinks to four page modes, and rule 19 becomes one line: set Scale on the frame that sets the width. That answers your "mode fatigue" ([owner-words-2026-11-17-naming.md](../owner-words-2026-11-17-naming.md), last section).

- **Alternative 1: keep everything in Scale and follow rule 19** (wrappers and frozen child modes). It costs nothing now, but you have to remember three places for every grid.
- **Alternative 2: keep 48 and add a two-mode `Density` collection** (Default 48, Compact 24) that you set only on narrow containers. It wins only if you really want 48 at 1000 and also need small cards. It brings back one mode to remember.

## Card padding adopted (2026-11-17, mastermind-card-pad)

voice-app decided to adopt this test ([next-2026-11-17.md](../next-2026-11-17.md), last section). Cards now have one fixed padding of 32, and page spacing still scales.

**The tokens** (`Lew42 v2 · Card`, `VariableCollectionId:276:4062`, mode `Fixed`):

| Token | Before | After |
|---|---|---|
| `card-pad-x`, `card-pad-y` | 48 | **32** |
| `card-gap` | 32 | **24** (the test's own pairing with 32; 32 between items was as big as the padding) |
| `card-radius` | 4 | 4 |
| `card-text-gap`, `card-button-pad-x/-y` | 12, 32 / 12 | unchanged, still bound to nothing outside the lab |

**What was rebound** (padding, gap and all four corners → Card tokens; was Scale `pad-x/-y`, `gap`, and Surface `surface-radius` or Scale `radius`; three cards had a raw radius 6):

| Node | Padding before → after | Size before → after |
|---|---|---|
| `360 · Default` `268:452` | 16 → 32 | 360 × 284 → 360 × 316 |
| `400 · Default` `251:1730` | 32 / 24 → 32 | 400 × 320 (same) |
| `600 · Default` `251:1290` | 32 → 32 | 600 × 237 (same) |
| `1000 · Default` `251:972` | 48 → 32 | 1000 × 252 → 1000 × 220 |
| `1600 · Default` `251:544` | 64 → 32 | 1600 × 280 → 1600 × 216 |
| `1920 · Default` `252:797` | 68 → 32 | 1920 × 292 → 1920 × 220 |
| `2600 · Default` `263:1357` | 80 → 32 | 2600 × 316 → 2600 × 220 |
| `3440 · Default` `264:1170` | 128 → 32 | 3440 × 420 → 3440 × 228 |
| Content cards: 1000 `260:1184`, `282:52`, `282:70`; 1600 `252:778`, `286:115`, `286:133`; 600 `264:897`, `287:48`; 400 `265:543` | 48 / 64 / 32 / 32·24 → 32 | e.g. `1600 · Content` 1600 × 958 → 1600 × 814 |
| `Card` `16:364` (Elements) | 48 → 32 | 660 × 312 → 660 × 280 |

The children already filled their parent, so nothing needed a sizing fix. Every instance follows its master. Page-level spacing (Root, `section-pad` on the previews and the `X · 2/3/4` folders) still uses Scale.

**Lint:** `card-pad-x/-y` were added to `PAD_TOKENS` in [lint.js](../lint.js) (and to the pad-token row in [lint.md](../lint.md)). Lint does not check gap or radius token names, so `card-gap` and `card-radius` pass as they are. Result: **0 errors, 0 warnings on all 8 size pages and on `Card` 16:364.**

**Previews in two columns** (1000, 1600, 1920, 2600, 3440). Each `.X Preview` now holds its Header (Fill) above a `Columns` row with `Column 1` and `Column 2`. Each column's width is bound to Scale `width`, so it is exactly X wide, and both gaps are bound to `gap`. The items are placed in order, each going into the shorter column, and the Default stays first. Before the change, a copy of each preview was put in that page's hidden Archive as `<name> · before 2 columns (2026-11-17)`: 1000 `294:80`, 1600 `295:152`, 1920 `295:406`, 2600 `295:582`, 3440 `295:751`. Each Root's fixed width was then chosen by script as the most compact one between square and 2:1.

| Page | Preview before → after | Root before → after |
|---|---|---|
| 1000 Default | 1098 × 1938 → 2130 × 1163 | 3162 × 2947 → **4194 × 2172 (1.9 : 1)** |
| 1600 LG | 1728 × 2870 → 3370 × 1651 | 5008 × 4306 → **5264 × 3351 (1.6 : 1)** |
| 1920 Desktop | 2064 × 2240 → 4030 × 1285 | 8244 × 6380 → **7693 × 6307 (1.2 : 1)**: the Build demo and your `image 1` set the height |
| 2600 XL | 2840 × 2281 → 5490 × 1397 | 5728 × 3827 → **5728 × 2943 (1.9 : 1)** |
| 3440 Mega | 3952 × 2684 → 7458 × 1744 | 7968 × 4820 → **7968 × 3880 (2.05 : 1)** |

"Before" here means after the rebind, which had already made every page shorter. The 360, 400 and 600 Roots kept their widths (1510 × 1124, 2130 × 1300, 3154 × 1994).

**Rule 18 check** (a shot of each Root): no cropped heads, nothing outside Root, edges line up. **Still off:** the 360, 400 and 600 previews (a 3-column `Masonry` from before) leave an empty area beside their first Default. The Index's instances of `.1000 Preview` and `.400 Preview` now show the two-column `.1000 Preview`, so that one is about twice as wide. **To undo:** rebind the 18 nodes to Scale `pad-x/-y`/`gap` and Surface `surface-radius`, and swap each preview back to its archived copy.

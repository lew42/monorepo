# A smaller size system: 4 pages, 4 modes (proposal, 2026-11-17)

Your words: [owner-words-2026-11-17-sizes.md](./owner-words-2026-11-17-sizes.md). It builds on the [size ladder](./size-ladder.md) and the fixed card padding from the [card tokens test](./research/card-tokens-test.md). **See it:** page [Lab · Tiers](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=332-2) in Lew42 v2 (after `Archive ↓`). Nothing outside that page has changed.

## Conclusion

- **4 size pages instead of 8:** 512 Small, 1056 Default, 1600 Desktop and 3232 Mega.
- **4 Scale modes instead of 8:** Small, Default, Desktop and Mega.
- **Bigger sizes are made of smaller ones, exactly.** 1056 = 240 + 32 + 784. 1600 = 3 × 512 + 2 × 32. 3232 = 2 × 1600 + 32.
- **The Index drops from 8 previews to 4.**
- **Small replaces Mobile as the single-column size.** Small spacing at about 500 wide is what you asked for: the Mobile mode crunches the side margin to 16, which looks cramped in a desktop composition.

## 1. The size pages

The number in a size's name is the width of its card or content. A page's screen adds a margin around it.

| Page | Content | Screen | Built from |
|---|---|---|---|
| **512 Small** | 512 | 576 (margin 32) | one column; holds the 240 and 376 widths too |
| **1056 Default** | 1056 | about 1152 | 512 + 32 + 512 · 240 + 32 + 784 (rail + main) · 376 + 32 + 648 (your "300 + 700") |
| **1600 Desktop** | 1600 | 1920 (margin 160) | 3 × 512 + 2 × 32 · 2 × 784 + 32 · 512 + 32 + 1056 |
| **3232 Mega** | 3232 | 3440 (margin 104) | 2 × 1600 + 32 · 3 × 1056 + 2 × 32 |

- **Every size is a whole number of columns:** a column of 104 plus a gutter of 32, so width = 136 × N − 32.
- **Widths without a page:** 240 (a rail), 376 (a narrow column or a phone) and 784 (half of 1600). You use them inside a page; they get no mode and no page of their own.
- **The condition that makes the sums exact:** the gap between cards is a fixed 32 in every mode, the same way card padding is a fixed 32 now. Today `gap` goes from 12 to 64 depending on the mode, so the sums never come out exact.

## 2. The Scale modes, and what each one changes

Card padding (32), radius (4) and the gap between cards (32) are the same in all four modes. A mode changes only these:

| Mode | `width` | `section-pad` | Button padding | `text-gap` | Replaces |
|---|---|---|---|---|---|
| Small | 512 | 32 | 18 × 10 | 6 | 360 XS, 400 Mobile, 600 SM |
| Default | 1056 | 48 | 24 × 12 (32 today, more than Desktop's) | 12 | 1000 Default |
| Desktop | 1600 | 72 | 24 × 16 | 12 | 1600 LG, 1920 Desktop |
| Mega | 3232 | 128 (256 today) | 36 × 20 | 16 | 2600 XL, 3440 Mega |

- **`width` becomes the content width,** not the screen width. `squeeze` and `card-min` can go: `width` does their job.
- **On the Lab page, `Tiers · Small vs Mobile` shows the difference you described.** Three screens hold the same Default with Text and the same Default with a Stat:
  - Small in a 576 screen: margin 32, card 512, text 448.
  - Today's Mobile at 400: margin 16, card 368, text 304.
  - Mobile in a 576 screen: margin 16, card 544.
  The Stat masters differ too: the 600 masters set bigger numbers than the 400 ones.
- **Alternative: keep a fifth mode, `Phone`, with a 16 margin.** It would win if you design real 390 app screens. Here, a phone frame is a 376 card in a 408 screen, so the margin comes from the frame's width and needs no mode.

## 3. What happens to today's pages

Old pages are archived, never deleted (rules 14 and 29). Each one moves after `Archive ↓` with a `.` prefix. Instances of its masters keep working wherever they are used.

| Today | Goes to |
|---|---|
| 360 XS, 400 Mobile, 600 SM | **512 Small**. Keep what is distinct: `400 · Stack`, the App bar, Navigation and Profile. |
| 1000 Default | **1056 Default** (renamed and rebound) |
| 1600 LG, 1920 Desktop | **1600 Desktop**, drawn in a 1920 screen |
| 2600 XL, 3440 Mega | **3232 Mega**, drawn in a 3440 screen |

## 4. The Index after the change

`Index · Sizes` holds 4 previews instead of 8: three 1920-wide sheets (Small, Default and Desktop) and one 3440 (Mega, at half size). A 1920 sheet holds three Small columns or a Default plus a Small, so the small sizes need no row of their own. Defaults, Layouts and Content keep their groups. `Index · Defaults` still holds 4, now 512, 1056, 1600 and 3232.

## 5. Names: exact widths

**Pick: name every size by its exact width** (`512 · Default`, `1056 · 2 · Sidebar`), because the sums are then readable straight off the names. You said a label that doesn't match its width is confusing ("we don't want to call it 390 when it's really 500").

- **Alternative: keep the round labels** (500, 1000, 1600). That is friendlier, but "1000 = 240 + 784" doesn't add up on screen.
- **The old name goes into each master's description,** so a search for "1000" still finds it.

## 6. A size is a starting point

- **A Default works above and below its size.** Its Content Fills, so a 1056 · Default stretched to 1200 or squeezed to 900 still reads fine.
- **Padding makes the inner piece narrower than its name.** A 1056 · Default holds 992 of Content (1056 − 2 × 32), and a 512 card holds 448.
- **Name a Content master for the card it sits in, not its own width.** `1056 · Content` is 992 wide.
- **On the Lab page this is the last line of `Tiers · Proposal`.** It belongs on the AI page and in the glossary once the proposal is adopted.

## 7. Migration, and its cost

About **25 `use_figma` calls**: one Sonnet builder for about a day, plus a reviewer. It is piloted one page at a time, building the new version beside the old one (rule 14).

1. **Tokens (2 calls):**
   - Rename `600 SM` to `Small` and set `width` to 512; rename `1000 Default` to `Default` and set `width` to 1056.
   - Set `gap` to 32 in every mode and Mega's `section-pad` to 128.
   - Rename the other four modes `.old · …`. Deleting a mode would move every frame set to it.
2. **Pilot on 512 Small (4 calls):** build the page from the 600 SM masters, add the 240 and 376 widths, carry over `400 · Stack`, lint, 1:1 shots, then a review.
3. **1056 Default (3 calls),** then **1600 Desktop (4 calls)** and **3232 Mega (3 calls)**. Merge the two old pages into each, then archive the old pages.
4. **The Index (3 calls):** 4 previews, 4 Defaults, then refit Root.
5. **Lint, docs and the AI page (about 6 calls):**
   - Lint: allow the fixed `gap`; add a sum check (a row's children plus its gutters equal the row).
   - Docs: rules 5, 7, 17, 19 and 20, structure v5 and the glossary.

**What breaks:**
- Every name with a width in it changes, but renaming a master doesn't unlink its instances.
- The gap between cards stops growing at big widths: at Mega it is 32, not 64.
- Frames set to a removed mode stop changing with the mode. That is mostly the archived `Res.*` sets and specimens.

## The Lab page

`Lab · Tiers` `332:2`, Root `332:3` (Root v2: no fill, padding 0, gap `gap`, wrap, Scale 1920 Desktop; 5160 × 3996, 1.3 : 1). It holds four tinted groups:

| Group | Node | Shows |
|---|---|---|
| `Tiers · Proposal` | `332:4` | this page in 7 bullets, the mode table included |
| `Tiers · Sizes` | `332:7` | the 7 ladder widths at real size, as Default instances stacked (240 → 3232) |
| `Tiers · Compose` | `332:60` | six rows at real width with a 32 gutter: 240 + 784 and 376 + 648 = 1056; 3 × 512, 2 × 784 and 512 + 1056 = 1600; 2 × 1600 = 3232 |
| `Tiers · Small vs Mobile` | `332:146` | the three screens described in section 2 |

- **How it was built:** only instances of the `400`, `600`, `1000`, `1600` and `3440 · Default` masters, with their Content swapped to `· Text` and `· Stat`. Overrides are text, plus widths in layout rows. Nothing permanent was built.
- **Lint:** 0 errors, 1 warning. `Row · 3232` sits in 1000 Default mode on purpose: that is the only mode whose `gap` is 32 today.
- **Rule 18:** I checked 1:1 shots of Small vs Mobile, two Compose rows and two size bars, plus the whole Root. Nothing is cut off, nothing sits outside Root, and the edges line up.
- **Known gap:** the Proposal group leaves empty space below it. Root has no wrapper groups, so it can't stack under another group.

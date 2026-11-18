# A smaller size system: 4 pages, 4 modes, columns instead of wrap (proposal, 2026-11-17)

Your words: [owner-words-2026-11-17-sizes.md](./owner-words-2026-11-17-sizes.md) (both sections). It builds on the [size ladder](./size-ladder.md) and the fixed card padding from the [card tokens test](./research/card-tokens-test.md). **See it:** page [Lab · Size system](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=332-2) in Lew42 v2 (after `Archive ↓`). Nothing outside that page has changed.

## Conclusion

- **4 size pages instead of 8:** 512 Small, 1056 Default, 1600 Desktop and 3232 Mega.
- **4 Scale modes instead of 8:** Small, Default, Desktop and Mega.
- **Bigger sizes are made of smaller ones, exactly.** 1056 = 240 + 32 + 784. 1600 = 3 × 512 + 2 × 32 = 4 × 376 + 3 × 32. 3232 = 2 × 1600 + 32.
- **Every Root, the Index included, becomes equal columns, 1744 wide.** Each column holds 1600 of content plus 72 of padding on each side, and they sit on a gray ground. Things in a column are stacks or rows that add up to 1600, so nothing is squeezed and there are no wrap voids (the voids in your `image 1` on 1600 LG).
- **A master lives in a specimen card:** its name as the label, a stage exactly its width, and short notes. Everywhere else you place an instance.
- **Small replaces Mobile as the single-column size.** Small spacing at about 500 wide is what you asked for: the Mobile mode crunches the side margin to 16, which looks cramped in a desktop composition.
- **No more "Tier", and no more "A clear title for this section".** Every example says what it shows.

## 1. The size pages

The number in a size's name is the width of its card or content. A page's screen adds a margin around it.

| Page | Content | Screen | Built from |
|---|---|---|---|
| **512 Small** | 512 | 576 (margin 32) | one column; holds the 240 and 376 widths too |
| **1056 Default** | 1056 | about 1152 | 512 + 32 + 512 · 240 + 32 + 784 (rail + main) · 376 + 32 + 648 (your "300 + 700") |
| **1600 Desktop** | 1600 | 1920 (margin 160) | 3 × 512 · 2 × 784 · 4 × 376 · 512 + 1056, each with 32 gutters |
| **3232 Mega** | 3232 | 3440 (margin 104) | 2 × 1600 + 32 · 3 × 1056 + 2 × 32 |

- **Every size is a whole number of columns:** a column of 104 plus a gutter of 32, so width = 136 × N − 32.
- **Widths without a page:** 240 (a rail), 376 (a narrow card) and 784 (half of 1600). You use them inside a page, with no mode and no page of their own.
- **Your 1600 · 4 cards "at about 370":** under this ladder they are 376, a real size (4 × 376 + 3 × 32 = 1600). Today they take their Scale mode from the 1600 parent. With card padding fixed at 32, that mode no longer changes the cards.
- **The condition that makes the sums exact:** the gap between cards is a fixed 32 in every mode, as card padding is now. Today `gap` goes from 12 to 64 depending on the mode, so the sums never come out exact.

## 2. The Scale modes, and what each changes

Card padding (32), radius (4) and the gap between cards (32) are the same in all four modes. A mode changes only these:

| Mode | `width` | `section-pad` | Button padding | `text-gap` | Replaces |
|---|---|---|---|---|---|
| Small | 512 | 32 | 18 × 10 | 6 | 360 XS, 400 Mobile, 600 SM |
| Default | 1056 | 48 | 24 × 12 (32 today, more than Desktop's) | 12 | 1000 Default |
| Desktop | 1600 | 72 | 24 × 16 | 12 | 1600 LG, 1920 Desktop |
| Mega | 3232 | 128 (256 today) | 36 × 20 | 16 | 2600 XL, 3440 Mega |

- **`width` becomes the content width,** not the screen width. `squeeze` and `card-min` can go, because `width` does their job.
- **On the lab page, `Small vs Mobile` shows the difference you described:**
  - Small in a 576 screen: margin 32, card 512, text 448.
  - Today's Mobile at 400: margin 16, card 368, text 304.
  - Mobile in a 576 screen: margin 16, card 544.
- **Alternative: keep a fifth mode, `Phone`, with a 16 margin.** It wins if you design real 390 app screens. Here, a phone frame is a 376 card in a 408 screen, so the margin comes from the frame and needs no mode.

## 3. Root layout: equal columns, not wrap

Today a Root wraps groups of random widths and heights, so rows leave voids: `image 1` on 1600 LG; the Index at 7594 × 8438.

**Proposal:**
- **Root:** fill `tint` (the gray between the columns), padding and gap `section-pad`, horizontal, no wrap, Scale Desktop.
- **Columns, all the same width, 1744:** fill Scheme `fill` in Light gray, padding `section-pad`, so 1600 of content inside. The gap between the groups in a column is `section-pad`.
- **The tallest column hugs; the others fill.** So all columns end level and the gray reads as clean gutters.
- **Inside a column:** groups are plain stacks (a title, a note, then the thing), with no fill and no padding (rule 2). Small things go side by side in a row that adds up to 1600: 3 × 512, 4 × 376, 512 + 1056.
- **Width per page:**
  - 1744 on every page.
  - On 3232 Mega, the column is 3488 (3232 + 2 × 128, Mega's own section-pad).
  - The Index adds one 3488 column for Mega and keeps everything else in 1744 columns.
  - **Alternative: 1920 columns.** That is the candidate you named, but 1920 leaves 176 that no size fills, and the padding would have to be 160, which isn't a token.

**The lab page uses this shape:**
- Column 1: Proposal and Sizes.
- Column 2: Compose.
- Column 3: Small vs Mobile, the specimen and the Index example.
- The page is 5520 × 3158 (1.8 : 1).

## 4. The specimen card

**The master lives inside a specimen card:**
- A label that is exactly the component's name.
- One line of facts (width, what it is built from).
- A stage exactly the master's width, marked with a 1 px `master`-purple outline.
- Two or three lines of notes: when to use it, what to override, what it swaps with.

**Everywhere else you place an instance with no docs around it:** previews, the Index, other pages. Select one and use Go to main component, and Figma jumps to its specimen.

- **In the lab:** `Specimen · .Lab · 1056 · 2 · Sidebar` (`337:165`) holds the lab-only master `337:170` (240 · Default + 784 · Default, gutter 32, with a description). The `Index` group holds its instance `337:185`.
- **This replaces the purple master folders and the canvas notes of rule 21.** One specimen per master; a size page is a column stack of specimens.
- **This is the "Specimen + Notes" idea from [layout-library.md](./layout-library.md),** now with the master inside it.

## 5. The Index after the change

**Shape:**
- The Index uses the same Root: three 1744 columns plus one 3488 Mega column.
- There are 4 previews instead of 8, one per size page, each at its real width.
- The reason for what goes where is the column it sits in:

| Column | Holds | Why there |
|---|---|---|
| Small | the `.512 Preview`, then `512 · Default` and its Content, three across (3 × 512 = 1600) | everything single-column |
| Default | the `.1056 Preview`, then the 1056 layouts, each with a 512 beside it (1056 + 32 + 512 = 1600) | everything at 1056 |
| Desktop | the `.1600 Preview`, then the 1600 layouts (2 × 784, 3 × 512, 4 × 376) | everything at 1600 |
| Mega (3488) | the `.3232 Preview` and the 2 × 1600 layout | the one place wider than 1600 |

- **Previews show one size at its real width.** Today `.1000 Preview` is two 1000 columns, about 2000 wide, so it never looks like 1000. A preview becomes one column of its own size; a long preview is just a taller stack.
- **Labels instead of filler.** Every example's title says what it shows ("Sidebar 240 + main 784", "Two columns, 1/3 + 2/3"), and every placeholder body says what to notice. The Content masters keep `Kicker`, `Title` and `Body` as layer names, so swaps still carry text.
- **Fewer photos.** One seagull per preview at most. Most examples need no photo.

## 6. What happens to today's pages

Old pages are archived, never deleted (rules 14 and 29). Each moves after `Archive ↓` with a `.` prefix. Instances of its masters keep working.

| Today | Goes to |
|---|---|
| 360 XS, 400 Mobile, 600 SM | **512 Small**. Keep what is distinct: `400 · Stack`, the App bar, Navigation and Profile. |
| 1000 Default | **1056 Default** (renamed and rebound) |
| 1600 LG, 1920 Desktop | **1600 Desktop**, drawn in a 1920 screen |
| 2600 XL, 3440 Mega | **3232 Mega**, drawn in a 3440 screen |

## 7. Names: exact widths

**Pick: name every size by its exact width** (`512 · Default`, `1056 · 2 · Sidebar`), so the sums are readable straight off the names. You said a label that doesn't match its width is confusing ("we don't want to call it 390 when it's really 500").

- **No "Tier" anywhere.** A page is `512 Small`, a group is `1056 · 2`, and the Preview header says "Everything at 1056".
- **Alternative: round labels** (500, 1000, 1600). They are friendlier, but "1000 = 240 + 784" doesn't add up on screen.
- **The old name goes into each master's description,** so a search for "1000" still finds it.

## 8. A size is a starting point

- **A Default works above and below its size,** because its Content Fills.
- **Padding makes the inner piece narrower than its name.** A 1056 · Default holds 992 of Content (1056 − 2 × 32); a 512 card holds 448 of text.
- **Name a Content master for the card it sits in, not its own width.** `1056 · Content` is 992 wide.
- **This goes on the AI page and in the glossary once adopted.**

## 9. Migration, and its cost

About **35 `use_figma` calls**: one Sonnet builder for one to two days, plus a reviewer. It is piloted one page at a time, building the new version beside the old one (rule 14).

1. **Tokens (2 calls):**
   - Rename `600 SM` to `Small` with `width` 512, and `1000 Default` to `Default` with `width` 1056.
   - Set `gap` to 32 in every mode and Mega's `section-pad` to 128.
   - Rename the other four modes `.old · …`. Deleting a mode would move every frame set to it.
2. **Pilot on 512 Small (6 calls):**
   - Build the column Root, put one specimen per master, and add the 240 and 376 widths.
   - Carry over `400 · Stack`, and replace the filler titles with labels.
   - Lint, 1:1 shots, review.
3. **1056 Default (5 calls),** then **1600 Desktop (6 calls)** and **3232 Mega (4 calls):** merge the two old pages into each, then archive them.
4. **The Index (5 calls):** the column Root, 4 previews at real width, instances only.
5. **Lint, docs and the AI page (about 7 calls):**
   - Lint: allow the fixed `gap`; add a sum check (a row's children plus its gutters equal the row); add a column check (Root children are equal-width columns).
   - Docs: rules 5, 7, 12, 17, 19, 20 and 21, structure v5 and the glossary.

**What breaks:**
- Every name with a width in it changes, but renaming a master doesn't unlink its instances.
- The gap between cards stops growing at big widths: at Mega it is 32, not 64.
- Frames set to a removed mode stop changing with the mode. That is mostly the archived `Res.*` sets and specimens.

**Found while building:** the `1600 · Default` master (`251:544`) sets no Scheme mode, while the others set White. Inside a Light gray column it turns light gray. On the lab page this is fixed on the instances; the master itself should get Scheme White.

## The lab page

`Lab · Size system` `332:2`, Root `332:3`.

| Column | Node | Holds |
|---|---|---|
| 1 · Sizes | `337:136` | `Proposal` `332:4` (this page in 7 bullets, with the mode table); `Sizes` `332:7` (the 7 ladder widths at real size; Mega at half size) |
| 2 · Compose | `337:137` | `Compose` `332:60`: rail 240 + main 784 and sidebar 376 + main 648 = 1056; 3 × 512, 2 × 784, 4 × 376 and 512 + 1056 = 1600; 2 × 1600 = 3232 at half size |
| 3 · Spacing, specimen, Index | `337:138` | `Small vs Mobile` `332:146`; `Specimen` with its master; `Index` with an instance |

- **How it was built:** only instances of the `400`, `600`, `1000`, `1600` and `3440 · Default` masters. The one exception is the lab-only master `.Lab · 1056 · 2 · Sidebar`, which the specimen needs.
- **Lint:** 0 errors. One warning, on purpose: the Mega bar is drawn at half size, so it is 1600 wide in the Mega mode. The compose rows use 1000 Default mode, because it is the only mode whose `gap` is 32 today.
- **Rule 18:** I checked 1:1 shots of Small vs Mobile, three Compose rows, two size bars and the specimen, plus the whole Root. Nothing is cut off and nothing sits outside Root.
- **Known gaps:**
  - The half-size Mega row is a plain frame placed by hand: scaling an auto-layout row unbinds its gap.
  - Column 2 ends about 600 short of column 1. Its light ground still fills to the bottom.

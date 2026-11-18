# A smaller size system: 4 pages, 4 modes, columns instead of wrap (proposal, 2026-11-17)

Your words: [owner-words-2026-11-17-sizes.md](./owner-words-2026-11-17-sizes.md) (both sections). It builds on the [size ladder](./size-ladder.md) and the fixed card padding from the [card tokens test](./research/card-tokens-test.md). **See it:** page [Lab · Size system](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=332-2) in Lew42 v2 (after `Archive ↓`). Nothing outside that page has changed.

## The plan now (2026-11-17 ~23:00; replaces every number below it)

The owner rejected the new ladder ("Why do we have a 1056 default? It used to be 1000. Why are you changing numbers on me?"). Sections 1–9 below keep the old proposal as history; where they disagree with this box, this box wins.

- **The owner's numbers, always.** The three core sizes are **500 SM, 1000 Default and 1920 Desktop** (~23:20; Small was renamed from 600 to 500, the one token change). 1600, 2600 and 3440 are parked: pages and modes untouched. The 512 / 1056 / 1600 / 3232 ladder is dropped. Never invent a new number or name: ask voice-app first.
- **A size is a range.** SM ≈ 320–700 (around 500), Default ≈ 700–1300 (around 1000), Desktop ≈ 1300–2400 (around 1920), Mega ≈ 2400 and up (around 3440). A size's pieces should work anywhere in its range, so widths add up only roughly, and that is fine ("roughly the same ballpark").
- **The Scale collection is as it was before tonight,** except mode `600 SM` → `500 SM` with width 500: all eight modes, the same values ([Scale restored to before](#scale-restored-to-before-2026-11-17-2300)). Padding, radius and gap scale with the mode.
- **Which token does which job:** `pad-x/-y` for a Default and panels, `section-pad-x/-y` for sections and page-level groups, `gap` for wrappers, `text-gap` inside a Content, `button-pad-x/-y` for buttons, plus `radius`, `measure` and `width`. `squeeze` and `card-min` are kept and marked "unused" in their descriptions.
- **Modes cascade. Unset means inherit. Set means locked for everything inside. Reset on a wrapper.** Masters set no Scale mode, so a Default dropped into a section takes that section's size. A specimen's stage sets its size's mode, so the master shows at its own size. To make children differ from their parent, set the mode once on the Wrapper around them (or on the selected children), never per master.
- **Pages:** 360, 400 and 600 became one `500 SM` page; `1000 Default` and `1920 Desktop` were rebuilt; the 1600 / 2600 / 3440 merges are paused. The old pages move after `Archive ↓` with a `.` prefix; nothing is deleted.
- **A size page's Root** is equal-width columns, used as a masonry, holding in order: `<size> · Preview`, `Defaults`, `Wrappers`, `Content`, then `App` if the page has app pieces. A master stands on a stage inside its group; everywhere else it is an instance. Masters are named `<Group>/<Name>` (`Defaults/500 · Default`).
- **A preview shows what the size can do with smaller pieces** (rows, inline columns, sections), each labelled with what it shows: no duplicates, no near-identical neighbours, at most one photo.
- **The Index is the approved layouts** (~23:20): everything else is built from it. Three equal groups, 500 · Small | 1000 · Default | 1920 · Desktop, each its own masonry (4, 2 and 1 columns). 500 shows the basics; 1000 and 1920 reuse and vary them, never repeat them. Each size shows a card layout and a section layout. The 4-step **Swap demo** sits at the top of 500: `Defaults/500 · Default` → its Content swapped to `Content/500 · Content · Stat` → the Default swapped to `Wrappers/500 · 2 · Equal` → column 1 swapped to `Defaults/400 · Default`.

## Conclusion (old proposal; see the box above)

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

## Progress (migration, 2026-11-17, mastermind-size-system)

### Token values before step 1 (to reverse it)

`Lew42 v2 · Scale` (`VariableCollectionId:2:2`), read just before the change. Mode ids never change; only names and values do.

| Variable | 1000 Default `2:0` | 360 XS `2:5` | 400 Mobile `2:1` | 600 SM `2:3` | 1600 LG `2:4` | 1920 Desktop `58:0` | 2600 XL `2:6` | 3440 Mega `2:2` |
|---|---|---|---|---|---|---|---|---|
| pad-x, pad-y | 32 | 32 | 32 | 32 | 32 | 32 | 32 | 32 |
| gap | 32 | 12 | 24 | 22 | 40 | 44 | 48 | 64 |
| radius | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| squeeze | 1600 | 1600 | 1600 | 1600 | 1600 | 1600 | 1800 | 2400 |
| section-pad-x | 48 | 16 | 16 | 32 | 64 | 72 | 120 | 256 |
| section-pad-y | 48 | 16 | 32 | 32 | 64 | 72 | 120 | 256 |
| button-pad-x | 32 | 12 | 14 | 18 | 24 | 24 | 28 | 36 |
| button-pad-y | 12 | 6 | 8 | 10 | 14 | 16 | 16 | 20 |
| text-gap | 12 | 4 | 6 | 6 | 10 | 12 | 12 | 16 |
| card-min | 320 | 280 | 280 | 280 | 400 | 432 | 500 | 600 |
| width | 1000 | 360 | 400 | 600 | 1600 | 1920 | 2600 | 3440 |
| measure | 720 | 720 | 720 | 720 | 720 | 720 | 720 | 720 |

**Decision:** the four kept modes are renamed and re-valued (`600 SM` → `Small`, `1000 Default` → `Default`, `1920 Desktop` → `Desktop`, `3440 Mega` → `Mega`); the other four are renamed `.old · <name>` and keep their old values, so frames still set to them (the archived pages) look as before. `gap` is 32 in the four kept modes only. `squeeze` and `card-min` stay for now (nothing new binds them). Alternative: also set `gap` 32 in the `.old` modes, as the plan says; it would shift the archived pages for no gain.

### Masters are named `<Group>/<Name>` (voice-app, ~22:20)

One slash level, so the swap menu shows folders: `Defaults/`, `Wrappers/`, `Content/`, `App/`. The group word is the title of the group the specimen sits in on the canvas, the same words on every size page. A rename keeps every instance. The 512 Small page has a "Swap menu check" note at the top for the owner to confirm the folders show.

### Scale restored to before (2026-11-17 ~23:00)

Every mode name and value in `Lew42 v2 · Scale` is back to what it was before tonight, checked by script cell by cell: 13 variables × 8 modes = 104 cells, 0 differences. Names: `1000 Default`, `360 XS`, `400 Mobile`, `600 SM`, `1600 LG`, `1920 Desktop`, `2600 XL`, `3440 Mega`. Values: the table above, except `pad-x`, `pad-y` and `radius`, which are the per-mode values from [card-tokens-test.md](./research/card-tokens-test.md) "before" (pad 48, 16, 24/32, 32, 64, 68, 80, 128; radius 4, 3, 4, 4, 6, 8, 8, 6). The table above shows 32 and 4 because tonight's earlier fixed card padding was already in place when it was read. Also undone: Mega `section-pad` back to 256, Default `button-pad-x` back to 32. The only token edits left are two descriptions: `squeeze` and `card-min` say "Unused (2026-11-17): kept, not deleted."

### Small becomes 500 SM (the owner, ~23:20: "Let's rename small to 500")

The owner's three core sizes are now **500 SM, 1000 Default and 1920 Desktop**; only the Index and those three pages are worked on. 1600, 2600 and 3440 are left as they are (pages and modes untouched), and so are the 360 XS and 400 Mobile modes. The one token change: Scale mode `2:3` is renamed `600 SM` → `500 SM` and its `width` goes 600 → 500. Every other value in that mode stays. Before the change (to reverse it):

| `2:3` | name | width | pad-x / pad-y | gap | radius | section-pad-x / -y | button-pad-x / -y | text-gap | card-min | squeeze | measure |
|---|---|---|---|---|---|---|---|---|---|---|---|
| before | 600 SM | 600 | 32 / 32 | 22 | 4 | 32 / 32 | 18 / 10 | 6 | 280 | 1600 | 720 |
| after | 500 SM | 500 | same | same | same | same | same | same | same | same | same |

### Sections, one max width, one Root setup (the owner, ~23:40)

- **New collection `Lew42 v2 · Constants`** (`VariableCollectionId:372:2`, one mode `Value`): one variable, `max-width` = 1600 (`VariableID:372:3`, scope Width/Height). It did not exist before; nothing else moved, and `measure` stays in Scale. It is bound (Figma allows it) to the `maxWidth` of the Wrapper inside `Sections/1920 · Section`.
- **Section presets:** `Sections/500 · Section` (`373:86`), `Sections/1000 · Section` (`373:187`), `Sections/1920 · Section` (`374:61`). Each: fixed at its width on its stage (Fill in use), padding `section-pad-x/-y`, radius 0, no shadow, sets no Scale mode. 500 and 1000 are White and hold their size's Content. 1920 is Light gray and holds a centred Wrapper capped at 1600 with (a) `Defaults/1600 · Default` and (b) `Content/1600 · Content`; 1920 has no Content of its own.
- **1600 LG:** only its Default and Content masters were renamed (`Defaults/1600 · Default`, `Content/1600 · …` ×10); the page and the reference image were not touched.
- **Root setup on the three core pages, as on the Index:** Root `tint`, columns are bare wrappers (no fill, no padding), and each titled group carries the gray panel (Scheme fill) and `section-pad`. Every group's title equals its frame name; masters sit in groups; columns are equal. Order: Preview, Sections, Defaults, Wrappers, Content, App. 1920 Desktop went to two equal columns (4344 × 2624).
- **Index:** a Section preset in each group, a padding-zeroed Section and cards inside a dark Section at 1000, a dark Section at 500, and at 1920 a section capped at 1600 above a flush white band (the old 3-band stack moved to `Archive · Pages`). The groups end at 92 / 90 / 100 % of the tallest. The "blank" photo in Text + Media is a render-scale artifact: the image fill is there (scale mode FILL).

### Page, and Sections that hold columns (the owner, 2026-11-18 ~00:20)

The owner accepts two words, **Page** and **Section** ([owner-words-2026-11-17-naming.md](./owner-words-2026-11-17-naming.md), "Text (~00:20)"); Wrapper and Default are not renamed yet. On each core page, beside the `Sections/<w> · Section` preset:

| Master | 500 SM | 1000 Default | 1920 Desktop |
|---|---|---|---|
| `Sections/<w> · Section · 2 Columns` (padded, horizontal, `gap`, two Content set to Fill) | `379:89` | `380:96` | `381:68` |
| `Sections/<w> · Section · 3 Columns` | (none at 500) | `380:103` | `381:75` |
| `Sections/<w> · Section · Flush` (no padding; holds that size's Default with radius 0, no shadow) | `379:96` | `380:113` | `381:85` |
| `Pages/<w> · Page` (zero padding, zero gap: a Section, a columns Section in Scheme Dark, a Flush Section) | `379:102` | `380:119` | `381:91` |

Each Sections group carries the note "Radius needs room: full bleed means zero radius. No rounded card touches an edge or another border." A new `Pages` group holds the Page. On 1920 the column Sections use `Content/1600 · Content · Text` and are not capped at 1600 (the plain Section is the capped one); its Page opens with that capped Section in Scheme Dark. Lint 0 on all three pages; roots 6664 × 4160, 5328 × 4397, 4344 × 4227.

### Pages

| Step | Page | Node | What was done | Lint | Shots |
|---|---|---|---|---|---|
| 1 | Tokens | `VariableCollectionId:2:2` | Changed to 4 modes (Small 512, Default 1056, Desktop 1600, Mega 3232), then **fully restored** (above). | — | — |
| 2c | **500 SM** (~23:20, the owner's rename) | page `345:2`, Root `345:3` (6664 × 3009) | Page and mode renamed 500 SM. `Defaults/500 · Default` (500), `Wrappers/500 · 2 · Equal` (500), `Content/500 · …` ×5 (436 = 500 − 2 × 32), `App/500 · …` ×3 (500), `.500 Preview` (564); the Stack is back to `Wrappers/400 · Stack` (400, three 400 Defaults); `Defaults/360` and `/400` kept. Content stages are white padded surfaces (a Default around the Content). | 0 errors, 0 warnings | Root shot checked; reviewer pass (valid: Stack held 500s, 400 title wrapped; both fixed). |
| 3 | **1000 Default** | new page `358:2`, Root `358:85` (5328 × 2874); old page archived as `.1000 Default (archived …)` | 4 equal 1242 columns: Preview · Defaults + Wrappers · Content · Content in columns. 13 masters moved and renamed: `Defaults/1000 · Default`; `Wrappers/1000 · 2 · Equal` (two 500 Defaults) and `Wrappers/1000 · 2 · Sidebar` (a 250 sidebar, Fill height, beside a Fill main ≈ 718); `Content/1000 · Content` + Text, Text + Button, Stat, Hero, Text + Media, 2 · Equal, 2 · 1/3 + 2/3, 2 · 2/3 + 1/3, 3 · Equal (all 904, set to Fixed: they were Fill and collapsed on a hugging stage). Preview: hero, flush dark section, two 500s, two columns in one Default, text beside a photo, sidebar + main. | 0 errors | Root shot checked; reviewer pass (sidebar called short: it is 250 and Fill, as the shot shows; preview labels and the mirror 2/3 + 1/3 left as is). |
| 4 | **1920 Desktop** (only what the Index needs) | new page `367:10325`, Root `367:10326` (2208 × 3484); old page archived as `.1920 Desktop (archived …)`, its `.1920 · Preview`, Build demo and reference image still there | One 2064 column: `Defaults/1920 · Default`; `Wrappers/1920 · 2 · Equal` (two 1000s, the 960 \| 960 halves), `· 2 · Sidebar` (400 + 1600 Default), `· 3 · Equal` (three 500s), `· 4 · Equal` (four 400s). Their own Scale modes cleared (inheritance). No preview yet (the Index replaces previews for now). | 0 errors | shot checked |
| 5 | **Index** | new page `368:2`, Root `368:40` (7116 × 2798); old Index archived as `.Index (archived 2026-11-17, now Index)` | Three equal 2276 groups: **500 · Small** (swap demo: 4 steps and the owner's 3-line test note; then a 4-column masonry: a Default holding text, card layout (a 400 on a 500 ground), section layout (two flush 500s), the four hug/fill combos, Text + Media, buttons, app bar, navigation, Stack), **1000 · Default** (2 columns: sidebar 250 + 750, two Content columns in one Default, card layout with one Default set to Scheme Dark, three columns in one Default, dashboard tiles, section layout (hero + section, flush), text and one Button), **1920 · Desktop** (split 960 \| 960, sidebar + content, card layout 3-up, flush section stack (white, dark, white), four tiles). Each masonry column sets its size's mode; both dashboards set 500 SM on the wrapper (the cascade rule in action). Items are instances; labels are short headings. | 0 errors, 1 warning (the 1920 tile wrapper in 500 SM, intended) | shot checked; the 1000 group ends ~1000 shorter than 1920 (left as is) |
| 2b | **600 SM** (renamed back from 512 Small, ~23:00) | page `345:2`, Root `345:3` (6664 × 3059, 2.2 : 1) | Numbers back to the owner's: masters `Defaults/360 · Default` (360 wide), `Defaults/400 · Default` (400), `Defaults/600 · Default` (600), `Wrappers/600 · 2 · Equal` (600, two 360 Defaults set to Fill), `Wrappers/600 · Stack` (600), `Content/400 · Content` ×4 (336, their original width), `Content/600 · Content` ×5 (536, original), `App/600 · …` ×3 (600); `.600 Preview` (664). Masters set no Scale mode (pins added at ~22:50 cleared at ~22:55); each stage sets `600 SM`. Root is 4 equal 1576 columns: Preview (with the swap-menu check) · Defaults + Wrappers · Content · App. The preview shows an app bar, two text columns inside one Default, a Stat, and two rails; no photo. 71 layer names and 74 texts renumbered; sums that no longer add up were reworded. | 0 errors, 0 warnings | Root at 0.36: nothing cut off, the photos whole, nothing outside Root. |
| 2 | **512 Small** | page `345:2`, Root `345:3` (5520 × 3055, 1.8 : 1) | Three 1744 columns (Light gray, on a `tint` Root, Desktop). 17 masters moved here and renamed, each on a stage of its exact width set to Small: `Defaults/240 · Default` (was 360 · Default), `Defaults/376 · Default` (400), `Defaults/512 · Default` (600); `Wrappers/512 · 2 · Equal` (600 · 2 · Equal, now 240 + 32 + 240), `Wrappers/512 · Stack` (400 · Stack); `Content/376 · Content` ×4 (400 Content), `Content/512 · Content` ×5 (600 Content); `App/512 · App bar`, `· Navigation`, `· Profile` (the archived 360 pieces). New `.512 Preview` `346:48` (576 screen, instances only). Filler titles replaced by labels; each Default shows its own name as the title and "<width> wide · Small mode". The old 360 XS, 400 Mobile and 600 SM pages moved after `Archive ↓` with a `.` prefix. | 0 errors (4 same-on-same on the App masters fixed with Scheme White) | Root at 0.18, every column at 0.33–0.4, the preview and App row at 0.5–0.6: nothing cut off, nothing outside Root. Two photos remain, both inside the Text + Media masters themselves; the preview has none. |

### Paused (2026-11-17 ~22:40): padding scales with the mode again

*Resolved ~23:00: everything below is undone; see [Scale restored to before](#scale-restored-to-before-2026-11-17-2300).*

The owner (relayed by voice-app) wants padding that scales with the mode, not a fixed 32. Restored in `Lew42 v2 · Scale`, by mode id, from [card-tokens-test.md](./research/card-tokens-test.md) "before" and the table above:

| Mode id (name now) | pad-x / pad-y | radius | gap |
|---|---|---|---|
| `2:0` (Default, was 1000) | 48 / 48 | 4 | 32 |
| `2:5` (.old · 360 XS) | 16 / 16 | 3 | 12 |
| `2:1` (.old · 400 Mobile) | 24 / 32 | 4 | 24 |
| `2:3` (Small, was 600) | 32 / 32 | 4 | 22 |
| `2:4` (.old · 1600 LG) | 64 / 64 | 6 | 40 |
| `58:0` (Desktop, was 1920) | 68 / 68 | 8 | 44 |
| `2:6` (.old · 2600 XL) | 80 / 80 | 8 | 48 |
| `2:2` (Mega, was 3440) | 128 / 128 | 6 | 64 |

**Still changed from step 1, not reverted (waiting for the confirmed plan):** the eight mode names; `width` Default 1056 (was 1000), Small 512 (600), Desktop 1600 (1920), Mega 3232 (3440); Mega `section-pad-x/-y` 128 (256); Default `button-pad-x` 24 (32). To undo, set those back from the table at the top of this section. The 512 Small page and its 17 renamed masters stay as built; the old 360/400/600 pages stay archived. With padding back on the mode, a `240 · Default` placed in a Desktop column gets 68 padding (104 of text), so the fixed-width Defaults only read right in their own mode. No further structural changes until voice-app confirms the plan.

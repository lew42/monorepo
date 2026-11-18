# A size ladder that lines up (proposal, 2026-11-17, nothing changed in Figma)

The question ([next-2026-11-17.md](./next-2026-11-17.md), item 2; your words: [owner-words-2026-11-17-naming.md](./owner-words-2026-11-17-naming.md), "~20:30", "~20:45", "~21:20"): can the smaller sizes add up exactly to the larger ones, gaps included, so a layout's columns hold exact smaller pieces instead of "the nearest size, squeezed or stretched"?

## Conclusion

**Yes. Use one grid for every size: a column of 104 and a gutter of 32.** Every size is a whole number of columns:

> **width = N × 104 + (N − 1) × 32**, which is the same as 136 × N − 32.

- **Why it adds up:** two sizes side by side, with one gutter between them, always give the size of their columns added together. For example, 376 + 32 + 376 = 784 (3 + 3 = 6 columns). That is true for any pair, at any level of nesting.
- **The one condition:** the gutter is the same everywhere. Today `gap` changes with the mode (32 at 1000, 44 at 1920, 64 at Mega), and that alone stops the sizes from adding up. So the gutter becomes fixed, like the card padding in the [card tokens test](./research/card-tokens-test.md).
- **Desktop content is 12 columns = 1600.** That keeps your "1920 with a 1600 area" and the `squeeze` 1600.
- **Ultrawide content is 24 columns = 3232, exactly two 1600s.** It also splits exactly into 3 or 4.
- **Sizes become widths, not modes.** With card padding and the gutter fixed, a 376 card and a 1056 card need no mode of their own. So you get more sizes (any number of columns, one every 136 px) and fewer modes: **4 Scale modes, down from 8.** That answers the mode fatigue in "~20:45".

## The ladder

Core sizes (each one gets a page with its `X · Default`, `X · Content` and layouts). Every sum below has been checked.

| Size | Columns | What fits inside it, exactly | Today's size it replaces |
|---|---|---|---|
| **240 XS** | 2 | 104 + 32 + 104 | new: the ~300 rail or sidebar; 360 XS moves to 376 |
| **376 Mobile** | 3 | 240 + 32 + 104 | 400 Mobile (−6%) and 360 XS (+4%) |
| **512 SM** | 4 | 240 + 32 + 240 | 600 SM (−15%) |
| **784 Tablet** | 6 | 376 + 32 + 376 · 240 + 32 + 512 (your 300 / 700 sidebar) | new: a desktop half; today a squeezed 1000 sits there |
| **1056 Default** | 8 | 512 + 32 + 512 · 240 + 32 + 784 · 4 × 240 + 3 × 32 | 1000 Default (+6%) |
| **1600 Desktop** | 12 | 2 × 784 + 32 · 3 × 512 + 2 × 32 · 4 × 376 + 3 × 32 · 512 + 32 + 1056 | 1600 LG (exact) and the content of 1920 Desktop |
| **3232 Mega** | 24 | 2 × 1600 + 32 · 3 × 1056 + 2 × 32 · 4 × 784 + 3 × 32 | 3440 Mega's content; 2600 XL merges in here |

The sizes in between (648, 920, 1192, …) work the same way, so an odd layout still adds up. Only the seven above get masters.

**Pages are device-real; content is the ladder.** A page frame is the real screen, and its side margin is whatever is left over:

| Scale mode (4) | Screen | Margin each side | Content | Size pages that use it |
|---|---|---|---|---|
| Mobile | 390–430 phone (408 shown) | 16 | 358–398, the 376 size set to Fill | 240, 376 |
| Default | 1120 (tablet landscape, small laptop) | 32 | 1056 | 512, 784, 1056 |
| Desktop | 1920 | 160 | 1600 | 1600 |
| Mega | 3440 | 104 | 3232 | 3232 |

On a phone everything stacks, so nothing has to add up there. The 376 size shrinks to 328 on a 360 phone (−13%), so its minimum width must be 328 or less.

## What real grids do (well-known values, not looked up again today)

- **960.gs**, the classic 12-column grid: 12 × 60 + 11 × 20 = 940. That is the same formula as ours.
- **Bootstrap 5:** containers of 540, 720, 960, 1140 and 1320, with a fixed 24 gutter at every size. Its widths divide exactly because the gutter sits *inside* each column, as padding. In Figma that would break rule 2 (padding needs its own background) and add a layer to every column, so we use the outside gutter instead.
- **Tailwind:** containers equal the breakpoints (640, 768, 1024, 1280, 1536). There is no column math; you use gap utilities.
- **Material 3:** window classes are compact < 600, medium 600–839, expanded 840–1199, large 1200–1599 and extra-large ≥ 1600. Margins go 16 → 24, and wider windows get more panes, not bigger padding.
- **The 8-point grid:** 104, 32 and 136 are all multiples of 8, so every size on the ladder is too.

## What changes

- **Tokens:**
  - New one-mode collection `Lew42 v2 · Grid` holding `column` 104, `gutter` 32, and one width per core size (`w-2` 240, `w-3` 376, `w-4` 512, `w-6` 784, `w-8` 1056, `w-12` 1600, `w-24` 3232).
  - Card tokens fixed as the [card tokens test](./research/card-tokens-test.md) proposed: padding 32, gap 24 inside a card.
  - Scale keeps only `width`, `section-pad-x`, `section-pad-y` and `h1-size`, in 4 modes. That is 16 cells instead of 104.
  - `squeeze` and `card-min` go, because `w-12` and the smallest size do their job.
  - Vertical gaps (`gap-y`) may still change with the mode, because they never affect a width.
- **Names:** sizes are named by their exact width (`1056 · Default`, `784 · 2 · Equal`), so the sums are easy to see. The old name goes in the master's description. **Alternative:** keep 400, 600 and 1000 as labels. That costs nothing, but you said a label that doesn't match its width "gets a little confusing".
- **Pages:** from 8 to 7.
  - 360 XS becomes 240 XS; 400 becomes 376; 600 becomes 512; 1000 becomes 1056.
  - 784 Tablet is new.
  - 1600 LG and 1920 Desktop merge into **1600 Desktop**, drawn inside a 1920 frame.
  - 2600 XL and 3440 Mega merge into **3232 Mega**, drawn inside a 3440 frame.
  - The [nesting table in rollout.md](./naming/rollout.md#what-nests-where) gets the "What fits inside it" column above in place of the "nearest size" rule.
- **Icons and tiles (your "~20:45" question):** 1 column, 104, is the smallest piece (a tile). Icons at 64 or 32 stay in the `Icon size` tokens. They need no Scale mode.
- **Lint:** a new rule that a row's children plus its gutters must equal the row's own width, and that each child is a ladder width. `gutter` and the card tokens are added to the allowed list.

## Migration cost

About **30 `use_figma` calls**, one agent working for about a day, plus a reviewer. Following rule 14, the new version is built beside the old one, and nothing is deleted.

1. Tokens: create Grid and the card tokens. Rename the 4 unused Scale modes `.old · XS` and so on, but keep them until you approve (deleting a mode moves every frame set to it). About 3 calls.
2. Pilot on 1000 Default, which becomes 1056: rebind `1056 · Default` to `w-8`, build `· 2 · Equal` (512 + 512) and `· Sidebar` (240 + 784) beside the old ones, run lint and take a 1:1 shot. About 3 calls.
3. The other 6 pages, about 3 calls each, plus the new 784 page. About 22 calls.
4. The Index previews (about 2 calls), `lint.js`, and the docs: rules 5, 7, 19 and 20, plus the rollout table.

## What breaks

- **Every name with a width in it changes:** in the swap menus, the Index, the docs and structure v5. Instances keep working, because renaming a master doesn't unlink them.
- **The 1920 page gets 160 margins** (68–72 today), because desktop content stops at 1600, so its halves are 784, not the ~960 you pictured.
  - **Alternative ladder:** a column of 120 with a gutter of 32 gives 272, 424, 576, 880, 1184 and 1792. That makes desktop full width with a 64 margin and halves of 880.
  - The cost: Mega content (3312, 22 columns) only splits in two, not into 3 or 4, and 1600 is no longer a size. Pick it if a full-width 1920 matters more than the ultrawide.
- **The gap between cards stops growing with width.** 32 between two 1600 columns at 3440 is tighter than today's 64. Real systems keep the gutter at 24–32 too.
- **What nests where changes:**
  - 1000 · 2 held 400s; 1056 · 2 holds 512s.
  - 1920 · 2 held squeezed 1000s; it now holds 784s.
  - Everything on the size pages moves a little: 400 → 376, 600 → 512.
- **Anything bound to the removed Scale modes stops changing with the mode.** That means the `Res.*` sets and the specimens, most of them archived already.
- **Figma variables can't do arithmetic**, so a different column width means rewriting 7 numbers with a script.

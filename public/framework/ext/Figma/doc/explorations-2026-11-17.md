# Explorations: what the Index can build, and in how many steps (2026-11-17)

The [Explorations page](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=309-1664) of Lew42 v2 sits right after Index. Everything on it was built only from [Index](./index.md) items: drag an instance, then **swap**, **override** (text, radius, shadow, a Scheme mode) or **detach** (rule 25). Every one of those counts as one step. The owner's ask: [owner-words-2026-11-17-naming.md](./owner-words-2026-11-17-naming.md), "~21:20"; the plan: [next-2026-11-17.md](./next-2026-11-17.md), item 4.

**The answer in one line:** a whole 1920 landing page takes 34 steps, and two thirds of them are typing text. A variant of it takes 2 to 6 steps, except card → section, which takes 19 because the Surface mode doesn't reach the cards.

## The page

`Root` `309:1665` (Root v2: Scale 1920 Desktop, gap `gap`, wrap, no fill; 8100 × 4808, 1.68 : 1) holds two tinted groups:

| Group | Node | Holds |
|---|---|---|
| `Explorations · Landing` | `309:1666` | the 1920 landing `309:1669`, then its 400 version `309:20680` |
| `Explorations · Design tree` | `310:119` | three rows (branches A, B, C), each the first-level variant then its two leaves, each with a caption "from X: … n steps" |

The brief: a landing page for a small product ("Tidy", a weekly planner) with a hero, three features, a stat band, a two-column story and a call to action.

## Steps per design

| Design | Node | Steps | What they were |
|---|---|---|---|
| 1920 base | `309:1669` | **34** | 5 drags, 7 swaps, 22 text overrides |
| 400 version | `309:20680` | **37** | 1 duplicate, 13 swaps, 2 detaches, 4 retyped texts, 17 fixes (sizes, Hug, a stray mode) |
| A · Light and airy, cards | `310:128` | 2 | duplicate, page frame Scale → 2600 XL (wider gaps) |
| A1 · Prime bands | `310:137` | 3 | duplicate, hero and CTA Scheme Prime |
| A2 · Square corners | `310:188` | 9 | duplicate, radius 0 on each of the 8 cards |
| B · Flush sections, dark hero | `310:197` | 19 | duplicate, page gap 0, radius 0 and shadow off on each of the 8 cards, hero Scheme Dark |
| B1 · Prime hero | `310:248` | 2 | duplicate, hero Scheme Prime |
| B2 · Sidebar story | `310:299` | 2 | duplicate, story → `1920 · 2 · Sidebar` |
| C · Dense, 3 columns | `310:369` | 6 | duplicate, page Scale → 600 SM, story → `1920 · 3 · Equal`, third column swapped and written |
| C1 · Dark stats | `310:433` | 2 | duplicate, stat band Scheme Dark |
| C2 · Four features | `310:489` | 5 | duplicate, features → `1920 · 4 · Equal`, fourth feature written |

The tree is 50 steps for 9 designs, about 5.6 each. Text is the bulk of the base: 22 of 34 steps. A swap kept every text override whenever the layer names matched.

## What the Index lacked

- **`1920 · 3 · Equal`.** The three features need it. It exists as a master, but the Index shows only 2 and 4 columns at 1920, so I reached it by swapping a `1920 · Default`.
- **A button.** No Content master has one, and `Button` isn't on the Index. The call to action is text only. I left it that way rather than step outside the Index.
- **A hero.** Every title is `h2`, so the hero title is the same size as a feature title.
- **A 1600 Stat.** Only 1000, 600 and 400 have one, so the 1920 stat band holds `1000 · Content · Stat`.
- **A stacked 400 layout.** No 400 master takes columns, so going to 400 means detaching every multi-column layout.

## What broke

1. **The 1600 Contents name their text layers after their text** ("A clear title for this section"), not `Title` / `Body` like 1000, 600 and 400. A swap out of them loses the text: hero and CTA lost theirs going to 400 (0 of 2 kept). Every other swap kept 100% of its text.
2. **The Surface mode does nothing to a Default.** The Defaults bind their corners to Scale `radius` (`VariableID:2:6`), not Surface `surface-radius`, though their descriptions say "Surface radius". Setting Surface → Section on the page frame changed nothing, so card → section cost 2 overrides per card (16 for B).
3. **A swapped instance keeps its old size.** `1920 · Default` swapped to `400 · Default` stayed 1920 wide. Columns that were Fill height in a row turned into 64 px slivers when the row was detached and made vertical. That cost 10 of the 37 mobile steps.
4. **A detached layout keeps the master's Scale mode,** so its gap stayed at 1920 inside the 400 page until I cleared the mode (2 steps).
5. **Columns don't match heights.** In `1920 · 3 · Equal` the first feature card is taller than the other two.
6. **The stat band reads loosely at 1920:** the label sits well below its number, with a gap as big as the number itself. At 400, "5 min" breaks onto two lines in a three-up Stat.
7. **Square corners don't show.** The radius is 4, so A2 looks almost the same as A.
8. **"Dense" has no token.** C borrows the 600 SM mode for tighter gaps, and lint warns about it (12 mode-mismatch warnings; 0 errors on the page).
9. **Flush cards inside a layout still show the layout's gap.** In B, B1 and B2, the features and story layouts keep their 44 px gap, so grey bars sit between the flush cards, with grey notches under the shorter cards. Rule 22 allows no gap override on an instance; only a detach would close the gap (2 more steps per layout).

Photos were fine: the seagull image uses FILL, the head is never cut, and nothing stretched.

What held up: swapping a layout for a layout (2 → Sidebar, 2 → 3, 3 → 4) kept every column's text, and the new column arrived as the placeholder. Radius and shadow overrides on a column survived a layout swap there and back.

## What looks good

- **B · Flush sections with a dark hero** is the strongest idea: the dark band anchors the top. But it isn't clean yet. Inside the features and story layouts, the 44 px layout gap and the uneven card heights show as grey bars between the flush cards (see "What broke", item 9). The top-level bands (hero, stats, CTA) do read as one page.
- **C1 · Dark stats:** one dark band in the middle of a dense page breaks it up well.
- **A1 · Prime bands** looks lively, but the body text on Prime is weak (white on orange, about 2.6 : 1).
- **C2 · Four features** fits at 1920; four short cards are the most a row holds before titles wrap.

## Three Index improvements

1. **Make card → section one switch.** Bind each Default's radius to Surface `surface-radius`, and its shadow (colour alpha, or the effect itself) to a Surface variable, and bind each layout's gap to `surface-gap`, so the columns close up too. Then Surface → Section on a page turns every card into a flush section: B drops from 19 steps to 4 (duplicate, Surface mode, page gap 0, dark hero). Fix the master descriptions in the same pass.
2. **Name every Content's text layers `Kicker` / `Title` / `Body`, the 1600 ones too.** Swaps then carry text across every size. The 400 version would have cost 33 steps, not 37, and a 1920 ↔ 400 round trip would keep all its text.
3. **Add the missing pieces to the Index:** `1920 · 3 · Equal`, a `Content · Text + Button` and a hero Content (h1) at 1000 and 1600, a `1600 · Content · Stat`, and a `400 · Stack` whose layers are named `Column 1…N`, so a 1920 layout swaps down to a stack instead of being detached. Also give the layouts stretch-height columns so cards in a row match heights.

## Checks

- **Lint** (`doc/lint.js` on the page): 0 errors, page-root passes. The 12 warnings are branch C's borrowed 600 SM mode.
- **Screenshots** (rule 18): the 1920 base, the 400 page and B at 1:1; each branch row at 0.33; the whole Root (`root-before-fold.png` still shows the 400 page in its own group, before it was moved under the 1920 one). A different reviewer (`reviewer-explorations-review`) found the grey bars in B, which led to item 9. They are local only, in the session folder's `shots/`. No cropped heads, nothing floating, nothing outside Root.
- **Left as is:** the 400 page sits under the 1920 one in the same group, so the group has empty space to its right (about 1600 × 2500). That is the price of keeping Root at 1.68 : 1 without a void beside the tree.

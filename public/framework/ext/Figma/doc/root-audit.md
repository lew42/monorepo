# Root audit: every page after the Root spec (2026-11-17)

Lew42 v2 (`ADpu9u2V0BlEZfR3rrMfER`). The [Root spec](./root-spec.md) is now on 18 pages: every working page except Index (the reference) and 1000 Default (its own pilot). The 7 `Explore –` pages were skipped; they will be archived.

**What changed on each page.** All of Root's old children moved into one `Root Column - <page>`. That column keeps the Scale mode, Scheme and gap that Root had before, so nothing inside moved or changed size. Root itself got the spec: `tint` fill, 3440 Mega, `section-pad-x`/`-y` padding, `section-pad-x` gap, horizontal. A hidden `Archive` stays Root's last child. There is one exception: on Showcase every block is Fill width, so its column is fixed at the old inner width, 3440.

**How to read the table.** Size is Root after the change, width × height. Empty is the share of Root that no child covers, padding included. Shape is width ÷ height; rule 12 wants about 2:1 to 1:1. Each split is a proposal. Only 1920 Desktop has been split (the pilot, below). Rule 14 says nothing rolls out to the other pages until the owner approves the pilot.

| Page | Root after | Empty | Shape | Worst problem | Proposed Root columns (title: contents, width) |
|---|---|---|---|---|---|
| **1920 Desktop** (pilot, done) | 9068 × 4608 (was 8420 × 9845) | 29% (was 52%) | 2.0:1 | The placeholder row "Pages · one per Scale mode" was 7908 wide (now in Archive) | **Done:** Preview (preview + Page · 1920 Desktop, 2016) · Masters (2060, Res set stacked) · Specimens (3968) |
| 360 XS | 2432 × 5273 | 49% | 1:2.2 | One tall column; the Layouts folder is 1240 wide and mostly empty | Preview: preview + Layouts (1920) · Specimens (1240) → about 3930 × 2930 |
| 400 Mobile | 2432 × 6696 | 43% | 1:2.8 | Same shape as 360, taller | Preview: preview + Layouts (1920) · Specimens (1360) → about 4050 × 3900 |
| 600 SM | 2472 × 5148 | 30% | 1:2.1 | Tall | Preview: preview + Layouts (1960) · Specimens (1960) → about 4700 × 3000 |
| 1600 LG | 4032 × 7426 | 28% | 1:1.8 | Its old Root was set to Mega, so the content renders at Mega, not LG. The Layouts folder is 3394 wide on a 1600 page | Preview: preview + Layouts wrapped to 1920 · Specimens (3520) → about 6200 × 4000; set the columns to 1600 LG once frozen |
| 3440 Mega | 7520 × 11266 | 21% | 1:1.5 | The Masters row is 7008 wide (two 3440 Res cards side by side); Specimens is 7008 × 7598 | Preview + Masters (Res set stacked, 3500) · Specimens (7008) → about 11300 × 8100 |
| Scale | 13776 × 17206 | 27% | 1:1.25 | Two frames fixed at 13264 wide (Masters, only 410 tall, and Page · Scale). The owner edited this page today | Masters → Hug; Scratch · mode precedence tests → Archive; Preview (1920) · Page · Scale on Hug · Plain-frame layouts (5190). Wait for the owner's edits to settle |
| 2600 XL | 19672 × 24390 | 25% | 1:1.24 | The biggest page. Layouts is fixed at 18840; Layouts · 2600 XL is a 7-wide grid of 2600 frames, 19160 wide; three Parked folders | Parked/* → Archive (the Interactive sets already live on Elements); Layouts → Hug, wrapping 2 per row; layout grid wrapped 2 per row (about 5400) → about 9000 × 8000 |
| Templates | 4208 × 10450 | 29% | 1:2.5 | The XS frame is fixed at 3696 wide but holds one 360 card; LG is fixed at 3696 | XS → Hug. Preview + XS + Swap preview test (1920) · LG + 3440 layouts (3696) · Swap pilot (3696) → about 10300 × 4500 |
| Elements | 3290 × 19049 | 28% | 1:5.8 | The worst ratio. The Interactive folder is 12829 tall (Sidebar and Miller sets). Three loose texts sit straight in the column | Elements: title, preview, text styles, Example · Button by scheme, Specimen (1920) · Masters + Review notes (2618) · Interactive wrapped 2 across (about 5600 × 6500) |
| Showcase | 3952 × 14014 | not measured (the blocks fill the 3440 column) | 1:3.5 | 11 blocks stacked; most content inside each 3440 block is about 1600 wide | Three 1920 columns of blocks: Scale…Text styles · Resolution…Composing · Swaps…Review tags → about 6800 × 5800. Click through stays beside Root |
| Text | 5964 × 4021 | 42% | 1.5:1 | Row 1 (5452) and Row 2 (5192) are long rows; the column is 2600 XL | Preview: title + preview (1920) · Specimens: rows wrapped at about 2700 → about 5400 × 3700 |
| Icons | 2528 × 11918 | 32% | 1:4.7 | Page · Icons and Workspace are Big Sloppy instances (7341 tall). A stray `Icon` (16 px) and `Frame 1` sit loose | Strays and Workspace → Archive. Icons: Masters + the 7 category folders (2016) · Page · Icons (1920) → about 4700 × 7900, until Big Sloppy's Page is replaced |
| Squeeze | 3952 × 4505 | 23% | 1:1.1 | None. One frame, fixed 3440 on purpose | Keep; give the column a title |
| Columns | 4288 × 6610 | 19% | 1:1.5 | Fine | Keep; optionally split "Wrapping" from "Column system + Carded vs flush" |
| Card vs Section | 6336 × 4833 | 18% | 1.3:1 | Fine | Keep |
| Live | 4248 × 5263 | 50% | 1:1.2 | The Done archive (1784 × 1138) sits beside a 4751-tall board | Live (1920) · Done (1784). The void under Done is fine on a status page |
| AI | 6496 × 3275 | 52% | 2:1 | Eight 720 cards in one row with heights from 767 to 2763 | A `Masonry` of 4 columns of 720, heights evened → about 3600 × 3300 |

## The 1920 Desktop pilot

- **Before:** Root 8420 × 9845, 52% empty. Its biggest row was "Pages · one per Scale mode": 8 placeholder cells from 360 to 3440 wide, 7908 across. The owner's screenshot `image 1` (`228:7335`, beside Root) shows the same picture from earlier today.
- **After:** Root 9068 × 4608 (2:1), 29% empty. It now has three titled Root columns, each at `1920 Desktop` (`58:0`):
  - `Root Column - Preview` (`243:776`): the `.1920 Desktop Preview` and `Page · 1920 Desktop`.
  - `Root Column - Masters` (`243:778`): the Masters folder, now stacked vertically. Inside it, `Res.1920 Desktop Set` is stacked vertically too, so it is 2060 wide, not 7908.
  - `Root Column - Specimens` (`243:780`): `Specimens · 1920 Desktop`.
- **Archived, not deleted:** "Pages · one per Scale mode" (`50:4077`) went into the hidden `Archive` (`128:8859`).
- **Frozen:** before the columns switched to 1920 Desktop, each moved frame got the mode it had been drawn in (1000 Default, White) explicitly. Nothing inside moved. Those frames still show 1000 Default tokens on a 1920 page. Moving them to 1920 Desktop is the next step, and it changes how they look, so the owner should approve it first.
- **Tokens:** `Page · 1920 Desktop` had raw padding 48 and gap 32. They are now bound to `pad-x`/`pad-y`/`gap`, with the same values at its mode. Its title's raw black is now bound to Scheme `text`.
- **Lint:** 0 errors on everything touched. 12 errors were already there inside the moved masters, and none of them came from this change: the Button master's inner frame (6, the known one), Toggle (1), the `1920 Page` and `Page` masters' raw fills and gaps (4), and the owner's `image 1` outside Root (1).

## Found while doing it

- **Lint counted a bound colour's alpha twice.** Figma copies a colour variable's alpha into `paint.opacity` (tested: bind `tint` with opacity 1 and it reads back 0.05). Lint multiplied the two, so every `tint` Root read as 0.25% black, and the Preview sheets on top of it were flagged same-on-same. Lint now counts the alpha once ([lint.md](./lint.md)).
- **Most pages drew their content at 1000 Default.** Their old Root set no mode, so it fell back to the collection default. On a size page, the specimens then use Default tokens even when they are labelled with another width. Rule 17 says a size page shows its own width, so each column should eventually take its tier, one approved page at a time.
- **1600 LG's Root had been set to Mega by hand**, so that page shows Mega tokens.

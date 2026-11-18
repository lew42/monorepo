# Page audit: is every page in Lew42 v2 clean? (2026-11-18, read-only)

You asked an agent to look at a screenshot of every page and say whether it is clean: one Root, the same Root everywhere, equal columns, no voids, labels that match the frame names, tidy flow ([your words, "Voice (~23:20)"](./owner-words-2026-11-17-sizes.md)). This is the answer. Nothing in Figma was changed.

**In short:** 2 pages are clean, 12 have minor problems and 8 are messy. The biggest problem is that the Roots are not the same: the file has **three different Root setups**, plus two one-off variants. The worst single defects are two stray screenshots pasted onto size pages and one broken item on the Index.

How it was done: one read-only `use_figma` call per page (22 calls, at most 3 a minute). Each call read the Root's properties and took `node.screenshot()` of the Root. I looked at every image myself. The images came back inline and were not saved to disk. File `ADpu9u2V0BlEZfR3rrMfER`. Pages marked **in progress** were being edited by `mastermind-size-system` during the audit (Index, 500 SM, 1000 Default, 1920 Desktop), so recheck them when that work lands.

## The three Root setups in the file today

| Setup | Root | Columns inside it | Pages |
|---|---|---|---|
| **A · Mega band** (the old Root v1) | fill `tint`, Scale **3440 Mega**, padding and gap `section-pad-x`/`-y` (256), horizontal, no wrap, Hug × Hug | `Root Column - <title>` (mode 1000 Default + Scheme White, no fill). The column has **no title text**; the title sits somewhere inside. | AI, Live, Showcase, Scale, Templates, Elements, Text, Icons (vertical!), Squeeze, Columns, Card vs Section, Lab · Card tokens |
| **B · Root v2** (what [root-spec.md](./root-spec.md) says now) | **no fill**, Scale = the page's own size, padding 0, gap `gap`, horizontal **wrap**, fixed width × Hug | Groups with fill `tint`, padding `section-pad-x`/`-y`, and a title text that equals the frame name | Index, Explorations, Tokens (Hug × Hug and no wrap), 1600 LG, 1920 Desktop, 2600 XL, 3440 Mega (the four size pages have loose masters instead of groups) |
| **C · Panel columns** (new today, not in any doc) | fill `tint`, Scale **1920 Desktop**, padding and gap `section-pad-x`/`-y` (72), horizontal, no wrap, Hug × Hug | Equal-width `Column N · <name>` frames, Scheme Light gray + fill Scheme `fill`, so they show as **white panels**, all stretched to the same height. The heading on the canvas ("Defaults", "Content") does not equal the frame name. | 500 SM, 1000 Default, Lab · Size system |

## Every page

Ratio is the Root's width ÷ height (about 2 down to 1 is what you asked for).

| Page | Verdict | The 3 most important fixes | How its Root differs from the standard (setup B, below) |
|---|---|---|---|
| AI | clean | 1. Give each column a title text equal to its name ("Start here", "Rules", "Reference"); the "Reference" column holds Glossary + Systems map. 2. Columns end at different heights (1771 / 2224 / 1932). 3. — | Setup A. Ratio 1.16. |
| Live | messy | 1. The one column is horizontal: Live (1920 × 4788) beside Done · archive (1784 × 1138) leaves about 60% of the right half empty. 2. "One simple thing" sits **above** the "Live" title. 3. Cards still link the archived 360 XS, 400 Mobile, 600 SM and 1000 Default pages. | Setup A. Ratio 0.80. |
| Showcase | messy | 1. Ratio 0.28: one 3440-wide column of 10 stacked blocks whose content uses only the left third, so about 60% is empty. 2. It teaches the Surface switch, slots and 8 Scale modes, which rules 15, 25 and 31 replaced. 3. Split it into 2–3 columns, or archive it. | Setup A. "Click through" (`128:7156`) sits outside Root (the one allowed exception: a prototype starting point). |
| Index *(in progress)* | messy | 1. **Broken:** in `Index · Content`, the "Text + Media" item's text is squashed into a one-letter-wide vertical column (twice). 2. `Index · Sizes` still shows 8 tiers, not your 3 (500, 1000, 1920); the small tiers leave grey voids inside the previews. 3. The bottom row's groups are 1539 / 3228 / 4007 / 3438 tall, and `Index · Playground` is empty (2158 × 3438): big voids. Labels mix "400 · Default" and "500 · Default". | Setup B: the reference Root. Ratio 0.77 (taller than 1:1). |
| Explorations | minor | 1. The 400 landing sits in a 1920-wide group, so the lower three quarters of that group are empty. 2. The Landing group is about 1200 shorter than Design tree. 3. In branch B2, the narrow "Why we built it" column wraps to 1–2 words a line. | Setup B. Ratio 1.31. The groups repeat the 1920 mode Root already sets (harmless). **The best page in the file.** |
| Scale | messy | 1. Its column is 13,264 wide (rule 7: nothing grows past 5000). 2. About 55% is empty: the preview, the Layouts frame and a `Masters` strip (13264 × 410) that looks empty all leave voids to their right. 3. The last tier's cards poke past the right edge of `Page · Scale`. | Setup A. Ratio 1.06. |
| Tokens | minor | 1. The Variables group is 660 shorter than Stretch: a void at the bottom left. 2. It still shows the 8-mode ladder (360 XS to 3440). 3. — | Setup B, but Hug × Hug and no wrap (Index and Explorations use a fixed width and wrap). Ratio 1.58. |
| 500 SM *(in progress)* | messy | 1. Leftover names on a 500 page: "360 · Default", "400 · Default", "Content/400 · …". 2. Voids: the App column is half empty and the Defaults column a third empty; each 1576-wide column holds 400–500 items, so its right half is empty. 3. White 500 cards sit on white panels: the same colour on the same colour (rule 4). Canvas headings ≠ frame names. | Setup C. Ratio 2.36 (a little wide). |
| 1000 Default *(in progress)* | minor | 1. Column 2 is about 55% empty at the bottom and column 4 about 45%. 2. The "Side bar" heading in `1000 · 2 · Sidebar` wraps onto two lines. 3. Canvas headings ("Defaults", "Content in columns") ≠ frame names (`Column 2 · Defaults and Wrappers`, …). | Setup C. Ratio 1.53. Columns equal (1242 each), readable and pleasant. |
| 1600 LG | messy | 1. **A stray raster image, "image 1" (`329:3930`, 4096 × 3312), sits outside Root.** 2. The `1600 · Default` master sits alone beside the preview, leaving a ~1500 void under it; the masters are loose, not in a group. 3. Two group styles are mixed: `1600 · Content…` are white, `1600 · 2/3/4` are tint. "400 · Default" headings wrap to 3 lines in `· 2 · Sidebar` and `· 4`. | Setup B, without groups. Ratio 1.14. Preview header reads "1600 Tier", not `.1600 · Preview`. |
| 1920 Desktop *(in progress)* | messy | 1. **"image 1" (`228:7335`, 3477 × 4096), a raw screenshot of an old page, sits inside Root.** It is the biggest thing on the page. 2. The `1920 · Default` master sits alone (~1250 void below it); `1920 · 3` and `· 4` are shorter than `· 2`. 3. The fixed width (7693) is ~1400 wider than the second row, leaving an empty strip. | Setup B, without groups. Ratio 1.17. Header "1920 Tier". |
| 2600 XL | minor | 1. The `2600 · Default` master leaves a ~700 void under it beside `2600 · 2`. 2. The preview's right column ends a third short. 3. Header "2600 Tier" ≠ `.2600 · Preview`. | Setup B, without groups. Ratio 1.62. Calm and readable. |
| 3440 Mega | minor | 1. The `3440 · Default` master leaves a ~1100 void. 2. Text is tiny and sparse at this width. 3. Header "3440 Tier" ≠ `.3440 · Preview`. | Setup B, without groups. Ratio 1.53. |
| Templates | messy | 1. **Cut-off photo:** the "How a Layout finds its size" card shows the seagull with its head cropped off (rules 18, 28). 2. Ratio 0.43: the `XS` row is 90% empty, and `3440 layouts` is a small layout in a big grey band. 3. It is the paused Templates pilot: archive it or mark it Draft. | Setup A. Ratio 0.43. |
| Elements | messy | 1. Ratio **0.17**, the most extreme in the file: `Interactive` alone is 12,829 tall. 2. The page title "Elements" sits in the middle of the column, after Interactive and Review notes. 3. Split it into 2–3 columns (Masters · Text and Button · Interactive). | Setup A. |
| Text | minor | 1. The preview fills only a third of the top band. 2. The "Text" title sits below the preview. 3. Row 1's four cards have very different heights (stair-step voids). | Setup A, with the column in 2600 XL (every other A column is 1000 Default). Ratio 1.36. |
| Icons | messy | 1. Ratio 0.19, and loose stray nodes in the column: "Icon" 16 × 16, "Frame 1" 28 × 28, and seven 520-wide category frames, each leaving a 75% void to its right. 2. `Icons · Local` is stacked under the column, not beside it, and is not named `Root Column - …`. 3. `Page · Icons` (1920 × 7341) is the old page copy. | Setup A, but the Root is **vertical**: the only vertical Root. |
| Squeeze | minor | 1. 720-wide text on a 3440 white sheet: about 45% white space. 2. The demo boxes sit off-centre to the right. 3. — | Setup A. Ratio 0.87. |
| Columns | clean | 1. On the left, examples run one row longer than on the right (a void at the bottom right of the first section). 2. — 3. — | Setup A. Ratio 0.65. Same-size cards line up. |
| Card vs Section | minor | 1. It teaches the Surface mode switch and an "experiment" table; rule 15 replaced both with a plain override. 2. The right column ends a quarter above the left. 3. — | Setup A. Ratio 1.30. |
| Lab · Card tokens | clean | 1. In the 3440 band, three cards fill about 85% of the width (ragged right edge). 2. The two columns use different gaps (16 and 6). 3. — | Setup A. Ratio 1.68. Titles equal the names, minus the prefix. |
| Lab · Size system | minor | 1. It shows 512 / 1056 / 3232, the numbers you rejected (rule 31), with no "rejected" tag. 2. Column 3 is about 35% empty at the bottom, and the Sizes ladder leaves column 1's right half empty. 3. Canvas headings ≠ frame names. | Setup C. Ratio 1.46. |

## Root standard (proposal)

Use **setup B, exactly as on Explorations** (`309:1665`), the cleanest page. It is what [root-spec.md](./root-spec.md) already says (your Root layout v2, ~20:00). It uses only existing tokens and adds no new numbers (rule 31).

- **Root:** the only top-level frame; no fill; padding 0; gap and counter-axis gap bound to `gap`; horizontal **with wrap**; fixed width × Hug height, the width chosen so the page reads 2:1 to 1:1; explicit Scale = the page's own size (1920 Desktop for pages that aren't size pages).
- **Groups (the "columns"):** straight in Root, no wrapper. Each has fill Colors `tint`, padding `section-pad-x`/`-y`, vertical layout, gap `gap`, Hug height and an explicit Scale = its tier. **Its first child is a title text equal to its frame name.**
- **Equal columns:** groups that show the same tier share one width, so they line up (1000 Default and Lab · Size system already do this). This is the one thing to keep from setup C.
- **Inside a group,** white cards sit straight on the `tint`. No white panel between them (setup C's panels put white on white, against rule 4).
- **Masters** go in a group too (for example `1600 · Masters`), never loose in Root, so a lone Default stops leaving a void.

What changes per setup: **A pages** drop the Root fill and the Mega mode, move from padding 256 to 0, add wrap and a fixed width, turn each `Root Column - X` into a tinted group titled "X", and split tall pages into 2–3 groups. **C pages** move the `tint` from Root to the columns, drop the white panel fill, rename `Column N · X` to the exact heading text, and stop stretching every column to the same height. **Tokens** gets a fixed width and wrap. **Icons** becomes horizontal. The alternative is to adopt setup C everywhere (equal panels look tidy). It loses because it breaks rule 4, its headings don't match its names, and it is in no doc.

## Top 10 fixes across the file, ranked

1. **Remove the two stray screenshots:** `image 1` `228:7335` inside 1920 Desktop's Root (the biggest thing on the page), and `image 1` `329:3930` outside 1600 LG's Root. Move both to `Archive · Pages` (rule 29).
2. **Fix the broken Index item:** in `Index · Content`, the "Text + Media" text is squashed into a one-letter column. The Index is what every agent reads first (rule 13).
3. **Use one Root on every page** (the standard above): 12 pages use setup A, 3 use C, and Tokens and Icons are one-offs.
4. **Split the tall strips into 2–3 groups:** Elements (0.17), Icons (0.19), Showcase (0.28), Templates (0.43), Live (0.80, plus a 60% void) (rule 12).
5. **Put the size pages' masters in a group:** a lone `X · Default` beside the preview leaves a 700–1500 void on 1600, 1920, 2600 and 3440.
6. **Fix the beheaded seagull** in Templates' LG card: re-frame it or use the baked landscape crop (rules 18, 28).
7. **Finish the 500 rename and the 3-tier Index:** remove "360 · Default" and "400 · Default" from 500 SM, stop mixing 400 and 500 labels on the Index, and cut `Index · Sizes` from 8 tiers to 500 / 1000 / 1920 (your 23:20 ask; in progress).
8. **Make titles equal frame names:** the preview headers say "1600 Tier" but the frames are `.1600 · Preview` (all four big size pages); the setup C columns say "Defaults" but the frames are `Column 2 · Defaults and Wrappers`; setup A columns have no title at all.
9. **Fix the Scale page:** its column is 13,264 wide (rule 7: nothing past 5000), the `Masters` strip looks empty, and cards overflow `Page · Scale`.
10. **Mark or archive the stale teaching pages:** Live links archived pages; Showcase and Card vs Section teach the Surface switch and slots (replaced by rules 15 and 25); Lab · Size system shows rejected numbers with no tag.

Smaller things seen along the way: headings that wrap in narrow cards ("Side bar" on 1000 Default; "400 · Default" on 3 lines on 1600 LG), and white space on Squeeze. Photos are otherwise framed well (no stretching seen).

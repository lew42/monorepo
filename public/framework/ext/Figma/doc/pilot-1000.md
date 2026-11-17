# Pilot: the 1000 Default page shows 1000 at first glance (plan, 2026-11-17)

**Status: proposal. Nothing below is built.** This plan applies [rule 17](./rules.md) ("a size page shows its width at first glance") to one page, [1000 Default](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=64-2898). Nothing rolls out to other pages until you approve this one (rule 14). Source: [your words, section 6](./owner-words-2026-11-17.md#6-the-1000-default-page-stray-folders-text-column-card-vs-section-masonry-text-15-00).

## The idea in one line

The page becomes a title on top, then one `Masonry` of three columns. Every item in it is 1000 wide: the preview, the master folders and two small demos. Whatever you look at, you see 1000.

```
Root (vertical, ~3450 × ~3100, about 1.1 : 1)
├─ Title            "1000 Default" (h1) + one line: "Everything on this page is drawn 1000 wide."
├─ Masonry          3 columns × 1096 (1000 + folder padding), gap = gap
│   ├─ Column 1     .1000 Default Preview (hugs, 2 × 484 cards)   ~2000
│   │               Content (folder)                               ~450
│   ├─ Column 2     Swap demo (4 steps, each a 1000 Section)      ~1900
│   │               Card → section (demo)                          ~600
│   └─ Column 3     Layouts (folder: Text column, Two small cards, ~1300
│                     Nav + cards, Three cards 2+1)
│                   Containers (folder: 1, 2, 3 columns at 1000)   ~950
│                   Sections (folder: Section at 1000)             ~480
└─ Archive          hidden, last
```

The column heights are estimates: 2480, 2530 and 2790, a spread of 11%. The real balance is done by brute force once the items exist ([preview-recipe step 3](./preview-recipe.md)).

```
┌───────────────────────────────────────────────────────────────┐
│ 1000 Default                                                  │
│ Everything on this page is drawn 1000 wide.                   │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│ │ Preview      │  │ Swap demo    │  │ Layouts      │          │
│ │ ┌────┐┌────┐ │  │ step 1       │  │ Text column  │          │
│ │ │card││card│ │  │ step 2       │  │ Two small    │          │
│ │ └────┘└────┘ │  │ step 3       │  │ Nav + cards  │          │
│ │ ┌────┐┌────┐ │  │ step 4       │  │ Three cards  │          │
│ │ │    ││ 🐦 │ │  ├──────────────┤  ├──────────────┤          │
│ │ └────┘└────┘ │  │ Card →       │  │ Containers   │          │
│ ├──────────────┤  │ section      │  ├──────────────┤          │
│ │ Content      │  └──────────────┘  │ Sections     │          │
│ └──────────────┘                    └──────────────┘          │
└───────────────────────────────────────────────────────────────┘
```

## Decisions

1. **Page title on top.** A `Title` frame, the first child of Root: `h1` "1000 Default" and one `body` line. It is separate from the preview's own header, because the preview is also placed on Index.

2. **The preview hugs its content, at 1000.** Today `.1000 Default Preview` (`162:10434`) is a 1920 sheet holding a 1600 area of three 512 columns, which puts a 1920 drawing on a 1000 page. The plan: the sheet hugs, and its `Masonry` becomes two columns of about 484 (1000 content wide), so the preview is one 1000 item like everything else.
   - *Alternative:* keep the 1920 sheet and label it "Preview · 1600 area". It wins if Index needs every preview the same width. Its cost is that the first thing on the 1000 page is not 1000.
   - *Knock-on:* the preview instance on Index (`162:11146`) gets narrower. That is a check on Index, not a change to it.

3. **One `Masonry` of 1000 items** (rule 16 names it). Each item is either a folder (a frame with the purple `master` stroke, padding bound to `pad-x` / `pad-y`) holding 1000-wide masters, or a 1000-wide demo. A 1000 section can hold two cards of about 484 (the Two small cards and 2 columns masters do this already). Order: the preview top left (the first glance), then the master folders, then the demos. *Alternative:* the readme's order puts master folders first. Rule 17 is newer, so the first glance goes to the preview.
   - You started a `Root Column 1` frame (Preview + Layouts). The plan reads it as your intent ("Root holds columns") and takes it to three balanced columns. Nothing in `Root Column 1` was moved or restyled; it currently has a raw 64 gap, which lint reports.

4. **Text column: the 720 measure goes on the text, inside a full-width card.** Today the instance is a 904 container with a card about 600 wide floating inside it, so its edges line up with nothing. In the fix, the card Fills the 1000 width (radius, shadow, padding as every Card has) and the body text inside it has max width bound to `measure` (720), left-aligned. The reading line stays 720, and the card's edges align with every other item.
   - *Why this one:* it matches the web (`max-width: measure` on the prose, not the box), keeps text in exactly one padded surface (rule 3), and removes the "floating" look you named.
   - *Alternative:* a narrow 720 card centred in a filled 1000 Section band, which reads as an article column. It wins on a long-read page. It costs a centred box that only looks right with a band behind it.
   - Built beside the old master (rule 14): a new `Text column` next to it, the old one to Archive once you approve.

5. **Card → section, shown once** (rule 15). One demo item, 1000 wide, with two rows:
   - *Card:* a 2 columns Container holding two Card instances, each with radius and shadow.
   - *Section:* the same Card instance dropped full width into a Section, with three plain overrides: radius 0, drop shadow removed, clip content on.

   A caption lists exactly those three overrides. No toggle, mode or variant.

6. **Kit folders.** Sections (`180:644`), Containers (`180:645`), Content (`180:646`) and Swap demo (`181:557`) are now inside Root (moved today). In the pilot they become Masonry items at 1000. The Swap demo's four steps were 1200 wide, because a 3-column Container needs 1024. At 1000 they show 2 + 1 cards, which is honest for this width. They are rebuilt at 1000 beside the old ones, and the old 5120-wide demo goes to Archive. The 5120 demo is what makes Root 5376 wide today, with a large void on the right.

## What moves to Archive (hidden, last in Root)

- Already moved today: `Res.1000 Default Set` (`100:9677`), `Specimens · 1000 Default` (`114:11659`); also there from before: `Page · 1000 Default` (`64:6138`), `Cut · old page contents (2026-11-16)` (`100:9889`).
- In the pilot: the old `Text column` master once the new one is approved; the old 5120 `Swap demo`; the loose `Text column` instance `103:24900` in Root, if it was not placed there on purpose. If you dragged it out to look at it, it stays.

## Size check

Root ≈ 48 + 3 × 1096 + 2 × 32 + 48 ≈ **3450 wide**, × 48 + 160 (title) + 32 + ~2800 + 48 ≈ **3100 tall**: about **1.1 : 1**, inside rule 12's 2:1-to-square band, with no column more than ~11% shorter than the tallest. Today it is 5376 × 7345 with a void right of everything above the Swap demo.

## What you check to approve it

1. At first glance the page reads 1000: one item width, the title on top.
2. The Text column card lines up with its neighbours, and its text line is no wider than 720.
3. The Card → section demo makes sense with its three overrides and nothing else.
4. The preview at 2 × 484 still reads well (and on Index).
5. Root is about square, with no void, and nothing sits outside it.

If it passes: the same shape goes to the other size pages one at a time, each at its own width.

## Done today (the fix job, for reference)

- **Everything inside Root, every page:** hidden `Archive` frames went into Root (360, 400, 600, 1000, 1600, 1920, 3440, Elements). The four kit folders went into Root on 1000 Default. On Index, the loose reference image `image 1` (`148:25853`, a screenshot of the old file's Index) went into a new hidden `Archive` (`231:1173`), because it would have doubled Root's width. New `Root` frames hold the pages that had none: AI `231:503`, Live `231:504`, Explore – Sizing `231:505`, Drag playground `231:506` (rows stay rows, the column stays a column). Showcase's `Click through` stays top-level (a flow start must be).
- **Masonry names:** the `Columns` wrapper is now `Masonry` in 11 previews (Scale, 360, 400, 600, 1000, 1600, 1920, 2600, 3440, Elements, Text). Templates has `Row`s, not a masonry, so it is unchanged.
- **Seagull crops:** all 10 preview photos now show the whole bird. The 512 × 200 Media boxes cannot be resized on an instance (the size is locked to the master). The photo is portrait (480 × 639), so the bird fits only with a slight vertical squash (about 0.77×). The clean fix is a taller Media box in the `Card · with media` master; it is logged as an improvement. Templates' 16:9 photo is undistorted.
- **Lint, 1000 Default:** 1 error, `Root Column 1` with a raw 64 gap (your frame, left alone), and 1 warning, `Layouts` 1920 wide on 1000 Default.

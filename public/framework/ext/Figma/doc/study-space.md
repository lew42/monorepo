# Using space better in Lew42 v2: a masonry Preview per page (2026-11-16, read-only study, nothing edited)

**Conclusion.** Big Sloppy looks good because every preview is the same 1920 sheet: #f5f5f5 ground, white cards, 120 margins, and **cards fill about 95% of the content block**. v2 looks empty because its tiers show a bench (masters, labels, placeholder titles) around small content. The fix is one Preview per page, 3 columns of **516-wide Default cards**, previewed on Index. Sources: Big Sloppy previews `339:7753` (Masonry boards) and `232:25752` (Domain cards), measured by read-only script; v2 pages by script plus screenshots. [think-layouts.md](./think-layouts.md) and [think-index.md](./think-index.md) already cover the seven layouts and the Index shape; only new numbers here.

## 1. What makes Big Sloppy's previews good (new numbers)

- **Sheet:** 1920 wide, ground #f5f5f5, padding 120, content 1600 (83% of width). Header 48 title + one 16 line, then sections 96 apart.
- **Masonry:** 3 columns of **516**, gap **26** (Domain cards uses 40, columns 506). Cards hug height and never stretch.
- **Balance:** column heights 573 / 602 / 544 (Masonry boards) and about 1880 / 1900 / 1720 (Domain cards). The **spread is under 11%**, so the bottom edge reads as one line.
- **Cards:** white, radius 4, soft shadow, inner padding 48 (9% of a 516 card). Photo cards run edge to edge at the top.
- **Type:** title 48, section title 24 or 36, body 16, caps label 12 to 14. Card titles about 24, body 14 to 16.
- **Accent:** one filled orange card (#ff7950) per preview, 2 to 3 dark #433e37 header bars, orange buttons and kickers. Everything else is white or gray. Rich content (photo, map, QR, slider) fills the cards, so none look empty.
- **Density:** the empty space is margin (120) and gaps, never holes. Preview heights run 700 to 3700; most are 1000 to 1800.
- **Index:** root is white, previews #f5f5f5 stacked 87 apart in 1920-wide columns 500 apart. All 25 previews have the same width and ground, so they read as one calm grid. Index root padding is 160, v2's is 48.

## 2. Where v2 wastes space: top 10 by visual impact

Crop = `get_screenshot` on the node id.

1. **Bench around every tier (32 to 37% of height).** The Layouts or Masters block is 1198 of 3741 on 360 XS (`100:4742`), 1672 of 4558 on 400 (`100:4290`), 1354 of 3616 on 600 (`100:5115`), 1578 of 4988 on 1000 (`100:5811`), 1880 of 5254 on 1600 (`100:6091`). Each opens with a giant "360 XS"-style placeholder tile.
2. **1920 Root is 57% void.** `128:9173` is 13136x7019 and top-level children cover 43%. The Specimens frame (`128:8860`) is 3968 wide, 30% of the root width.
3. **Mega pages half empty.** `Main + Aside` (`128:9386`, 3184x1440) holds content about 720 tall, so the lower half is blank. The same goes for `Sidebar + Main` (`128:9255`). The aside's three Stat tiles (about 190 wide) sit tiny in the top-right corner.
4. **Huge padding at Mega.** Card pad is 128 and gap 64 (`I128:9183;111:62;128:9211`, 3184x371). That is 2.7x Big Sloppy's 48. The Mega `Three cards` (`128:9387`) are about 1040x162 strips with 14 px text.
5. **Desktop Three cards are 1784x162 strips** (`128:9013`) in a 382-tall frame with about 130 px of void above. Card pad is 64, gap 40, radius 6, versus 48 / 26 / 4.
6. **Inset wrappers.** A card sits in 4 nested grounds: Root, Specimen frame, Specimen instance, region. `Specimen / Main + Aside` is 3440x1796 around a 3184x1440 frame, so 128 inset a side and 178 top and bottom, with the Draft pill and title above.
7. **Tiny items in huge cells.** The Mega Components grid (`128:9182`) is 6912x5115 for 13 items. Button ("Learn more", about 60 wide) and Icon.Item Set ("Label") are specks in 3400-wide cells.
8. **Stat tiles misalign.** On 360 XS (`114:9545`, 328 wide) tiles wrap 2+1: two 154-wide tiles, then an orphan full-width tile. On Mega the three tiles are equal but too small. Pick one count per tier.
9. **Same-on-same fills.** Desktop Card fill is #f5f5f5 (`I67:4653;34:5586`, pad 64) sitting on #f5f5f5 and #dedede grounds. Index previews are #f5f5f5 on a #ebebeb root, a 1.07:1 step, so previews don't separate.
10. **Index and loose strips.** v2 Index (`137:725`) holds 2 previews (Icons `43:7936` at 1144 tall, Page Set `103:25367` at 2747 tall) on padding 48, plus a loose 3424x4096 image (`148:25853`). The `Pages · one per Scale mode` strip (`50:4077`) is 13040x380 of white holding 8 labels. 2600 XL is 18936x27302 with 4 Parked blocks (`100:4366` and the three after it).

## 3. Preview recipe: 3-column masonry made of instances

- **Sheet:** a `.<Page> Preview` component, 1920 wide, #f5f5f5 (Colors `light`, direct fill), padding 120, header 48 + 16, content 1600. No Section level. Every preview uses it, so Index stays calm.
- **Columns:** 3 x **516**, gap **26**. Items are instances at **Default** mode, Fill width 516. Card pad 48, radius 4, white. They stay one size on every page; the sheet carries the width.
- **Item count:** 6 to 9 per preview. 9 is the cap, 3 per column.
- **Height:** target column 1100 to 1400, hard max 1900 (Domain cards). Total preview about 1500 to 1800. If it grows past that, the page has too much: cut items.
- **Balance mixed heights:** pick items in three height classes: tall (photo or screen, 500 to 640), medium (300 to 400), short (170 to 260). Fill columns in the order T-M-S, M-S-T, S-T-M. A column is then 560 + 360 + 220 + 52 = about 1190. Check max minus min is **10% or less of the tallest**, as Big Sloppy's 573 / 602 / 544 does; swap one item if not. Never stretch a card.
- **Mixed tiers, one grid:**
  - **Card-level items** (Card, Stat, Profile, Button, Icon.Item) are Default cards, native 516.
  - **Mobile (400, 360, 600) screens:** keep native width, centred in a 516 well (#ececec, radius 4). One per preview. For tier pages, a **Sizes strip** across all 3 columns: 360 + 400 + 600 native, with 26 gaps (1412 wide), clipped to 640 tall.
  - **Desktop 1920 pages:** one full-width band of 1600, instance scaled 0.833 (1920 to 1600), clipped to 600 tall. Layout shape plus readable 13 px text.
  - **Mega 3440 pages:** scale 0.465 (3440 to 1600), shape only, text about 7 px. Show it as the band, never as a masonry item. Don't rescale Mega cards to 516: 14 px becomes 2 px.
  - The band goes first, then the masonry. The big thing leads, the small things fill below.
- **Accent budget:** one filled orange card, 2 dark header bars, orange buttons. Everything else white. Nothing else filled.
- **Index:** root #ffffff, padding 160. 3 columns (Foundations, Components, Layouts) each 1920 wide, **column gap 240**, preview stack gap **120** (vs 87 in Big Sloppy, giving v2's fewer previews more air). Each column opens with a 48 caps header and one 16 line. Every preview is the same 1920 sheet, so tiers differ only inside the band. 7 previews give about 3 x 2 of 1700 each, a 6200 by 5800 Index.
- **Cut first (by the numbers above):** the tier bench (1, 2), Mega specimens that fill 2 of 3 rows with a Draft pill (3, 6, 7), and the strips (10). A preview takes the best 6 to 9 items from each, so nothing is lost.

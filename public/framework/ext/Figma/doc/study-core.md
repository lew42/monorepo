# Study: what works in Lew42 v2, outside the size pages (2026-11-16, read-only)

File `ADpu9u2V0BlEZfR3rrMfER`. Nothing was edited. Judged from 1:1 crops, scripts for counts.

## Conclusion

- **The gold is small and already there:** one Card (16:364, 502 instances), one Button (23:506, 310), the Review tag (104:2072, 312), the Icons Preview (43:7935), the Text page (99:5363) and four Showcase blocks.
- **What fails is sprawl, not the parts.** 27 pages, masters on 15 of them, 7 Explore pages of failed experiments, test masters, and a "Draft" wrapper on everything.
- **Keep 9 pages, archive the rest.** The target in [consolidation-plan.md](./consolidation-plan.md) is right; this study confirms it and ranks what goes in each Preview.

## Gold per page (best first)

- **Index** (0:1): 1. Icons Preview 43:7936. 2. Big Sloppy Page Set 103:25367 (white cards on light gray, any height).
- **Text** (99:5363): 1. Text styles 99:5368. 2. Icon + title 100:2227. 3. Hierarchy in use 100:2023. 4. Wrapping 100:2047. Best-documented page; leave as is.
- **Icons** (43:5481): 1. Icons Preview 43:7935 (24 icons, then one icon at six sizes). The model every other Preview should copy.
- **Showcase** (109:14): 1. Block · Scale 109:21 (one Card at every mode, the owner's breakout). 2. Block · Scheme 109:175 (one section on White / Light gray / Prime / Dark). 3. Block · Surface 110:652. 4. Block · Columns 110:730. 5. Click through 128:7156 (three working prototypes).
- **Components** (now Elements 48:4568 and Scale masters): 1. Card 16:364. 2. Button 23:506. 3. Review Set 104:2072. 4. Icon.Title 110:1776. 5. Interactive sets 128:6990 (Sidebar 34:5646, Miller 34:1513, Miller.Mobile 34:1572).
- **Templates** (99:3765): 1. Dashboard grid 98:104. 2. Article 98:128. 3. Form 99:3769. Real content, good-looking; these are the best layout instances after the Page Set.
- **Tokens** (Scale 5:5, Squeeze 81:1590): 1. Block · Scale again. 2. Squeeze bars per mode (81:1591: clear ruler, live bars, two ways to apply it). 3. Card + Content · Stat 15:131.
- **Live** (61:8): Status board 85:1554 is functional; keep unchanged.

## Masters

- **Keep:** Card 16:364 (502). Content · Stat 15:131 (54). Card · with media 16:374 (5). Button 23:506 (310). Review Set 104:2072 (312). Icon.Item Set 43:6069 (115). Icon.Title 110:1776 (2). Card · Slot 112:7282 (1). Layout.Sidebar Set 34:5646 (4), Miller 34:1513 (2), Miller.Mobile 34:1572 (3). Templates 98:104, 98:128, 99:3769, 99:3798. Nav item 34:484 (120) and Sidebar 34:486 (19) if the size pages still use them.
- **Unused (0 instances):** Image 48:4583. Page 51:9277. Rail + Main + Rail 100:3553. Centred column 100:3687. Res.2600 XL Set 100:10097. Layout.Columns Two 34:5795 and Three 34:5822.
- **Duplicate:** Rail + Main + Rail exists on 2600 XL (100:3553, 0 uses) and Templates (99:3835, 1 use). Keep the Templates one.
- **Junk:** test masters "Master 1-6" 19:459, 19:479, 19:499, 19:519, 19:544, 21:502, and 18:437, 18:442, 18:447. Card Set 34:244 (226 instances of one card in seven grays; the variants show nothing Scheme does not). Heading Set 34:466 (53 broken variants: vertical letters, overlapping text).
- **Rarely needed:** Specimen 111:57 (103 instances), Note 111:43, Notes 111:48.

## Waste

- **Draft wrappers:** the "Draft" pill on every Showcase block header, Specimen 103:23641, "Review notes" 111:40, "Example · Button by scheme" 108:3988. Seen at 1:1: Specimen is a titled frame around a dashed "Content slot: put the example here", plus a Notes list that says "No notes yet". It adds a level and carries no information. Drop the wrapper; show the instance bare on its ground.
- **Whole pages to archive:** Explore, all 7: Sizing 33:3, Color permutations 34:194, Icon + title 34:281, Layout examples 34:1198, Figma → CSS 37:2, Legacy vs Latest 39:2, Drag playground 50:4106. Not all were opened; the two that were (34:244, 34:466) are failed experiments.
- **Frames to cut:** Index loose image 148:25853 (3424x4096, beside the Root). Block · Resolution cards 113:2366 (mostly empty "600 SM" labels). Templates Swap test 100:5842 and Swap pilot 99:3914. Scale scratch 18:436 and 26:538.
- **Fold, then archive:** Squeeze 81:1590, Columns 90:199, Card vs Section 100:9440 duplicate the Showcase blocks Columns and Surface. Squeeze is the clearest of them; move its bars and its two examples into Tokens.
- **Too busy:** Scale board 8:2 (13262x10745, tiny cards per mode). Replace it with Block · Scale. Keep the loose masters.
- **Medium, rewrite:** Block · Slots and swaps 113:2450 (three demos, text heavy).
- **Not screenshotted, assume archive:** Showcase Text styles 113:2347, Composing 113:2382, Swaps 110:943, Review tags 113:2567, Head 109:16; the AI page text frames.

## Minimal kept pages, sidebar order

1. **AI** 60:360. 2. **Live** 61:8. 3. **Index** 0:1 (Previews only). 4. **Components** (from Elements 48:4568, plus the Scale masters). 5. **Tokens** (from Scale 5:5, absorbing Squeeze). 6. **Text** 99:5362. 7. **Icons** 43:5481. 8. **Sizes** (or the eight size pages, instances only). 9. **Showcase** 109:14 (with Click through). 10. **Archive**: Explore ×7, Templates leftovers, Columns, Card vs Section, old step grids. Templates 99:3765 stays only if it earns an Index preview; otherwise it is Components > Layouts.

## Next

- One agent edits, one page at a time (`roots`). First move the unused and junk masters into Archive; their instance counts are 0 or 1.
- Strip the Draft pill from Showcase blocks before any Preview is built from them.

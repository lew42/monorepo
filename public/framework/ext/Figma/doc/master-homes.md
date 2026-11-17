# Master homes: where every master is defined, and where it should be (2026-11-16, read-only, nothing moved)

File `ADpu9u2V0BlEZfR3rrMfER` (Lew42 v2). Method: read-only `use_figma` scripts, one per page, `getInstancesAsync()` per master (a set counts all its variants). Counts are a snapshot at about 20:00 local on 2026-11-16 (Button is 326 now, 310 in [study-core.md](./study-core.md)). The owner's complaint is in [owner-words-2026-11-16.md](./owner-words-2026-11-16.md): "I click through to see where it's defined, and it's defined on a completely bullshit page."

## Conclusion

- **72 masters (single components and component sets) live on 14 of the 27 pages.** 13 pages define none.
- **The worst home is the Card.** `Card` `16:364` (520 instances), `Content · Stat` `15:131` (54) and `Card · with media` `16:374` (7) are defined on **Scale** (the token page, in its Masters frame `162:10503`). They belong on **Elements**.
- **Next worst: `Nav item` `34:484` (120) and `Sidebar` `34:486` (19)** are defined on **2600 XL**, but Elements and Showcase use them too. And **`Icon + title` `100:4360` (49)** is defined on **400 Mobile** while 43 of its 49 uses are on 1000, 1600, 1920 and 3440.
- **The Templates page's "card":** `Swap test card` `100:5846` (4 instances, 3 on Showcase) is a test master named Card-like that shows in the swap menu with Templates as its home. It is junk: Archive. This is probably the click the owner meant. Real Templates (Dashboard grid, Article, Form) are layouts sized to Desktop and Mega.
- **Moving is safe.** Move with `appendChild` (same node id, instances stay linked). One real risk: a master takes its Scale mode from the frame it sits in (see "Risks"). Proposal only; nothing was moved.

## 1. Every master

Page IDs: Scale `5:5`, Elements `48:4568`, Icons `43:5481`, Templates `99:3765`, 360 XS `64:2895`, 400 Mobile `64:2896`, 600 SM `64:2897`, 1000 Default `64:2898`, 1600 LG `64:2899`, 1920 Desktop `43:8101`, 2600 XL `34:475`, 3440 Mega `64:2901`, Explore – Color permutations `34:194`, Explore – Icon + title `34:281`. "Archive" is a **new page to create** (none exists today; each page has a tiny `Archive` frame, not a page).

`=` means already in the right place. `?` instances are nested inside other instances (not on a page frame). Status: **MOVE** (a real move), **ARCHIVE**, **FOLD** (merge into another master first, then archive; needs instance swaps, not covered here), **KEEP**.

### Scale (13 masters, only the first is a token demo)

| Master | Node ID | Defined on | Instances | Should live on | Status |
|---|---|---|---|---|---|
| Card | `16:364` | Scale | 520 | Elements | **MOVE** |
| Content · Stat | `15:131` | Scale | 54 | Elements | **MOVE** |
| Card · with media | `16:374` | Scale | 7 | Elements | **MOVE** |
| Size · Default | `9:2` | Scale | 6 (all on Scale) | Scale = | KEEP (a token demo row) |
| Master 1 to 5 | `19:459` `19:479` `19:499` `19:519` `19:544` | Scale | 1 each | Archive | ARCHIVE (test) |
| Master 6 (card mode SM) | `21:502` | Scale | 3 | Archive | ARCHIVE (test) |
| Master 1, 2, 3 (Case 1 to 3) | `18:437` `18:442` `18:447` | Scale | 1 each | Archive | ARCHIVE (test) |

### Elements (11)

| Master | Node ID | Defined on | Instances | Should live on | Status |
|---|---|---|---|---|---|
| Button | `23:506` | Elements | 326 | Elements = | KEEP |
| Review Set (3 variants) | `104:2072` | Elements | 312 | Elements = | KEEP |
| Icon.Title | `110:1776` | Elements | 3 | Elements = | KEEP |
| Card · Slot | `112:7282` | Elements | 3 | Elements = | KEEP |
| Layout.Sidebar Set | `34:5646` | Elements (Interactive) | 4 | Elements = | KEEP |
| Layout.Miller Set | `34:1513` | Elements (Interactive) | 2 | Elements = | KEEP |
| Layout.Miller.Mobile Set | `34:1572` | Elements (Interactive) | 3 | Elements = (or 400 Mobile later) | KEEP |
| Specimen | `111:57` | Elements | 103 | Elements until unwrapped, then Archive | KEEP, FOLD later |
| Note | `111:43` | Elements | 13 | same as Specimen | KEEP, FOLD later |
| Notes | `111:48` | Elements | 18 | same as Specimen | KEEP, FOLD later |
| Image | `48:4583` | Elements | **0** | Archive (re-home when used) | ARCHIVE |

### Icons (2)

| Master | Node ID | Defined on | Instances | Should live on | Status |
|---|---|---|---|---|---|
| Icon.Item Set (6 variants) | `43:6069` | Icons | 128 | Icons = | KEEP |
| Icons Preview | `43:7935` | Icons | 1 (on Index) | Icons = | KEEP |

### Size pages (the layouts sized to a tier)

| Master | Node ID | Defined on | Instances | Should live on | Status |
|---|---|---|---|---|---|
| App bar | `100:4743` | 360 XS | 31 | 360 XS = (phone chrome) | KEEP |
| Navigation | `98:164` | 360 XS | 34 | 360 XS = | KEEP |
| Profile | `98:179` | 360 XS | 27 | 360 XS = | KEEP |
| Res.360 XS Set | `100:8494` | 360 XS | 4 | 360 XS = | FOLD (placeholder, delete) |
| .400 Mobile Preview | `162:10582` | 400 Mobile | 0 | 400 Mobile = | KEEP (new Preview) |
| Card stack | `100:4291` | 400 Mobile | 19 | 400 Mobile = | KEEP |
| List section | `100:4325` | 400 Mobile | 8 | 400 Mobile = | KEEP |
| **Icon + title** | `100:4360` | 400 Mobile | 49 | **Elements** (only 2 uses on 400 Mobile, 15 on 1000, 13 on 1600, 8 on 1920, 6 on 3440) | **MOVE** |
| Res.400 Mobile Set | `100:8938` | 400 Mobile | 18 | 400 Mobile = | FOLD |
| Rail + main | `100:5116` | 600 SM | 20 | 600 SM = (72px rail, SM only) | KEEP |
| Two small cards | `100:5139` | 600 SM | 21 | Elements, as a Card at width | FOLD |
| Stat tiles | `100:5162` | 600 SM | 31 (3 on 600 SM; 28 elsewhere) | Elements, as Content · Stat at width | FOLD |
| Res.600 SM Set | `100:9439` | 600 SM | 35 | 600 SM = | FOLD |
| .1000 Default Preview | `162:10434` | 1000 Default | 0 | 1000 Default = | KEEP (new Preview) |
| Text column | `100:2115` | 1000 Default | 13 | 1000 Default = | KEEP |
| Two cards | `100:2139` | 1000 Default | 9 | fold into Three cards | FOLD |
| Nav + main | `100:2164` | 1000 Default | 9 | 1000 Default = | KEEP |
| Three cards | `100:2189` | 1000 Default | 6 | 1000 Default = (the reference rhythm) | KEEP |
| Res.1000 Default Set | `100:9677` | 1000 Default | 27 | 1000 Default = | FOLD |
| Rail + two cards | `100:3746` | 1600 LG | 11 | 1600 LG = | KEEP |
| 60 / 40 | `100:3785` | 1600 LG | 9 | 1600 LG = | KEEP |
| Three cards (duplicate) | `100:3812` | 1600 LG | 13 | fold into `100:2189` | FOLD |
| Rails both sides | `100:3849` | 1600 LG | 4 | 1600 LG = | KEEP |
| Res.1600 LG Set | `100:9682` | 1600 LG | 6 | 1600 LG = | FOLD |
| 1920 Page | `43:8103` | 1920 Desktop | 17 | 1920 Desktop = (the page shell) | KEEP |
| Page | `51:9277` | 1920 Desktop | **0** | Archive | ARCHIVE |
| Res.1920 Desktop Set | `100:9888` | 1920 Desktop | 11 | 1920 Desktop = | FOLD |
| Sidebar + Main | `100:3511` | 2600 XL | 4 | 2600 XL = (gold) | KEEP |
| Main + Aside | `100:3618` | 2600 XL | 4 | 2600 XL = | KEEP |
| Centred column | `100:3687` | 2600 XL | **0** | 2600 XL = (gold, not yet used) | KEEP |
| Rail + Main + Rail | `100:3553` | 2600 XL | **0** | Archive (duplicate of `99:3835`) | ARCHIVE |
| Res.2600 XL Set | `100:10097` | 2600 XL | 2 | 2600 XL = | FOLD |
| **Nav item** | `34:484` | 2600 XL | 120 | **Elements** (12 uses on Elements, 6 on Showcase, 6 on 1920; 96 on 2600) | **MOVE** |
| **Sidebar** | `34:486` | 2600 XL | 19 | **Elements** (the Nav item block's container) | **MOVE** |
| Layout.Columns.One Set | `34:6349` | 2600 XL | 4 (360, 400, 600, 1000; none on 2600) | Elements (Interactive frame) | **MOVE** |
| Layout.Columns.Two Set | `34:5795` | 2600 XL | **0** | Archive | ARCHIVE |
| Layout.Columns.Three Set | `34:5822` | 2600 XL | **0** | Archive | ARCHIVE |
| Layout.ScaleRegions Set | `34:5871` | 2600 XL | 1 (on 3440) | Elements (Interactive frame) | **MOVE** |
| Res.3440 Mega Set | `100:8489` | 3440 Mega | 4 | 3440 Mega = | FOLD |

### Templates (6, the page the owner distrusts)

| Master | Node ID | Defined on | Instances | Should live on | Status |
|---|---|---|---|---|---|
| Dashboard grid (frame "LG") | `98:104` | Templates | 6 (2600 XL 2, 3440 1, 1600 1, Templates 2) | 1600 LG (Desktop tier) | **MOVE** |
| Article (frame "LG") | `98:128` | Templates | 3 (all on 2600 XL) | 1600 LG | **MOVE** |
| Form (frame "LG") | `99:3769` | Templates | 3 (3440 2, 2600 1) | 1600 LG | **MOVE** |
| Filters (frame "XS") | `99:3798` | Templates | 2 (both on Templates) | 360 XS | **MOVE** |
| Rail + Main + Rail (frame "3440 layouts") | `99:3835` | Templates | 1 | 3440 Mega | **MOVE** (keep this, not the 2600 duplicate) |
| **Swap test card** | `100:5846` | Templates | 4 (Showcase 3, Templates 1) | Archive | ARCHIVE |

### Explore pages (archive as whole pages, do not move masters)

| Master | Node ID | Defined on | Instances | Should live on | Status |
|---|---|---|---|---|---|
| Card Set (7 variants) | `34:244` | Explore – Color permutations | 358 (226 on that page, 132 nested) | stays with its page, which goes to Archive | ARCHIVE with page |
| Heading Set (52 broken variants) | `34:466` | Explore – Icon + title | 84 (all on that page) | stays with its page | ARCHIVE with page |

Pages with **no masters** (13): AI, Live, Showcase, Index, Text, Squeeze, Columns, Card vs Section, and the five other Explore pages.

## 2. The misplaced ones, worst first

Ranked by instances times how surprising the page is.

1. **Card `16:364` on Scale: 520 instances, on a token page.** Scale is the "see the tokens at work" page; it should hold token demos, not the most-used block in the file. Click an instance anywhere and "Go to main component" lands on a 13360x14518 canvas of scale scratch. Move to Elements > Masters.
2. **Nav item `34:484` (120) and Sidebar `34:486` (19) on 2600 XL.** The defining page is the biggest, messiest size page (18936x27302). Elements, Showcase and 1920 use them. Move to Elements.
3. **Icon + title `100:4360` (49) on 400 Mobile.** 47 of 49 uses are on other pages. The name is a block, not a Mobile layout. Move to Elements.
4. **Content · Stat `15:131` (54) and Card · with media `16:374` (7) on Scale.** Card variants: they go with the Card.
5. **Swap test card `100:5846` on Templates** (3 uses on Showcase demos): a test, listed as a card in the swap menu, defined on Templates. Archive (after Showcase's Slots and swaps block is rewritten).
6. **Layout.Columns.One Set `34:6349` and Layout.ScaleRegions Set `34:5871` on 2600 XL.** 5 uses on pages 360 to 1000 and 3440, none on 2600. Move to Elements > Interactive next to the other Layout sets.
7. **Templates masters (Dashboard grid, Article, Form, Filters, Rail + Main + Rail)** are layouts sized to a tier on a page that is not a tier. Lower urgency: they are real, and used only on pages 1600 and up.
8. **Stat tiles `100:5162` (31, 3 on its own page), Two small cards `100:5139` (21), Two cards `100:2139`, the second Three cards `100:3812`**: one Card or Stat at a width, defined as if size-specific. Not a move: fold ([study-sizes.md](./study-sizes.md)).
9. **Test masters (Master 1 to 6, Case 1 to 3) on Scale and unused ones (Image, Page, Columns Two and Three, Rail + Main + Rail on 2600)** clutter the swap menu: Archive. Nothing here is a surprise except the swap menu.

Not misplaced (checked): Button, Review Set, Icon.Title, Card · Slot, the Layout.Sidebar, Miller and Miller.Mobile sets (Elements); Icon.Item Set and Icons Preview (Icons); App bar, Navigation, Profile (360 XS, phone chrome; used on wide pages for the drawer); Card stack, List section (400 Mobile); Rail + main (600 SM); Text column, Nav + main, Three cards (1000 Default); Rail + two cards, 60 / 40, Rails both sides (1600 LG); 1920 Page (1920 Desktop); Sidebar + Main, Main + Aside, Centred column (2600 XL).

## 3. Does moving keep instances linked?

**Yes.**

- **Figma's own words** ([Move published components](https://help.figma.com/hc/en-us/articles/4404848314647-Move-published-components)): "Figma will keep connections between components and instances as long as they remain in the same file." A search of the help centre also gives the UI route: right-click the layer, **Move to page**, pick the page ([Create and manage pages](https://help.figma.com/hc/en-us/articles/360038511293-Create-and-manage-pages)). The article is written about moving between files and does not describe the page case in detail; the same-file statement is the one that applies. I could not find a doc line that says "a page move is safe" in so many words, so this is the one claim the first move must prove (below).
- **Plugin API way:** reparent the main component or set; it keeps its node id, so every instance's `mainComponent` still points at it. Never `clone()` (that makes a new component and unlinks nothing but creates a second master).

```js
// one use_figma call per target page (switch pages once per call)
const target = await figma.getNodeByIdAsync("161:300"); // Elements > Masters frame
const m = await figma.getNodeByIdAsync("16:374");        // Card · with media
const before = (await m.getInstancesAsync()).length;
target.appendChild(m);                                   // reparent: same id
const after = (await m.getInstancesAsync()).length;
return { id: m.id, page: m.parent.parent.name, before, after };
```

  `appendChild` into an auto-layout frame (Elements and Scale `Masters` are HORIZONTAL auto layout) puts the master last in the row and lets the frame lay it out. Move a component **set** as a whole; a variant `COMPONENT` inside a set cannot be moved on its own.
- **Not the cut-and-paste route for bulk:** same-file cut and paste also keeps links, but it is manual and (in the UI) can assign a new id; use it as the fallback if `appendChild` across pages throws.

## Risks

- **Scale mode comes from the parent frame.** `Elements > Masters` `161:300` and `Scale > Masters` `162:10503` have **no** explicit Scale mode, so Card, Content · Stat and Card · with media draw the same after moving. The size pages' Layouts frames set one (360 XS Layouts `100:4742` has mode `2:5`), and Elements > Interactive `128:6990` sets `2:0` (1000 Default). A master moved into one of those frames **changes size** to that frame's mode. That is wanted for Filters (into 360 XS Layouts) and the Templates layouts (into their tier's Layouts frame), but screenshot each after moving.
- **Cross-page `appendChild` is not proven in this file yet.** Docs say reparenting works; I did not test (read-only). First move: an unused master (Image `48:4583`), check `id` is unchanged and `getInstancesAsync().length` equals the count before. If it throws, use **Move to page** by hand.
- **Position:** `appendChild` keeps the relative x/y; into an auto-layout frame that does not matter, into a plain frame set `x`/`y` or the master lands on top of others.
- **Visible side effects:** the Assets panel and the swap menu regroup by page > frame, which is the point. `Go to main component` on an instance then lands on the new page. Showcase demos that use the Swap test card keep working after Archive but the swap menu shows it under Archive.
- **No instance count may change.** Return `before` and `after` from every call; a different number means stop.
- **Single editor:** one agent edits at a time (`roots`), as in the plan. Do not run the moves while a Preview is being built from the same masters.

## 4. Move list (proposal, smallest risk first; not done)

Each step returns instance count before and after. Stop on any mismatch.

0. **Create the `Archive` page** (`figma.createPage()`, name `Archive`, last in the sidebar), with one frame per source page (`Scale`, `Elements`, `2600 XL`, `Templates`). The page is a new write but touches no master.
1. **Canary:** `Image` `48:4583` (0 instances) to Archive. Proves `appendChild` across pages and the id check.
2. **Unused to Archive:** `Page` `51:9277`, `Layout.Columns.Two Set` `34:5795`, `Layout.Columns.Three Set` `34:5822`, `Rail + Main + Rail` `100:3553` (all 0 instances).
3. **Test masters to Archive:** Master 1 to 5 `19:459` `19:479` `19:499` `19:519` `19:544`, Master 6 `21:502`, Case masters `18:437` `18:442` `18:447` (1 to 3 instances each, all in Scale scratch). Move the scratch frames `18:436` and `26:538` in the same call so no instance is left dangling visibly.
4. **Card family to Elements > Masters `161:300`:** `Card · with media` `16:374` (7) first as the canary, then `Content · Stat` `15:131` (54), then `Card` `16:364` (520). Screenshot Elements and one size page.
5. **Nav item and Sidebar to Elements:** `34:484` (120), `34:486` (19).
6. **Other blocks to Elements:** `Icon + title` `100:4360` (49) into Masters; `Layout.Columns.One Set` `34:6349` and `Layout.ScaleRegions Set` `34:5871` into Interactive `128:6990` (its mode is 1000 Default, so check them at 1000).
7. **Templates to their tier** (changes Scale mode, screenshot each): `Filters` `99:3798` to 360 XS Layouts `100:4742`; `Dashboard grid` `98:104`, `Article` `98:128`, `Form` `99:3769` to 1600 LG Layouts; `Rail + Main + Rail` `99:3835` to 3440 Mega Masters. After this the Templates page holds only instances and is archived or becomes the Previews page.
8. **Swap test card** `100:5846` to Archive, only after Showcase's "Slots and swaps" block `113:2450` no longer uses it (3 instances).
9. **Folds, not moves (separate task, needs instance swaps):** Two small cards, Stat tiles, Two cards, the 1600 Three cards, the eight `Res.N Set` placeholders, Specimen / Note / Notes. Then archive the empty masters.
10. **Explore pages** (7, with Card Set and Heading Set): reorder to the end and group under Archive as whole pages. No master moves.

After step 7 every master sits on the page its name says: blocks on Elements, Text styles on Text, icons on Icons, layouts on their tier, junk on Archive.

## Search terms

`master homes`, `defined on`, `appendChild`, `Go to main component`, `Swap test card`, `Card 16:364`.

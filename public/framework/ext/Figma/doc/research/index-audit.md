# The Index: what is on it, and a minimal Index that is the design system (research, 2026-11-17)

File [Lew42 v2](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=0-1) (`ADpu9u2V0BlEZfR3rrMfER`). Answers question H of [the brief](../brief-2026-11-17.md), under rules 12 to 14 of [rules.md](../rules.md) and the owner's words in [owner-words-2026-11-17.md](../owner-words-2026-11-17.md) §3 and §5. This is a read-only audit and a proposal: nothing in Figma was changed. It took 6 Figma calls.

## The answer

- **Today's Index is a catalogue, not a system.** It holds 4 large blocks stacked in one 2016 × 7610 column (about 1:4, which breaks rule 12). Cards appear in 3 places, and every glyph and the whole bottom block come from Big Sloppy, the old remote library.
- **Recommendation: a new Index with 3 columns, 9 small schematics and about 25 instances,** about 3500 × 2700 (1.3:1). Columns are Foundations, Elements and Cards, and Layouts. Each schematic is that page's `.<Page> Preview`, cut down to the least an agent needs to use that system.
- **Build it beside the old one** (rule 14), on a new page named `Index (new)` right after Index, with nothing in place. When it is approved, the old Root goes to Archive.

## 1. What is on the Index now

Root `137:725` is vertical, gap 32, and 2016 × 7610.

| # | Item | Node | Source | Kind |
|---|---|---|---|---|
| 1 | `Sizes` frame | `162:11145` | made by an agent | a loose frame holding 2 previews |
| 1a | `.1000 Default Preview` | `162:11146` | master `162:10434`, page 1000 Default | preview instance, 1920 × 1805 |
| 1b | `.400 Mobile Preview` | `162:11239` | master `162:10582`, page 400 Mobile | preview instance, 1920 × 1690 |
| 2 | `Icons Preview` | `43:7936` | master `43:7935`, page Icons | preview instance, 1920 × 1144. Its shell (`Page`, `.Section`) and all 24 glyphs are remote |
| 3 | `Page Set` "Page title" | `103:25367` | **remote**, Big Sloppy `Page Set / Size=1920` | instance, 1920 × 2747: Four features, Photo cards, Three cards, Masonry three |
| 4 | `image 1` | `148:25853` | probably placed by the owner | a loose 3424 × 4096 image beside Root |

**Leave alone (rule 1):** items 3 and 4 look owner-placed. Both are listed here and left untouched.

**What is wrong with it:**
- **Duplicates.** Card · with media, Card · Slot, List section, Icon.Title and Card each appear in both size previews. Three cards appears twice (the local master and the remote Page Set). There are three rows of photo cards.
- **Remote dependencies:** 67 `Icon`, 36 `icon-*` glyphs, 16 Card, 6 Button, 6 Icon.Item Set, 4 `.Section` and 2 Page Set instances all come from Big Sloppy. That includes the Icons Preview and the toolbar of the local `Icon.Title`.
- **Previews are missing.** `.Elements Preview` `172:516` and the other previews in [preview-recipe.md](../preview-recipe.md) (Scale, Text, Templates and the size pages) exist on their pages but are not on the Index.
- **Too many glyphs.** The Icons block shows all 24 glyphs. Rule 13 says the Icons page is the place to browse glyphs, not the Index.

## 2. The core masters, re-checked today

The moves in [master-homes.md](../master-homes.md) are done: Card, Content · Stat, Card · with media, Icon + title, Nav item and Sidebar now live in **Elements › Masters**. Instance counts are from today. The other columns are from master-homes.md and [study-sizes.md](../study-sizes.md).

| Master | Node · uses | Verdict | Why |
|---|---|---|---|
| Text styles (8: h1 to h4, body, label, small, code) | local | **Index** | One card shows each style once, with its name |
| Scale (8 modes) · Scheme (4) · Colors | variables | **Index** | One schematic each (see the sketch) |
| Surface (4 vars) | variables | off | Still an experiment ([card-vs-section](../card-vs-section.md)) |
| Button | `23:506` · 297 | **Index** | Default and accent only |
| Review Set | `104:2072` · 247 | **Index** (legend) | It is the approval mark itself |
| Icon.Item Set | `43:6069` · 76 | **Index** | Sizes, framings and the text pairing |
| Icon + title | `100:4360` · 28 | **Index** | The icon-with-text pairing |
| Icon.Title | `110:1776` · 13 | off | Overlaps Icon + title; it is level 2 (header plus Toolbar and Body slots) |
| Card | `16:364` · 434 | **Index** | The one surface |
| Card · with media | `16:374` · 16 | **Index** | Full-bleed image card |
| Content · Stat | `15:131` · 25 | **Index** | Shown as Card content |
| List section | `100:4325` · 10 | **Index** | Shown as Card content |
| Card · Slot | `112:7282` · 32 | off | Wait for question B (a slot or a detached default card) |
| Sidebar · Nav item | `34:486` · 21 · `34:484` · 6 | off | Shown inside the layouts, not on their own |
| App bar | `100:4743` · 31 | **Index** (Mobile) | Exists only on phones |
| Card stack | `100:4291` · 21 | **Index** (Mobile) | The mobile page body |
| Rail + main | `100:5116` · 22 | **Index** (Mobile, 600) | The only layout that is SM-only |
| Three cards (1000) | `100:2189` · 8 | **Index** (Default) | The reference rhythm |
| Nav + main · Text column | `100:2164` · 14 · `100:2115` · 15 | **Index** (Default) | Rail plus main, and the 720 reading measure |
| 1920 Page | `43:8103` · 17 | **Index** (Desktop) | The page shell |
| Sidebar + Main | `100:3511` · 8 | **Index** (Mega) | Proves the max width holds |
| Three cards (1600) `100:3812` · Two cards · Two small cards · Stat tiles `100:5162` · 33 | | fold, then archive | Each is the same Card at a different width |
| Main + Aside · 60 / 40 · Rails both sides · Rail + two cards · Centred column (0) | | off | Level 2; each stays on its size page |
| Navigation · Profile (360) | `98:164` · `98:179` | off | These are example screens, not system parts |
| Templates (Dashboard grid, Article, Form, Filters) | `98:104` … | off | These are outcomes, not system parts ([process.md](./process.md)) |
| Kit test: Section, 1/2/3 column, Text | `180:617` … | off | Waits for approval of [kit-structure.md](../kit-structure.md) |
| Layout.Sidebar · Miller · Miller.Mobile Sets | `34:5646` … | off | Prototypes; they live on Showcase's Click through |
| Layout.Columns.One Set (6 variants) · Layout.ScaleRegions Set | `34:6349` · `34:5871` | **Archive** | Variant sets that work as permutation grids (rules 6 and 13) |
| Res.* Sets (8) · Swap test card `100:5846` · Rail + Main + Rail `100:3553` · Image `48:4583` (0) | | **Archive** | Placeholders, a test, a duplicate and an unused master |
| Specimen · Note · Notes | `111:57` · 103 … | **Archive** after unwrapping | A wrapper that carries no information |
| Card Set · Heading Set · Master 1–6 (Explore, Scale) | | **Archive** with their pages | Failed experiments |

**Result:** 15 masters, 8 text styles and 3 collections go on the Index. Everything else stays on its own page as level 2, or goes to Archive.

## 3. The reduced Index

**Ground:** Colors `light`, with no Scheme mode. **Cards:** Scheme White. **Scale:** 1000 Default on the Root. Each column is 1000 wide, so every atom shows at its true Default size and nothing is scaled. The only scaled items are the wide layouts: `rescale()` to 1000 wide.

```
Root  ≈ 3480 × 2700  (1.3:1)   pad 120 · gap 120 · ground Colors light · Scale 1000 Default
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ Index · one line: "Use only what is here, as instances."  Legend: [Draft][Approved] │
├────────────────────────────┬────────────────────────────┬────────────────────────────┤
│ FOUNDATIONS (1000)         │ ELEMENTS & CARDS (1000)    │ LAYOUTS (1000)             │
│ Scheme · one Card + Button │ Elements · Button default, │ Mobile · a 400 screen      │
│   on White/Light/Prime/Dark│   accent; Review tag ×3    │   (App bar + Card stack)   │
│   (4 across)       ~380    │                    ~260    │   beside 600 Rail + main   │
│ Scale · the same Card at   │ Icons · 6 sizes in a row;  │                    ~720    │
│   400 / 1000 / 3440 (shown │   bare / framed / button;  │ Default · Three cards;     │
│   to scale): pad and gap   │   Icon.Item + label,       │   Nav + main | Text column │
│   change       ~620        │   Icon + title     ~560    │                    ~820    │
│ Text · 8 styles, one line  │ Cards · Card, with media,  │ Desktop · 1920 Page        │
│   each with its name; one  │   Stat, List section, one  │   (rescaled to 1000) ~520  │
│   short "in use" sample    │   Dark card; masonry, 3    │ Mega · Sidebar + Main      │
│                ~760        │   across           ~1000   │   (rescaled)       ~320    │
└────────────────────────────┴────────────────────────────┴────────────────────────────┘
column heights ≈ 1760 / 1820 / 2380 (+ the header) → about 2700 tall, with no big void
```

**One preview per page, and the 9 together are the kit:**

| Preview (lives on its page) | Holds (the minimum) | Its layout |
|---|---|---|
| `.Scheme Preview` (Scale page) | one Card + Button on each of the 4 grounds | one row of 4 |
| `.Scale Preview` (Scale page) | one Card at 400, 1000 and 3440 | one row, real widths scaled to fit 1000 |
| `.Text Preview` | 8 styles, then a short sample in use | one card, then a small card |
| `.Elements Preview` (cut down from `172:516`) | Button ×2, Review tag ×3 | one row |
| `.Icons Preview` (rebuilt on local glyphs) | sizes, framings, pairings | 3 short rows |
| `.Cards Preview` (Elements page) | 5 Cards | 3-column masonry |
| `.Mobile` / `.Default` / `.Desktop` / `.Mega Preview` | the layouts marked Index in §2 | one band each |

**Widths follow [process.md](./process.md):** layouts at 400, 1000 and 1920, and 3440 only for the page shell. The 360, 1600 and 2600 previews stay on their own pages (level 2). Rail + main is the one 600 item, and it sits in the Mobile band.

**Alternative:** 4 columns (Foundations, Elements, Cards, Layouts) at about 4600 × 2000 (2.3:1). That wins if the Layouts column grows past about 3000 tall. Today 3 columns fit the 2:1-to-square range better.

## 4. How an agent reads it

- **Names, shown once.** Each preview's title is the page name, with a NODE hyperlink to that page. Under each row is one `small` caption: the master names and their home, e.g. "Card · Card · with media — Elements › Masters". The caption sits outside the instances, so it never scales.
- **The approval mark is the existing `Review Set` tag** (`104:2072`), one per preview header. The owner flips it. An agent uses instances only from an Approved preview. A Draft preview is visible but is not canon.
- **Lint checks it** (process.md item 10): every Index child is an instance of a local, non-Draft master, and no master appears twice. Zero remote instances is a third check.
- **The text twin is `doc/index.md`.** It is the file process.md called `guidelines.md`; keep one, not both. A read-only `use_figma` script generates its table from the Index (law 7), so nobody types it by hand. Proposed outline:
  1. **What the Index is:** 3 sentences.
  2. **The build recipe:** read the Index; use instances only; override text, images and slots; set Scheme per section and Scale per region; a missing piece is a proposal.
  3. **The table** (generated): category · master · node id · home page › folder · Approved or Draft · what to override.
  4. **Tokens:** which Scale mode on which region, and the 4 Scheme grounds.
  5. **Layouts by tier:** Mobile, Default, Desktop, Mega.
  6. **Level 2, not on the Index:** links to each page.

## Before the build

- **Remote glyphs.** Every icon on the Index today comes from Big Sloppy. To make the Index local, give `Icon.Item Set` and `Icon.Title` local glyphs first, or accept the library as a dependency and write that in index.md.
- **Elements is 2874 × 18633 (1:6.5)** and also breaks rule 12. It is the next page to compact, after the Index.
- **Order (rule 14, one page at a time):** pilot `Index (new)` with the Foundations column only, then the owner reviews it, then add the other two columns.

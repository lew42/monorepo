# Card census (2026-11-12): what the Content slot of Card 8:5 holds

Read-only count of every Card `8:5` instance in the Lew42 Design System file, all pages except the Cut list (46 pages). Purpose: decide which 5 to 10 layouts become real masters.

**Signature** = the Content slot's children in order, one level down plus one more: frames show their children (`Text[T+]`), instances show their component name (`<Button>`), `T` is a text layer, `R` a shape, `+` a run of repeats. Text content is ignored. Re-run the same count by reading `inst.children.find(c => c.type === 'SLOT')` on every instance whose main component is `8:5`.

## Totals

- **1265 instances, 162 signatures.** 1048 of them sit inside another instance (a copy in a page, a preview, a section), so they repeat a master's structure. **217 are authored** (not inside an instance), with 41 signatures.
- The earlier "about 901" is not reproduced: 1265 counts nested copies, and 217 does not.
- Top 5 cover **52%** (653) of all instances, top 10 cover **62%** (782), top 15 cover 69% (870). Of the authored 217: top 5 cover 74%, top 10 cover 82%.
- One-offs (count 1): **67** of 162 signatures (26 of 41 among the authored).

## Top 15 (all instances)

| # | Signature | Count | Name | Example page |
|---|---|---|---|---|
| 1 | `Text[T+], <Button>` | 277 | Basic | 1920 · Desktop (and 24 other pages) |
| 2 | `Text[T+]` | 245 | Text only | Lew42 Design System, Grids |
| 3 | `T` | 51 | Bare text | Images |
| 4 | `<Card header>, <List row>, <Divider>, <List row>, <Divider>, <List row>` | 42 | List panel | Lew42 Design System |
| 5 | `<Image>, <Card body>` | 38 | Media top | Lew42 Design System |
| 6 | `<Card header>, <List row>, <Divider>, <List row>` | 32 | List panel (2 rows) | Lew42 Design System |
| 7 | `<Icon>, Text[T+]` | 32 | Icon feature | 1600 Sections |
| 8 | `Text[T+], Rows[Row+]` | 23 | Rows | Lew42 Design System |
| 9 | `Text[T+], Fields[<.Form field>+], <Button>` | 21 | Form | Lew42 Design System |
| 10 | `T, <Person>` | 21 | Quote | Lew42 Design System |
| 11 | `<Image>, Body[Text]` | 21 | Media top (framed body) | 1600 Sections |
| 12 | `<Card media>, <Card body>` | 21 | Media top (Card media) | Lew42 Design System |
| 13 | `Text[T+], Buttons[<Button>+]` | 18 | Text + actions | Lew42 Design System |
| 14 | `Stats[Stat+]` | 16 | Stat | Lew42 Design System |
| 15 | `<Toolbar>` | 12 | Toolbar | Lew42 Design System |

Grouped into layouts, the top 15 are about eight: **Basic** (1, 2, 7, 13: text, optional icon, optional button or buttons), **Media top** (5, 11, 12: 80), **List panel** (4, 6: 74), **Rows** (8), **Form** (9), **Quote/Person** (10), **Stat** (14) and **Toolbar** (15).

## Surprises

- **13 Cards hold Cards** in their slot (Images, Live previews, Cards · Lists & grids, Cards).
- **No Card holds a Panel** (0 Panel `153:1779` in any Content slot).
- **Four near-identical media layouts** (`<Image>, <Card body>`, `<Image>, Body[Text]`, `<Card media>, <Card body>`, `<Card header>, <Image>, <Card body>, <Card footer>`) differ only in which wrapper they use.
- **51 cards hold a single text layer** (Images page) and **12 hold only a Toolbar**: layers, not cards.
- Cards by page: Pages 169, Lew42 Design System 158, Cards 90, Layouts 80, Scale 76, Live 72.

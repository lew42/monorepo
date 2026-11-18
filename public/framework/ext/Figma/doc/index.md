# The Index page: the design system on one page (2026-11-17)

The [Index page](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=137-725) of Lew42 v2 (`ADpu9u2V0BlEZfR3rrMfER`) is the design system. Reading it is the documentation: every group holds instances of the core masters, in the order you would use them, with a short note where the use isn't obvious. This file is its text twin. The owner's words behind it: [owner-words-2026-11-17-naming.md](./owner-words-2026-11-17-naming.md), sections "~21:20" and "~21:35"; the plan: [next-2026-11-17.md](./next-2026-11-17.md), item 3.

## How an agent uses it

1. Read the [Rules](../readme.md#rules), then this page, then the Index itself.
2. Find the nearest thing on the Index. Duplicate it (or drag a fresh instance from its master) into the Playground or onto your own page.
3. Change it by **swapping**: a Default to one of its size's layouts, a column's Default to a Content or another card, one Content to another. Override text and images only (rule 22).
4. Need structure that doesn't exist (another column, a different stack, text of any length)? **Detach** it (rule 25). Its tokens keep it linked.
5. When it works, move it to its own page. Nothing stays loose outside Root.

## Root

Root `137:725` follows Root layout v2 ([root-spec.md](./root-spec.md)): padding 0, gap and row gap bound to `gap`, no fill, horizontal with wrap, Scale mode **1920 Desktop** (the Index has no size of its own; it sets only the groups' padding and gaps). Its width is fixed at **7594**, so the page is 7594 × 6777 (1.1 : 1). Each group is a tinted folder: Colors `tint`, `section-pad-x`/`-y`, a title equal to its name, then a note.

| # | Group | Node | Holds |
|---|---|---|---|
| 1 | `Index · Sizes` | `294:875` | a "Open a page" line (each size name is a link to its page), then the 8 previews in a wrap frame `Previews` |
| 2 | `Index · Defaults` | `294:1753` | one `X · Default` per main size |
| 3 | `Index · Layouts` | `294:1777` | the basic column layouts, and one card → section example |
| 4 | `Index · Content` | `294:1874` | four 1000 Content masters, in a white `Content card` |
| 5 | `Index · Playground` | `294:1904` | an empty tinted area to try things in |
| — | `Archive` (hidden) | `231:1173` | the old Index (see the end) |

## 1. Index · Sizes

One `.X Preview` per size page, 360 to 3440, in size order. Each preview carries its own Scale mode. The 2600 and 3440 previews are `rescale(0.5)`; the rest are 1:1.

| Instance | Master (page) |
|---|---|
| `294:880` | `.360 Preview` `268:457` (360 XS) |
| `294:951` | `.400 Preview` `265:572` (400 Mobile) |
| `294:992` | `.600 Preview` `264:932` (600 SM) |
| `294:1088` | `.1000 Preview` `260:1260` (1000 Default) |
| `294:1133` | `.1600 · Preview` `276:340` (1600 LG) |
| `294:1335` | `.1920 · Preview` `262:824` (1920 Desktop) |
| `294:1479` | `.2600 · Preview` `263:1396` (2600 XL), half size |
| `294:1623` | `.3440 · Preview` `264:1217` (3440 Mega), half size |

**When a preview changes size,** the rows can go out of balance (on 2026-11-17 the 1000–3440 previews became two-column, about twice as wide). The fix is one call: try every width for the `Index · Sizes` group, simulate the wrap, keep the width with the smallest Root area whose ratio stays between 1 : 1 and 2 : 1, then widen the Playground so row 2 meets Root's edge. Today the rows are 360 · 400 · 600 · 1000, then 1600 · 1920, then 2600 · 3440.

## 2. Index · Defaults

`X · Default` is a white card with corners (padding 32 from `Lew42 v2 · Card`, radius `surface-radius`, `Card shadow`), holding one Content. Each instance sets its own Scale mode.

| Instance | Master | Mode |
|---|---|---|
| `294:1757` | `400 · Default` `251:1730` | 400 Mobile |
| `294:1762` | `1000 · Default` `251:972` | 1000 Default |
| `294:1767` | `1600 · Default` `251:544` | 1600 LG |
| `294:1772` | `1920 · Default` `252:797` (holds `1600 · Content`) | 1920 Desktop |

## 3. Index · Layouts

Bare columns, each holding a smaller Default.

| Instance | Master | Mode |
|---|---|---|
| `294:1781` | `1000 · 2 · Equal` `260:1220` | 1000 Default |
| `294:1792` | `1000 · 2 · Sidebar` `260:1225` | 1000 Default |
| `294:1803` | `1600 · 3 · Equal` `260:699` | 1600 LG |
| `294:1819` | `1920 · 2 · Equal` `252:801` | 1920 Desktop |
| `294:1830` | `1920 · 4 · Equal` `252:820` | 1920 Desktop |
| `294:1869` | `1000 · Default` with radius 0 and no shadow, in the frame `Card → section` `294:1867` with its one-line note | 1000 Default |

The card → section example is rule 15: a flush section is the same Default with radius unbound and set to 0, and its effect style removed. No other override.

## 4. Index · Content

Inside `Content card` `294:1877` (white, Scheme White, Scale 1000 Default, `pad-x`/`pad-y`), so content shows the way it sits inside a Default.

| Instance | Master |
|---|---|
| `294:1878` | `1000 · Content · Text` `260:1188` |
| `294:1881` | `1000 · Content · Text + Media` `260:1192` |
| `294:1887` | `1000 · Content · Stat` `260:1199` |
| `294:1897` | `1000 · Content · 2 · Equal` `260:1210` |

## 5. Index · Playground

`294:1904`: an empty tinted area with one line, "Drag anything here and try it; move it to its own page when it works." Its height matches the Layouts group (2369) and its width fills the rest of row 2 (2158), so the row has no gap on the right.

## The old Index, archived

Moved, never removed, into the hidden `Archive` `231:1173`, inside `Archive · old Index (2026-11-17)` `294:873` with a note: the owner's `Root Column - Sizes` `162:11145` (the old `.1000` and `.400` preview instances), `Icons Preview` `43:7936` and Big Sloppy's `Page Set` `103:25367`. The owner's `image 1` `148:25853` stays where it was, the first child of Archive. The old Root settings, to switch back: fill Colors `tint`, Scale 3440 Mega, padding `section-pad-x`/`-y`, gap `section-pad-x`, horizontal, no wrap.

## Checks (2026-11-17)

- **Lint** on the page (`lint(['0:1'])`): 0 errors, page-root passes. Two warnings, both mode-mismatch: `Index · Sizes` is 7594 wide on 1920 Desktop (it is a shelf of previews that carry their own modes), and the hidden Archive.
- **Screenshots** (rule 18), in the session folder's `shots/` (local only; `**/shots/` is gitignored): Defaults, Layouts and Content at 1:1; Sizes (7594 wide) at 0.34 and the empty Playground at 0.34; the whole Root. No cropped heads, nothing floating, nothing outside Root. Empty space remains beside the 2600 and 3440 previews (about 1000 wide) and under the Defaults and Content groups.

## Not done, and why

- **Elements, Text, Icons and Scale previews are not on the Index.** The brief named the size previews, Defaults, layouts and Content. The Icons Preview still depends on Big Sloppy's glyphs ([index-audit.md](./research/index-audit.md)), so it was archived with the old Index rather than kept. Adding `.Elements Preview` and `.Text Preview` is the next step once they are rebuilt on local masters.
- **No per-preview captions.** A caption above each preview needs a wrapper per preview, so the page names are one line of links above them instead.

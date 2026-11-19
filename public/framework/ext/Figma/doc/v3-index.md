# Lew42 v3: the Index and the size pages (2026-11-19)

**The Index is the design system.** The [Index page](https://www.figma.com/design/JYGQX0WaBO4HcGMZTkL2rx/Lew42-v3?node-id=41-499) holds one `Index Root` with an instance of each size page's Preview, in order: 500, 1000, 1920. Read it in its entirety before building anything (AI page, rule 1). The owner's words: [owner-words-2026-11-18.md](./owner-words-2026-11-18.md), "Text (~01:10 UTC 11-19)".

## One pattern on every size page

This follows the owner's sketch on 500 Mobile. Each page has one Root, in this order:

1. **The size card** (`500`, `1000`, `1920`), a master. Padding `pad`, gap `gap`, fill `fill`, and it sets its own Scale mode. It holds `Default Content` plus a row of two Buttons.
2. **`<size> Preview`**, a master, 1920 wide, Scale Desktop, fill `darken`. It holds the best ~9 things for that size, as instances or detached copies, never masters.
3. **`<size> Layouts`**: full-width containers (column count, distribution, padding, gap, colour), as masters.
4. **`<size> Content`**: content items specific to that size, as masters.

| Page | Root | Preview | Layouts | Content |
|---|---|---|---|---|
| 500 Mobile (the owner's) | `500 Root` `31:871` | `500 Preview` `25:693`: 3 masonry columns. His plain card, image card and dark image card, plus Stats, List, Button Row, Dark, Form and Toggles (his 6 identical copies, each detached and filled with content) | none: one column only | his `500 Button Row` `31:1308` |
| 1000 Default | `1000 Root` `40:7` | `1000 Preview` `40:76`: 2 columns. Default, Image Split, Stats, Form · Dark, 2 Columns, List, Features | `2 Columns` `40:25`, `Image Split` `40:34` | `Features Content` `40:55` (4 tiles, wrapping 2 × 2); his scratch `Content` frame sits last |
| 1920 Desktop | `1920 Root` `41:2` | `1920 Preview` `41:82`: 1 column of full-width layouts. Hero, 3 Columns, Stats band (Dark), Squeeze | `Hero` `41:20` (Photo/Mountains, Dark, scrim), `3 Columns` `41:35`, `Squeeze` `41:78` (content max width = `squeeze`) | none |

**Shared content items** (one column, they work at every size) were added to the owner's `Content` frame on the Content page, after his three: `Icon Item` `37:2`, `Toggle` `37:8`, `Stats Content` `37:11`, `List Content` `37:22` and `Form Content` `37:39`. Each has zero padding, a transparent fill and Fill width, so it drops straight into a card.

## Why these preview layouts

All three Previews are 1920 wide, so they line up on the Index. The column count follows what fits at that size:
- **500:** 3 masonry columns of ~550, so each card is shown near its real width.
- **1000:** 2 columns of ~850, the 960 | 960 halves.
- **1920:** 1 column, because its pieces are full-width bands.

## Names

- **Content:** a zero-padding, transparent building block.
- **Body:** the padded area when a card has a full-bleed image.
- **Layout:** a full-width, multi-column container.

Card vs section stays parked, as the owner asked.

## The content rule, tested while building

The rule "a content master lives on the page of the smallest width it works at" **held**:
- Stats, List, Form, Icon Item and Toggle are one column, so they went to Content.
- The two-column pieces (2 Columns, Image Split, Features) went to 1000.
- The wide bands went to 1920.
- 500 needed nothing new beyond his button row.

**One refinement:** Features also "works" at 500, because it wraps to one column, but its point is the 2 × 2 grid. Read the rule as **the smallest width where it looks as intended**.

## Open

- **Lint:** 0 on every page I touched, except 2 hits inside the owner's own scratch `Content` frame on 1000: an unbound fill and an unbound line stroke. Left as is.
- His `2x H2 Content` is a two-column item that lives on the Content page; by the rule it belongs on 1000. Not moved: it's his.
- Every Root keeps everything in one folder in the swap menu (only top-level frames make folders). Short names inside folders are a later choice.
- **Next steps:** an Icon items page; more ports from the [shortlist](./v3-port-shortlist.md) (dark CTA, prime offer card, quote, footer, phone screen), each into a Preview only if it earns a place.

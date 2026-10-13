# browse.js — history, lessons, reasons

## browse() — what it does

browse(bands, tokens, options) renders `previews()` as a WALL YOU BROWSE: a sticky filter rail beside a wall of bands, one grid per band.

**Example:**
```js
const BANDS = { Surfaces: "card toolbar panel", Data: "table timeline" };
content(){ return this.browse(BANDS, { "--column": "18em" }); }
```

The sibling of `catalog()`. The distinction: a catalog is a rail beside the one child you picked (you're choosing); browse spends the whole width on the set (you're reading it in order). Both draw the same `preview()` cards — there is no second card shape here (RULE#7).

## Options: cap, facets, search

`bands` is an object of `label: "name name name"`, declared once and in reading order. The caller derives its own `children:` from it so no name is written twice.

`tokens` lands on the wall — `--column` is the one that matters, a legibility argument: a thumb is the page at `zoom-25`/`zoom-50`, so the card's width times four (or two) is the width the thing inside it lays out at. `--gap` there is the space BETWEEN bands; the gap between cards is the wall's own 1em, because `--gap` inherits and a band that set it would retune every grid inside it.

**cap:** how many cards to draw before a "show more" control. Default: all of them. `core/Layout` passes 60 — two full rows at 3440 on a 20em column — because a card is a PICTURE, not a live instance.

**facets:** extra rail rows, each read STRAIGHT OFF a child page's own props. No schema and nothing registers: a layout page declares `columns: 2` and a facet named `columns` can filter on it.

```js
facets: [
  { head: "Columns", key: "columns", values: [1, 2, 3, 4],
    label: n => n + " columns" },
  { head: "Tags", key: "tags", all: "Every tag" },
]
```

`values` may be left out for a prop whose values are worth collecting from the wall itself (`tags`, an array). `label` names a value in the reader's words; `match(page, value)` is the escape hatch for a prop that is not a plain equality (a boolean read as two named states).

**search:** extra prop names the search box reads, space separated — the default needle is the card's label, title, description and name.

## Filters default to all

Every facet starts empty, and empty means "everything", so the first thing a reader sees is the whole set and a filter can only take away.

## Bands are declared, never derived

⚠ Two of the four bands on `styles/layouts/` cannot be expressed by reading each child's `group:` — one is made of grandchildren, and one member belongs to another effort — so a taxonomy that cannot express half the wall is not the taxonomy.

## One grid per band

⚠ `previews()` emits one flat run with a full-width heading per group, so a band of one renders a row holding one card. Per band, only a band's LAST row can be ragged.

The heading is the caller's: this returns the row, and a page that wants a title puts one above it.

## rail: false

A fourth, optional key in `options`, for a caller that already has its own filter UI (a sticky tier strip with live approved-counts, say — a search-and-facets rail would be a second, competing one). Skips the sticky rail entirely; the wall still renders byte for byte. Every band's own heading always carries `data-band="<group>"`, rail or none, so a caller with its own strip can scroll straight to one: `$browse.el.querySelector('[data-band="Global"]')`.

See `/layouts/browse/`, 2026-09-18 — the first caller with its own strip.

## Why the heading sits outside the grid

A `.page-previews-group` spans `1 / -1`, which means every track holds an item — so `auto-fit` had nothing to collapse and a five-card band still drew eight tracks, four of them empty. Measured at 3440: 2626px of grid for 1640px of cards. Out of the grid, the tracks collapse and the band fills its row.

## The cap is over the whole wall

⚠ The cap is over the WHOLE wall, not per band: a reader asked for sixty cards, not sixty in each of four bands.

## Show more only when capped

⚠ Only when a cap was asked for. Without one `shown` is Infinity, `held` is 0, and every existing caller draws exactly the markup it drew before.

## Borrowed pages point to their owner

A page and the nav that addresses it. ⚠ `owner/name` BORROWS a grandchild — shown here and never moved, so the OWNING page builds the nav: `nav_for()` addresses a child at its own url, and building these here would point every borrowed card at this page. The borrowed label is the grandchild's own title.

## Rail framework

The rail: a search, one row per band with its count, and a row per value of every facet the caller declared. The rows redraw themselves so the lit one is read off `state` rather than pushed onto the DOM.

`rail` is the framework word now (core/Page/Page.css): the basis, the column, the gap, the pin and the scrollport arrive together, and below 52em of the PAGE — not the window — it becomes a sideways strip on its own line. The four utilities it replaces (`basis flex v gap`) and browse.css's own sticky rule said the same thing in two places.

## Matching facets

Does a page match one facet's value? Empty means everything. The default reads the prop straight off the page — `includes` for an array, `===` for anything else — and `match` is the escape hatch for a prop that is not a plain equality.

## Search finds the card's own words

⚠ The needle is the card's OWN words — never its `textContent`. A card here holds a live render, so its text includes every word inside the thing: searching `mail` matched two layouts that merely contain the word.

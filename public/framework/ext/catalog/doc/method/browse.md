`Page.prototype.browse(bands, tokens, options)` — `previews()` as a wall you browse:
a sticky filter rail beside one grid per band. Patched on by `import`, the
same move [`catalog()`](/framework/ext/catalog/) makes, and called from
`content()` rather than `initialize()` — it adds no child and rewrites
nothing, so there is no reason for it to run early.

```js
const BANDS = {
    Surfaces: "card toolbar panel stats accordion",
    Data:     "table timeline progress pagination crumbs",
};

content(){ return this.browse(BANDS, { "--column": "18em", "--gap": "2em" }); }
```

## The sibling of `catalog()`

The distinction is whether the reader is **choosing from** the set or
**reading it in order**. A catalog is a rail beside the one child you picked,
so it spends the width on that child; browse spends the whole width on the
set. Both draw the same `preview()` cards, and neither invents a second card
shape — RULE#7.

Reach for browse when a tier is a gallery of twenty peers and the reader
arrives not knowing which one they want. Reach for catalog when they will
read most of them, in the order you wrote.

## `bands`

An object of `label: "name name name"`, declared **once**, in reading order,
and the caller derives its own `children:` from it so no name is written
twice:

```js
const names = Object.values(BANDS).flatMap(band => band.split(" "));
children: names.join(" "),
```

A name may be `owner/name` to **borrow a grandchild** — shown on this wall,
owned and addressed by its real parent, so its url and its inbound links are
untouched. `styles/layouts/`'s Words band is six of those.

⚠ **Bands are declared, never derived from each child's `group:`.** Two of
the four bands on `styles/layouts/` cannot be expressed that way: one is made
of grandchildren, and one member belongs to another effort, so its `group:`
is not that page's to set. A taxonomy that cannot express half the wall is
not the taxonomy.

## `tokens`

Applied to the wall. Two matter:

| token | what it decides |
|---|---|
| `--column` | the card's width, which times four (`zoom-25`) or two (`zoom-50`) is **the width the thing inside it lays out at**. A legibility argument, not a taste one. |
| `--gap` | the space **between bands**. The gap between cards is a fixed `1em`: `--gap` inherits, and a band that set it would retune every live render inside it. |

## Band sizes are load-bearing

A band is its own grid and `auto-fit` stretches it to fill the row, so a band
of three on a 2750px wall draws three cards a thousand pixels wide. Size the
bands evenly — `ui/` runs 5, 5, 5, 4 — and the cards come out even too.

## The heading is the caller's

`browse()` returns the row and draws no title. A page that wants one puts it
above the call; `styles/layouts/` does exactly that, because `page full`
zeroes the gutter its own `h1` would otherwise sit in.


## `options` — for a catalogue too big to read in one screen

Three keys, all optional, and a call that passes none renders exactly the markup it always did.
`core/Layout`'s tree of thirty layouts is the caller they were written for; before them it kept
a near-copy of this whole file.

```js
this.browse(BANDS, { "--column": "20em" }, {
    cap: 60,                                   // draw sixty, then offer "show more"
    search: "intro when tags",                 // extra props the search box reads
    facets: [
        { head: "Columns", key: "columns", values: [1, 2, 3, 4],
          label: n => n + " columns" },
        { head: "Tags", key: "tags", all: "Every tag" },
        { head: "Proof", key: "approved", all: "Approved and draft",
          values: ["approved", "draft"],
          label: v => v === "approved" ? "Approved" : "Draft",
          match: (page, v) => (v === "approved") === Boolean(page.approved) },
    ],
});
```

**A facet reads a child page's own prop, straight.** There is no schema and nothing registers: a
page declares `columns: 2` and a facet named `columns` filters on it. Leave `values` out and the
distinct values are collected from the wall itself (an array prop like `tags` is flattened);
give `match(page, value)` when the prop is not a plain equality — a date read as two named
states, say. `label(value)` names a value in the reader's words; `all` renames its
"everything" row.

**Filters default to all.** Every facet starts empty, and empty means everything — so the first
thing a reader sees is the whole set and a filter can only ever take away. The band rows become
the last facet, headed *Band*, and the count beside each row is that facet's own count over the
whole wall.

**The cap is over the whole wall, not per band** — a reader asked for sixty cards, not sixty in
each of four. The control says how many are held back and how many there are; a click adds
another `cap`.

⚠ **A wall with no `options` is byte for byte what it was.** Without a cap, `shown` is
`Infinity`, nothing is held back and no control is drawn; without facets the rail is one search
box and the band rows, with the same button classes and the same *Everything* label. The three
walls that predate this — [`core/Page`](/framework/core/Page/),
[`styles/layouts`](/framework/styles/layouts/), [`ui`](/framework/ui/) — were pixel-checked at
1280 and 3440 for exactly that. (2026-09-06.)

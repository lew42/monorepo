`Page.prototype.browse(bands, tokens)` — `previews()` as a wall you browse:
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

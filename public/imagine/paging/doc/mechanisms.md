# The four mechanisms — what each one actually is

A mechanism is the answer to one question: **what does a click on a child do?** There are
four answers and no fifth. Two of them are core's columns vocabulary said out loud; two of
them never navigate at all, and that split is the whole design.

## `launch` — a child column

The item is an `<a href>` to the child's url. Core does the rest: `/imagine/` is a columns
host, so a page under it lays out as a full-height column to the right of its parent and
every ancestor stays open. Nothing in this module implements it.

**Measured** (`/imagine/paging/mechanisms/launch/`, headless, clicking the first item):

| | 1280 | 3440 |
|---|---|---|
| visible columns, before → after | 4 → 5 | 4 → 5 |
| the parent column's size | unchanged (`dw 0`) | shrank 76px as the row redistributed |
| the row | scrolled 241px to reveal the new column | scrolled 676px |

The parent does not close, does not resize at 1280, and keeps its own state. At 3440 it gives
up 76px because `large` columns share the row — that is the width word negotiating, not the
mechanism.

## `takeover` — `width: "full"`

The same `<a href>`. The difference is one word on the page that opens: `full` is a 100%
basis with a 100% floor, and one `:has()` rule in `Page.css` hides every column left of it
while it is the deepest thing open.

**Measured** (from `/imagine/paging/mechanisms/`, clicking the takeover item):

| | 1280 | 3440 |
|---|---|---|
| columns before | `[211, 535, 535]` | `[432, 1152, 1152]` |
| columns after | `[1280]` | `[3440]` |
| crumb links | 3 → 4 | 3 → 4 |

**Nothing is unmounted.** The ancestors are still in the DOM with their state; only their
layout is gone, and the crumb strip — derived from the page's own `chain()`, so it cannot be
stale — brings the row back exactly as it was.

## ⚠ A child's track is its PARENT's mechanism

That is the whole of how one set of children can be launched *or* taken over:

```js
// paging.js, column()
const drives = parent?.chips?.().includes("mech");
this.width = drives && parent.at("mech") === "takeover" ? "full" : this.declared();
```

Only a parent whose toolbar actually offers the `mech` chips can do it. That guard is
deliberate: the mode is remembered in `localStorage` against the page's url, so a hub that
offered the word could leave a full-screen child behind for the reader's *next* visit. The
`/imagine/paging/` hub therefore declares `axes: "style content"` and no mechanism chips —
its walk items each carry a fixed mechanism instead.

## `expand` — a panel below, in place

No navigation, no url. The item is a clickable span; clicking it sets `this.opened` and
repaints the stage, which draws a `.paging-panel` directly under that item. Everything below
slides down; nothing else on screen moves and no column opens.

**Measured**: visible columns 4 → 4 at both widths, the panel present from the click onward.

## `swap` — the box stays, its content changes

Also no navigation. `this.swapped` names the child; the stage redraws with that child's
title and description where the sample was, plus a back chip.

**Measured** (`/imagine/paging/mechanisms/swap/`, the `.paging-box` watched):

| | 1280 | 3440 |
|---|---|---|
| box moved | `dx 0, dy 0` | `dx 0, dy 0` |
| box height | +29px (the new content) | +93px |
| box text | the sample → "Same box…" | same |

The box does not move a pixel at either width. Its height follows its content, which is what
a box holding different things is supposed to do.

## Why two of them have no url

An expanded panel and a swapped box are **states of one page**, not places. Giving them urls
would mean either a query string the router does not read or a child page that is not a
column — both of which would make `launch` and `expand` the same gesture with different
paint. The honest trade is: no link, no back button, and every panel offers the column as the
way out. If a thing deserves to be linked to, it deserves to be a column.

## Related

- [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns/) — the width words, the crumb strip, the seam
- [`doc/decisions.md`](/imagine/paging/doc/decisions.md) — the record, and what was rejected

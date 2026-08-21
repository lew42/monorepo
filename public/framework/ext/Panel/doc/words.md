# A panel's words — one table, one control surface

A **word** is one key on a panel with a fixed list of choices: `tone`,
`display`, `gap`, `cols`. Every one of them is drawn as a row in the
**properties rail**, from one table — `WORDS` in
[`glyphs.js`](/framework/ext/Panel/glyphs.js). Add a word there and it appears,
in the table's order, with its pictures.

```js
gap: { names: ["0", "0.5em", "1em", "2em"], cols: 4,
       modes: ["flex", "grid"], var: "--panel-gap", knob: true },
```

⚠ **The bar reads none of this since 2026-08-19.** Words used to be drawn twice —
once in a popover on the hover bar, once in the rail — and the `bar:` flag said
how. The sweep took every word off the bar (15 controls to 6, and 365 clipped
popovers to none) and the flag went with it: **the rail is the UI**.
[decisions.md](/framework/ext/Panel/doc/decisions/).

| field | what it says |
|---|---|
| `names` | the choices, in the order they are drawn |
| `pics` | a picture per choice — a set that ships none reads as its own words |
| `cols` | how wide that picker's grid is |
| `toggle` + `pic` | two names, one of which means OFF: ONE button that lights. `names[1]` is the ON state — see below |
| `drop` | `true` draws an `ext/Dropdown` instead of a row — a trigger saying the value's NAME as well as its picture |
| `modes` | the display modes the word is live under; absent means always |
| `root` | the ROOT panel only — hidden on everything with a parent |
| `var` + `css` | the custom property it lands as, and the value map (absent = the word IS the CSS value) |
| `knob` | `true` adds a free-value slider beside the preset row — see below |

## The words

**On the root only:** `mode` (fill · document) — see below.

**Always:** `tone` · `display` · `align` · `position` (rail only) · `pad` (rail only).

**Under `display: flex`:** `dir` (row · col) · `gap` · `wrap` · `justify`
(start · center · end · between · around) · `items` (stretch · start · center · end).

**Under `display: grid`:** `cols` (auto · 1 · 2 · 3 · 4) · `gap` · `dense` (off · on).

A word only appears where its mode makes it real — `live_words(item)` is the
filter, and both hosts iterate exactly what it hands back.

## `mode` — one screen, or a document

A workspace in **`fill`** is one screen its panels divide: split it and the
height you have is halved. In **`document`** it is as tall as its sections and
**scrolls** — a split below *appends* a section instead of dividing anything.
It is the answer to "how do I add sections to a full-screen panel"; the demo is
[`/full/`](/framework/ext/Panel/full/).

The word rides the **root** panel, so it is the one row the rail draws for a
*split* — every other word there belongs to a leaf. Reach the root by **hovering
a seam** (the divider only the split owns — an ancestor stands down for the panel
under the pointer) and clicking `tune` on the bar it reveals.

What `document` means, and all it means:

- the root's column is sized by its rows and the **workspace** scrolls — not the
  page: the workspace keeps the height it was handed (`--panel-height`) and the
  root inside it is the thing that gets tall.
- the root's `dir` reads `col` whatever the split said — a document is rows.
- a section that would **fill** has nothing left to fill, so it takes
  `--panel-section` (16em) as its **floor**. Nothing is written into the tree:
  `divide()` is untouched, and switching back to `fill` puts the rows back on one
  screen exactly as they were. **The mode is a lens.**
- **nothing in a document divides the block axis.** Every stacked panel and every
  panel's own payload takes `flex-basis: auto` (`panel.css`, the last rule), so
  each measures what it holds. The inline axis is untouched — a row of columns
  still divides its width by `grow`.

Measured on `/full/` at 1280×800 — three splits below give four sections of
241px (16em at the fluid base size), `scrollHeight` 963 against `clientHeight`
723, and 4 × 241 = 964. At 400 the sections stack (4 × 224 = 896) with no
horizontal overflow. Back in `fill`: 181 × 4 = 723, no scroll.

**A section grows with its content** (2026-08-19). 16em is a floor, not a height:
a section holding a `hero` band measures 280px, a `pricing` band 450px, and a
rolled layout is as tall as its bands. Measured with fixed seeds, the same
document went from three 241px sections with **55 boxes scrolling their own
content** to 13012/1832/5062 and **0** — which is the whole point of the mode.
A box scrolls only where a height was genuinely chosen (`h: fixed`, or `fill`
mode, where the screen is finite): [sizing](./sizing.md).

## A word with a continuous value has presets AND a knob

`pad` and `gap` (2026-08-19) both carry `knob: true`: a value from `names`
is a preset, but the property means something at any length, so the row also
draws a small slider (0–4em, quarter-em steps) beside the buttons —
`properties.js`'s `knob()`, copied from `ext/layout/controls.js`'s idiom
rather than imported (`ext/Panel` depends on nothing in `ext/layout`,
[`decisions.md`](./decisions.md)) — that writes the **same key** the buttons
do: `item.set("pad", "1.25em")`. Nothing about reading the word changes —
`word_vars()` and `live_words()` read the stored **value**, never an index
into `names`, so a knobbed value that matches no preset paints exactly like
one that does. The button row lights whichever preset equals the stored
value and lights none once the knob has written something off that list.

`pad` has no `modes` (always live — it insets a body's content whatever
`display` draws inside it); `gap` keeps its existing `modes: ["flex", "grid"]`
— it means nothing on a block body, so the knob doesn't change when it shows.

## How a word lands on a body

One custom property, written by **`paint.js`'s `show()`** and nothing else —
the same function that has always been the single writer of the display class:

```
item.set("cols", "3")   →   --panel-tracks: repeat(3, minmax(0, 1fr))
                        →   .panel-body.panel-d-grid { grid-template-columns: var(--panel-tracks, …) }
```

`display.css` reads the property; nothing in the module writes a layout
property on a body by hand. Every fallback in those rules is exactly what the
rule hardcoded before the words existed, and every `Panel.defaults` entry
matches it, so a panel that has chosen nothing draws as it always did —
measured: `gap: 7.52px` (0.5em) in flex, `repeat(auto-fit, minmax(8em, 1fr))`
in grid.

The words are plain keys in `data`, so they persist through the saver exactly
as `display` does, and the six that modify `display` are in `Panel.shared` —
a live duplicate shows the same arrangement.

## Adding a word

1. One entry in `WORDS`, in the order you want the rail to draw it.
2. One default in `Panel.defaults`, matching what the CSS did before it existed.
3. One line in `display.css` reading `var(--your-prop, <the old hardcoded value>)`.

Nothing in `toolbar.js` or `properties.js` changes — unless the word is `root`.
Both hosts stop drawing words the moment a panel is a **split**, and a document
root is a split as soon as it holds two sections, so each host draws the root's
run before that early return: one predicate in `toolbar.js`'s `word_pops()`, one
line in `properties.js`'s split branch. That is the whole cost of `root`, and it
is paid once for every root word there will ever be.

If the word is a `T`-entry
picture, a per-axis control, or writes more than one key, it is **not** a
`WORDS` row — `template`, `w`/`h` and `self` each keep their own two writers
for exactly those reasons.

## Traps

- ⚠ **`--panel-tracks`, never `--panel-cols`.** `--panel-cols` is already the
  pickers' own grid column count, and a custom property written on a body
  **inherits** into every control surface drawn inside it — the properties rail
  is a `T` entry living in a body.
- ⚠ **Every shipped `T` entry wraps its drawing in one div,** so a leaf's flex
  or grid words have exactly one child to arrange. **`cells`** is the exception
  — twelve boxes appended straight to the body — and it is what the demo on the
  [Panel page](/framework/ext/Panel/) uses. The 15 section adapters are still
  one-child bodies; that is open.
- ⚠ **`dir` is one key with two readings** — a split's axis, and a leaf body's
  `flex-direction`. A panel is one or the other and never both.
- ⚠ **Picking `display` rebuilds the bar**, because it is the one word that
  changes which *other* words exist. Nothing else on the bar rebuilds on a
  `change`, by decision.

Verdicts and what was weighed: [`decisions.md`](./decisions.md).
Where a word came from when a preset was sown: [`generator.md`](./generator.md).

## A binary word is one button

The owner, 2026-08-19: *"don't have a Wrap > Wrap/NoWrap drill down, when a
single Wrap with active state would suffice."*

```js glyphs.js
wrap:  { names: ["nowrap", "wrap"], toggle: true, pic: "wrap_text", modes: ["flex"], var: "--panel-wrap" },
dense: { names: ["off", "on"],      toggle: true, pic: "apps",      modes: ["grid"], var: "--panel-flow", css: { off: "row", on: "row dense" } },
```

`toggle: true` means the row draws **one** button, wearing `pic`, lit when the
value is `names[1]`. Clicking flips between the two names. The two names stay in
the table because they are the CSS values `paint.js` writes — the toggle is a
reading of them, not a replacement.

A split's `group` is drawn the same way and is *not* in this table: it is a
leaf-only door (`live_words()` never sees a split) and it reads `grouped()`'s
computed default rather than a stored value, so `properties.js` hand-draws it.

⚠ **Two names is not enough to make a toggle.** `mode` (fill | document), `dir`
(row | col) and `position` (static | absolute) are two *named states* with two
distinct pictures — neither one is "off". They stay picker rows.

## A word with `drop` gets a dropdown

```js glyphs.js
display: { names: Object.keys(DISPLAY), pics: DISPLAY, cols: 3, drop: true },
```

[`ext/Dropdown`](/framework/ext/Dropdown/) draws a trigger showing the current
value's **picture and name**, and a list that opens in the browser's top layer —
so it can never be clipped by the panel, workspace or rail it is drawn inside.

Two words earn it. `template` (which is not in this table — a per-document
vocabulary, 29 entries on this site) because a shelf of that many pictures is a
wall of icons you have to hover to read. `display` because it decides which
*other* words are live, so naming it names the state the rest of the rail is in.

Everything else stays a row of two to nine pictures: positional, and faster to
read than a list you must open. A row of six or fewer is **one line** —
`cols` is sized to `names.length` unless the grid IS a picture (`align` and
`self` are 3×3s and stay 3 wide).

## Item words — one level down (2026-08-19)

A leaf's own words above tune the WHOLE arrangement; a flex/grid CHILD of that
body gets its own row of them — `grow`, `basis`, `order`, `self` under flex,
`span`, `row_span`, `self` under grid. One table, `ITEM_WORDS` beside `WORDS`
in `glyphs.js`, same shape (`names`, `cols`, `modes`, `var`), minus `pics`,
`toggle` and `drop` — every item word is a plain row.

```js glyphs.js
grow: { names: ["0", "1", "2", "3"], cols: 4, modes: ["flex"], var: "--item-grow", default: "0" },
```

**Lands on the CHILD, never the body.** `persist.js`'s `items_apply()` writes
one custom property per picked word straight onto the cell (keyed by its
`data-cell`, or its index where a template stamps none); `display.css` reads
them in one rule block: `.panel-d-flex > *` / `.panel-d-grid > *`.

**`self` is `place-self`, not `align-self` split from `justify-self`.** Flex
has no `justify-self` at all — the shorthand's inline half is simply inert
there, which is cheaper than two properties for the one row.

**Two rows can say "self" at once** — the leaf's own placement (a 3×3 of
seats, `self_words()`) and an item's (`auto · start · center · end ·
stretch`, drawn last). Same tag text, different pictures and values; accepted
rather than renamed, since both are legitimately "self" in CSS terms.

**Selection, not a word table concern:** which cell is being edited lives in
`text.js` (`item_selection()`) — [doc/focus.md](./focus.md).

# A panel's words — one table, two control surfaces

A **word** is one key on a panel with a fixed list of choices: `tone`,
`display`, `gap`, `cols`. Every one of them is drawn twice — once in the hover
**bar** over the panel, once as a row in the **properties rail** — and both
surfaces read the same table, `WORDS` in
[`glyphs.js`](/framework/ext/Panel/glyphs.js). Add a word there and it appears
in both, in the same order, with the same pictures.

```js
gap: { names: ["0", "0.5em", "1em", "2em"], cols: 4, bar: "space_bar",
       modes: ["flex", "grid"], var: "--panel-gap" },
```

| field | what it says |
|---|---|
| `names` | the choices, in the order they are drawn |
| `pics` | a picture per choice — a set that ships none reads as its own words |
| `cols` | how wide that picker's grid is |
| `bar` | the bar's trigger: an icon name, or `true` for "the trigger IS the value". Absent means rail-only |
| `modes` | the display modes the word is live under; absent means always |
| `root` | the ROOT panel only — hidden on everything with a parent |
| `var` + `css` | the custom property it lands as, and the value map (absent = the word IS the CSS value) |

## The words

**On the root only:** `mode` (fill · document) — see below.

**Always:** `tone` · `display` · `align` · `position` (rail only).

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
*split* — every other word there belongs to a leaf. Reach it on the root's own
bar the way you reach any ancestor's bar: **hover a seam**, the divider only the
split owns (an ancestor stands down for the panel under the pointer).

What `document` means, and all it means:

- the root's column is sized by its rows and the **workspace** scrolls — not the
  page: `.panel-workspace` is a size query container, which is what makes
  `100cqb` mean "the visible workspace", and a size container may not be sized
  by its contents.
- the root's `dir` reads `col` whatever the split said — a document is rows.
- a section that would **fill** has nothing left to fill, so it takes
  `--panel-hug` (16em) as its floor. Nothing is written into the tree: `divide()`
  is untouched, and switching back to `fill` puts the rows back on one screen
  exactly as they were. **The mode is a lens.**

Measured on `/full/` at 1280×800 — three splits below give four sections of
241px (16em at the fluid base size), `scrollHeight` 963 against `clientHeight`
723, and 4 × 241 = 964. At 400 the sections stack (4 × 224 = 896) with no
horizontal overflow. Back in `fill`: 181 × 4 = 723, no scroll.

⚠ **A section does not grow with its content, ever.** `hug` never measures, and
a section's body is a size container — measured, `h: hug` on a section holding a
long `toc` is the same 241px, and the body scrolls inside it. A section is 16em
or the length its `h` states.

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

# The layout generator — `space` and `structure`

One seed, two ways to arrive. **`space` draws a picture** of a generated layout
inside one leaf; **`structure(seed)` translates the same layout into real
panels** you can drag, split, resize and keep. Both live in `generate.js`, which
is the only file that knows about both `styles/layouts/space/` and `Panel`.

`space` is one T entry that draws a whole **generated page** in a leaf
panel: `gen(seed)` from
[`styles/layouts/space/`](/framework/styles/layouts/space/) writes a layout as
spec text, `render(text)` turns that into the live view, and the panel keeps
the seed.

```js
space: { icon: "space_dashboard", draw($body, panel){
    $body.append(import("./generate.js").then(m => () => m.generate(panel)));
} },
```

Everything else is `generate.js`'s first forty lines: a screen, a three-control
dial (`‹ #201810 › 🎲`) in the corner, and one `show(seed)` that refills the
screen inside a callback — `render()` builds with bare factories, so anywhere but
a callback it appends to whatever the captor has since become.

## The seed is the whole state

`gen(seed)` is an **address**: the same integer is the same layout forever, in
any browser. So there is nothing to serialise but the integer, and `Panel`
already persists arbitrary keys — `panel.set("seed", n)` writes `data.seed`,
emits `change`, and the root saves:

```json
{ "type": "Panel", "id": "8e6f…", "data": { "template": "space", "tone": "dark", "seed": 201810 } }
```

Verified: a reload comes back to the same layout, and a `divide()` carries the
seed down to the child that inherits the content (`divide` clones `data`). A
panel that has never seen `space` rolls one on first draw and commits it — the
same bargain `scatter()` makes, for the same reason.

## Two sizing rules, both measured

**The panel is a screen.** `.panel-t-screen` scales the layout with
`font-size: clamp(0.5em, 1.5cqw, 1em)`, not `zoom`: every measure a layout uses
is `em` — `--basis`, the pads, the type scale — so one inherited size scales the
whole arrangement, hairlines stay hairlines, and a stretched grid item's `zoom`
would be applied *after* its area was already sized. A 300px panel reads as
roughly a 600px screen; past ~1070px the panel is the screen at 1:1.

**Two definite heights, or the page runs off the bottom.** A generated page is a
`fill` page whose regions scroll *inside* it, and that needs a height it did not
choose. Neither an auto grid row nor `min-block-size` caps one: a `bands` layout
laid itself out 1145px tall in an 820px panel and simply overflowed. Hence both
`block-size: 100cqh` and `grid-template-rows: 100%` on the screen. (`hug` is
handled by `panel.css` rather than here: a hugging body holding a `.panel-t`
scene — which `space` draws — gets `container-type: size` and a declared
`block-size: var(--panel-hug)`, so `cqh` resolves against 16em instead of
falling back to the viewport.)

The dial sits **bottom-right** because `.panel-bar` is a full-width strip
floating over the top of every panel and hit-tests as soon as the panel is
hovered.

## `structure(seed)` — the same layout, as real panels

`parse(gen(seed))` walked once, emitting `Panel`s instead of `div`s. `gen` and
`parse` are both pure, so **the same integer is the same tree, forever** — and
because the result is a detached `Panel`, the two doors already take it:

```js
panel(structure(42));              // one managed leaf → a whole rolled arrangement
sow(item, 42);                     // this panel BECOMES that layout
```

Structure translates directly: a node with children is a split, `v` in its class
list runs it as a column, and `share()` reads the sizing claims. What does not
translate is the leaf vocabulary, and the mapping as built is:

| spec part | panel template |
|---|---|
| `topbar`, `toolbar` | `navbar` |
| `hero` | `hero` |
| `footer` | `footer` |
| `cards` | `features` |
| `tiles` | `logos` |
| `rows` | `changelog` |
| `sections` | `split` — a prose stack, the nearest band |
| `notes` | `testimonials` — the only band whose cards are ragged, which is `notes`'s whole point |
| `menu` | `rail` — **new** |
| `toc` | `toc` — **new** |
| `brand` | `brand` — **new** |

⚠ **This table and `spec.js`'s `PARTS` are one commit-unit.** `notes` was added to
the spec's parts a day before it was added here, and because `paint()` blanks
silently on a name it does not know, a depth roll drew **checkerboard** where a
third of its panels should have been. Nothing logged. The trap was already
recorded in the readme; it cost a real bug anyway, so it is written here too —
beside the table that is the thing you have to remember to edit.

The two vocabularies are of different grain — spec parts are *page furniture*,
templates are *marketing bands* — so rather than stretch one to cover the other,
the panel side grew the three small furniture templates it was missing. They are
the only entries in `T` that exist because something asked for them. (`brand` is
in `PARTS` but `gen()` never rolls one, so it reaches a panel only through a
hand-written spec or the `T` menu.)

### Two rules that had to be invented, both measured

**One share is 8em.** `flex-1` and `--basis:15em` are both claims on a share and
Panel has one currency, `grow`. A fluid track claims eight shares, a fixed track
claims its own measure, and a track claiming nothing takes one. Against the real
thing, a `13em menu / fluid / 16em toc` row lands at 14/69/17% where a 1200px
screen gives 20/60/20 — close, and wrong in the safe direction (a fixed rail is a
*minimum* on a real page and a *fraction* here). The unclaimed `1` is what makes
a topbar read as a band rather than a hairline: `topbar / flex-1 body / footer`
is 1:8:1, so a 40em panel gives the bar 4em.

**A single child is not a split.** The spec nests one box per declaration, so a
rails layout with no menu and no toc is a row inside a row inside a row — three
panels where one belongs. `node()` collapses any node whose translation yields
exactly one child into that child, keeping the outer's `grow`, which is
`Panel.absorb()`'s rule exactly. Seed 48213 went from 5 panels to 3.

### The seed stops being the address

`space` keeps its seed because the picture has no other state. `sow()` keeps
nothing: the moment a layout is panels, it is a tree, and the tree persists like
any arrangement — you can drag a band out of it and the seed would be a lie. The
asymmetry is deliberate, and it is why there are no arrows beside the bar's dice.

### The control: one button, beside the other two structure verbs

`toolbar.js` grew a third icon next to divide-columns and divide-rows —
`space_dashboard`, the same glyph the `space` template wears, because it means
"that, as panels". It is the only body-less control a **split** gets, so a split
is no longer a bar with two buttons on it.

**One rule for which seed it rolls**: a panel showing `space` materializes the
layout it is *showing*; anywhere else rolls a fresh one. So the intended path is
dial → find one you like → dice, and a second dice on the result rolls again.

It is handed in through `T` (`sow:`), like `roll` and `repaint` — `toolbar.js`
still imports nothing of `ext/Panel`. `vocab.js`'s `standard()` withholds it from
a workspace running its own vocabulary, the same predicate that withholds
`random`: a structure roll in `ext/editor` would replace its five regions with
marketing bands.

### Known limits

- **`space` ignores `panel.get("tone")`**, like the three scene templates, because
  a generated page paints its own surfaces.
- **A translated layout does not reflow.** A spec row wraps at 390px; a split
  does not, at any width — so a `rails` tree at 700px keeps its three columns and
  the bands inside them squeeze. That is what a panel *is*, but it means the
  translation is faithful at desktop widths only.
- **`rail` and `toc` centre their contents vertically**, like every other entry in
  the vocabulary. A real rail sits at the top; the panel's own alignment picker is
  the lever, and making these two the exception was not worth the inconsistency.

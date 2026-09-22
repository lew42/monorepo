# background — one div behind your content, swappable in a line

A page wants a hero, a card or a section to have something going on behind it —
a colour, a pattern, a tiled icon, a scattered handful of them, a glow — without
that "something" ever pushing the real content around, or catching a click meant
for a button three layers up. `background(kind, options)` is that one div.

```js
div.c("hero", () => {
    background("dots");
    h1("A real heading, on top");
});
```

## Use

- Call `background(kind)` as the **first** thing you build inside a box — order
  doesn't actually matter for how it looks (`.background` always paints at the
  back, forced there by its own `z-index: 0`), but writing it first is the habit
  that reads true.
- Ten kinds, no images: `ground` `gradient` `dots` `grid` `stripes` `texture`
  `scatter` `blobs` `wave` `spotlight` — see them all, live, with real content on
  top of each one, on this page.
- `background(fn)` — hand it a plain function instead of a kind name and build
  whatever you want inside the layer by hand.

## Watch out

- **Wrap your content, or it can hide UNDER the layer — not over it.** `.background`
  is `position: absolute; z-index: 0`, and CSS paints anything positioned like that
  AFTER (in front of) a plain, unpositioned sibling — even one written later in the
  HTML. A bare `<p>` or `<div>` next to `.background` loses, every time, proven live
  on this page's own wrapper demo. The fix is one class, `.background-content`
  (`position: relative; z-index: 1`), around your real content — [doc/decisions.md
  #2](./doc/decisions.md) has the measurement.
- **A click always lands correctly anyway.** `.background` carries
  `pointer-events: none`, so even the broken-paint case above still lets a click
  through to whatever's underneath — visibility and clickability are two different
  questions here, and only the first one needs the wrapper. [doc/decisions.md
  #3](./doc/decisions.md).
- **The host needs nothing.** `:has(> .background)` gives any box that holds one a
  `position: relative; isolation: isolate` automatically — no second class to
  remember. `.has-background` is the explicit escape hatch for the rare case the
  layer isn't a literal direct child.
- A busy kind (texture, scatter) ships at a low, **measured** opacity so body text
  still reads 4.5:1 over it — the numbers are on this page, in small text under
  every card. Don't raise the opacity without re-checking that number.

## More

- [doc/decisions.md](./doc/decisions.md) — the host contract, the wrapper measurement,
  the click proof, why `em` over a `cqi` container for the texture, and the contrast
  numbers.
- Back to [UI](/framework/ui/).

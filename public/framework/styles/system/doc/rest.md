# The rest of the system

Spacing is the part with rungs. Here is everything else, one line each, with the page that
shows it.

## Type — six levels, never a font-size

You never invent a size. You pick one of six, and each is a class as well as a tag, so
`p.c("h2", "…")` reads as a section title and is still a paragraph.

`h1` · `h2` · `h3` · `h4` · `h5` · `h6` — plus body copy and `code`.

Shown: [/framework/styles/](/framework/styles/) · the reasoning:
[`styles/doc/theme.md`](/framework/styles/doc/theme.md)

## Colour — tokens, and a contrast ratio you can read back

`--prim` `--prim-ink` `--ink` `--subtle` `--surface` `--wash` `--tint` `--line`, plus the
state ramp `--ok` `--warn` `--hot` `--error`, and `--lighten-1/2/3` / `--darken-1/2/3` for a
step off whatever ground you are on.

The one rule: say the ratio out loud for every text-on-ground pair — 4.5:1 carries body text,
3:1 carries large text and UI shapes, below that nothing. `--prim` is a **fill**, about 2.2:1
as text; `--prim-ink` is the one you write words in.

Painted and measured live: [/imagine/design/color/](/imagine/design/color/)

## Layers — four names, declared once

```css
@layer base, theme, site, util;
```

`base` is the reset, `theme` is the default look (and where a component's own rules go),
`site` is `/styles.css`, `util` is the opt-in classes you typed on purpose. That line lives in
`framework.css` and nowhere else; a layer name outside the four lands past `util`, silently.

Shown: [/framework/styles/layers/](/framework/styles/layers/) · the ratchet:
[`styles/doc/cascade.md`](/framework/styles/doc/cascade.md)

## Layout — five words a page is built from

`page` · `rail` · `wall` · `stage` · `solo`, and the tracks a page offers its content
(`main`, `wide`, `bleed`).

[`styles/doc/layout-system.md`](/framework/styles/doc/layout-system.md) ·
seventeen whole-page layouts: [/framework/styles/layouts/](/framework/styles/layouts/)

## The studies behind each piece

- [/imagine/design/size/](/imagine/design/size/) — the size standard: one `--size` knob, the
  three clamps, and the control rule. This is the long form of everything on the system page.
- [/imagine/design/spacing/](/imagine/design/spacing/) — the 2026-09-05 spacing audit that
  set the three clamps' floors.
- [/imagine/design/padding/](/imagine/design/padding/) — padding on its own, and the one rule
  ([one-rule](/imagine/design/padding/one-rule/)): a box that paints its own ground is padded;
  a box that does not, is not.
- [/imagine/design/scale/](/imagine/design/scale/) — how a scale is built and why an even one
  reads as even.
- [/imagine/design/color/](/imagine/design/color/) — the grounds, the inks, the ratios.
- [the spacing census](/framework/ai/2026-09-17/spacing-census/) — every spacing value the
  site declares, counted and classified. The rungs were fitted to it.

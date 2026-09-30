# CSS — review questions

The css skill's rules, worded as questions a reviewer answers yes, no or n/a from the screenshots, `layout.json` or the page's source; the `review` skill asks them. Colour and contrast live here because tokens, light and dark, and the theme are this skill's.

## Spacing and padding

1. At 400, is the padding stacked at the left edge of the first heading and paragraph 3em or less? [css: the padding law] [owner 2026-09-30] [measured: layout.json left_stack]
2. Is no box padded inside a padded box inside a padded box, so nested levels don't add up to a big clunky block? [layout: nesting, grounds and padding] [owner 2026-09-30] [measured: layout.json left_stack.layers]
3. Is padding opted in where needed: a region `.pad`, a framed box `.card`, a deliberate no `.bleed` — and never `.pad` on a card? [css: the one-line rule for which spacing word]
4. Does text never sit at 0 from an edge: the viewport, the nav rail, the ToC column, or any box that paints its own ground? [css: text never sits at 0 from an edge]
5. Does every gap, pad and rhythm come from the spacing clamp (`--pad`, `--gap`, `--flow`, the `--gap-70/50/35/25` rungs), never a constant and never a multiplier? [css: the padding law; layout: spacing is one knob]
6. Does every control (a chip, a button, a nav item) keep its own `em` padding and height, never a spacing clamp or a `vw` value? [css: a spacing clamp is never the size of a control]
7. Does a box with padding also have a different ground, so nothing floats in midair off its siblings' margins? [layout: boxes, padding and contrast]
8. Does a bled container keep `.pad` on the content inside it, so only paint touches the edge? [layout: bleed is for paint]
9. Is every rule inside one of the layers `base theme site util`, with no new layer name and no unlayered rule? [css: 3. layers; CLAUDE.md: traps]
10. Is the CSS as small as it can be: an existing class, token or layout word first, no inline static styles, no class that doesn't exist? [css: write as little new CSS as you can; the ladder]

## Colour and contrast

11. Does body text reach 4.5:1 against its ground, and large text and UI shapes 3:1? [layout: say the ratio out loud]
12. Does accent-coloured text still reach its ratio? [layout: the accent is the pair most likely to fail]
13. Are colours tokens (`--surface`, `--wash`, `--ink`, the lighten and darken steps), never literal colours in a component? [css: ownership, a token override not a new component]
14. Does every box meant to read as a box actually differ from its parent's ground (not `--wash` on the page, which paints nothing)? [css caveats: --wash is the page ground]
15. Does the page work in dark mode as well as light, with `light-dark()` tokens rather than a second theme? [css: ownership, light and dark are modes of one theme]
16. Is every seam where two grounds meet a deliberate choice, reading as one page's sections rather than two pages? [layout: color meets color]
17. Is there one repeated anchor (an eyebrow, a coloured mark) kept identical wherever it appears? [layout: repetition is the strongest tool]
18. Is muted text made with the `.muted` class, never `var(--muted)` as a colour? [css caveats: --muted is a percentage]

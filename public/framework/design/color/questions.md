# Color — review questions

The colour rules, worded as questions a reviewer answers yes, no or n/a from the screenshots, `layout.json` or the page's source; the `review` skill asks them. Moved from `.claude/skills/css/questions.md`'s "Colour and contrast" section.

## Colour and contrast

1. Does body text reach 4.5:1 against its ground, and large text and UI shapes 3:1? [layout: say the ratio out loud]
2. Does accent-coloured text still reach its ratio? [layout: the accent is the pair most likely to fail]
3. Are colours tokens (`--surface`, `--wash`, `--ink`, the lighten and darken steps), never literal colours in a component? [css: ownership, a token override not a new component]
4. Does every box meant to read as a box actually differ from its parent's ground (not `--wash` on the page, which paints nothing)? [color: --wash is the page ground]
5. Does the page work in dark mode as well as light, with `light-dark()` tokens rather than a second theme? [css: ownership, light and dark are modes of one theme]
6. Is every seam where two grounds meet a deliberate choice, reading as one page's sections rather than two pages? [layout: color meets color]
7. Is there one repeated anchor (an eyebrow, a coloured mark) kept identical wherever it appears? [layout: repetition is the strongest tool]
8. Is muted text made with the `.muted` class, never `var(--muted)` as a colour? [color: --muted is a percentage]

# Foundational layouts: stack, columns, split, media, sidebar, three, bands (2026-10-12)

Coded from the Figma page `DS · 4.1 Foundational layouts`. Opt-in like the controls: generated into [`../tokens/tokens.css`](../tokens/tokens.css) by `FigmaTokens.mjs` (the `layouts` list), shown on [/framework/ext/Figma/tokens/](/framework/ext/Figma/tokens/). Every class is `.fig-*`, inside the `theme` layer; nothing global changes.

Put the layout inside any `.fig-lay` (usually the scheme card). `.fig-lay` is a size container, so the layout collapses by its own width, not the window's: under **480 px** of content width every layout becomes one column, the left above the right, and the sidebar rail becomes a wrapping top row.

| Class | Parts | Shape |
|---|---|---|
| `.fig-stack` | | **Reused** — already in the generator; a column with the token gap |
| `.fig-cols` | | label column 170, content fills (title left, content right) |
| `.fig-split` | | two equal columns |
| `.fig-media` / `.fig-media-sm` | `.fig-media-box` | image 160 (or 120) beside text; the box is a square placeholder |
| `.fig-side` | `.fig-side-rail` | rail 200, content fills; rail items stack |
| `.fig-three` | | three equal columns |
| `.fig-bands` | `.fig-head` `.fig-body` `.fig-foot` | full-width bands, no radius; head and foot have the 10% inset ground, body fills |

Gaps and padding are the `--fig-gap` / `--fig-pad-*` tokens; the fixed sizes (170, 200, 160, 120) are the only ones Figma registers.

**Framework class reuse.** `.fig-stack` was already the one stack. The framework's `cols half` / `cols-thirds` / `cols main-aside` ([cols](/framework/styles/layouts/cols/)) are close to split / three / sidebar but wrap by viewport floor (34 rem, 52 rem) and use ratios, whereas Figma's rail and label column are fixed pixels that collapse by container at the phone width; so the `.fig-*` ones are the same ideas on the `--fig-*` tokens, not a replacement. If the two systems merge, `fig-split` = `cols half`, `fig-three` = `cols-thirds`.

Watch out: the media box and rail are the layout only; the Figma uses (docs tree, mail rows) put their own components inside. Bands put no radius on the bands themselves; the demo clips them with the card radius.

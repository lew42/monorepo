# Figma colours: before, after, and the design

**Cause:** the style-system fold (`4c74b6ae8`, `b4514ecd0`…) put `--prime` (our orange `#FF8F60`) and `--dark` (`#42404B`) under pages rebuilt from the Sept-2026 Figma file, whose `prime` is `#72c4ff` and `dark` `#675f56`. The `--bg → --dark` rename itself changed no value (`--bg` is still an alias). **Fix:** `.figma-scheme` on every page below `ext/Figma/` sets the file's own `--prime`/`--dark` (white ink on its prime ground, as drawn). Details: [doc/scheme.md](/framework/ext/Figma/doc/scheme.md).

| Figma frame | Before (orange) | After |
|---|---|---|
| ![](shots/figma-colors.png) | ![](shots/before-colors-1200.png) | ![](shots/after-colors-1200.png) |
| ![](shots/figma-palette.png) | ![](shots/before-palette-1200.png) | ![](shots/after-palette-1200.png) |

Also after: ![](shots/after-typography-1200.png) ![](shots/after-pricing-1200.png)

Not part of this fix (layout, not colour): timeline cards clip at 1200 and hero text spacing is loose.

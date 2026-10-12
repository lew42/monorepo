# Drawing in Figma with `use_figma` (2026-10-12)

`use_figma` runs a Plugin API script inside a Figma file. On the Sept-2026 "Claude test page" (`124:1062`) it drew two 3440×1440 frames entirely from the file's own tokens: v1 `130:1062` (overflows) and v2 `131:1062` (fits).

## The file's tokens (Sept-2026, `QYN0G2URSBHYH5I06MOjxU`)

- **Colors** (one mode): `prime` #72C4FF, `light` #DDDDDD, `dark` #675F56.
- **Text** (modes `Light BG`, `Dark BG`): `text` black 80% / white; `muted` black 55% / white 70%. A frame set to `Dark BG` turns every bound `text`/`muted` fill inside it white.
- **Resolution** (modes `Default`, `Mobile`, `Mega`): `pad-x` 32/16/56, `pad-y` 36/24/64, `gap` 16/14/32, `radius` 4/4/6, `section-pad-x` 48/16/80, `section-pad-y` 120/48/64, `h1-size` 48/32/64, `btn-pad-*`, `small-pad-*`. **Mega is the 3440 mode.**
- **Text styles**: `h1` Montserrat Black (size bound to `h1-size`), `h2` Bold 36, `h3` SemiBold 24, `h4` Bold 14 +7% tracking, `body` Medium 16 / 180%, `code` Consolas Bold 14.
- No paint or effect styles. Every variable has `ALL_SCOPES`.
- The approved stacks (Page 7, `115:2340`) are fill layers: base colour, then a black or white alpha layer (10/25/50%). Dark and prime frames set Text = `Dark BG`.

## The recipe

1. **Inspect**: `getLocalVariableCollectionsAsync()` and `getLocalTextStylesAsync()`, then index both by name.
2. **Bind**: `figma.variables.setBoundVariableForPaint(paint, "color", v)` (it returns a new paint); `frame.setBoundVariable("itemSpacing" | "paddingTop" | "topLeftRadius", v)`; `await text.setTextStyleIdAsync(style.id)`.
3. **Mode**: `frame.setExplicitVariableModeForCollection(collection, modeId)`, for `Text` per ground and for `Resolution` on the root.
4. **Compose**: `figma.createAutoLayout(dir)`, append, *then* set `layoutSizingHorizontal = "FILL"`; wrapping text needs `textAutoResize = "HEIGHT"` first.
5. **Check**: `get_screenshot` with `maxDimension: 2400`; compute each column's used height in the script, since `clipsContent` hides overflow.

## Traps

- **`code` style can't load**: Figma has no Consolas, so `loadFontAsync` throws and the whole script aborts. Code text uses Cousine Bold by hand. The real fix is to change the style's font in Figma (the owner's file; ask first).
- **Wrap rows don't grow their children**: in a `layoutWrap = "WRAP"` row, children stayed at their `minWidth`. Use a plain row with FILL children.
- **3440×1440 is wide, not tall**: v1 stacked its cards and overflowed the bottom; v2 moved them side by side (steps in a 2×2 grid, stacks across the width, type ramp in the rail) and fits.
- Load the `figma-use` skill (MCP resource `skill://figma/figma-use/SKILL.md`) before the first call.

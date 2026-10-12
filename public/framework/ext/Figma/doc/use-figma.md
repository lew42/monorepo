# Drawing in Figma with `use_figma` (2026-10-12)

`use_figma` runs a Plugin API script inside a Figma file. On the Sept-2026 "Claude test page" (`124:1062`) it drew two 3440×1440 frames entirely from the file's own tokens: v1 `130:1062` (overflows), v2 `131:1062` (fits) and v3 `133:1072` (the mode model below). Four layout schemes for preview → detail at 3440 sit below them (A list/detail/inspector, B grid + docked detail, C Miller columns, D filmstrip + detail), and the clickable prototype has its own page.

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

## The mode model: same section, any context (owner, 2026-10-12)

Resolution modes scale every spacing token at once, so a section is built once and placed anywhere:

- **The page root is `Mega`** (3440): section pads 80/64, gap 32, h1 64.
- **A narrow column (nav, rail, inspector) is `Mobile`**: section pads 16/48, gap 14. The same column dropped into a phone frame needs no edits.
- **Every card is `Default`** and pads with `pad-y`/`pad-x` (36/32), wherever it sits. Cards never take the column's mode, which is why card padding stays the same in a rail and in the centre.
- Columns pad with `section-pad-y`/`section-pad-x`; nothing else picks its own number. Use only the approved grounds (white, 10% black inset, prime + 25% black, dark and its 10%/50% stacks); a 4% grey crept in once and the sweep replaced 20 of them.
- **Containers take the context mode; components are always `Default`.** A page, column or phone screen is Mega, Default or Mobile depending on where it sits; a card, row or button sets `Default` on itself, so it keeps one size everywhere. That is the whole system: no new token was needed.
- **A sidebar pads like a card** (`pad-y`/`pad-x`, `Default`), not like a page section. v2's Mega sidebar was too loose, v3's Mobile one cramped; Default at 360 wide sits between them.
- New tokens are a last resort: the set should cover 99% of cases, and a one-off override belongs on the web, not in Figma.

## Fixed sizes are a register, not a habit

Everything hugs or fills unless it is on this list. The node's name carries the reason, e.g. `Nav (fixed 320: rail)`:

| Fixed | Why |
|---|---|
| The screen (3440×1440) | it is the viewport being designed for |
| Nav rail 320, panes 560–1280, inspector 520–560 | a rail or pane holds its width while the centre fills |
| Table columns (except Name) | a column lines up down the grid |
| Search input 640, meter track 240×6 | an input or bar has an intrinsic size |
| Thumbnails, chart plot height | an image box has a height before its content loads |
| Dots and icons (10, 20, 24) | glyph size |
| Row and button min height 44, app bar 56 | touch target |
| Phone 390×844, sheet 420 tall, sheet top radius 16 | viewport; a half-screen sheet; `radius` (4) is too small for a sheet's top corners |
| A component's main width | display only: every instance FILLs |

The Nav link component first had a fixed width and height (a `resize()` after setting the sizing modes resets them to FIXED); it now hugs, and its instances fill and hug.

## Prototyping

The [Claude prototype](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=135-1062) page holds four clickable 3440×1440 screens: Inbox, Sessions grid, Grid + detail, Preview rail. Press Present on the "AI prototype" flow.

- **Navigate**: `node.setReactionsAsync([{trigger:{type:"ON_CLICK"}, actions:[{type:"NODE", destinationId, navigation:"NAVIGATE", transition}]}])`. A row in the grid opens the detail screen, Close returns, and the nav switches screens.
- **Hover**: a component set with `State=Default/Hover/Active` variants, and an `ON_HOVER` → `CHANGE_TO` reaction on Default. Clicks go on a wrapper frame around the instance (`Go · Inbox`), so the instance keeps the hover from its main component.
- **Scroll**: a list that FILLs a fixed-height screen, with `clipsContent = true` and `overflowDirection = "VERTICAL"`, scrolls in Present mode. Figma draws its own overlay scrollbar while scrolling, so a custom scrollbar can't be prototyped.
- `page.flowStartingPoints` names the flow that Present opens.

## The UI Kit (Sept-2026 "UI Kit" page, `126:15264`)

Components, each with text properties (Label, Sub, Meta, Icon) so an instance is filled by `setProperties`, never by editing its text:

- **Row** (`139:1095`): Size Compact or Two-line × State Default, Hover (10% black) or Selected (the prime stack). Icon, label, meta.
- **Tree row** (`139:1120`): Open × State, chevron + icon + label. Nesting is an `Indent` frame whose left padding is `gap`; a leaf hides its chevron.
- **Section header** (`139:1121`): an h4 in prime with the row's side padding.
- **Button** (`139:1132`): Primary (prime stack), Secondary (10% black, works on any ground), Ghost. On a prime ground use Secondary + Ghost: a primary disappears into it.
- Icons are Material Symbols Rounded, typed as their ligature name (`account_tree`).

Five phone screens use only those instances: Lists, Tree in a sheet (split screen: the artboard above, layers in a half sheet, the selected layer outlined in prime), Drill-in (Miller columns on a phone: one column at a time with a breadcrumb), Action sheet, and Grounds (rows and buttons on white, prime and dark). Present opens the "Mobile UI kit" flow; the Layers tab, the back arrow and the first row are linked.

## Slots: containers that hold anything (verified 2026-10-12)

`const k = comp.addComponentProperty('Content', 'SLOT', '')`, then bind a child auto-layout frame: `frame.componentPropertyReferences = {slotContentId: k}`. In every instance that frame is a `SLOT` node, and `slot.appendChild(node)` puts arbitrary content in it. So a card, panel, dialog or sheet is a component with a Content slot, not a frame we detach.

## Links that work in design mode

`text.setRangeHyperlink(0, len, {type: 'NODE', value: nodeId})` links to a frame or a page; `{type: 'URL', value}` to the site. The `Claude · Overview` page (`144:1062`) is an index built this way.

## The site shell, measured

`Claude · Site shell` (`142:1246`) holds the current site sidebar copied at its measured 1920 values (256 wide, rows 31.7 tall, 14.4 px labels, active row = 7% tint + prime icon; source `core/Sidebar/Sidebar.css`) beside the same sidebar from tokens in white (the main site), dark (the dev shell) and the home variant without icons. The kit's Tree row gained `State=Current` (10% inset + prime icon) to match the site's active row.

## Traps

- **`code` style can't load**: Figma has no Consolas, so `loadFontAsync` throws and the whole script aborts. Code text uses Cousine Bold by hand. The real fix is to change the style's font in Figma (the owner's file; ask first).
- **Wrap rows don't grow their children**: in a `layoutWrap = "WRAP"` row, children stayed at their `minWidth`. Use a plain row with FILL children.
- **3440×1440 is wide, not tall**: v1 stacked its cards and overflowed the bottom; v2 moved them side by side (steps in a 2×2 grid, stacks across the width, type ramp in the rail) and fits.
- A glyph outside Montserrat (↳ ✕ ⌕) falls back to Noto Sans Symbols2; any later edit to that frame needs that font loaded too, so load every font with `getRangeAllFontNames` first.
- `getRangeAllFontNames(0, 0)` throws on an empty text (an empty Meta), so skip empty texts when loading fonts.
- Load the `figma-use` skill (MCP resource `skill://figma/figma-use/SKILL.md`) before the first call.

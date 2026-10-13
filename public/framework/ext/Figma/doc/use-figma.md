# Drawing in Figma with `use_figma` (2026-10-12)

`use_figma` runs a Plugin API script inside a Figma file. On the Sept-2026 "Claude test page" (`124:1062`) it drew two 3440×1440 frames entirely from the file's own tokens: v1 `130:1062` (overflows), v2 `131:1062` (fits) and v3 `133:1072` (the mode model below). Four layout schemes for preview → detail at 3440 sit below them (A list/detail/inspector, B grid + docked detail, C Miller columns, D filmstrip + detail), and the clickable prototype has its own page.

## The file's tokens (Sept-2026, `QYN0G2URSBHYH5I06MOjxU`)

- **Colors** (one mode): `prime` #FF6157 (the site's; was #72C4FF until 2026-10-12), `light` #DDDDDD, `dark` #675F56 (the site's is #42404B: open), and `error` #CC0000, `ok` #15803D, `warn` #A16207, added 2026-10-12 to mirror the site's `--error`/`--ok`/`--warn`.
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

## The kit pages (2026-10-12, three Sonnet agents from [the brief](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/brief.md))

- `Kit · Controls` (`145:13667`): Input, Select, Tab, Field, Badge, Tag, Kbd, Toolbar, Crumb, Page, Progress, Avatar, Alert, Tooltip, Segment; 2 phone screens. [report](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/controls.md)
- `Kit · Containers` (`143:1235`): Card (4 grounds, Content slot), Panel, Accordion, Decision, Stat, Timeline, Dialog/Sheet, DataGrid (Table/Rail, one opaque header row, counts as chips, no group rows); 2 phone screens. [report](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/containers.md)
- `Kit · Workflows` (`144:1140`): App bar, Tab bar, Chat bubble, Mic button, Field, Sheet, Popover, Step bar; 13 clickable phone screens for Inbox, Tree, Course/Wizard, Auth, Dictate, Menu, Card. [report](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/workflows.md)

**Values no token gives yet** (all three agents hit them; the candidates for the small rock-solid set): text under 14 px, a hairline border (black 10%), the 50% scrim, a large radius (16) for sheets and round buttons, a stat-number style. Everything else they built came from the existing tokens.

## Schemes, prime and modes, revised (owner, 2026-10-12 evening)

- **Prime is used plain, with dark ink** (about 5:1; white on prime is under 3:1). The 25% black darkening is gone everywhere (46 fills) and no longer an approved stack.
- **A scheme is a Text mode:** `Light BG` (white), `Light gray BG`, `Prime BG`, `Dark BG`. The Text collection now also holds `surface` (the ground), `accent` (prime; dark on a prime ground) and `on-accent` (ink on an accent fill). Bind a container's fill to `surface`, highlights to `accent`, and one master serves every scheme: switch the mode, not the component.
- **Insets are a bare 10% black layer**, never white + 10%, so the same card darkens any ground.
- **Components inherit Resolution; containers set it.** A phone (or a sample) is `Mobile`, a desktop page `Default`. The earlier "components always Default" rule is retired (112 main components cleared).
- **Mobile sections pad with `section-pad`** (Mobile 48 top and bottom, 16 sides): tall phones breathe vertically, horizontal space stays scarce.
- **Edges:** rows that run edge to edge (own side padding = `pad-x`) line up with the heading above; a card that touches the screen edge has no radius; a card with full-width sections has zero padding and each section pads itself.

## The four tiers in the file

1. `Claude · Elements` — mobile element library as a tree: A one column (text, images, overlays, card edges), B two on a row (hug + fill), C three or more (equal shares, wrapping), D nesting & grounds, E progress.
2. Components — `UI Kit`, `Kit · Controls`, `Kit · Containers`, `Kit · Workflows`.
3. `Claude · Stacks` — the `Section` master (fill `surface`, Content slot) stacked into recipes across White, Light gray, Prime, Dark and Mixed.
4. `Claude · Layouts` — 1920 desktop pages from components: the `Site sidebar` component (dark = a mode), Docs on gray and on white, Sessions with the grid, the dev shell.

Clickable flows carry a big ▶ PROTOTYPE badge (Claude prototype, UI Kit, Kit · Workflows). The kit's `DataGrid` exposes only its toolbar chips as a slot; its body rows are not a slot yet, so a layout composes Grid toolbar + Grid head + Grid rows directly.

## The design-system pages (2026-10-12, night; [brief v2](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/brief-ds.md))

The file reads in tier order after the owner's pages: `Claude · Overview` (start here) → `DS · 1 Elements` → `DS · 2.1 Buttons` (the exemplar every page copies) → `2.2 Lists & rows` → `2.3 Cards & containers` → `2.4 Inputs & controls` → `2.5 Status & progress` → `DS · 3 Sections` → `DS · 4 Layouts`; then the kit pages (`UI Kit`, `Kit · Controls/Containers/Workflows`), the `Claude prototype`, and the explorations renamed `Lab · …` (Site shell, Stacks, Elements; `Claude test page` keeps the owner's name).

Every DS page has the same shape: a nav row of links, an accent code, an h1, one gist line, sections of `Specimen` tiles (component `158:1238`: Content slot + Label) on white and on dark, an "In action" row of 390 phone samples, and a dark Rules box.

Colour rule (owner, night): prime is a splash (the one primary button, accent labels, progress fills, active icons), never a ground; selected and current = 10% black inset + accent icon; dark grounds step up with 10% white and down with 10%/50% black. Chip `Selected`, Segment `Active` and the View switch follow it; Panel and Dialog bind their fill to `surface` (white by default via Text mode `Light BG`).

Second and third waves (same night): `DS · 1.1 Icons` (Material Symbols Rounded as ligature text; sizes 16–48; inline icon at the text's line height beats a big icon above, except on cards and images), `1.2 Dark grounds` (dark and near-black ladders, contrast computed per step), `2.6 Dropdowns & menus` (phone: inner scroll, page scroll, bottom sheet; ▶ prototype), `2.7 Toggles, checkboxes & radios` (toggle for one on/off, segments for 2–3 modes, dropdown for more), `4.1 Foundational layouts` (seven layouts, four uses each), `5 Diagrams & charts`. Every interactive kit control has a `Focus` variant (2 px accent ring, offset 2). Reports: [kit/](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/).

## Diagrams from auto layout (DS · 5, verified 2026-10-12)

Design files have no live connectors (`ConnectorNode` is FigJam-only), so arrows are **layout pieces**: a connector frame between cards whose 2 px line FILLs it, an elbow made of two FILL halves with one or two stroke sides, a T piece (top bar of two halves + stem + stubs) for branch and merge. When a card grows, the stack reflows and the line stays joined; each case has a before/after pair on the page. Pieces: `DG Node`, `DG Line V`, `DG Line H`, `DG Turn`, `DG Fan`. Limit: a FILL stub under a short card in a HUG row is not re-measured by the plugin API, so those stubs are sized to the tallest card. Charts: bars FILL a row with data heights, stacked bar shares by `layoutGrow`, donut by `ellipse.arcData`, sparkline as a vector. For free-form charts, the MCP's `generate_diagram` makes FigJam diagrams instead.

## Traps

- **`code` style can't load**: Figma has no Consolas, so `loadFontAsync` throws and the whole script aborts. Code text uses Cousine Bold by hand. The real fix is to change the style's font in Figma (the owner's file; ask first).
- **Wrap rows don't grow their children**: in a `layoutWrap = "WRAP"` row, children stayed at their `minWidth`. Use a plain row with FILL children.
- **3440×1440 is wide, not tall**: v1 stacked its cards and overflowed the bottom; v2 moved them side by side (steps in a 2×2 grid, stacks across the width, type ramp in the rail) and fits.
- A glyph outside Montserrat (↳ ✕ ⌕) falls back to Noto Sans Symbols2; any later edit to that frame needs that font loaded too, so load every font with `getRangeAllFontNames` first.
- `getRangeAllFontNames(0, 0)` throws on an empty text (an empty Meta), so skip empty texts when loading fonts.
- **A removed ground leaves its mode behind**: a frame that once had a prime fill also had an explicit Text mode (`Light BG`) so its ink stayed dark. Removing the fill keeps that mode, so on a dark screen the label still renders dark. When you drop a ground, also `clearExplicitVariableModeForCollection` (the kit Tab bar hit this, 2026-10-12).
- Load the `figma-use` skill (MCP resource `skill://figma/figma-use/SKILL.md`) before the first call.
- **Paint opacity on a variable-bound paint is lost in instances**: `setBoundVariableForPaint` drops `opacity`, and even re-applied it read as 1 inside instances (a 72% scrim rendered solid). Put the translucency on the node (`node.opacity = 0.72`), paint opacity 1.
- **I can't see your page or selection.** `use_figma` runs in its own headless copy of the file (`currentPage` is always the first page, the selection is empty, verified 2026-10-13). To point me at something, right-click it → Copy link to selection and paste the link: its `node-id` is exact.
  - Sharing settings don't change this: `figma.currentUser` and `figma.activeUsers` (other people's cursors and selections) are blocked in `use_figma` ("not a supported API", 2026-10-13). The robot avatar you see is that headless copy joining. The way to share a selection is Figma's **desktop** MCP server: in the desktop app, open a design file, switch to Dev Mode (Shift+D), and press Ctrl+K and search **Enable desktop MCP server** (the old button in the MCP panel became "Connect to AI agent", which only sets up the remote server again; the desktop one serves `http://127.0.0.1:3845/mcp`), add it to Claude Code, and its tools read what you have selected.
  - The API does exist: a plugin that asks for the `activeusers` permission can read `figma.activeUsers`, which gives each person's cursor position, viewport and selection ([ActiveUser](https://developers.figma.com/docs/plugins/api/ActiveUser)). Only the hosted `use_figma` blocks it. There are two routes: the desktop MCP server ([selection-based](https://developers.figma.com/docs/figma-mcp-server/local-server-installation)), or a small plugin you run in your own Figma that sends your page and selection to Claude (the "Talk to Figma" MCP pattern). With that plugin, `figma.currentPage` and `figma.currentPage.selection` are already yours.

# Drawing in Figma with `use_figma` (2026-10-12)

`use_figma` runs a Plugin API script inside a Figma file. On the Sept-2026 "Claude test page" (`124:1062`) it drew two 3440×1440 frames entirely from the file's own tokens: v1 `130:1062` (overflows), v2 `131:1062` (fits) and v3 `133:1072` (the mode model below). Four layout schemes for preview → detail at 3440 sit below them (A list/detail/inspector, B grid + docked detail, C Miller columns, D filmstrip + detail), and the clickable prototype has its own page.

## The design system file (owner, 2026-11-05)

System work (tokens, components) now lives in the **"November 2026"** file (the owner is renaming it "Lew42 Design System"), key `hbolzQ3Xnc78rhxAPj8xK2`. It sits in a project in the only paid team, "Michael's Starter team" (`team::1558244461354989578`, Pro; the other four teams are free Starter). This file *is* the library. Sept-2026 (`QYN0G2URSBHYH5I06MOjxU`) is in the same project and keeps its existing pages; the token tables below describe it.

What the design system file holds:
- **Colors** (1 mode): `prime`, `light`, `dark`, `error`, `ok`, `warn`. `prime`, `light` and `dark` are hidden from pickers.
- **Scheme** (modes White, Light gray, Prime, Dark; roles `text`, `muted`, `surface`, `accent`, `on-accent`): the Sept-2026 `Text` collection, renamed.
- **Resolution** (Default, Mobile, Mega): `pad-x`, `pad-y`, `gap`, `radius`, `btn-pad-x`, `btn-pad-y`, `h1-size`, `small-pad-x`, `small-pad-y`, `section-pad-x` (120/16/80), `section-pad-y` (120/48/64) (the last two copied from Sept-2026, 2026-11-09).
- **Card** (modes Filled, the default, and Flush; variables `card-fill` = Scheme/`surface` or transparent, `card-pad-x` / `card-pad-y` = `pad-x` / `pad-y` or 0): see [Card modes](#card-modes-label-style-the-_claude-frame-and-making-a-card-owner-2026-11-09).
- **Button** (modes Primary, Transparent; variables `fill` = Scheme/`accent` or 10% black, `label` = Scheme/`on-accent` or Scheme/`text`): the button's style, as a mode (see [modes over variants](#modes-over-variants-owner-2026-11-05)).
- **Text styles** `h1`–`h4`, `body` and `label` (Montserrat Medium 16 / 24, on the Button label); **components** Button, Card, Icon button and Page. Masters sit on the root canvas.

### How Claude works in a file (owner's rules, 2026-11-05)

1. **One author frame.** Everything Claude builds goes inside one top-level frame named `Claude · working area`, headed by a `smart_toy` icon (in the file's icon font: Material Symbols Rounded in Sept-2026, Material Icons in the design system file), an h1 "Claude" and a one-line context note. Claude edits only inside it.
2. **Duplicate before editing.** To change something the owner made, duplicate it into Claude's frame and edit the copy. Never edit the owner's nodes in place.
3. **Read before every edit.** Re-read the current page and nodes before each edit; never assume the owner hasn't changed something since the last read.
4. **Explain on the canvas, not in chat.** Every group gets an on-canvas label (h4 kicker + h3 title + one plain-English line: what it is, why it exists, where it goes) and clear layer names (a bad name: "backdrop is review-only"). Chat replies stay short; the canvas carries the explanation. When the owner asks a question or for a status (owner, 2026-11-09, stronger), Claude answers on the canvas **visually**: show what works, what doesn't and how, with real components and small visuals, not text notes to read and not in chat. Text-only note cards were removed from the design system file for this reason. A quick answer is spoken. No long chat replies.
5. **Normal auto-layout frames, never Sections** (see the skill).
6. **Doc and repo edits from a cloud chat** go through a spawned local SDK agent, not the chat running shell commands itself.

### Libraries, teams and files

- A library is just a published file, named by the file name. Publish from that file: Assets → Libraries (book icon) → This file → Publish. It needs a paid team, and the file must be in a project, not Drafts. Unpublish only from the library's own file.
- Drafts are per team. Right-click → Move file in the file browser is how a draft becomes a project file.
- UI kits are on by default in free teams, per file on Pro.
- Modes per collection: Pro 10, Org 20 (raised from 4 on 2025-10-28).
- **Agents can create files** (Figma MCP `create_new_file`).
- The headless `use_figma` copy reports `figma.root.name` as "Document", so it can't read or rename the file. The owner renames files in Figma (the file key and links don't change).
- **Trap: a Card (or any ground) filled with `surface` disappears on a parent of the same mode** (white on white). Give it a hairline (10% black, inside) or put it on a backdrop of a different shade; a card that must sit on a same-mode ground needs the hairline.
- **A new design file in a team gets the 8 Figma UI kits added by default.** Remove what you don't use.
- **Consumer file** ("Library test", `85fN2Vo4ZvuTUukvCc2zfu`, in the Pro team's Drafts): a file that uses the library, to see what a consumer gets. Variables and text styles import fine (published under the old name "November 2026"). Components made after the owner's first publish (which had only the 3 collections and 5 text styles) are not in the library until it is published again; `importComponentByKeyAsync` returns "not found" until then. Republish after adding components.

## The file's tokens (Sept-2026, `QYN0G2URSBHYH5I06MOjxU`)

- **Colors** (one mode): `prime` #FF6157 (the site's; was #72C4FF until 2026-10-12), `light` #DDDDDD, `dark` #675F56 (the site's is #42404B: open), and `error` #CC0000, `ok` #15803D, `warn` #A16207, added 2026-10-12 to mirror the site's `--error`/`--ok`/`--warn`.
- **Text** (modes `Light BG`, `Dark BG`): `text` black 80% / white; `muted` black 55% / white 70%. A frame set to `Dark BG` turns every bound `text`/`muted` fill inside it white.
- **Resolution** (modes `Default`, `Mobile`, `Mega`): `pad-x` 48/16/56, `pad-y` 48/24/64, `gap` 16/14/32, `radius` 4/4/6, `section-pad-x` 120/16/80, `section-pad-y` 120/48/64, `h1-size` 48/32/64, `btn-pad-x/y` 26·16/14·8/24·14, `small-pad-x/y` 12·6/8·4/16·8 (read from the file 2026-10-20). **Mega is the 3440 mode.**
- **Text styles**: `h1` Montserrat Black (size bound to `h1-size`), `h2` Bold 36, `h3` SemiBold 24, `h4` Bold 14 +7% tracking, `body` Medium 16 / 180%, `code` Consolas Bold 14.
- No paint or effect styles. Every variable has `ALL_SCOPES`.
- The approved stacks (Page 7, `115:2340`) are fill layers: base colour, then a black or white alpha layer (10/25/50%). Dark and prime frames set Text = `Dark BG`.

## The recipe

1. **Inspect**: `getLocalVariableCollectionsAsync()` and `getLocalTextStylesAsync()`, then index both by name.
2. **Bind**: `figma.variables.setBoundVariableForPaint(paint, "color", v)` (it returns a new paint); `frame.setBoundVariable("itemSpacing" | "paddingTop" | "topLeftRadius", v)`; `await text.setTextStyleIdAsync(style.id)`.
3. **Mode**: `frame.setExplicitVariableModeForCollection(collection, modeId)`, for `Text` per ground and for `Resolution` on the root.
4. **Compose**: `figma.createAutoLayout(dir)`, append, *then* set `layoutSizingHorizontal = "FILL"`; wrapping text needs `textAutoResize = "HEIGHT"` first.
5. **Check**: `get_screenshot` with `maxDimension: 2400`; compute each column's used height in the script, since `clipsContent` hides overflow.
6. **Edit the master, not the instances** (owner, 2026-10-13). To change something that every copy shows (a colour, a size, a label), edit the main component once, and every instance follows. Never apply the same change as an override on each instance. An instance carries only what makes it different: its Text mode, and its ground bound to a variable. Before you edit, check `instance.overrides`. If a change would add overrides to many instances, it belongs on the main component. The model is Page 7's `The Palette`: one master and four copies (white, gray, prime, dark), and each copy overrides only its mode and its section fills (bound to `light`, `prime` or `dark`).
7. **Colour breakouts are for colour that changes with the ground.** Text sits on a card, the card on a section, and the section on the page. A four-up breakout earns its place where those layers interact: lighten and darken layers, translucent cards, and inks bound to tokens. A fully opaque, fixed card looks the same in every copy. Text on a translucent card needs the right Text mode for the colour that results, so check it on `Colour · Permutations`. A second prime column (prime with white ink, beside prime with dark ink) is a planned option; it would need a new Text mode.

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

**What the pink outline is.** When you select a slot, the pink outline is the slot's *area*, not its content. In `Specimen` the area is the card's inside, after the card's 48 padding (the slot itself has no padding). A small piece of content (a button, a chip) keeps its own size and sits centred in that area, so the outline looks too big. That isn't double padding. So `Specimen` (`287:50406`) has a `Slot` variant (owner question, 2026-10-13):
- `Fill`: the slot spans the card, for rows, cards and phone screens, which FILL it.
- `Fit`: the slot hugs its content, centred, for buttons and chips, so the outline wraps what's inside.

417 instances whose content was all narrower than the slot were switched to `Fit`. Slots never clip (`clipsContent = false`).

### Slot, property, swap or variant: which one (owner's question, 2026-10-13)

A slot does **not** detach anything. The instance stays linked to its main component, and only what is inside the slot belongs to that one instance. Put instances of other components in the slot and they stay linked to *their* masters. So a template with a slot keeps updating everywhere except the hole.

| The part… | Use | Example |
|---|---|---|
| is the same in every use | leave it in the main component | site nav, footer, page padding |
| differs only in words or on/off | a TEXT or BOOLEAN property | page title, subtitle, "show breadcrumb" |
| is one of a small, known set | a VARIANT (style or state) or an INSTANCE_SWAP (pick one thing from a list) | icon, size (a colour or style switch is a mode in the design system file, not a variant) |
| is open-ended content | a SLOT, filled with instances of small components | a page body, a card body, a dialog body |

A page is a `Page` template: its nav, title and footer live in the main component, and its body is a `Content` slot holding Card, List and Section instances. Don't make a variant per page. That means editing the main component for every new page, which is the awkward loop. A variant is for a handful of styles, never for content.

### Design system file: Card, Button, Page and the slot rules (owner, 2026-11-05)

Decisions:
- **No text properties on components.** With placeholder text, a plain override is fine and a property is just more to manage. Keep component properties for real toggles and swaps. (This supersedes the TEXT-property rows in the table above and the kit's Label/Sub/Meta properties for new work in the design system file.)
- **Card is a thin shell:** a padded `surface` (its fill and padding bound to the **Card** collection) with one `Content` SLOT. Its default content (kicker, title, body, Button) is starter content only; the Kicker/Title/Body/Show toggles were removed.
- **Master components live on the root canvas, not nested in frames.** A nested master loses its purple component label, which the owner wants visible. Only main components get that label; instances get none (owner finding, 2026-11-09), so keeping *pieces* loose on the canvas gains nothing, and frames are fine for them.
- **Button is one component again** (the `Style` variant set is gone): its look comes from the **Button** variable collection, modes Primary and Transparent ([modes over variants](#modes-over-variants-owner-2026-11-05)). Transparent is a 10% black fill with a `text` label and works on any ground.
- **Page** (owner-built, file `hbolzQ3Xnc78rhxAPj8xK2`): a wrapper frame (no padding, gap bound to `gap`) holding a Toolbar row of Transparent-mode buttons, then a Card instance.

How a slot behaves in copies (verified by the owner by testing):
1. Anything in the master outside the slot (toolbar, fill, radius) always propagates to every copy.
2. Slot contents and their order follow the master until you add, remove or reorder items in that copy's slot. After that, the copy's list is its own and stops following.
3. Overriding the slot node's own properties (for example a bigger corner radius on the slot in a copy) does **not** break that: contents and order still follow the master. This holds through nesting (a slot inside a Card instance inside the Page).
4. So shared chrome (toolbars, headers, footers) goes in the master around the slot; the slot holds only what changes per page.

Icons in the design system file (2026-11-05): they use the **Material Icons** font (filled), the same set the site loads, not Material Symbols (Sept-2026's icon font). New component **Icon button**: square, padding `small-pad-x` (12) on the sides and `btn-pad-y` top and bottom (so it matches the Button's height; was `small-pad-x` all round, 48×48), a 24 px glyph in `text`; it binds the same `fill`/`label` variables as Button and sets Button mode Transparent on its main, which its copies inherit; change the icon by typing its name into the `Icon` layer. `small-pad-x` / `small-pad-y` (12/8/16 and 6/4/8 for Default/Mobile/Mega) were copied into Resolution from Sept-2026. The Page toolbar is now `arrow_back` on the left, `share` and `more_vert` on the right.

Open: should Page wrap a Card instance (one extra layer, lets things sit outside the card) or be flat, the surface itself?

#### Component or plain frame? (open, raised by the owner 2026-11-09; shown on the canvas)

With padding, gap and colours tokenized, a container like a card may not need to be a component: a plain frame bound to the tokens is easier to edit (no slot to fill). Claude's suggestion, **not decided**: components for small repeated pieces that must stay in sync (Button, Icon button, a toolbar); plain frames for free-form containers. This puts the earlier "Card: a thin shell with one Content slot" choice in question. The owner leans towards components plus slots ("try them until there's a reason not to"), so the Card stays a component for now; the Flush mode below covers the nested-card case.

#### Modes over variants (owner, 2026-11-05)

A colour or style switch is a **variable mode**, not a variant: `Scheme` for grounds, `Button` (Primary, Transparent) for button style. Use a variant only when a named setup changes many things at once. Why: variants don't inherit from each other, and making one variant a child of another means wrapping a component in an instance of another, which gets tricky. Removing the Style variant set from Button is the worked example.

#### Rebasing a component, and the zero-config root (owner, 2026-11-05)

- **Rebasing:** duplicate a component, detach it, and make a new component from it under a new name. It no longer inherits from the base (it is not a live template).
- **Under consideration, not decided:** keep a master's root layer zero-config (no fill, radius, clipping) so a duplicate-and-rebase inherits exactly what the master did. The cost is one extra layer that agents must remember to put things inside.

#### Where masters go as the library grows (owner, 2026-11-05)

Masters on the root canvas will sprawl. The likely fix is **one library page per component family**: the Assets panel groups library components by page, then top-level frame, so the library pages become the sections of the drag-and-drop toolbox ([builder.md](./builder.md)). Not built yet; the owner wants to see a consumer file first, and that drives the structure (see the consumer-file note above). A drag-and-drop test went on the canvas (2026-11-09): **A)** pieces loose on the root canvas against **B)** pieces in a toolbox frame (tidy, can match a column's width and mode). Result: only main components carry the purple label, so A gains nothing; frames are fine. The Drag-and-drop frame is a toolbox plus a 400-wide Mobile drop zone (Light gray, Resolution Mobile, `pad-x` / `pad-y`).

#### Card modes, `label` style, the `_Claude frame`, and making a card (owner, 2026-11-09)

- **Card modes, no variants.** The **Card** collection has modes **Filled** (default) and **Flush**. Flush is no fill and no padding, for content inside a parent that already pads; same component, still linked. **Trap:** a nested Card inherits its parent's Card mode unless you set the mode on the nested Card itself.
- **Inline items in a row share one height** (owner rule; mismatched heights look wrong). The `label` text style (Montserrat Medium 16, line height 24) is on the Button label, and Button and Icon button both pad with `btn-pad-y`, so each is 2×`btn-pad-y` + 24 tall: 56 Default, 40 Mobile, 52 Mega.
- **`_Claude frame`** (component; the `_` prefix hides it from publishing): a robot header plus a `Content` slot, `section-pad` padding, Scheme Light gray. `Claude · working area` and the Drag-and-drop frame are instances of it, so their look changes in one place.
- **White is for actual cards** (owner rule): containers go a touch darker (Light gray), to avoid white, gray, white back and forth.
- **Blocks dropped into a card (a stat, rows) use a 10% black fill, not white**, so they show on any card and any Scheme.
- **Layers panel:** a layer with several explicit modes shows one mode chip plus "+1".
- **Make a new card** (a workflow now on the canvas): 1) copy a Card (Alt-drag, or from Assets); 2) fill its slot with blocks; 3) pick a Scheme; 4) pick a Resolution (Mobile for phone width); 5) blocks inside use 10% black.
- **Open, not decided:** card widths (about 400 for a phone, about 500 a good desktop default, 800 too wide), so maybe a min and max width per Resolution; responsive wrapping in Figma isn't worth much effort yet. "Section", to the owner, means a full-width, full-height block.

#### Grid auto layout: equal-height cards that adapt (verified 2026-11-05)

Set `frame.layoutMode = 'GRID'`, then `gridColumnCount` / `gridRowCount`, `gridColumnSizes = [{type:'FLEX', value:1}, …]` and `gridRowSizes = [{type:'HUG'}, …]`; bind `gridRowGap` / `gridColumnGap` to `gap`. The grid frame has a fixed width and HUG height; its children get `layoutSizingHorizontal` and `layoutSizingVertical` = `'FILL'`. Each row takes the tallest card's height and every card in it fills: making one card's text longer grew all three from 346 to 520. **Trap:** append the children *after* setting `layoutMode = 'GRID'`; children already in the frame kept one row each. Re-append them to re-flow. **Second trap (2026-11-09):** a grid child that is a *wrapper* (caption + card) with the card set to FILL vertically collapses, because the HUG row measures the wrapper's content as near zero. Fix: give captions and cards their own grid rows (row 0 captions, row 1 cards, …), each child FILL; the cards then get full height and equal heights per row. This replaces the "tallest hugs" and "fixed row" workarounds in [figma-layout.md](./figma-layout.md).

Removing boolean component properties (Show kicker, Show button) made every previously hidden layer visible again in all copies; re-hide or delete those layers afterwards.

A worked example: `Kit · Slots vs components` (`238:30989`) builds the same card three ways and a nested Site template > Section template navigation system with a clickable prototype: [report](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/slots.md).

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
- **`figma.combineAsVariants()` makes a real component set without the purple dashed border** Figma's UI adds, so it looks like a plain frame (2026-11-05). Add it in the script: `strokes` #9747FF, `dashPattern` [10, 5], `strokeWeight` 1, `cornerRadius` 5.
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
  - **Connected 2026-10-13.** Turning it on is a checkbox in Ctrl+K. Then `claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp` (local scope). It is the "Figma Dev Mode MCP Server", read-only, with six tools: get_design_context, get_metadata, get_screenshot, get_variable_defs, get_figjam and get_motion_context. Calling get_design_context with no nodeId reads your live selection and answers "Nothing is selected" when there is none. Writes still go through the remote `use_figma`.

## Swapping text for components in bulk (2026-10-13, [icon swap](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/icon-swap.md))
- **Expose, don't delete overrides**: a main's text that instances override (an icon name) becomes an `Icon` instance with `isExposedInstance = true`; each instance's old text value is restored through `node.exposedInstances` and `setProperties({'Icon#229:0': glyphId})`. Delete the text's component property only after that.
- **Prototype reactions on inner nodes are deleted with the node**: a reaction on an instance's inner text (`I123;456`) lives only as an override. Before removing a main's text, collect reactions on every node whose id contains `;` and ends with that text's id, and re-apply on `host;newInstanceId`. Count reactions per page before and after (UI Kit and Workflows lost some until this was added).
- **A hidden icon instance has no children**: overrides on an instance whose icon is toggled off can't be restored (harmless).
- `figma.setPluginData` is unsupported; use `setSharedPluginData(namespace, key, value)` to keep a long script body in the file and run it with `new AsyncFunction(...)`.
- A `use_figma` return over 20 KB is rejected: slice lists. A script that throws commits nothing, so pre-check every value first.
- Glyph components must exist (created in an earlier call) before they can be instanced.

## One master, four schemes (owner, 2026-10-13)

Page 7 shows the pattern the owner wants for libraries. `The Palette` (`112:12899`) is a single master component holding every specimen. It is placed four times: on white (the master itself), on light gray (instance `112:14443`, Text mode Light gray BG), on prime (instance `112:12900`, Text mode Prime BG) and on dark (instance `112:13671`, Dark BG). Edit the master and all four update. Use this wherever colours stack and contrast matters, for example a section ground with opaque cards on it. Single cards that don't stack colours don't need four copies.
- The old blue (`#72c4ff`, 123 fills and 9 strokes) now binds to `accent`. It reads as prime on white, gray and dark, and as the dark colour on the prime copy, so nothing turns prime-on-prime.
- Still blue: two agent-avatar colours (`#8068d8`, `#527ec5`) inside the `Section · darken` instance on the same page. They are identity colours, not the scheme, so they were left as they are.
- **When to use four copies, and when to use the permutation page** (2026-10-13). A card with a fixed fill looks the same in all four copies, so the four-up view only helps where colours adapt to the ground. For "which colour on which", use `Colour · Permutations` (page `218:1062`). It shows every ground × ink and every card × ground, with WCAG contrast computed by the script that drew it, graded AAA / AA / Large / Decorative / Invisible. Build the real design once, in one scheme.
- **`figma.createFrame()` gives a WHITE fill when the frame is created unparented** (our scripts do this); frames the owner draws inside another frame in the UI don't necessarily have one (corrected 2026-11-05). A wrapper made only for layout (Tiles, Specimens, rows, columns) must be given `fills = []` straight away. Otherwise every grouping frame paints a white box behind cards that already have their own grounds, which the owner had to remove by hand on the DS pages (2026-10-13). A frame gets a fill only when it is meant to be a ground.

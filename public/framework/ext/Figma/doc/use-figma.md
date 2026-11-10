# Drawing in Figma with `use_figma` (2026-10-12, condensed 2026-11-09)

`use_figma` runs a Plugin API script inside a Figma file. The current file is the design system file below; the Sept-2026 file (`QYN0G2URSBHYH5I06MOjxU`) is an archive of the first pass (page map: its `Claude · Overview` page). Sections that only described Sept-2026 pages (UI Kit, kit pages, site shell, DS pages, the mode model, the fixed-size register) were cut on 2026-11-09; git history has them.

## The design system file (owner, 2026-11-05)

System work (tokens, components) lives in the **"November 2026"** file (the owner is renaming it "Lew42 Design System"), key `hbolzQ3Xnc78rhxAPj8xK2`. It sits in a project in the only paid team, "Michael's Starter team" (`team::1558244461354989578`, Pro; the other four teams are free Starter). This file *is* the library. Sept-2026 is in the same project and keeps its pages.

What the design system file holds:
- **Colors** (1 mode): `prime`, `light`, `dark`, `error`, `ok`, `warn`. `prime`, `light` and `dark` are hidden from pickers.
- **Scheme** (modes White, Light gray, Prime, Dark; roles `text`, `muted`, `surface`, `accent`, `on-accent`): the Sept-2026 `Text` collection, renamed.
- **Resolution** (Default, Mobile, Mega, Compact): `pad-x`, `pad-y`, `gap`, `radius`, `btn-pad-x`, `btn-pad-y`, `h1-size`, `small-pad-x`, `small-pad-y`, `section-pad-x` (120/16/80), `section-pad-y` (120/48/64) (the last two copied from Sept-2026, 2026-11-09). **Compact** (pad 24, gap 12, btn 16/10, h1 40, small-pad 8/4, section-pad 48) is for dense desktop grids; Mobile is only for previewing phone width.
- **Card** (modes Filled, the default, Flush, Shell and Inset; variables `card-fill` = Scheme/`surface` or transparent, `card-pad-x` / `card-pad-y` = `pad-x` / `pad-y` or 0, `card-gap` = 0 in Shell, else `gap`): see [Card modes](#card-modes-label-style-the-_claude-frame-and-making-a-card-owner-2026-11-09).
- **Button** (modes Primary, Transparent; variables `fill` = Scheme/`accent` or 10% black, `label` = Scheme/`on-accent` or Scheme/`text`): the button's style, as a mode (see [modes over variants](#modes-over-variants-owner-2026-11-05)).
- **Text styles** `h1`–`h4`, `body` and `label` (Montserrat Medium 16 / 24, on the Button label); **components** Button, Card, Icon button, Page, Card header, Card media, Card footer, Icon item, Section, `_Claude frame`, Image and Avatar (see [componentize](#componentize-almost-everything-that-has-a-name-owner-2026-11-09-later)). Masters sit on their family page in a board.

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
- **Second consumer file** "Claude November 2026" (`woCZQDoXKJW3GcJPZukW7f`, Pro team Drafts, 2026-11-09): built only from library variables and text styles (`importVariableByKeyAsync` / `importStyleByKeyAsync`); waiting on a publish for the components. "Library test" is the earlier test.

## Resolution modes, in practice (owner, 2026-11-09)

- **Leave pieces at Default.** A piece takes the Resolution mode of the frame it is dropped into, so set a mode on a container only when the container needs it.
- **Mobile is only for previewing phone width (400).** Compact is for ~300 px cards and dense grids. At 3440 a main content area may use **Mega**; sidebars stay Default.
- Standard widths: 400, **1920 (the default for everything, including HD video and slides)** and 3440. Use FILL plus a max width (a page's content area is FILL, max 1600), not fixed widths.
- **Fixed sizes are the exception, named in the layer** (`Nav (fixed 320: rail)`): a viewport, a rail that holds its width while the centre fills, a table column, an input with an intrinsic size, an image box before it loads, glyph sizes, a 44 px touch target. A component's main width is display only: every instance FILLs. A `resize()` after setting sizing modes resets them to FIXED.
- New tokens are a last resort: the set should cover 99% of cases, and a one-off override belongs on the web, not in Figma.

## The recipe

1. **Inspect**: `getLocalVariableCollectionsAsync()` and `getLocalTextStylesAsync()`, then index both by name.
2. **Bind**: `figma.variables.setBoundVariableForPaint(paint, "color", v)` (it returns a new paint); `frame.setBoundVariable("itemSpacing" | "paddingTop" | "topLeftRadius", v)`; `await text.setTextStyleIdAsync(style.id)`.
3. **Mode**: `frame.setExplicitVariableModeForCollection(collection, modeId)`, for `Scheme` per ground and for `Resolution` on the root.
4. **Compose**: `figma.createAutoLayout(dir)`, append, *then* set `layoutSizingHorizontal = "FILL"`; wrapping text needs `textAutoResize = "HEIGHT"` first.
5. **Check**: `get_screenshot` with `maxDimension: 2400`; compute each column's used height in the script, since `clipsContent` hides overflow.
6. **Edit the master, not the instances** (owner, 2026-10-13). To change something that every copy shows (a colour, a size, a label), edit the main component once, and every instance follows. Never apply the same change as an override on each instance. An instance carries only what makes it different: its Scheme mode, and its ground bound to a variable. Before you edit, check `instance.overrides`. If a change would add overrides to many instances, it belongs on the main component. The model is one master placed on the four Scheme grounds (white, light gray, prime, dark), each copy overriding only its mode.
7. **Colour breakouts are for colour that changes with the ground.** Text sits on a card, the card on a section, and the section on the page. A four-up breakout earns its place where those layers interact: lighten and darken layers, translucent cards, and inks bound to tokens. A fully opaque, fixed card looks the same in every copy. Text on a translucent card needs the right Scheme mode for the colour that results, so check it on `Colour · Permutations`.


## Prototyping (API, verified Sept-2026)

A clickable prototype is reactions on nodes; press Present on a flow.

- **Navigate**: `node.setReactionsAsync([{trigger:{type:"ON_CLICK"}, actions:[{type:"NODE", destinationId, navigation:"NAVIGATE", transition}]}])`. A row in the grid opens the detail screen, Close returns, and the nav switches screens.
- **Hover**: a component set with `State=Default/Hover/Active` variants, and an `ON_HOVER` → `CHANGE_TO` reaction on Default. Clicks go on a wrapper frame around the instance (`Go · Inbox`), so the instance keeps the hover from its main component.
- **Scroll**: a list that FILLs a fixed-height screen, with `clipsContent = true` and `overflowDirection = "VERTICAL"`, scrolls in Present mode. Figma draws its own overlay scrollbar while scrolling, so a custom scrollbar can't be prototyped.
- `page.flowStartingPoints` names the flow that Present opens.

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
- **Masters live on their family page, in one auto-layout board** ([structure](#where-masters-go-as-the-library-grows-owner-2026-11-05)), so they no longer sprawl or overlap on the canvas. The earlier "root canvas, not nested in frames" rule is retired: only main components get the purple label and instances get none (owner finding, 2026-11-09), so a board costs nothing.
- **Masters carry as little configuration as possible** (owner, 2026-11-09, asked to be written down): no explicit modes on a master, so it renders in the defaults (White, Default resolution, Filled); copies set modes only where they differ. Don't switch masters to Mobile; Default padding is the default.
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

Masters on the root canvas will sprawl. The likely fix is **one library page per component family**: the Assets panel groups library components by page, then top-level frame, so the library pages become the sections of the drag-and-drop toolbox ([builder.md](./builder.md)). **The structure** (owner, 2026-11-09 night; replaces the evening's Foundations/Pages/App plan, whose Input, Select, Toggle and page and app builders are still to build): the library file (to be renamed "Lew42 Design System") has these pages, in order: **Page 1** (Claude's working area and the drag-and-drop frame), **Index**, **Components**, **Cards**, **Layouts**, **Images**, **Claude · Sandbox**. The Assets panel groups components by page, so the family pages become its sections. Other files turn the library on and drag pieces in.
- **Each family page has one auto-layout board `<Family> · main components`** holding its masters, each with a caption (name plus one line). Components: Button, Icon button, Icon item. Cards: Card, Card header, Card media, Card footer. Layouts: Section, Page, `_Claude frame`. Images: Image, Avatar.
- **Board trap:** a board set to Scheme Light gray turns a default-config Card light gray, so it vanishes. Boards use the plain `Colors/light` primitive as their fill, with no explicit Scheme mode; masters then show in their default White.
- **Index page:** one copy of each core piece per family, with the page it lives on. To jump to a definition: right-click, Main component, Go to main component (a layer link cannot point to a whole layer).
- **Drag-and-drop frame** (Page 1): a toolbox plus two drop zones, **Mobile 400** (Resolution Mobile) and **Desktop column 600** (Default). The 2026-11-09 test (A: pieces loose on the canvas, B: pieces in a toolbox frame) showed a frame costs nothing.

#### Card modes, `label` style, the `_Claude frame`, and making a card (owner, 2026-11-09)

- **Card modes, no variants.** The **Card** collection has modes **Filled** (default), **Flush**, **Shell** and **Inset**; same component, still linked.
  - **Flush:** no fill, no padding, for content inside a parent that already pads.
  - **Shell:** fill, no padding, clips; it holds sections. The `card-gap` variable (0 in Shell, else `gap`) is bound to the Card slot's spacing, so sections sit flush in a Shell.
  - **Inset:** padding, no fill; that is a section.
  - **Trap:** a nested Card inherits its parent's Card mode unless you set the mode on the nested Card itself.
- **Default padding (48) on ~300px cards is far too much** (owner): put fewer per row, or use the **Compact** Resolution mode. Mobile mode is only for previewing phone width.
- **Card parts are components** (2026-11-09, later): **Card header** (10% black band, `pad-x` sides, Content slot), **Card media** (full-bleed image area, 200 tall), **Card footer** (top hairline, the Scheme `surface` fill so it matches a Card it sits in and still shows on its own, right-aligned Content slot for buttons), **Icon item** (an icon plus a name) and **Section** (Icon item kicker, title, a description you hide when not needed, Content slot; master `clipsContent` off). The Icon item is the context header above content, instead of a small kicker line. Every section, status tile and workflow step in `Claude · working area` is a Section or Card instance.
- **Inline items in a row share one height** (owner rule; mismatched heights look wrong). The `label` text style (Montserrat Medium 16, line height 24) is on the Button label, and Button and Icon button both pad with `btn-pad-y`, so each is 2×`btn-pad-y` + 24 tall: 56 Default, 40 Mobile, 52 Mega.
- **`_Claude frame`** (component; the `_` prefix hides it from publishing): a robot header plus a `Content` slot, `section-pad` padding, Scheme Light gray. `Claude · working area` and the Drag-and-drop frame are instances of it, so their look changes in one place.
- **White is for actual cards** (owner rule): containers go a touch darker (Light gray), to avoid white, gray, white back and forth.
- **Blocks dropped into a card (a stat, rows) use a 10% black fill, not white**, so they show on any card and any Scheme.
- **Layers panel:** a layer with several explicit modes shows one mode chip plus "+1".
- **Make a new card** (a workflow now on the canvas): 1) copy a Card (Alt-drag, or from Assets); 2) fill its slot with blocks; 3) pick a Scheme; 4) pick a Resolution (Mobile for phone width); 5) blocks inside use 10% black.
- **A piece takes the Resolution mode of the frame it is dropped into** (observed 2026-11-09): a Card or Button dropped in the Mobile drop zone tightens to mobile padding. Mega layouts should probably use Default sizing for their columns.
- **Widths and responsiveness** (owner, 2026-11-09 evening): lean on the standard widths **400** (phone), **1920** (desktop) and **3440** (Mega). Working areas are 1920 wide; the `_Claude frame` Content slot is FILL with max width 1600, aligned left so titles line up. Make layouts as responsive as possible: FILL plus max width, not fixed widths.
- **Always screenshot after building, and check reading order** (the owner briefly saw workflow steps 2, 3, 4, 5, 1). Figma sometimes fails to redraw after scripted edits; clicking into the frame redraws it.
- **Open, not decided:** card widths (about 400 for a phone, about 500 a good desktop default, 800 too wide), so maybe a min and max width per Resolution; responsive wrapping in Figma isn't worth much effort yet. "Section", to the owner, means a full-width, full-height block.

#### Images: components, generated pictures, layouts (owner, 2026-11-09 night)

The **Images** page holds the **Image** and **Avatar** masters and sample pictures.
- **Generated pictures:** the Figma MCP `generate_image` (model gpt-image-2.5-flare, spends Figma AI credits). Create placeholder frames, then call it with `nodeId` to fill each. Eight made: 4 scenes (Lisbon rooftops, hike, moodboard flat lay, desk), 3 head-and-shoulders portraits on light grey, 1 full-body photo on white for a cut-out.
- **Image component** (verified): a copy keeps its own picture when the master's picture changes (an image fill on a copy is an override, like text); an untouched copy follows the master. To swap: Fill, click the image, Choose image. Media inside a Card: set the Card media copy's fill to an image and hide its icon.
- **Avatar:** a 64 circle with an image fill. Copies change the size (corner radius half the size), the picture, a rounded square, or an accent ring (outside stroke).
- **Transparent people:** generated images have a background. Remove it in Figma (select, Actions, Remove background). The MCP has no background removal; Weave models would cost credits and need approval.
- **Image layouts:** photo card, author card, testimonial, header + image + footer (Card parts), an overlay (plain frame: image fill, dark gradient, white text aligned bottom) and an image beside text (plain frame).

#### Componentize almost everything that has a name (owner, 2026-11-09, later)

Chips, tiles, sections and card parts become components; text layers do not (text styles cover those). The **level-1 base set** is: text styles, Button, Input, Select, Toggle, Icon button, Icon item. For grids, set cards to Fill so they share the row, and control how many per row with the column count and by dragging; prefer no variants for layouts.

**Slot traps (verified):**
- A slot cannot have GRID layout (error "Slot property cannot be applied to frame nodes with GRID layoutMode"). A grid is a plain frame inside a slot.
- A slot whose only child is set to Fill collapses (HUG with only FILL children). Slots also clip by default: set `clipsContent = false` and let rows hug.
- Inside an instance's slot (especially nested slots), node handles go stale after each insert or append ("node … does not exist", `indexOf` = -1). Look nodes up again by name after every change; build new content at the page root and move it in as one piece; append a node to its final parent *before* editing it (editing a Card's slot and then appending it into another Card's slot scrambled both cards).
- **A Card inside another Card's slot** (verified 2026-11-09): Figma only accepts the inner Card if it goes in *before* the outer slot's default content is cleared. Clearing first and then appending a Card silently resets the slot to its defaults (non-Card nodes are fine). Working order: append the inner Card, remove the default children, then `insertChild(0, header/media)` and append the footer.
- **Scan for strays:** a script that "succeeds" while using stale handles can leave strays (five Card copies ended up at the page root at (0, 0)). A failed script commits nothing, but after any run with handle trouble, scan the page root for strays.

#### Grid auto layout: equal-height cards that adapt (verified 2026-11-05)

Set `frame.layoutMode = 'GRID'`, then `gridColumnCount` / `gridRowCount`, `gridColumnSizes = [{type:'FLEX', value:1}, …]` and `gridRowSizes = [{type:'HUG'}, …]`; bind `gridRowGap` / `gridColumnGap` to `gap`. The grid frame has a fixed width and HUG height; its children get `layoutSizingHorizontal` and `layoutSizingVertical` = `'FILL'`. Each row takes the tallest card's height and every card in it fills: making one card's text longer grew all three from 346 to 520. **Trap:** append the children *after* setting `layoutMode = 'GRID'`; children already in the frame kept one row each. Re-append them to re-flow. **Second trap (2026-11-09):** a grid child that is a *wrapper* (caption + card) with the card set to FILL vertically collapses, because the HUG row measures the wrapper's content as near zero. Fix: give captions and cards their own grid rows (row 0 captions, row 1 cards, …), each child FILL; the cards then get full height and equal heights per row. This replaces the "tallest hugs" and "fixed row" workarounds in [figma-layout.md](./figma-layout.md). **Third trap (2026-11-09):** grid children keep explicit cells; `insertChild` into a grid does not take the old cell. Reorder with `node.setGridChildPosition(row, col)`: a cell must be empty, and rows can't be removed while occupied, so park every child in spare rows first, then place them, then trim `gridRowCount`. A grid cannot be a slot (see the slot traps above).

**Masonry recipe** (Layouts page, 2026-11-09): a fixed-width row of N vertical columns (FILL width, HUG height, `gap` token); place each card, in reading order, into whichever column is currently shortest (read `column.height` before each append). Equal heights use the grid above; uneven heights use this. It is now a `Masonry` component: the Layouts demo is an instance with balanced columns, and Responsive test has one capped by `content-max`.

Removing boolean component properties (Show kicker, Show button) made every previously hidden layer visible again in all copies; re-hide or delete those layers afterwards.

A worked example: `Kit · Slots vs components` (`238:30989`) builds the same card three ways and a nested Site template > Section template navigation system with a clickable prototype: [report](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/slots.md).

## Links that work in design mode

`text.setRangeHyperlink(0, len, {type: 'NODE', value: nodeId})` links to a frame or a page; `{type: 'URL', value}` to the site. The `Claude · Overview` page (`144:1062`) is an index built this way.

## Scheme, prime and edges (owner, 2026-10-12, still current)

- **Prime is used plain, with dark ink** (about 5:1; white on prime is under 3:1); no 25% black darkening. Prime is a splash (the one primary button, accent labels, progress fills, active icons), never a ground. Selected and current = 10% black inset + accent icon; dark grounds step up with 10% white and down with 10%/50% black.
- **A scheme is a Scheme mode** (`White`, `Light gray`, `Prime`, `Dark`; roles `text`, `muted`, `surface`, `accent`, `on-accent`). Bind a container's fill to `surface`, highlights to `accent`, and one master serves every scheme: switch the mode, not the component.
- **Insets are a bare 10% black layer**, never white + 10%, so the same card darkens any ground.
- **Edges:** rows that run edge to edge (own side padding = `pad-x`) line up with the heading above; a card that touches the screen edge has no radius; a card with full-width sections has zero padding and each section pads itself.
- Every interactive control has a `Focus` state (2 px accent ring, offset 2). Toggle for one on/off, segments for 2–3 modes, dropdown for more. An inline icon at the text's line height beats a big icon above, except on cards and images.

## Diagrams from auto layout (DS · 5, verified 2026-10-12)

Design files have no live connectors (`ConnectorNode` is FigJam-only), so arrows are **layout pieces**: a connector frame between cards whose 2 px line FILLs it, an elbow made of two FILL halves with one or two stroke sides, a T piece (top bar of two halves + stem + stubs) for branch and merge. When a card grows, the stack reflows and the line stays joined; each case has a before/after pair on the page. Pieces: `DG Node`, `DG Line V`, `DG Line H`, `DG Turn`, `DG Fan`. Limit: a FILL stub under a short card in a HUG row is not re-measured by the plugin API, so those stubs are sized to the tallest card. Charts: bars FILL a row with data heights, stacked bar shares by `layoutGrow`, donut by `ellipse.arcData`, sparkline as a vector. For free-form charts, the MCP's `generate_diagram` makes FigJam diagrams instead.

## Templates you drag into (owner's findings, 2026-11-09)

- **Padding goes ON the slot (the default).** A slot inside a padded frame is a thin drop target: the blue box is the frame, and the slot only lights up near its edge. Put the padding on the `Content` slot itself (bound to `pad-x` / `pad-y`, gap to `gap`) and give the frame 0, so the whole area is the target. Card, Card body/header/footer (voice-app) and every Page builder template work this way. In a template whose height fills (App with sidebar, Mega) the slot is FILL × FILL; in a hugging one it hugs with `minHeight` 240. The slot's `maxWidth` includes its padding (1600 content = 1696), and the wrapper centres it.
- **Full-bleed rows (advanced).** For sections that run edge to edge, use a copy with the slot's padding and gap at 0: `Template · App with sidebar · Full bleed` (88:1749). The block brings its own padding.
- **A drag source carries an explicit Scheme mode.** A white card on a Light gray parent vanishes because surface resolves to the parent's mode. Templates have `Scheme = White` set on the component, and Card instances inside blocks have it set on each instance, so they look right wherever they land. A ground is then a mode you set on the instance.
- **No dashed placeholders in a slot.** They sit in the way of the drop. Use `minHeight` on the slot itself on the component (a copy cannot override it), or nothing.
- **Bind padding and gaps to `pad-x`, `pad-y`, `gap`, `section-pad-x/y`** wherever one fits, so a Mobile or Mega parent resizes them. The sidebar uses `pad-x` / `pad-y` (Default).
- `Colors/light` and `Colors/dark` now show in the colour picker. The owner removed the default UI kits from the Claude November 2026 file one by one; team-wide, turn them off in team settings → libraries → UI kits.

## Traps

- **Drag sources are direct children of a root GRID frame** (owner, 2026-11-09): title spanning all columns, a row of captions, a row of sources, then an `After` column, so one click selects one source and you alt-drag it. Sources buried inside page or section instances cannot be found or grabbed. The Cards page follows it: three stacked 1920 root frames at its top, `Step 1 · Pick a card` (103:976), `Drop zone` (103:1053), `Step 2 · Fill it` (103:1059); don't move them (`Page · Cards` and `Main components` start at y 2115 below them).
- **`findAll(n => n.type === 'SLOT')` on a Masonry also returns the slots inside its cards**, so indexing `[i]` dropped cards into other cards (2026-11-09). Use `masonry.children.filter(c => c.type === 'SLOT')` or `findChild` by name (`Column N`).
- **Lay out a whole page as auto-layout containers** (owner, 2026-11-09): query every top-level node (position, size, how it grows) before moving anything; a container is a column of equal-width things or a row of equal-height things, so a column that mixes 400, 1600, 1920 and 3440 items leaves voids (split it into one column per width); size titles to the content (120 to 160 in a 1920 row). Instance `minHeight` cannot be overridden, so a fixed-height blank page is the instance set FIXED with its Body set FILL.
- **A max width of 760 is for body and description text only**, never a big title: a 160px title capped at 760 wraps hard (2026-11-09). In the Section master the title hugs (no max width, no wrap), its `Label` frame has no max, and only the description keeps `maxWidth` 760 (with `minWidth` 760 so a short title does not narrow it).
- **`code` style can't load**: Figma has no Consolas, so `loadFontAsync` throws and the whole script aborts. Code text uses Cousine Bold by hand. The real fix is to change the style's font in Figma (the owner's file; ask first).
- **`figma.combineAsVariants()` makes a real component set without the purple dashed border** Figma's UI adds, so it looks like a plain frame (2026-11-05). Add it in the script: `strokes` #9747FF, `dashPattern` [10, 5], `strokeWeight` 1, `cornerRadius` 5.
- **Wrap rows grow their children only with FILL plus a `minWidth`** (verified 2026-11-09; children without FILL stay at their `minWidth`). A FILL child with no intrinsic height collapses in a stacked wrap row, so give an image `minHeight`.
- **3440×1440 is wide, not tall**: v1 stacked its cards and overflowed the bottom; v2 moved them side by side (steps in a 2×2 grid, stacks across the width, type ramp in the rail) and fits.
- A glyph outside Montserrat (↳ ✕ ⌕) falls back to Noto Sans Symbols2; any later edit to that frame needs that font loaded too, so load every font with `getRangeAllFontNames` first.
- `getRangeAllFontNames(0, 0)` throws on an empty text (an empty Meta), so skip empty texts when loading fonts.
- **A removed ground leaves its mode behind**: a frame that once had a prime fill also had an explicit Scheme mode (`White`) so its ink stayed dark. Removing the fill keeps that mode, so on a dark screen the label still renders dark. When you drop a ground, also `clearExplicitVariableModeForCollection` (hit 2026-10-12).
- Load the `figma-use` skill (MCP resource `skill://figma/figma-use/SKILL.md`) before the first call.
- **Pages and blocks (verified 2026-11-09, [Pages page](/framework/ext/Figma/readme.md#the-page-builder-page-2026-11-09)):** a slot with `maxWidth` 1600 and a FILL width centres inside a wider page; a GRID frame needs `layoutSizingVertical = 'HUG'` after `resize()` or it stays 100 px tall; a block that holds a Section builds its grid and children at the block root first, then `slot.appendChild(grid)`; an instance's own Section slot is HUG (100 px wide) until you set it to FILL; you can't `remove()` a node inside an instance (hide it); a failed call commits nothing; a main component can't go inside a slot, so masters sit in a plain `Main components` frame left of x 0, each under a `Main component label` instance.
- **Page builder traps (2026-11-09, [page](/framework/ext/Figma/readme.md#the-page-builder-page-2026-11-09)):** on a phone template set `gridColumnCount = 1` and `gridRowCount = children.length` on each nested Grid, and put Resolution Mobile on the root; on the Mega template put Resolution Mega on the Main frame only; a block's text that must wrap needs `textAutoResize = 'HEIGHT'` with a FILL width, and a CTA band stacks by setting `layoutMode = 'VERTICAL'` on the phone instance; cards on a Light gray, Dark or Prime ground resolve to the ground and vanish, so set `Scheme = White` on each Card instance; a Section heading cloned from the heading of another group keeps a FIXED 760 label, so set the Label, Title and Description to FILL before enlarging the type; in `setBoundVariableForPaint` use the Scheme `surface` variable for a ground, not `muted` (the second variable, easy to mistake); `figma.createAutoLayout` frames have a white fill, so clear `fills` on layout-only rows.
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

Place one master component on the four Scheme grounds (white, light gray, prime, dark); edit the master and all four update. Use it where colours stack and contrast matters; a card with a fixed fill looks the same in all four, so it needs no four-up. For "which colour on which", build the real design once in one scheme and check contrast with a script (WCAG graded AAA / AA / Large / Decorative / Invisible).

- **`figma.createFrame()` gives a WHITE fill when the frame is created unparented** (our scripts do this); frames the owner draws inside another frame in the UI don't necessarily have one. A wrapper made only for layout (Tiles, rows, columns) must be given `fills = []` straight away, or every grouping frame paints a white box behind cards that have their own grounds. A frame gets a fill only when it is meant to be a ground.

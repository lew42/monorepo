# Brief: Kit · Mobile builder: drag, drop, done (owner, 2026-10-13)

The owner: "the ideal is a drag and drop builder… a library page with our components set up so that… a mobile/sidebar design kit: single column, very narrow, responsive-friendly. All the elements on the left, a workspace on the right, and you just drag them in, bing bang boom. Then what you can create is about how many elements (rows) we have and how well they play with each other." And the problem to solve: "in Figma you have to choose the background colour AND the text colour scheme AND maybe the resolution every time you move something. Customising three things every time is a lot more work than drag and drop and it just works."

Read: [page-layout.md](/framework/ext/Figma/doc/page-layout.md) (masters top level, page = 1920 component), [figma-layout.md](/framework/ext/Figma/doc/figma-layout.md), [design/layout/doc/space.md](/framework/design/layout/doc/space.md), [use-figma.md](/framework/ext/Figma/doc/use-figma.md) (modes, "One master, four schemes"), [componentize.md](componentize.md) (`Ground` `177:1312` already sets fill + Text mode in one variant), [lists.md](lists.md), [icons.md](icons.md), [transcribe.md](transcribe.md). Reuse existing kit components inside the blocks; don't rebuild them. File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. Notes box at the top, in plain words.

## The one-switch rule (solve this first, and write it in the Notes box)
- Every block is a component whose variant property **`Scheme`** (Light / Gray / Dark / Near-black / Prime) sets BOTH its fill and its Text mode inside the variant. So picking a scheme is one dropdown, and the text follows.
- **Resolution** is set ONCE on the workspace frame (Mobile) and inherited by everything dropped in. A block never sets Resolution itself.
- Blocks are `FILL` width and `HUG` height, so a block dropped into the 390 workspace column just fits.
- Test it: drop each block into a fresh workspace and confirm the text is legible on every scheme with no further clicks. Record the result.

## Page `Kit · Mobile builder` (new)
1. **Blocks (20–30), each `Block / <kind>`** with the Scheme variant: app bar, search, section header, list row (icon + title + meta), tree row, toggle row, card, stat pair, chart card, image + caption, tab bar, segmented control, button row, form field, empty state, message bubble, transcript line, mic bar, context pill / card, footer. Masters top level, grouped by kind.
2. **Library column (left):** instances of every block, grouped with labels. **Workspace (right):** 3 empty phone columns (390, vertical auto layout, Resolution = Mobile, gap token), plus 3 pre-built example screens made only by stacking blocks (a settings screen, a list → detail, a dictation screen).
3. **How to drag:** Alt-drag an instance from the library into a workspace column (a plain drag moves it out of the library), or drag a master from the Assets panel. Reorder by dragging inside the column. Write this as a 4-step box at the top.
4. **Play-well check:** a strip showing blocks stacked in different scheme sequences (light → dark → light, gray bands) to show which neighbours need a divider or a gap, and the rule you settle on.
5. The page is a `Page · Kit · Mobile builder` 1920 component (library + workspace inside as instances); masters beside it.

Screenshot and fix. Link it from the Overview design-system card. Report `kit/builder.md`, committed by path.

## Addendum (owner, 2026-10-13)
A few blocks give thousands of combinations. Which block sits well above or below which, what gets padding, and which ground changes are the design system, so the workspaces exist to play with exactly that. **Workspaces at every benchmark:** 400 (mobile), 1000 (a 300–400 left sidebar plus the remaining main area), 1920, 3440. Do mobile first; add the 1000 / 1920 / 3440 workspaces (empty, plus one example each) if the blocks are FILL-based and it is cheap. Three-column page templates come after the two-column set (a later brief).

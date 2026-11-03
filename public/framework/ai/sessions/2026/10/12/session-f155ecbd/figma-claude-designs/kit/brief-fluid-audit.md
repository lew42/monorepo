# Brief: fluid audit: fill width and auto height everywhere unless named (owner, 2026-10-14)

The owner: "everything should be responsive: fill width and auto height, unless otherwise specified." The rule: [design/layout/doc/space.md](/framework/design/layout/doc/space.md) and [figma-layout.md](/framework/ext/Figma/doc/figma-layout.md). A fixed size is fine only when it is NAMED in the layer, as the fixed-size register in [use-figma.md](/framework/ext/Figma/doc/use-figma.md) says (`(fixed 280: sidebar)`, phone frames 390, icons, avatars, controls, 1920 page wrappers, 1920×1080 prototype screens). Edit main components, not instances (rule 6). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. Skip the owner's pages (Page 1–8, Color Schemes, Component Slots, Vector Design, Paragraph Design) and the Index pages.

1. **Census script first, read only:** for every FRAME / COMPONENT on Claude's pages whose `layoutSizingHorizontal` or `layoutSizingVertical` is FIXED and whose name has no "fixed", count by page and by kind (card, row, column, specimen, text box). Print only the counts and 30 examples.
2. **Fix the safe classes, in masters first:** cards, specimens, rows, columns, text boxes and wrappers become FILL width (with `minWidth` where a card shouldn't shrink, per grids.md: cards 360/520, tiles 200/280, specimens 480/760) and HUG height. A text layer set to fixed width inside a FILL parent becomes FILL + auto height.
3. **Leave and name:** anything that must stay fixed (an image crop, a chart's plot area, a phone) gets renamed with its reason.
4. After each page: run the rows-wider-than-parent scan and the clipping check (no child cut off by a clipping parent), and screenshot the page. Prototype reactions must count the same before and after.
5. Don't touch pages another agent is working on right now: Essentials, Demo · Site, Foundations · Layouts.

Report `kit/fluid-audit.md` (census before/after per page, what was named instead of changed), committed by path.

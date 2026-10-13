# Brief: Templates · Three-column pages (owner, 2026-10-13)

The owner: "if we get done with all this and we've gone through a lot of two-column layouts, three-column layouts would be good as well… at 1000 px a left sidebar becomes possible; then 1920; then 3440… hitting all the benchmarks."

This continues [brief-templates.md](brief-templates.md). Read its report [templates.md](templates.md) and copy its conventions exactly: `Template / …` 1920 masters, top level, a `Scheme` variant (one dropdown recolours both sides), Title/Description properties, Content slots, the overview component, the verdict. Also read [design/layout/doc/space.md](/framework/design/layout/doc/space.md) (strong margins, fill then divide, no ragged grids, top-aligned equal heights), [ext/Figma/doc/figma-layout.md](/framework/ext/Figma/doc/figma-layout.md), [builder.md](/framework/ext/Figma/doc/builder.md) (toolboxes matched to their column; items inherit the mode) and [slots.md](slots.md) (Site / Section templates). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. Notes box at the top.

## Page `Templates · Three-column pages` (new)
1. **10–12 masters** (`Template / 3col / <name>`), varying:
   - splits: nav 280 | main fill | rail 320; 1/5 | 3/5 | 1/5; 1/4 | 1/2 | 1/4; nav | list | detail (mail / Miller style); two narrow left (global + inner nav) | main;
   - grounds: dark | light | gray, near-black | dark | light, all light with ground steps;
   - active states: the current nav item, the selected list row driving the detail, tabs in the main.
2. **Benchmarks:** for the 3 best, show how the same template degrades: 3440 (wider main or a 4th column), 1920, 1000 (the rail folds under or into a tab), 400 (one column, nav in a sheet). Instances side by side with captions.
3. **Filled examples:** 4 filled with real file content (Lists, cards, tables, transcripts). One clickable prototype across the nav | list | detail template (▶ PROTOTYPE).
4. **A matched-toolbox workspace** for one three-column template (a toolbox per column, the same width and ground; see builder.md).
5. **Verdict** in Notes, plus the overview component (thumbnails at natural height, NOT clipped: the 2-col overview clipped at 250, so don't repeat that).

Screenshot and fix voids, clipping and ragged edges. Link it from the Overview design-system card. Report `kit/templates-3col.md`, committed by path.

# Brief: the reading page at 3440: an attached inner sidebar, light page (owner, 2026-10-13)

The owner, looking at `Lists · Sidebars, TOC & trees` → Placements → `Screens` (`215:2656`; its `Screen 3440` `215:2657` was just reshaped: full-height sidebars, the article centred in a filling Main, max 960):
- "The text in the middle is still spanning a massive area."
- "I prefer light mode for reading. Even with dark sidebars, we probably want a white page for standard text."
- "The right sidebar is cramped, too close to the top compared with the main area's kicker ('Blog · 6 min'). Generally I don't like a right-sidebar TOC; it feels out of place. Child pages and related content are like an aside or a next step, much better as an INNER LEFT sidebar."
- "The blog sidebar sits right next to the global sidebar, so it looks detached from the centred page. An inner left sidebar should look attached to the page content: it could float next to it, especially if the page itself has a background, instead of filling the whole void."
- "Build a couple of those out, in colour permutations."

Read: [design/layout/doc/space.md](/framework/design/layout/doc/space.md) (reading width, strong margins, fill then divide, nesting without over-boxing), [ext/Figma/doc/figma-layout.md](/framework/ext/Figma/doc/figma-layout.md), [page-layout.md](/framework/ext/Figma/doc/page-layout.md) (no Figma Sections; wrappers transparent), [lists.md](lists.md) (Tree item, TOC styles). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first.

## Do
1. **Rework `Screen 3440` (`215:2657`)** to the owner's direction:
   - global sidebar (dark) at the far left, full height;
   - then a canvas ground where a **page block** floats, centred in the remaining space: a white (light) page card holding the article at a reading width (about 720–760 text measure), with the **inner sidebar attached to the page block's left side** (inside the same block, or flush beside it, sharing its top edge and height). That sidebar holds the blog list, then "On this page" and related or next items beneath;
   - no right-hand TOC; kicker and sidebar heading on the same top line; generous, even padding.
2. **Permutations** (a new frame beside it, `Reading page · permutations`, auto layout, 3440 screens, or 1920 where clearer):
   - (a) dark global + gray canvas + white page with a light-gray attached sidebar;
   - (b) dark global + near-black canvas + white page with an attached sidebar one step darker than the page;
   - (c) light global + light-gray canvas + white page, the sidebar unboxed (no ground, a rule line only);
   - (d) dark global + dark canvas + white page and the sidebar floating as its own card beside it (a small gap);
   - (e) the same as (a) at 1920, and at 1000 (the inner sidebar collapses above the article or into a menu).
   Caption each with its grounds and one line on why.
3. Verdict in a Notes box above the permutations: which one you'd ship, and why.
4. All layout is auto layout. Reading text never wider than about 760.

Screenshot each at 100% and fix. Report `kit/reading-page.md`, committed by path.

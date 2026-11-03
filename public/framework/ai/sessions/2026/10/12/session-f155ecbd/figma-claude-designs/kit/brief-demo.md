# Brief: Demo: a clickable 1920×1080 site, built from our own templates (owner, 2026-10-14)

The owner: "simple, robust, reusable layouts, the best ones at the top, used to exemplify themselves… a demo where I can click through the pages. The prototypes need to be a fixed height so they scroll: in one demo the variable height made the preview window jump around. A fixed-height container that scrolls acts like a browser window. Keep it at 1920 by 1080. As I click through, I can explore the different navigation systems, top down; build the navigation schemes into the demos. We want to be dogfooding. Everything should be, as much as possible, an instance of a component."

Read: [file-map.md](/framework/ext/Figma/doc/file-map.md), [templates.md](templates.md) and [templates-3col.md](templates-3col.md) (the picked page templates and their verdicts), [slots.md](slots.md) (Site template / Section template), [reading-page.md](reading-page.md) (the white page with an attached inner sidebar: the owner's preferred reading layout), [lists.md](lists.md) (Tree item, sidebars), [design/layout/doc/space.md](/framework/design/layout/doc/space.md), [page-layout.md](/framework/ext/Figma/doc/page-layout.md) (prototype screens are top-level frames; no Figma Sections), [use-figma.md](/framework/ext/Figma/doc/use-figma.md). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first.

## Page `Demo · Site` (new; place it right after `Essentials`, which another agent is building now, so this is page 4)
1. **Screens are 1920×1080, fixed, with vertical scrolling** (`overflowDirection = "VERTICAL"`, clip on): the frame is the browser window and the content inside it can be taller and scrolls. In the prototype, the viewport stays still.
2. **8–10 screens, every one an instance of a page template** (Two-column / Three-column / Site template), filled with real content: our own design system, as a documentation site about itself (dogfooding). For example: Home (overview cards), Elements, Buttons, Cards (use the Essentials card components once `kit/essentials.md` exists; until then the existing Card), Layouts, Templates, a Reading page (article + attached inner sidebar), Settings.
3. **Navigation schemes, one per area, so they can be compared by clicking:**
   - global left sidebar (dark) + inner left sidebar attached to a white page (the preferred one);
   - top nav + tabs;
   - icon rail + inner nav;
   - a breadcrumb + "next page" footer.
   Wire every nav item to its screen. The active item shows the current state on each screen (a variant or property, not hand-painted).
4. A start screen `Demo · Home`, a flow named `Demo · Site`, and the ▶ PROTOTYPE badge. Every link works both ways (back via nav).
5. A short Notes frame beside the screens: how to play it (Present, or open the flow), which nav scheme lives where, and your verdict on which nav scheme reads best.

Screenshot every screen at 100%, click-test the wiring by listing each reaction's destination in a script, fix, then report `kit/demo.md`, committed by path.

# Fluid sweep: Kit group (2026-10-13)

Brief: [brief-fluid.md](brief-fluid.md). Every page component stays a 1920 white wrapper; sections, rows and cards FILL, heights HUG. Reactions were counted before and after: none changed (the sweep only touched sizing, clipping and names).

- **DS · 4, 4.1, 5, 6, Layouts · Two columns, Kit · Layouts, UI Kit**: already fluid from the tidy pass; clip off on auto-layout cards and specimens. Reactions: DS 4.1 8, DS 6 32, UI Kit 5, all unchanged.
- **Kit · Controls**: the `Variants` strip now FILLs inside each card, so progress bars no longer cut off.
- **Kit · Containers**: each section is a `Body` with a wrapping `Specimens` row plus the phone strip; `Body` and the column HUG (this removed the void and the stale 9001 height). Phones stay fixed 390.
- **Kit · Workflows**: unchanged beyond clip off. Reactions 17 to 17.
- **Kit · Nesting**: fixed-width cell rows became FILL rows.
- **Screens · Transcription**: word-style cards equal height and top-aligned; pills no longer overflow.
- **Claude prototype**: clip off; reactions 65 to 65.
- **Claude test page**: clip off, `Claude was here` FILLs; reactions 22 to 22. The `wide` wrapper stays beside the page because it holds masters.
- **Lab · Site shell**: fixed items renamed `(fixed N: …)`. **Lab · Elements**: lanes FILL. **Lab · Stacks**: recipe columns HUG, phone frames renamed `(fixed 390: phone)`. A 300-wide FILL column was tried and clipped the 390 phones, so it was reverted.
- **Video · Kit, Storyboard, Channel ideas; Type · Title layouts**: clip off only. The 4400, 3000 and 2300 wide frames sit beside the page because they hold masters, so they stay fixed. Storyboard reactions 16 to 16.

## Still open
- Icons: not swapped to DS · 1.1 `Icon` instances; pages still draw plain Material Symbols text (all of the above).
- Wide lab frames beside the pages stay fixed (named in the layer).

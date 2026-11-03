# Brief: swap plain icon text for the Icon component, everywhere it is safe (2026-10-13)

Both fluid sweeps left this open ([fluid-ds.md](fluid-ds.md), [fluid-kit.md](fluid-kit.md)): pages draw icons as plain Material Symbols text, not as the `Icon` component from DS · 1.1 ([icons.md](icons.md), [doc/icons.md](/framework/ext/Figma/doc/icons.md)). The owner wants one icon system whose names hand off one to one to code (`icon("name")`). Read [use-figma.md](/framework/ext/Figma/doc/use-figma.md) recipe rule 6: **edit masters, not instances**. File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first.

## Do
1. A script first: list every TEXT node in Material Symbols Rounded on Claude's pages (not the owner's Page 1–8, Color Schemes, Vector Design or Paragraph Design), grouped by where it lives: inside a main component (swap there once), inside an instance (skip, since its master gets swapped), or loose on a page. Print the counts; read only the summary.
2. Swap **inside main components first**. Replace the glyph text with an `Icon` instance with the same glyph (the glyph component for that name: if it's missing, add it to the right category on DS · 1.1 following doc/icons.md), the nearest Size, and the same colour binding. Keep layer order and auto-layout position. Nested instances update by themselves.
3. Then loose specimens on pages, where it is quick. Leave the Icons page's own specimen grid, and any icon whose text is the label (an icon-name caption), alone.
4. Before and after: screenshot 6 representative places; count prototype reactions on the pages you touch (they must match).
5. List what you didn't swap and why.

Report `kit/icon-swap.md` (counts before and after per page, new glyph components added), committed by path.

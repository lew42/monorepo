# Brief: say what every specimen is; composition first, colour last (owner, 2026-10-14)

The owner, on DS · 2.3 Cards & containers: "there are different coloured backgrounds, and I'm not sure if that's just showing the colour permutations, nesting them, or if some of them are supposed to be a modal (the background darkening)… there needs to be better documentation per item, a better description… we need to separate composition and layout from colour. Colour permutations come last: first lock in the simplest layouts, then explore the colour schemes and modes."

Rules: [design/layout/doc/space.md](/framework/design/layout/doc/space.md) ("Composition first, colour last"; reading width), [ext/Figma/doc/figma-layout.md](/framework/ext/Figma/doc/figma-layout.md), [use-figma.md](/framework/ext/Figma/doc/use-figma.md) (rule 6: edit masters, never the same override everywhere). Page list: [file-map.md](/framework/ext/Figma/doc/file-map.md). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first.

## Pages
DS · 1, 1.1, 1.2, 2.1–2.7, 3, Lists · Sidebars TOC & trees, DS · 4.1, DS · 5. Do **2.3 Cards & containers first** (the owner's example), screenshot it, then the rest the same way.

## Per page
1. **Caption every specimen.** The `Specimen` component already has a `Label` (the small caps line under it). Make each label say what the thing IS and, where it isn't obvious, what the colour means, in at most about 8 words. For example: "Dialog: the dark layer is the scrim behind it", "Card nested on a gray section", "Same card on the dark ground (colour sample)". Where the label can't hold it, add one muted line (body small, max width 480) under the specimen. Don't touch the owner's pages.
2. **Each row's left description** (the 400 head) gets one plain sentence on what the row teaches, if it doesn't already have one.
3. **Colour last.** Move every colour row ("On dark", "Core set · on dark", "Flows on dark", "TOC styles on dark", "Dark in dark") to the END of its page, under one heading row `Colour · the same pieces on other grounds` with the description "Colour samples: the same components on the dark grounds. Composition is above." Move nodes; don't copy them (ids stay). DS · 1.2 Dark grounds is itself a colour page, so leave its order.
4. A **modal / scrim** specimen must say so in its label, and its scrim must look like one (a dark translucent layer behind a raised dialog), not just another ground.
5. Screenshot each page after and fix anything the move broke.

Report `kit/captions.md` (per page: captions written, rows moved), committed by path.

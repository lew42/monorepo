# Brief: Foundations · Layouts: lock in the simplest, most reusable layouts (owner, 2026-10-14)

The owner: "We created a ton of items. Now let's use them, but focus on simplifying: the simplest, most foundational, most versatile, reusable layouts, cards, text, styles and buttons, so we lock those in and I can see exactly what we have and how well they work. Everything should be responsive: fill width and auto height, unless otherwise specified."

Read: [file-map.md](/framework/ext/Figma/doc/file-map.md), [design/layout/doc/space.md](/framework/design/layout/doc/space.md), [figma-layout.md](/framework/ext/Figma/doc/figma-layout.md), [page-layout.md](/framework/ext/Figma/doc/page-layout.md), [componentize.md](componentize.md) (the `Layout / …` components on Kit · Layouts: build on them, don't duplicate), [ds-foundational.md](ds-foundational.md) (DS · 4.1), [grids.md](grids.md) (min/max numbers). An `Essentials` page with card components (`Card / …`) is being built right now: when `kit/essentials.md` exists, fill your layouts with those cards; until then use the existing `Card`. File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first.

## Page `Foundations · Layouts` (new; placed right after `Demo · Site`)
1. **Pick 6–8 layouts, no more**, the most versatile: stack (one column), two columns (fixed + fill), split 1:1, card grid (wrap with min/max), sidebar + content, section rows (title left, content right), header / body / footer band, and (optionally) a centred reading column. Each is ONE component (reuse and repair the `Layout / …` masters: edit them, don't make new parallel ones) with slots, FILL/HUG everywhere except named fixed columns.
2. **Prove they're responsive:** place each layout three times, at 400, 1000 and 1920 wide, filled with the same real content (cards, text, buttons as instances). Only the instance width changes, and nothing clips, overlaps or leaves a void. Where a layout must change shape at 400 (two columns stack), use a `Size` variant (Wide / Narrow) and say so.
3. **One row per layout** (section-rows style): left, the name + one sentence ("use for…"); right, the three widths.
4. Order: simplest first. Colour comes last (one row: two layouts on dark, Text mode only).
5. A Notes box at the top: the set, and what was cut and why.

Screenshot at 100%, fix, report `kit/foundations.md` (component ids, what changed in the masters), committed by path.

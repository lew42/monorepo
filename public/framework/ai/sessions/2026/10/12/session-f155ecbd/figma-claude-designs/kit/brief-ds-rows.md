# Brief: redo the DS pages on the "section rows" template (2026-10-13)

The two-column templates' verdict ([templates.md](templates.md)) picked **`1/4 · 3/4 · section rows`** to redo the design-system pages: each section is a row with its title and a short description in a narrow left column and the specimens filling the right. The owner wants pages with strong margins, no voids, no ragged grids and clear page edges: [design/layout/doc/space.md](/framework/design/layout/doc/space.md), [ext/Figma/doc/figma-layout.md](/framework/ext/Figma/doc/figma-layout.md), [page-layout.md](/framework/ext/Figma/doc/page-layout.md). Grid numbers: [grids.md](grids.md) (cards 360/520, tiles 200/280, specimens 480/760). Edit masters, never repeat an override (use-figma.md rule 6). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first.

## Pages
DS · 1 Elements, DS · 1.1 Icons, DS · 1.2 Dark grounds, DS · 2.1 Buttons, DS · 2.2 Lists & rows, DS · 2.3 Cards & containers, DS · 2.4 Inputs & controls, DS · 2.5 Status & progress, DS · 2.6 Dropdowns & menus, DS · 2.7 Toggles, DS · 3 Sections. Do 2.1 Buttons first as the pilot, screenshot it at 100%, and only then do the rest the same way.

## Per page, inside its existing `Page · …` component (keep its id, so the Index keeps working)
1. The top keeps the page title, a one-line gist and the Notes box.
2. Each existing section becomes a section row: left 1/4 holds the title, a 1–2 sentence description and an optional "use when" line; right 3/4 holds the existing specimens, MOVED, not copied (ids kept). Use the `Template / 2col / 1/4 · 3/4 · section rows` structure (an instance with its slot, or the same auto layout if a slot can't hold moved nodes; say which).
3. Specimen grids wrap with the numbers above; equal heights (fixed row height named in the layer, content top-aligned) or a masonry, never ragged.
4. Every row hits the same left, centre and right lines. Count prototype reactions before and after (they must match).

Also fix, from the reports:
- a single-stat block for 280 sidebars ([builder.md](builder.md));
- the 2-col templates' overview thumbnails clipped at 250 ([templates.md](templates.md));
- the low-contrast gray Stat on the gray rail ([templates-3col.md](templates-3col.md)).

Report `kit/ds-rows.md` (per page: rows made, reactions before/after, anything left), committed by path. Don't rebuild the Index; the mastermind re-runs it.

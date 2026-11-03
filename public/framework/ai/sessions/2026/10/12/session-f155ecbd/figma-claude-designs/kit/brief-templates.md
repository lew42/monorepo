# Brief: Templates · Two-column pages: 1920 page templates you copy and use (owner, 2026-10-13)

The owner: "let's create more page layouts… right now we have one page look: a gray background, rows, that's it… the number of two-column layouts at 1920 is huge: the colour scheme for each side, the distribution of space, the items within each column and how they relate… focus on two-column layouts at the page level and create a whole bunch of them, each a template I can copy and paste and use… figure out where the slots are and how to set up navigation for those pages… find a robust way to put our variable-height and variable-width content into these layouts: efficient spacing, white space where it helps, never looking broken or wasted… equal-height cards and repetition often help… two columns per section, with a small left column for the title and a brief description of each part…"

Read: [design/layout/doc/space.md](/framework/design/layout/doc/space.md), [ext/Figma/doc/figma-layout.md](/framework/ext/Figma/doc/figma-layout.md), [page-layout.md](/framework/ext/Figma/doc/page-layout.md), [use-figma.md](/framework/ext/Figma/doc/use-figma.md) (the "Slot, property, swap or variant" table), [slots.md](slots.md) (the `Site template` / `Section template` just built on `Kit · Slots vs components`: reuse them, don't rebuild), [two-col.md](two-col.md) (section-level two-column variants already on `Layouts · Two columns`), [lists.md](lists.md) (sidebars, TOC). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first. Notes box at the top.

## Page `Templates · Two-column pages` (new)
1. **12–16 page templates, each a 1920 COMPONENT** (`Template / 2col / <name>`), top level on the canvas so the purple label shows. Each uses slots for content and properties for title and description. Vary along the axes the owner named:
   - split: 280 | fill, 360 | fill, 1:2, 1:1, fill | 400 (right rail);
   - grounds per side: gray | white, white | white with a card, dark nav | light content, near-black | dark, a prime splash only as an accent;
   - what the left holds: a nav tree, a TOC, a section title + description (the "metadata" column), filters, a profile;
   - what the right holds: one flowing article, a card grid (wrap, min/max), a masonry, a table, a form;
   - sticky left vs scrolling left (annotate it).
   Include the "section rows": each section is itself two columns (a narrow title + description on the left, content filling the right), repeated down the page.
2. **Filled examples:** place 6 of the templates as instances filled with REAL content from the file (move nothing: put new instances of existing specimens, Lists, cards or charts into the slots) to prove variable-height content sits well. At least one with equal-height card rows, and one masonry.
3. **Navigation:** at least 3 templates use the `Site template` global nav, with the inner sidebar/TOC from `Kit · Slots vs components`. A clickable prototype between 3 filled examples (▶ PROTOTYPE badge; prototype frames top level in a Section).
4. **How to use** box: copy an instance → set the title → fill the slots; when to pick which template.
5. **Verdict** in Notes: the 4–5 templates you'd use for most pages, and one you'd use to redo the DS pages.
6. The page itself gets a 1920 `Page · Templates · Two-column pages` overview component that shows the templates at reduced scale with captions (the masters stay full size, top level, beside it).

Screenshot every template at 100% and fix voids, clipping and ragged edges. Link it from the Overview design-system card. Report `kit/templates.md`, committed by path.

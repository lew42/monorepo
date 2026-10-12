# UI library: one browsable library of everything we built, that is itself built with the kit (mastermind brief)

**Owner (2026-10-12, dictated):** "What I've always wanted is a browsable UI kit where the UI kit itself is designed with the UI kit." You browse pages that each use a different kind of navigation, and so experience the whole system until it is self-evident. We never got there: many preview grids link to a stage with code, but it never clicks, and the layouts look broken. Start with a **mobile UI collection**, and gather what we've built (Figma cards and controls, ui, ux, sections, layouts, templates) into **one unified library**: "if we can do 5,000 sessions, why couldn't we do 5,000 layouts".

**Not now:** the stage redesign. The owner will design it in Figma first.

## The shape: a three-column browser (starting point)
- **Left:** a preview rail (like the inbox) of the items in the chosen category.
- **Centre:** the selected item at 100%, with tools around it (responsive widths: the stage's job, kept minimal).
- **Right:** a preview rail of its variants and related items.
  - Variants can be real children: clones of the parent that change when the parent changes ([page-templates](../page-templates/requirements.md); try it only if it works cheaply).
  - Related items come from a simple rule first, an algorithm later.
- **Clicking an item on the right makes it active:** its siblings fill the left rail, it fills the centre, and its own variants fill the right. So you walk a tree of pages.
- Filter by category, browse, route everything (each view has a URL).

## Previews: sizes, zoom, layout
- **`optimalWidth` on every template:** 400 mobile, 1000 default, 1920 desktop, 3440 mega. All templates are responsive; this says where one shows best.
  - A preview grid filtered "3440" renders anything that can grow to 3440, at 3440 scaled down, so you see how the columns stack.
  - The same template can be previewed at several widths.
- **Mixed heights:** a one-word button next to a two-row card and a wall of text breaks equal grids. Options:
  - masonry (find past work: the owner asked before);
  - grid with a row and column span per item, from its size;
  - grouping by size.

  Pick one, record the alternative, and pick one zoom rule.
- **Padding contract, as template properties:**
  - `needs_parent_padding`: a card with a border or background difference needs room around it.
  - `no_parent_padding`: full-bleed layouts that must not be padded.
- **Red-flag misuse:**
  - CSS shades the area red when a `needs_parent_padding` item sits in an unpadded container.
  - A JS check logs it so `Server/smoke.mjs` fails.
  - The page assembler refuses or suggests the fix (add a background, move the padding) before rendering. We often put the wrong thing in a box, then add padding that breaks scroll and layout.

## Tree and data questions (decide, record the alternative; check with @mastermind-page-templates)
- A **tree** for browsing and editing pages, like Figma's left sidebar: pages at the top, layers under each page.
- A page today can hold child pages, items and content. You probably have items **or** content, not both.
- Dragging an item onto a page: does it become a child page or an item? Probably whatever it is (a page stays a page, an item an item), since a page is an Item plus routing. Say what the slimmed `Page` class holds now (the split landed: `Page.class.js` 2,270 → 849 lines).

## Order
1. **Past work** (`past-work` skill): every preview grid, UI kit, stage, browse wall, masonry ask and catalog.
2. A `plan.md` and the class architecture page.
3. The smallest slice: the three-column browser over the Figma cards and controls plus `ui/` (mobile first), with `optimalWidth`, one preview layout rule, and the padding red flag in smoke.

Then widen to the other collections. Coordinate with @mastermind-layout-catalog (the catalog becomes one view of this library) and @mastermind-data-grid (the rail).

Opus 5.5 for design, Sonnet to build, Haiku for scans; keep your context under 100k. Worktree; screenshots at 400/1200/1920/3440 before and after; `hold.mjs`; smoke clean; commit each step; merge. `STATE.md` here; one-sentence replies; land with `finish-task`. Budget open.

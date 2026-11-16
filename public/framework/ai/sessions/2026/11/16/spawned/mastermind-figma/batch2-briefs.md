# Batch 2 briefs (2026-11-16): three Figma builds in Lew42 v2

Shared: read [explore-brief.md](./explore-brief.md) first (rules, Index-first, reuse, no new masters, masters loose on the page root, " Set" names). File `ADpu9u2V0BlEZfR3rrMfER`; reuse Figma `sessionId` `bbeccbc5-c30f-4059-88a0-e7ee9cdd59bc`. Skills `figma-use,figma-generate-design`. Budget $6. Never wait; decide and note the alternative. Screenshots rationed: at most 8, one per finished section.

**The Scale modes were renamed today (2026-11-16)**, resolution first: `360 XS`, `400 Mobile`, `600 SM`, `1000 Default`, `1600 LG`, `2600 XL`, `3440 Mega` (ids unchanged: 2:5, 2:1, 2:3, 2:0, 2:4, 2:6, 2:2). Look modes up by name from `getLocalVariableCollectionsAsync()` (`Lew42 v2 · Scale`, id `VariableCollectionId:2:2`). A new FLOAT variable **`width`** (`VariableID:49:1505`) holds each mode's resolution (360 ... 3440): bind a frame's width to it (`node.setBoundVariable('width', v)`) and the frame follows its Scale mode. Old static labels that say `XL`, `Mega` etc. are now stale; write new labels as `<resolution> <name>`.

The owner hand-edits pages: **before editing anything, re-read the current state** (`get_metadata` or a read-only `use_figma`), keep his hand fixes, and never touch `Index`, `Icons`, `Scale`, `Elements`. No edits to variables or collections.

---

## A. `Explore – 2600 layouts` (34:475): fix the overlaps and wrong sizing

Done by agent `figma-2600-fix`. The page is still broken (the owner's report):

1. **Headings overlap labels** (a screenshot he pasted): section headings and the small text labels above/below frames collide. Find them (take one screenshot of the whole page, `maxDimension` ~4096, and zoomed shots of the worst areas) and fix by layout, not nudging: put each heading, label and frame in a vertical auto-layout stack so nothing can overlap, or give the section enough gap.
2. **`Layout.Miller.Mobile Set` (34:1572):** the list and detail stack in reverse order (detail above list; list should come first), there is an empty column, there is too much padding, and children are **Fixed** width where they should be **Fill**. The owner fixed two of these by hand: read the current state and keep his fixes.
3. **Wrong fixed widths everywhere on the page:** any child of an auto-layout frame that should stretch (cards, columns, text) must be Fill; only the outer region (the width-matched page frame) is Fixed. Audit all 13 page children; return a before/after count of FIXED children that became FILL.
4. **Sidebars:** any sidebar with a full-width (full column height) background must be **Fill height**, never floating auto-height. Fix all sidebars, in the component sets too (`Layout.Sidebar Set`, `Layout.Miller Set`, the `Sidebar` master 34:486).
5. Re-test each fixed layout with a short and a long text string, then a final whole-page screenshot and a screenshot of `Layout.Miller.Mobile Set`.
6. Update stale mode labels on the page to the new names.
Final message to `mastermind-figma`: before/after screenshot links (Figma node links), counts, what is still wrong.

---

## B. `1920 Pages` (43:8101): one page frame per mode width

Done by agent `figma-pages-modes`. The owner built a `Page` master (43:8103, 1920 wide, auto layout) on this page. **Do not edit the master.** For each Scale mode make one **instance** of `Page` named `Page · <resolution> <name>` (e.g. `Page · 360 XS`), seven in all, in a row or a wrapped auto-layout grid beside the master, each with a label above:

- set the frame's Scale mode explicitly (`setExplicitVariableModeForCollection(scaleCollection, modeId)`) to its mode;
- bind its **width** to the new `width` variable (so it reads 360 ... 3440 by mode); height stays Hug (auto), with a short placeholder body if the master has none (do not add masters; use plain frames or existing masters);
- read the master's padding bindings first (section-pad-x/y suggestion is in [component-inventory.md](/framework/ext/Figma/doc/component-inventory.md)); report whether the instances show the right padding per mode; do not change the master.
Final message: node links, a screenshot of the row, anything the master blocks (e.g. an instance width that cannot be bound).

---

## C. New page `Explore – Drag playground`: drag any card into any layout

Done by agent `figma-playground`. Create the page (en dash, exact name; do not touch other pages). The owner wants to **drag a card into a layout and watch it adopt the layout's Scale mode**. Build, with plain auto-layout frames (no new masters; reuse `Card` 16:364 on `Scale`, `Card Set` 34:244, `Button`, and the `Layout.* Set` components on `Explore – 2600 layouts` only if their instances are clean; no slots yet):

1. **Layouts**, each a labelled auto-layout frame with a Scale mode set **per region / per column**, a different mode in each column so adoption is visible (label every region `<resolution> <name>`): a sidebar layout (sidebar + main), a 2-column, a 3-column and a 4-column layout. Columns and sidebars Fill height, children Fill width, so a dropped card stretches.
2. **A tray of loose cards** beside them (about 8), each an instance of the existing `Card`, with the Scale collection left on **Auto** (no explicit mode, so dragging into a region makes it inherit). Vary the text (short and long) so the effect shows.
3. A one-line label on the page says what to try. No slots.
Test: drag-equivalent in the API, move a loose card into a column with `appendChild` and check its bound padding/gap resolved to that column's mode (read `resolvedVariableModes` or compare values), then put it back. Final message: link, screenshot, the test result.

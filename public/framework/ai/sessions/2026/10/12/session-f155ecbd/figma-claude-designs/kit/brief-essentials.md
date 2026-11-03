# Brief: Essentials: the condensed view, best first, all instances (owner, 2026-10-14)

The owner: "with the cards, the buttons, the text elements, a condensed view. There are expanded views where we see every single permutation; the condensed view shows just the most important ones, prioritised first. That's what I'd like to work on, in terms of cards: different card styles. Build templates that use our styles. We want to be dogfooding: creating things and then using them. Everything should be, as much as possible, an instance of a component."

Read: [file-map.md](/framework/ext/Figma/doc/file-map.md) (where everything lives), [design/layout/doc/space.md](/framework/design/layout/doc/space.md) (composition first, colour last; reading width; strong margins; no ragged grids), [page-layout.md](/framework/ext/Figma/doc/page-layout.md), [figma-layout.md](/framework/ext/Figma/doc/figma-layout.md), [use-figma.md](/framework/ext/Figma/doc/use-figma.md) (edit masters, never the same override everywhere). Reports: [templates.md](templates.md) (section-rows template), [ds-rows.md](ds-rows.md). File `QYN0G2URSBHYH5I06MOjxU`; load the figma-use skill first.

## Page `Essentials` (new; placed right after `Index · full size`, so it is page 3)
One 1920 `Page · Essentials` component built on the **section-rows** template (title + one sentence left, content right). Everything on it is an **instance of an existing component**; if something needed has no component yet, make the component first (master top level, beside the page) and then place an instance.
1. **Type**: the 5–6 text styles in use, each as a real sample line (h1 → small), with its one-word role.
2. **Buttons**: the 4 that matter (primary, secondary, ghost, icon), plus one button row.
3. **Cards: the main event.** 6–8 card styles side by side, the most useful first: plain card, card with header + actions, stat card, list card (rows edge to edge), media card (image top), feature card (icon + title + text), quote/context card (the launch-arrow one from Screens · Transcription), callout/alert card. Each is a component (`Card / <style>`) with a Content slot where it helps; each gets one caption ("use for…"). Equal heights, top-aligned.
4. **Inputs**: field, search, select, toggle, checkbox, segmented control: one each.
5. **Lists**: list row, tree item, section header.
6. **Status**: badge, progress bar, step list: one each.
7. **Colour last**: one row at the end showing three of the cards on the dark ground (instances of the same masters, Text mode only).
Captions say what each item is, in at most 8 words. No expanded permutations: link to the full DS page for each row (a text hyperlink to that page's `Page · …` component).

Screenshot at 100%, fix, then report `kit/essentials.md` with the new card component ids (the demo agent will reuse them), committed by path.

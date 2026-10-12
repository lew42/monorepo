# Generator word semantics — wave A of the column-pages round 2 run

The owner's ask, verbatim, is [`../column-pages-2/requirements.md`](/framework/ai/2026-08-27/column-pages-2/requirements.md).
The first six paragraphs are this task's spec. Itemized:

1. **Words need children to visualize, and all children look identical.** Generated placeholder
   content must be seeded-DISTINCT — siblings get visibly different content, drawn from the seed
   so it stays reproducible. A childless node wearing a nav word shows its empty state, not nothing.
2. **tabs and vtabs switch IN PLACE.** Selecting a tab swaps content inside the same column; it
   must not spawn a column to the right. Reuse `ext/tabs`' region behaviour; respect the core
   verdict "no `.block` tab strip directly above full-height columns".
3. **rail dies as a word.** It is a slightly different vtabs. The real concept is a LIST — an inbox:
   small previews left, selection opens the detail to the right, which is the columns mechanic.
4. **wall and grid merge** into one word.
5. **Prune.** Judge each word: does it change BEHAVIOUR (earns codification) or is it content-shape
   (a pattern example shows it better)? Cut what does not earn it; show the cut ones as short
   `new Page()` patterns.

Consequences owned here: the model changes, so every seed redraws — a declared version change,
noted in `doc/decisions.md`; `rules.js` PAIRS moves to the new vocabulary; the same-seed-twice
reproducibility proof keeps working; the Overview palette band and `ext/demo/mini` follow the
renamed/merged/removed words only.

## Fence

Owned: `core/Page/generator/**`, `core/Page/page.js`, `ext/demo/mini.js`, `ext/demo/mini.css`.
Nothing else — a sibling owns `Page.class.js` / `Page.css`; a needed core hook is logged and
worked around locally.

The dev server on :80 is the owner's — browsed headless, read-only, never restarted.

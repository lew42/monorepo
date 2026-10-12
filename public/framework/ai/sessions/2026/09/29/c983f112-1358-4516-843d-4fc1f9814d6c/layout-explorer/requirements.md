# Layout explorer: requirements

The owner's words: `/framework/ai/2026/09/29/layout-explorer-3-columns-and-a-study-of/owner-words.md`, the first half.

## The HTML study: done, follow it
The study exists: [`html-study.md`](/framework/ai/2026/09/29/layout-explorer-3-columns-and-a-study-of/html-study.md), with the full DOM trees and screenshots in `html-study/`. Don't write another. Follow its recommendation: **one page, `/layouts/explorer/…`, with three regions (left: siblings, centre: the selected page's real view scaled to fit, right: its children), all filled from the page tree's data** (`children` plus each page's `preview()`) for the current URL. Do **not** build it from nested column pages; that keeps every ancestor mounted. Hide `app.left` (the framework sidebar) on this page, and leave the right drawer free for properties.

## The explorer, in three columns
- **Left rail:** the current level's items as small preview cards (siblings). At the top level, these are categories, most primitive first: one-column layouts, two-column layouts, and scale groups such as mobile and mega.
- **Center:** the selected item, LARGE. It's a real full view at a responsive zoom, or in one of our responsive viewports.
- **Right rail:** the selected item's CHILDREN (its variants), as preview cards.
- **Clicking a child shifts everything one level down:** the old right rail becomes the left (siblings), the child goes to the center, and its children fill the right. It works as a tree. Every step is ROUTED (its own URL, with back working).
- **Each layout is its own PAGE.** A preview card is that page rendered scaled down, not a screenshot, and it's clickable.
- **Aim:** every layout on the site (/layouts/, core/Page width words, the approved five, layouts/decide, the sidebar variants and the floating page) sits in this one tree.
- The ☰ drawer can show the selected layout's properties.

## Rules
Reuse the page previews and responsive viewports that exist (find them first), and core/Page routing. Minimal new CSS. Use a pool worktree, the smoke test with links followed, merge.mjs, a fresh-eyes review ("can the owner browse from 'two columns' to one variant and back in 10 seconds?"), and screenshots at 1920 and 3440. At most 3 minions; budget about $10. Post on card 2026/09/29/layout-explorer-3-columns-and-a-study-of.

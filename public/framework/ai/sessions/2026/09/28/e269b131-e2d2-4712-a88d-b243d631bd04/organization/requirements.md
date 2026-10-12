# Organization mastermind: requirements

The brief is the owner's own words, in `owner-words.md` beside this file. Read them in full, and keep the owner's names for things. More dictation may follow; the VS Code tab will append it there and tell you.

## The owner's asks, numbered (tick each one against the owner's sentence)

1. **Spend slowly and carefully.** Step by step. Say the $ cost of each step before running it. The last audit burned tokens and had to be halted; this one must not. Default to Sonnet for reading and Haiku for scans. Use Opus only to judge.
2. **An organization card** (this card: 2026/09/28/organization-what-matters-most-paging-fi), built as structured content, not paragraphs:
   - top: the biggest, most important things;
   - middle: secondary things;
   - bottom: one-off tasks that don't group well.
   Each item is a link that NAVIGATES to its real page (a doc page, a task, a card), not a sub-card, so the owner gets the full screen.
3. **Link every earlier audit** from this card. Start with:
   - the open-tasks sweep (/framework/ai2/2026/09/25/open-tasks-where-each-one-is-and-what-ne/);
   - loose ends (/framework/ai/2026-09-24/loose-ends/);
   - the feedback council (/framework/ai/2026-09-25/feedback-council/);
   - the paging audit (/framework/ai/audits/paging/);
   - the css-audit, page-audit and layout-check tasks from 09-25;
   - public/framework/ai/todo.md.
   Find the rest by scanning, cheaply (Haiku).
4. **Prioritize by weight:** low-hanging fruit first, meaning quick fixes that carry a lot of weight.
5. **Paging first. Set everything else aside for now.** Audit and rewrite the paging system's REAL documentation pages (/framework/core/Page/ and its tabs, the `page` skill), not new side content:
   - little writing; headings that do the work (H1, H2, and H3 as small section headers);
   - icon items as navigation to the frequently used topics;
   - cross-references wherever they make an idea tangible;
   - keep the existing navigation (top tabs, left tabs). Don't clobber it; when unsure, link to a new page rather than rebuilding the navigation.
6. **An object card:** a small card that shows an instance or class (its name, then its properties and methods), so a doc shows "this is a Page, and its property X = Y" instead of explaining it in words. Design it once, use it on the paging docs, and make it a template per class later. (Data grids: later.)
7. Use the structured-content vocabulary being designed now (card 2026/09/28/structured-content-icon-cards-outlines-b, /framework/ux/Content/structure/) and the page skill. Don't invent a second vocabulary.

## Continued (about 1:30 PM): the page mastermind

This task is now the **page mastermind**. The card is renamed to match. The owner's words are in `owner-words.md` under "Continued".

8. **Audit as a new user, before any rewrite.** For each kind of page, columns included, check whether the simplest example comes first: the code that makes it, then what it produces. Build on the existing overview preview grid. Don't nuke it.
9. **Document every way to create a page:**
   - `page.js`;
   - `page.jsonl` (the loader picks whichever file the folder has);
   - dynamic or index pages with no folder, such as the AI 2 cards and `board.jsonl`.
10. **Settle the layout vocabulary:**
    - layout 1 is standard: one column, about 300–1000px, responsive down to mobile;
    - layout 2 is wide, the `wide` word: two columns in any proportion, stacking on mobile;
    - layout 3 is fill: three or more standard columns, and how they respond on a wide screen (centred or left-aligned);
    - the page's top-down shape (background, padding, full-bleed column pages) counts as much as its column count.
11. **Mine `/imagine/`** for past layout work, and fit it into the paging system.
12. **Rethink the core/Page top tabs and their left navigation.** Every reading minion suggests a structure. Methods and Properties tabs, with each method on its own page, are fine. Big concepts get well-named concept pages, linked wherever they are mentioned; trivial ones don't.
13. **Weigh by value per unit of space.** What is fundamental and easy to show goes first. What is confusing and hard to show doesn't earn space.

## Order (stop after each step; post the result on the card before starting the next)

| step | what | model | est. |
|---|---|---|---|
| 1 | Scan for every audit and open ask from the last week, into one list with links | Haiku | $0.50 (spent $0.41) |
| 2 | Build the organization card: three tiers, each item a link, with paging on top | Sonnet, judged by me | $1.50 |
| 3 | Audit, as a new user, with three Sonnet readers in parallel. Each one proposes a tab and left-nav structure. **3a:** core/Page tabs and the page skill, checking simplest-example-first and the preview grid. **3b:** every way to create a page (page.js, page.jsonl, dynamic/index pages). **3c:** the layout vocabulary (standard, wide, fill, top-down shape), plus mining `/imagine/`. | 3 × Sonnet | $4.50 |
| 4 | One structure proposal: a merge of the three suggestions, with the value-per-space order and the concept pages. It is posted as a Decision on the card | me | $0.30 |
| 5 | Object card, designed and used once | Sonnet | $2 |
| 6 | Rewrite the paging docs, one tab at a time: pool worktree, smoke test, fresh-eyes review, screenshot | Sonnet per tab | ~$1 per tab |

Anything waiting on the owner goes on the card as a Question or Decision (ux/Content), never only in a message.

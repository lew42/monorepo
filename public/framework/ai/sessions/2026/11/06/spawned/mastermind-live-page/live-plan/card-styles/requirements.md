> **Superseded 2026-11-09** (the owner, via voice-app): one consistent kit, not one-off card CSS. Card and list variants go into /framework/library/ as children of ui/card (and row, item, tree), owned by mastermind-ui-kit. The draft built from this brief is on branch `draft/card-styles` (e1d7bebd3), handed to ui-kit and never merged.

# Card styles: 3 to 5 list and card variants side by side, at /live/demos/cards/

Budget: $4 (Sonnet). Load the `minion` skill first, then `css`, `page` and `layout`.

## Why

The owner (2026-11-09, relayed by voice-app) finds /live/'s cards too big and heavy on a phone, and wants to pick a style by seeing it. The pick will then be applied to all LivePage cards in a later task. This task only builds the demo page; it changes no existing card.

## What to build

A page at **`/live/demos/cards/`** that shows **the same five sample items** drawn in 3 to 5 variants, compact to large, each under a letter heading (A, B, C…) with one plain line saying what it is. Variants, built from styles that already exist (framework.css utilities, `ui/` components, the LivePage card look), with **no new CSS system**:

- **A. Today's LivePage card, with an H3 title** instead of the current big title (the smallest change).
- **B. Stacked cards, zero gap:** one rounded group, rows divided by a hairline, like a settings list.
- **C. Icon rows like a file tree:** icon and title on one line, no background, no border.
- **D. Compact list:** one line per item, title then a short grey detail, tight spacing.
- **E. (optional) Large card:** today's card as it is, for comparison.

The five sample items: mix a link item (has a chevron), one with a two-line title, one with a short text under the title, one with a Material icon, one done task. Use Material icons (`icon` from View), coloured by the scheme, no emoji.

Layout: on a phone the variants stack, one after another. At 1200 and wider, show them side by side in columns so they can be compared at a glance.

Pick the simplest way to build it: a `page.js` (see `public/live/calibration/page.js` for how a page.js under /live/ is written) with a small CSS file, or a LivePage `page.jsonl` if its card types can already draw every variant. Link the new page from `/live/demos/`'s list (its `page.jsonl`, through the page tools or the `item` tool, never by hand).

## Proof

- Headless shots at 400 and 1200 of `/live/demos/cards/`, saved in this task folder and committed. Read them yourself: every variant visibly different, no overflow at 400.
- `node Server/smoke.mjs <worktree>` with no FAIL.

## How

- Work in a worktree (`take_worktree`). `public/live/` is gitignored, so add new files with `git add -f <exact path>`. Commit by exact path.
- **Don't edit** `public/live/LivePage.js`/`LivePage.css` (another worker is on them), `core/`, or `Servex/agents/page_tools.js`.
- **Don't merge.** Log the branch, commits and shots as `log` lines on your task, then `close_task` with outcome and evidence.
- Never: kill or restart the dev server or Servex, drive the owner's tabs, use git's stash, or delete recursively in the main tree.

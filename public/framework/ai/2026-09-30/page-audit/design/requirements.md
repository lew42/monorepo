# Design audit in horizontal bands: nine main pages (minion brief)

Parent: mastermind-page. Budget: about $3. Opus at high effort, because a reader that measures the live CSS finds real causes, and Haiku got them wrong (card 2026/09/29/experiment-3-models-read-the-dictate-spa).

## The owner's words (owner-words.md in the parent folder, "Continued, about 12:35 PM")
"treating any screenshot in kind of horizontal rows. Are we using this section properly? Is it the right size? Is it too big or too small? Does it have the right amount of padding?" · "instead of having four or five rows of tabs, which on mobile gets kind of cramped" · "the padding on mobile is a little bit too much… multiple levels of padding… big clunky blocks" · "Are things wrapping to another line when you didn't expect it?" · "we don't necessarily have to obsess over things we've already decided on, but there's a lot of simple errors that could be improved."

## What's already here
`node Server/layout-check.mjs --bands` has run on nine pages. Each folder in THIS directory holds `400.png 1200.png 1920.png 3440.png sheet.png layout.json` (tab_rows, left_stack, bands with share and ink, wraps). The pages: `/`, `/framework/`, `/layouts/`, `/imagine/`, `/framework/core/Page/`, `/framework/ai2/`, `/framework/ai/`, `/framework/core/Layout/`, `/notes/`. The site is `http://monorepo.localhost/`.

## The job
1. For each page, read the screenshots top to bottom as bands. For each band that's wrong (too big, too small, padding stacked, an unexpected wrap, space wasted at 3440, cramped at 400), find the CAUSE in the live CSS: open the page headless (Playwright via `Server/browser.mjs`, never the owner's tabs), `getComputedStyle` the element and its ancestors, and name the rule (file:line) that sets it. Skip anything that's fine.
2. Write `findings.md` here: one table ranked by how much it would improve the main pages (how many pages share the cause × how bad it looks). Columns: rank · what you see (plain words) · pages · width · cause (file:line) · fix (the CSS change) · obvious? (yes if it's a few lines in one place with no design decision in it).
3. Fix up to three of the "obvious" ones. Work in a worktree (`node Server/worktree-up.mjs design-bands`), re-run `layout-check.mjs --bands` on the affected pages to get before and after numbers, and merge with `MSYS_NO_PATHCONV=1 node Server/merge.mjs <worktree> --skip-smoke --no-review "<why + before/after>"` (the smoke test fails on uncommitted AI 2 card dirs that no worktree has; that's known). Then `node Server/worktree-down.mjs design-bands`.
   Load the `css` skill before writing CSS. Every rule sits inside a layer.

## Don't
- Don't change how the Doc top tabs wrap: that's a feature of its own ("more ▾", or grouping the tabs). Put it in findings.md as a row, with what you measured.
- Don't touch `ai2/` (other agents are building it) or `ext/JSONL/`. Record their rows only.
- Never `git stash/checkout/reset` in the main tree. Scratch files go in your session scratchpad.

## Return
At most 8 lines: the top 5 findings in one line each, what you fixed with before/after numbers, and the merge commit.

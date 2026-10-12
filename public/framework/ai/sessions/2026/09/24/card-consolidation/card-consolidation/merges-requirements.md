# The first three card merges (builder brief)

You are a minion of `task-mastermind-content-modules`. Load the `minion` skill first, then `code`, `css`,
`ui-test`. Read [requirements.md](requirements.md). The owner's words:

> "we need to be more careful about what kind of cards we have, whether we're using the right one in the
> right place ... We're still breaking things frequently, like the wrong spacing in the wrong places."

**The owner was burned by a padding sweep once already.** You change exactly the three merges below,
nothing else, and you prove every page that uses them with a before AND after screenshot.

Worktree `C:\Code\lew42\worktrees\page-cards` (dev server `http://localhost:4817/`). Log milestones to this
dir's `task.jsonl` with `node .claude/hooks/append.mjs`. Do not commit.

## The plan (read it, it is the spec)

`public/framework/ux/Content/plan/plan.json`, merges `ui-cards`, `ui-pills`, `link-tiles`, in that order.
Each lists its kinds, files, pages and the measured `visible_change`. The page: `/framework/ux/Content/plan/`.

## Fence

Exactly the `files` listed in those three merges (plus `public/framework/styles/sections/stats.js` for
ui-cards). NOT `framework.css` or any other shared stylesheet. If a merge needs a file outside its list,
stop that merge, log why, and go on to the next.

## Steps

1. **Before, first, for all three.** Shoot every page in the three `pages` lists (and the `screenshot`
   lists in `order`) at 1920x1080 and 390x844, full page, headless (Playwright, never the owner's tabs),
   into `C:\Code\lew42\monorepo\public\framework\ai\2026-09-24\card-consolidation\shots\before\<slug>-<width>.png`.
   Record console errors per page as the baseline.
2. For each merge in order: `node Server/hold.mjs on "minion-card-merges — <merge id>"`, make the change,
   load its pages, `hold off`. Then shoot the same pages into `shots/after/`. Measure the kind's first-word
   offset and height as the plan did and compare to `visible_change`. A difference the plan did not predict
   (anything else on the page moving) means: revert that merge, log it, go on.
3. Delete any CSS rule the merge made dead (e.g. `.decks-card` padding), only in the files in the list.
4. Write `shots/index.md`: one row per page: before | after, side by side (markdown image pairs), plus the
   measured change and "no other change" or what else moved.

Report: per merge: done or reverted, the files changed, the measured before → after, pages shot, any new console error (there must be none).

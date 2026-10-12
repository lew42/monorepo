# The consolidation plan (planner brief)

You are a minion of `task-mastermind-content-modules`. Load the `minion` skill first, then `code`, `css`,
`layout`, `new-page`, `new-css-class`. Read [requirements.md](requirements.md) start to finish: the owner's
words there are the acceptance test. Log milestones to this dir's `task.jsonl` with
`node .claude/hooks/append.mjs` (no launch line of your own). Do not commit.

Worktree `C:\Code\lew42\worktrees\page-cards` (dev server `http://localhost:4817/`). Other teams write
here: `node Server/hold.mjs on "minion-card-plan — ux/Content/plan"` before your batch, `off` after you
have loaded the page.

## Input

- `public/framework/ux/Content/catalog/catalog.json`: 75 merged kinds with sources, classes, render
  snippets, paddings, bleed, duplicates. Its page: `/framework/ux/Content/catalog/`.
- `public/framework/framework.css`: the three spacing words: **a page region is `.pad`, a framed box
  is `.card`, a control or row is its own `em`** (read the `.card`/`.surface`/`.pad`/`.bleed` rules themselves).
- Past lessons: the `new-css-class` skill (180 hand-rolled card classes, the padding audit of 2026-09-19),
  and `public/framework/ux/page.js` (the `--pad-card` vs `--pad` comment).

## Fence

`public/framework/ux/Content/plan/**` (new), plus one link line each in `ux/Content/page.js` (the index,
beside the catalog link) and `ux/Content/catalog/page.js` (under the numbers: "The plan to shrink this →").
**Step 1 changes NO existing CSS or JS anywhere else**: this is a plan, and the owner was burned by a padding sweep.

## Deliverables

1. `plan/plan.json`:
   - `targets`: the smallest set of kinds that covers every real job. Each target has name, job (one
     sentence), classes (existing classes preferred; a new class only if no existing one fits, and prefixed
     per new-css-class), padding, bleed, and `rule` (the reason, one plain sentence).
   - `kinds`: all 75 catalog kinds, each with exactly one of `into: <target>`, `keep: <why no target covers it>`, or `drop: <why>`.
   - `merges`: each group that becomes one target: the source kinds, `risk` (low/med/high with the reason),
     `files` and `pages` (grep-counted, list them), `visible_change` (what a reader would notice, in pixels
     where you can say it: "padding 16px → 24px on 12 tiles").
   - `order`: the merges, least risky first; each names the pages to screenshot before and after.
2. `plan/page.js` (+ `readme.md`, `doc/`): for the overwhelmed newcomer.
   - Level 1: two big numbers (75 → N kinds, 19 → M padding rules) and the target set drawn live, one tile each.
   - Then each merge as a before/after pair SIDE BY SIDE, both drawn live: before = the current real
     classes (reuse the catalog's render snippets), after = the target. Label the risk and the pages touched.
   - Then the ONE spacing table (target · padding · bleed · rule).
   - Then the migration order as a numbered list.
3. Load it at 1920 and 390 (`mcp__site__shot`, never the owner's tabs), open both, and fix what's wrong. Zero console errors, zero failed requests.

Report: N, M, the first three merges in order with their page counts, the URL, and the shot paths.

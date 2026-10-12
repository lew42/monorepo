# Page.class.js split, step 7: jsonl (the last move)

**Plan:** [core/Page/doc/split-plan.md](/framework/core/Page/doc/split-plan.md) step 7. Steps 1-6 landed tonight ([page-split-1](../page-split-1/STATE.md), [page-split-2](../page-split-2/STATE.md)): 2,270 to 1,089 lines, nothing broke. Jsonl (~470 lines: replay, the file steps, `set()`'s jsonl handling) is the core path of every page, so this is the careful one.

## Do
- Move the jsonl replay and file steps into their own class file (`Page.Jsonl`, or the name the plan settles), held by the page or attached as a static so a subclass can swap it. `page.set()`, `Page.Reader` and every public name keep their exact behaviour; replay order is unchanged.
- Before moving: record a baseline. For 40 pages (core, ai, sessions incl. a live session page, imagine/paging, markdown, a parts page, a page-tool-built page) save the computed state (`page_read`) and a 1200 screenshot. After: the same, diffed. Any difference is a failure.
- Prove the page tools still stream: `page_set`/`page_add` on a scratch page show in a watching headless browser within a second (as in `core/Page/doc/ai-api.md`'s proof).

## Done when
- [ ] Baseline vs after: 0 state diffs, 0 new console errors, screenshots match at 400/1200/1920/3440. Smoke clean.
- [ ] `split-measure.mjs` before/after in `STATE.md`; step 7 ticked; split-plan.md says the split is complete.
- [ ] Merge with live reloads held during the batch. If any diff can't be fixed, don't merge: leave the branch and write why in `STATE.md`.

Sonnet 5.5, high. Worktree. Land with `finish-task`.

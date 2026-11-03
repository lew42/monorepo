# mvp-table — the table on /imagine/platform/mvp/ looks broken; find what broke it today and fix the cause (Sonnet)

The owner, 2026-09-06 11:35: *"imagine platform mvp table looks broken... why can't we get clean layout????"*

Read first: `../../2026-09-04/mastermind-platform/minion-rules.md`; `public/imagine/platform/mvp/page.js` (the table — it uses the `table-equal` class the mastermind added on 09-04 to equalise column widths; the platform-slice minion added a "Running" section above it this morning); `framework.css` (the `table` rules and `.table-equal`), `core/Page/Page.css`. Skills: `new-task` (this dir, group `layout`), `css`, `layout`, `finish-task`.

## The work

1. **Look first.** Screenshot `/imagine/platform/mvp/` at 1280 and 3440 on the shared server and say in one sentence what is broken (columns collapsed? overflowing? the header row wrapped? the table past the measure? cells at x:0?). Measure the table's width, its columns' widths and the page's content width.
2. **Find what changed today.** `git log --since="2026-09-05" --oneline -- public/framework/framework.css public/framework/core/Page/Page.css public/imagine/platform/mvp/page.js public/styles.css` and read the diffs that touch tables, `.table-equal`, `max-width`, `width: 100%`, `bleed`, `wide`, or the pad/gap tokens. Bisect if you must: `git stash` is FORBIDDEN — use a scratchpad worktree (`git worktree add <scratchpad>/mvp-table/before <commit>`, serve it on `PORT=8089`, kill by pid, remove the worktree when done). Name the commit and the rule.
3. **Fix at the cause** — the rule, not the page — unless the page itself asked for something wrong (then fix the page and say why the rule was right). If the cause is a rule another minion is editing right now (`framework.css` control rules → ui-theme; `Page.css` → bleed-gutter and graduate-3), do not edit that file: write the exact one-line fix in your report and stop.
4. **Every table on the site**: grep `page.js` and `.md` files for `table(` / `<table` / markdown tables, crawl those pages at 1280 and 3440, and report how many tables overflow their container or sit past the measure, before and after. A table wider than its measure in a page grid is the layout skill's own rule: it claims `wide`.

## Fences and budget

Write: only the file that carries the cause (or `public/imagine/platform/mvp/page.js` if the page was wrong), this task dir. Shared server `http://localhost:8123/` — start none, kill none; one browser, ≤ 4 pages at once; Playwright is at `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs` — never search for it. Never `find /`; never spawn agents; never `git stash`/`git rm`/commit. Budget ~120k tokens. Report in ≤ 6 plain lines: what was broken (one sentence), the commit and rule that broke it, the fix, tables overflowing sitewide before → after.

# calls-core — two calls made, built into core: the elastic columns freeze at the ceiling, and even columns get a `fit` toggle

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (one declaration; one option). Clear beats brief by far. Prioritize (the freeze first — it changes every columns host — then the toggle).
**Length budget:** your landing report is one screen with the crawl numbers before and after.

## The owner's words (2026-09-18, 00:55)

> for those things that you said are my calls, the spacing ladder, the column count, just make a decision and document the alternative, or make a toggle that switches between each one. I don't want you to wait and not implement something because you're the mastermind. Make the call.

The mastermind's calls (decision lines in `ai/2026-09-17/mastermind-layout-browser/task.jsonl`, ids `nav-tuning` and `even-n-rounding`):

1. **Elastic columns freeze at the ceiling.** Apply `ai/2026-09-17/nav-stability/proposal.md` as written: `public/framework/core/Page/Page.css` line ~300, `flex: var(--page-column-flex, 1 1 0)` becomes `0 0 clamp(40em, 42cqi, 46em)` (the same number line ~305 already caps at — read both; if tonight's even-columns work moved the lines, find them by the declaration). `small`, `hug`, `fill`, `full` and the under-32em phone regime untouched. The alternative (34cqi — stays still AND fills 3440, but makes a reading column 357px at 1280) is documented in `core/Page/doc/columns.md` beside the change, with the sentence: hosts that must fill a wide screen use even columns.
2. **Even columns get `fit`.** `this.columns({ even: true, fit: "round" })` — `floor` stays the default (a column never under its recommendation), `round` fills tighter and can go under; store it beside `column_even` the same way (a config field would shadow the method — read tonight's record in `doc/decisions.md`). The N table in `columns.md` gains the `round` column for the Finder at 1280 / 1920 / 3440.

## Prove it

- **Before touching anything:** crawl every columns host and its demos on your private server (`PORT=8115 node server.js`, background, killed by its real Windows PID at landing): `/imagine/` (and three realms under it two levels deep), `/framework/core/Page/overview/columns/finder/`, `…/uses/docs/`, `…/uses/inbox/`, `…/uses/workbench/`, `…/uses/split/`, at 1280 / 1920 / 3440 — record per page per width: every open column's width, console errors, horizontal overflow of the row (a sideways scroll is now EXPECTED past the ceiling — say where it appears). Then the change, then the same crawl. The nav-stability measurement (open a child, re-measure the open columns: 0 / 0) on `/imagine/` and Docs.
- The lab `/imagine/design/navigation/`'s "today" row is built from core's classes: after the freeze it should read 0 / 0 too — say what it reads and update its caption if the row is no longer "today's behaviour" (the lab is `public/imagine/design/navigation/`, in your fence for that caption only).
- Two numbers that must agree: pages crawled before and after; the lab's readout and your measurement.

## Rules

- Load `code`, `layout`, `css`; `new-task` before the first edit (your dir exists: `ai/2026-09-17/calls-core/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you. Write the two calls as `decision` lines in your log (the verb exists) quoting the mastermind's ids.
- **Fence:** `public/framework/core/Page/**` (Page.css, the columns part of Page.class.js, doc/), the caption in `public/imagine/design/navigation/page.js`, your task dir. Nothing else.
- ⚠ Core is live on the owner's dev server (port 80 is listening now — never touch it; LiveReload will push your edit to the owner's open tabs, so make the core edit in ONE write, syntax-checked, and verify within a minute). Never `git stash`, never `find /`, never drive the owner's tabs.
- Landing: `outcome` = a headline (the freeze is in, N toggle is in), the crawl table summarised (pages, widths, columns that changed width and by how much, where sideways scroll appears), the links (columns.md, the lab), what was left and why. One screen.

# graduate-1 — slice 1: core gains the six words; nobody uses them yet (Opus)

Three laws: less is more (ASAP); clear beats brief, by far; prioritize. Length budget: the report is 10 plain lines; the numbers live in your log.

Read first: the repo's `CLAUDE.md`; `../mastermind-graduate/requirements.md` (the calls already made); `../../2026-09-04/mastermind-platform/minion-rules.md`; then **the plan, `../graduate-plan/plan.md`** — sections 2 (the seam), 3 (the proof and slice 1), 4 (risks) and 5. The plan was judged by the mastermind and is the spec: execute slice 1 exactly as written, file:line. Skills: `new-task` (this dir, group `paging`), `code`, `css`, `new-css-class`, `layout`, `finish-task`.

## The job

Slice 1 of the plan, and nothing past it: `core/Page/Page.class.js` gains `words()`, `word_classes()`, the two `.ac()` lines in `render()` and one in `render_column()`, the content-as-url branch with its loop fuse, `Page.read_json()` and `Page.from()`, and `Page.Frame` with its nine methods ported from `imagine/paging/stage.js`; `core/Page/Page.css` gains the one new block, inside `@layer theme`, after the columns section. Every default writes nothing. When you are done the site renders byte for byte what it renders now.

## Two calls the mastermind adds to the plan

- **`Page.Frame` may be its own file.** If `Page.class.js` would pass ~700 lines, put the class in `core/Page/Frame.js` (`export default class PageFrame extends View`), import it at the top of `Page.class.js` and hang it as `Page.Frame = PageFrame` beside `Page.Store`. Never a cycle: `Frame.js` imports `View`, never `Page`; it reaches its page through `this.page`.
- **Port, do not improve.** The nine methods come across from `stage.js` at the plan's lines with only the two substitutions the plan names (`this.config.<word>` → `this.page.<word>`, `paging-` → `page-`). A better idea you have on the way is a `log` line in your task, not an edit — slice 2 is where the lab gets simpler, and a change here that slice 2 does not expect costs a retry.

## Prove it — the plan's proof, run before AND after

1. Private server `PORT=8095 node server.js` from the repo root (kill the pid you started; never port 80; never the owner's tabs). Headless Playwright, scripts in the scratchpad under `graduate-1/`.
2. Before touching core: crawl the paging realm (108 pages, four widths), collect console messages, and screenshot the six control surfaces the plan names at 1280 and 3440. Save the shots in your task dir as `before-*.png`.
3. After: the same crawl, the same shots as `after-*.png`. **The pixel difference between each before/after pair is 0** — count differing pixels with a script and put the twelve numbers in your log. Zero console errors beyond the known `readme/page.js` probe 404.
4. The grep the plan gives: no page outside `/imagine/paging/` says any of the six words.
5. The throwaway page: one page under `core/Page/overview/` that says all six words, shot at 400/1280/1920/3440 (save the four shots in your task dir as `words-*.png` — they are the only picture slice 1 produces), then **deleted**, with its name removed from `children:` if you added it. `git status` at landing shows no file under `core/Page/overview/`.
6. Two numbers that must agree: lines added to core by `git diff --stat` vs the plan's estimate (~90 JS + ~40 CSS + the Frame); explain any gap over 30%.

## One skill correction, while you are in it

`../graduate-plan/task.jsonl` and `.claude/skills/new-css-class/improvements.md` record that step 6 of `new-css-class/SKILL.md` says core stamps `page-<slug>`; it stamps `page--<slug>` (two dashes). Fix the step's text and delete the entry. Nothing else in the skill changes.

## Fences and budget

Write only: `core/Page/Page.class.js`, `core/Page/Page.css`, `core/Page/Frame.js` (if you create it), the throwaway page (deleted before landing), `.claude/skills/new-css-class/` (the one correction), this task dir. Never: `Page.css` `@layer util`, `Page.css:280–390`, `Page.class.js:121–138`, anything under `imagine/`, `ext/`, `CLAUDE.md`. Never `find /`; never spawn agents; never `git stash`/`checkout --`/`reset`/commit. Budget ~350k tokens. Report in ≤ 10 plain lines: what landed in core (one line per file with the line count), the twelve pixel-diff numbers as one line, the four-width verdict on the throwaway page, anything you doubted.

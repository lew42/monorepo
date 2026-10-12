# graduate-2 — slice 2: the paging lab imports core's words and deletes its own copy (Opus)

Three laws: less is more (ASAP) — deleting beats adding; clear beats brief, by far; prioritize. Length budget: the report is 10 plain lines; the numbers live in your log.

Read first: the repo's `CLAUDE.md`; `../mastermind-graduate/requirements.md` (the calls); `../../2026-09-04/mastermind-platform/minion-rules.md`; **the plan `../graduate-plan/plan.md`** §2 (the seam), §3 slice 2 and its proof, §4, §5; **slice 1's landing, `../graduate-1/task.jsonl`** — read every `log` line, especially the four doubts at the end, and the files it wrote: `core/Page/Page.class.js` (`words()`, `word_classes()`, `render_content()`, `Page.from()`), `core/Page/Frame.js` (`PageFrame`), the new block at the end of `core/Page/Page.css`. Skills: `new-task` (this dir, group `paging`), `code`, `css`, `new-css-class`, `layout`, `ui-test`, `finish-task`.

## The job

Slice 2 of the plan, as written: `imagine/paging/blocks.js` drops its five word lists and re-exports core's under the same names; `stage.js` becomes `class PagingStage extends Page.Frame` and deletes the sixteen methods the plan lists, keeping the caption, the samples, the url and `stage_props()`; `paging.css` drops its four word blocks; `make/page.js` `grow()` becomes `Page.from()`; `build/stage.js` keeps crumbs, title and the child panel and inherits the rest. Every page in the realm renders what it rendered this morning.

## Four corrections slice 1 found — yours to make, in core, and nothing else in core

1. **`surface` paints the box only.** Slice 1 stamps `page-surface-*` on the page AND the frame's box, so `card` draws a card inside a card. The content box carries the surface; the page carries the background. One class each. Fix `word_classes()` / `Frame.js` so it is true, and prove it with the lab's `card` word at 1280.
2. **`paging.css`'s `.paging-stage-*` rules must not orphan.** The frame emits `page-frame-*` class names. Re-point the lab's remaining rules to the classes the frame actually emits, or delete them; a grep at landing shows no selector in `paging.css` whose class no file emits (say how you checked).
3. **`content` as a url works in a columns row too.** `render_column()` must use the same `render_content()` as `render()`. Prove with one page in a columns row whose `content` is a `.md` url.
4. **`tabs` stays outside the frame's SWAPS list** — `ext/tabs` brings its own panel. Leave it; write one comment line at the spot saying why, so slice 3 does not "fix" it.

## Prove it — before AND after

The plan's proof: private server, headless, the paging realm's ~109 urls at 400/1280/1920/3440, zero NEW console messages against a before-run (the known `readme/page.js` probe 404 stays); the six control surfaces at 1280 and 3440 pixel-diffed before/after — 0 except `/framework/`'s live clock. Then **the nine-step use test** from `../../2026-09-05/paging-audit-8/requirements.md` — pick, send, open cold, save, nest, content you wrote, edit from the page's own bar, save a nest, delete the page you made — with `ui-test`, every step screenshotted, the page you made deleted at the end, and `made/` byte-identical by md5 to before. Two numbers that must agree: lines deleted under `imagine/paging/` by `git diff --stat` vs the plan's ~500; explain a gap over 30%.

## Fences and budget

Write: `public/imagine/paging/**`; in `core/Page/` ONLY `Page.class.js`, `Frame.js`, `Page.css` for the four corrections above (never `@layer util`, never `Page.css:280–390`, never `child()`'s probe chain); this task dir. Never `imagine/paging/words.js`, `baseline.js`, `ext/**`, `CLAUDE.md`. Other minions are editing `core/Search`, `app.js` (one import), `public/notes`, `public/imagine/design/size`, page.js files elsewhere and `Server/` — expect them, do not touch them, do not measure them. Private server `PORT=8095 node server.js` from the repo root (kill the pid you started; never port 80; never the owner's tabs). Never `find /`; never spawn agents; never `git stash`/`checkout --`/`reset`/commit. Budget ~400k tokens. Report in ≤ 10 plain lines: lines deleted vs added, the four corrections each in one line with its proof, the nine steps' verdict, the pixel diffs as one line, anything you doubted.

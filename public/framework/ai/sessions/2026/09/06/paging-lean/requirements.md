# paging-lean — the paging pages go straight into the demo; the toolbars links show the thing or go (Opus)

The owner, 2026-09-06 11:40: *"these paging toolbars links don't really show anything meaningful… also, on this paging system, we don't need to write the h1, taking up so much space. instead, let's go straight into the demo to take less space."*

Three laws: less is more — delete the h1, delete links that show nothing; clear beats brief; prioritize — the demo is the page. The Presentation rule in `CLAUDE.md`: level 1 is the thing itself, shown, above the fold.

Read first: the repo's `CLAUDE.md`; `../../2026-09-04/mastermind-platform/minion-rules.md`; `../graduate-3/task.jsonl` — it landed just before you and changed `stage.js`, `blocks.js`, `paging.css`, the path bar and the rail; build on what it left; `public/imagine/paging/page.js`, `paging.js`, `stage.js`, `toolbar.js`, `toolbars/**`, `library/`, `mechanisms/`, `navigation/`, `doc/`. Skills: `new-task` (this dir, group `paging`), `code`, `layout`, `css`, `ui-test`, `finish-task`.

## Two changes

1. **No h1 on a paging page; the demo is the page.** On `/imagine/paging/` and every page of the realm that is a demo (the front, the library entries, the mechanisms, the navigation demos, the templates), the stage starts at the top of the content — no `h1`, no intro paragraph above it. The title lives in two places that already exist: the crumb / path bar of the stage, and the browser tab. Where a page has one sentence the newcomer needs, it goes UNDER the stage, small. Doc pages under `doc/` keep their headings — they are documents, not demos. Measure: the stage's top edge at 1280 before → after (px from the top of the content region); the fold at 1080 shows the whole stage and its bar.
2. **The toolbars page.** `/imagine/paging/toolbars/` (the 09-04 study — top / left / right / bottom × in the card / outside it) has links that show nothing meaningful. Open every link on it and judge each: a link earns its place only if what it opens shows the placement it names, live, at a glance. Rebuild the page as one wall where each card IS a small live stage with the toolbar in that placement (eight cards, no prose), each opening the same placement full size — or, if the placements are already choices in the stage's own bar, delete the page and the link to it and say so. Links that show nothing are deleted, not fixed.

3. **The toolbar takes the small size.** The ui-theme pass landed one control grammar with size words: one class, `size-small`, on the paging toolbar's slot (`.paging-toolbar-slot`, see `../ui-theme/task.jsonl` for the exact line) takes all seven of its controls from 36.09 to 27.06px at 1280. Add it, measure one control before/after at 1280 and 3440.

## Prove it

`ui-test` on the front page: the stage's top edge and the fold at 1280×1080 and 3440×1440, before/after screenshots in the task dir; the nine-step use test from `../../2026-09-05/paging-audit-8/requirements.md` still passes; a crawl of the realm (~109 urls) at 400 / 1280 / 1920 / 3440, zero new console messages; every link on the rebuilt toolbars page opens something that shows its placement (screenshot the wall at 1280).

## Fences and budget

Write `public/imagine/paging/**` only, and this task dir. Never `core/**`, `ext/**`. Playwright is at `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`. Shared server `http://localhost:8123/` — start none, kill none; one browser, ≤ 4 pages. Never `find /`; never spawn agents; never `git stash`/`git rm`/commit. Budget ~250k tokens. Report in ≤ 8 plain lines: the stage-top numbers before → after, what happened to the toolbars page (rebuilt or deleted, and the count of links before → after), the use test, anything you doubted.

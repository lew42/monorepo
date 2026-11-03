# theme-button — the site theme stops overriding the button; every control matches (Sonnet)

The owner, 2026-09-06 11:25: *"the default ui (for controls, buttons) should all match each other, and match the base font size."* The ui-theme pass (`../ui-theme/task.jsonl`) landed one control grammar — every control 36.09px at 1280 — except the button, which `.theme-lew42 :is(button, .btn)` still holds at 0.8em uppercase, 36.89px, from the site's own theme file (five declarations; the ui-theme page shows both rows side by side).

Read first: `../../2026-09-04/mastermind-platform/minion-rules.md`; `../ui-theme/task.jsonl` (the numbers and the file:line of the override); `/framework/ui/controls/` and its `doc/grammar.md`; the theme file the override lives in (`public/styles.css` or wherever `.theme-lew42` is — grep). Skills: `new-task` (this dir, group `web-ui`), `css`, `finish-task`.

## The job

Delete the override so the site's buttons take the grammar. If one of its five declarations is a real theme choice rather than a size (a font family, a letter-spacing the owner's brand uses), keep only that one and say so; the size, padding, transform and border go. Then measure: on `/framework/ui/controls/` the two button rows read the same height (36.09px at 1280, 43.19px at 3440); on `/`, `/framework/`, `/imagine/paging/`, `/blog/` every `button`/`.btn` is 36.09px at 1280 (list any that is not and why — a component class restating a size is a finding, not yours to fix). Screenshots of the homepage buttons before/after at 1280 in the task dir. Zero console errors on those pages at 400 / 1280 / 3440.

## Fences and budget

Write: the theme file's five declarations, this task dir. Nothing else. Shared server `http://localhost:8123/` — start none, kill none; Playwright at `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`. Never `find /`; never spawn agents; never `git stash`/`git rm`/commit. Budget ~50k tokens. Report in ≤ 4 plain lines.

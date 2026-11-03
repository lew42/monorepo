# docs-after-size — the docs say the size standard's names, nowhere the old ones (Sonnet)

Read first: `../../2026-09-04/mastermind-platform/minion-rules.md`; `../size-apply/task.jsonl` (the landing: the six `.md` files it left that still name `--pad-ramp` / `--gap-ramp` / `--flow-ramp` / `*-default` / `--spacing` / `spacing-tight` / `spacing-airy` — the study's own history pages keep the old names on purpose and are NOT yours); `/imagine/design/size/` (the standard as landed: `--size` 0.75 / 1 / 1.5, `--pad` / `--gap` / `--flow` from `:where(*)`, `cqi`); the `css` skill's spacing section (the skill was corrected this morning — check it says the landed names, fix one line if not). Skills: `new-task` (this dir, group `layout`), `documentation`, `finish-task`.

## The job

`grep -rn "pad-ramp\|gap-ramp\|flow-ramp\|pad-default\|gap-default\|flow-default\|--spacing\b\|spacing-tight\|spacing-airy" public/ .claude/skills/ --include=*.md` — every hit outside `/imagine/design/spacing/` and `/imagine/design/size/`'s history pages is rewritten to say the landed name, in one sentence that still reads as the doc's own voice (no "was renamed" notes — a doc says what is true). `core/Page/doc/columns.md`, `framework/styles/doc/*.md`, `core/Page/readme.md`, the `css` and `layout` skills are the likely places. Where a doc explains the OLD three-level idea (tight / regular / airy as separate classes), it now explains the one knob in two sentences and links `/imagine/design/size/`.

## Prove it

The grep returns zero hits outside the two history pages, and the list of files you changed with one line each. Every touched doc page loads at 1280 with zero console errors (a `.md` with a backtick fence still renders).

## Fences and budget

Write only `.md` files the grep names and the two skills' one line each; this task dir. Shared server `http://localhost:8123/` — start none, kill none. Never `find /`; never spawn agents; never `git stash`/`git rm`/commit. Budget ~60k tokens. Report in ≤ 4 plain lines.

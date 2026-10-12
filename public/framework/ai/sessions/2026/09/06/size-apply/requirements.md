# size-apply — the size standard lands: one knob, one vocabulary, 945 renames (Sonnet)

Three laws: less is more — one vocabulary, the old names deleted; clear beats brief; prioritize. Length budget: the report is 8 lines with the numbers.

Read first: the repo's `CLAUDE.md`; `../../2026-09-04/mastermind-platform/minion-rules.md`; **the study `/imagine/design/size/` and its task `../size-standard/task.jsonl`** — the candidate `:root` block, the measurement tables, the three corrections (unitless `--size`; type stays viewport-only; `vw` → `cqi`); `framework.css` `:root` and the spacing section; `/imagine/design/spacing/decision.md` (the 09-05 decision this supersedes — update its page with one line pointing at the size page). Skills: `new-task` (this dir, group `layout`), `css`, `new-css-class`, `layout`, `finish-task`.

## The calls, made by the mastermind — apply, do not reopen

- **The ladder is `.size-small { --size: .75 } .size-regular { --size: 1 } .size-large { --size: 1.5 }`.** Unitless. The 09-05 level classes (`spacing-tight` / `spacing-airy`) and `--spacing` are deleted, not aliased.
- **Sweep, not aliases.** `--pad-ramp` → `--pad`, `--gap-ramp` → `--gap`, `--flow-ramp` → `--flow` (the study's names), the `*-default` names folded in, every read renamed by grep across `public/` — CSS and `page.js` alike. When you land, `grep -rn "pad-ramp\|gap-ramp\|flow-ramp\|spacing-tight\|spacing-airy\|--spacing\b" public/` returns nothing. Say the count you renamed; the study counted 945 + 18 column-token sites.
- **Type is untouched.** The body clamp stays the only thing that ramps type; nothing gains `cqi` on a font-size except a display element the study names.
- `styles/css-scopes.txt` gains `size-`.

## Prove it

Before and after, the study's own 20 pages at 400 / 1280 / 1920 / 3440 (its script is in `../size-standard/` — reuse it): the medians match the study's "candidate" column within 1px at 1280 and 3440; the "does it compound" row still reads the same font size three containers deep. `.size-small` and `.size-large` visibly change a section's pad, gap and rhythm on the size page (screenshot the three). Zero console errors on a crawl of `/`, `/framework/`, `/imagine/`, `/notes/`, `/blog/` at four widths. Two numbers that must agree: renames counted by your grep before = renames applied.

## Fences and budget

Write: `framework.css`, any `.css` and `page.js` under `public/` for the rename only, `styles/css-scopes.txt`, `/imagine/design/spacing/decision.md` (one line), `/imagine/design/size/**` (the page reflects that it landed), this task dir. Nothing else changes in any file you touch — a rename pass, not a redesign. Use the shared server `http://localhost:8123/` (start none, kill none). Never `find /`; never spawn agents; never `git stash`/commit. Budget ~250k tokens. Report in ≤ 8 plain lines: renames, the two median lines, the compounding row, the crawl verdict.

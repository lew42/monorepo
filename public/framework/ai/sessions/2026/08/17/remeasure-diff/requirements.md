# remeasure-diff — did the night make the site better? Judge the +/− by meaning, not by count

Laws: less is more · clarity · prioritize. **Deliverable: a true verdict on the corpus (better / worse / noise), the real regressions named with their wave and rule, and the lost contact sheet regenerated. `proposal.md` ≤ 50 lines; final message ≤ 25 lines.**

Counts alone say: broken **78 → 83** across 19 pages (sweep 18:43 → remeasure 21:05, same prompt, same widths), total findings 247 → 245 — while the six wave-3 pages went 32 → 23. Table in [`../vision-remeasure/note.md`](../vision-remeasure/note.md). The image seat is stochastic (two Sonnet seats agreed only on shared bias tonight); ±2 on a page may be noise. Mike will ask one question in the morning: **is the site better?**

## Do

1. **Diff by meaning** for the pages that moved ≥2 either way — DesignTool/vision (+3), styles/elements (+3), `/` (+2), core/ (+2), ext/Doc/ (+2), ui/ (−4), web/ (−4), ai/2026-08-17/ (−2) — from `../vision-sweep/vision.jsonl` (before) and `../vision-remeasure/vision.jsonl` (after), page-level rows, per width. For each `broken` finding: gone · still · new. Open the png pair only when a "new" needs confirming. Classify every **new broken**: `regression` (a wave-1/2/3 rule caused it — name the wave and file:line from `layout-primitives/changes.js` and the wave task logs) · `pre-existing, now noticed` (visible in the before png too) · `taste/noise` (the seat, not the site) · `new content` (the page changed for another reason — e.g. DesignTool/vision grew rows).
2. **The verdict**, with two numbers that agree: real regressions vs real fixes across those eight pages, and the same summed from the per-page lines. Then one line: better / worse / a wash — and what the count-based 78 → 83 actually measured.
3. **Wave 4** (≤ 6 items): only the real regressions and the surviving repeated rules (tab clipping on `core/Page/` + `doc/` — is that a bar `ext/tabs` doesn't own?; unframed cards outside the card-frame fix; the mastermind-shots agents table without a header) — cause → one-line fix → class. **Do not fix anything.**
4. **Regenerate** `layout-primitives/after-3440.png` — the wave-1 "after" contact sheet at 3440 that a sibling overwrote: read `layout-primitives/task.jsonl` and `page.js` (`sheets()`) for the recipe (the eight pages, the tiling); reproduce it from the live site now (name it `after-3440.png` again — that is what the landing report links; note in `layout-primitives/task.jsonl` that it was regenerated at <time> from the current CSS, so it is a wave-3 "after", not wave-1's).

## Rules

- Files: this dir; `layout-primitives/after-3440.png` + one log line in `layout-primitives/task.jsonl`. Nothing else. Log in `task.jsonl` here (bash `printf`; timestamps from `date -Iseconds`); bump step; land per `finish-task`. Headless only; never Mike's live tabs; no runner calls.

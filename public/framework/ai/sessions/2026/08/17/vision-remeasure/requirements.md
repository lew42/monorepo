# vision-remeasure — the whole corpus after three waves, and the `wide` Before/After

Laws: less is more · clarity · prioritize. **Deliverable: the morning numbers — broken per page, sweep (18:43) → now — and four pngs for the accept screen's `thru` row. Final message ≤ 15 lines.**

## Do

1. Verify no agent is editing site files (`git status --short | wc -l` twice, a minute apart, equal — the vision-direction sibling only writes under `ext/DesignTool/vision/` and its task dir).
2. **Re-shoot the sweep corpus** — the same 19 pages as [`../vision-sweep/note.md`](../vision-sweep/note.md) (page-level, 390/1280/3440, Sonnet, `critique-full-v1` — the SAME prompt as the sweep, for comparability) → `--out public/framework/ai/2026-08-17/vision-remeasure` (~57 asks ≈ $4.50; `--dry`; ceiling $6).
3. **Diff by count** (script, no judgment): per page, broken and total findings sweep → now; the totals; the pages that got worse (name them). Write `note.md` here (≤ 25 lines): the table, then the top-5 most-repeated findings now (one line each) so the morning knows what remains.
4. **The `wide` Before/After** — `/framework/ai/2026-08-17/mastermind-shots/` at 1280 and 3440: shoot as-is (`before-1280.png`, `before-3440.png`), then in the same headless page add the class `wide` to `.ai-task` (`document.querySelector('.ai-task').classList.add('wide')` — no source edit) and shoot again (`after-…`). Save the four pngs in `layout-primitives/` and add their paths to the `thru` row in `layout-primitives/changes.js` (fields the other rows use for pictures — read one; if rows have no picture field, add `before`/`after` keys and the two-line render in `page.js`). Log the page height and the table width before/after at both widths.

## Rules

- Files: this dir; `layout-primitives/{changes.js,page.js}` (the thru row + pictures only) and its four pngs. Nothing else. Log in `task.jsonl` (bash `printf`; timestamps from `date -Iseconds`); bump step; land per `finish-task` with the browse URL. Never Mike's live tabs; headless only.

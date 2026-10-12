verdict: fix

1. [fixed] Headline said "73 classes, 27 worth a view"; the table actually had 77 rows, 37 "yes". Recounted and corrected.
2. [fixed] "Yes" rows weren't sorted first — some "no" rows sat between them. Now all 37 "yes" rows precede all 40 "no" rows.
3. [note] Page/App property names checked against `core/Page/Page.class.js` — correct, no change needed.
4. [fixed] `ui/`/`web/` claimed zero classes; a wider grep found more matches than rows. Intro now states the exact grep + exclusions, and adds the one class it had missed (`Flow`).


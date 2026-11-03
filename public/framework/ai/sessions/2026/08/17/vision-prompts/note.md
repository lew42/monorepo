# note — critique-v1 vs checklist-v1 vs critique-full-v1

6 pilot pages @1280, whole page, Sonnet, same run. Stats over the 6 shots/prompt
(regions, other widths, other models excluded — apples to apples).

| prompt | avg $ | avg out tok | findings/shot | broken/shot | unique findings* | invented? |
|---|---|---|---|---|---|---|
| critique-full-v1 | $0.087 | 2452 | 4.83 | 1.67 | 3 — e.g. two sidebar links both read "Overview" | (existing pilot baseline, not re-checked) |
| critique-v1 (short) | $0.070 | 1412 | 4.00 | 2.17 | 4 — e.g. the inline `import` badge is too high-contrast for body copy | no — 2/2 spot-checked against the png held up |
| checklist-v1 (targeted) | $0.085 | 2345 | 3.17 | 1.50 | 3 — e.g. gear icon + avatar sit flush against the viewport's bottom edge | no — 2/2 spot-checked against the png held up |

\* found by only this prompt, counted only on the 2 pages whose shot hash was identical
across all three (the other 4 are a live dashboard — content drifted between captures,
confounding a finding-diff there).

**critique-full-v1 stays the default.** Most findings/shot, and the only prompt to catch
a mislabeled-duplicate-link bug and a missing-surface card that its own "empty space" and
"UI/UX" bullets already name — it just let itself skip them on some images because
"cover the angles that apply … skip the ones that don't" gives it permission to.
checklist-v1's forced yes/no format reliably caught exactly what it was asked — edge-cramping,
unlabeled controls — on the *same* image full-v1 missed them on. critique-v1 (short) is
cheapest but calls more things "broken" without more support, and isn't a standalone
replacement. Wrote `critique-full-v2.md`: same 9 angles, same JSON rule, one line changed —
"skip the ones that don't apply" becomes "touch every angle in one clause, even to dismiss
it" — the smallest fix the evidence supports, not a rewrite.

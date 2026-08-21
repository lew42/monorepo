# layout — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

2026-08-17 · check `width-used` at 3440 explicitly in question 2 — it is the prime objective as a number · it read 6–10% on 17 of 18 pages until fixed (now 0.92 at 1280 vs 0.58 at 3440) and is 28.1% of the generator's quality gap (ai/2026-08-17/tier-calibration/, ai/2026-08-17/loss-budget/) — declined 2026-08-17: Q2 already names the widths; belongs in ext/DesignTool/knowledge/

2026-08-19 · add to the sizing questions: a demo OF a size token must be measured against the box it will actually live in, not the box you drew it in · page-docs-box built `--measure` as two 470px panes and both read `main 413px · wide 0px` — the 40em cap never bit, so the two states were identical and the card taught nothing; the routed page was 545px wide (a peer arrangement in `.pages`), not the 965px assumed. The check is one line: is the demo box wider than the token it demonstrates?

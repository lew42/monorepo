# layout — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

2026-08-17 · check `width-used` at 3440 explicitly in question 2 — it is the prime objective as a number · it read 6–10% on 17 of 18 pages until fixed (now 0.92 at 1280 vs 0.58 at 3440) and is 28.1% of the generator's quality gap (ai/2026-08-17/tier-calibration/, ai/2026-08-17/loss-budget/) — declined 2026-08-17: Q2 already names the widths; belongs in ext/DesignTool/knowledge/
- 2026-09-01: layout-system.md's "auto-fill, never auto-fit" is right for a WALL of unknown length and wrong for a row of a KNOWN, fixed count that is guaranteed the whole row (a 2-up code pair, a 3-card explainer). Measured on /imagine/design/system/'s draft: two sketches landed in 480px tracks with five reserved empty tracks beside them at 3440, and one was clipped. The skill should say the exemption out loud beside the rule - `repeat(auto-fit, minmax(min(30em, 100%), 52em))`, with the em ceiling doing the job the reserved track was doing.

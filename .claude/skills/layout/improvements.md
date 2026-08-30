# layout — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

2026-08-17 · check `width-used` at 3440 explicitly in question 2 — it is the prime objective as a number · it read 6–10% on 17 of 18 pages until fixed (now 0.92 at 1280 vs 0.58 at 3440) and is 28.1% of the generator's quality gap (ai/2026-08-17/tier-calibration/, ai/2026-08-17/loss-budget/) — declined 2026-08-17: Q2 already names the widths; belongs in ext/DesignTool/knowledge/
2026-08-30 · Q1 under a columns host with 3+ ancestor levels: `width: "large"` shares evenly with plain default-width ancestors (both `flex: 1 1 0`) instead of taking leftover — `fill` (`flex: 1 1 100%`) is the word that actually claims the room, at any depth · measured on /imagine/vary/colstyles/: Vary→Colstyles→Finder all landed 565px each under `large` (an embedded 1000px-wide demo box got squeezed to 538px); switching the leaf to `fill` gave it 1184px with ancestors at their floor (core/Page/doc/columns.md's own measured table only shows this at the top level, not nested)

2026-08-30 (blog-layouts) · a grid can be the RIGHT HEIGHT and still leave the fold white: `min-height: 100%` sizes the grid, `align-content: start` leaves its one ROW content-sized, and the two together left 54% of a 1080 screen empty under a composition that had already fitted (measured: container 1048, row 487) · the check belongs beside "scrollbars are a decision": after Q2, read back the child row's height as well as the container's, and say whether the leftover was wanted · same fault appeared three times in one lab (front grid, board grid, a `fill` column's prose)

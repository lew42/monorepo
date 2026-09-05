# research — improvements

Any agent may append. One line each: `YYYY-MM-DD · what should change · why (the evidence)`.
A recurring line is a rule waiting to be written; the owner promotes.

2026-09-04 · Name the 140-char title limit up front, not just "title <=140" · batching ~35 entries in one shell script, 14 of them exceeded 140 chars on the first draft (titles read naturally at 150-200 chars) and each overrun stopped the whole script (`set -e` plus the writer's hard refusal), costing a stop-diagnose-shorten-resplice cycle per hit; a one-line reminder ("140 chars is shorter than it sounds — check with `awk '{print length}'` before running a batch") would have caught all 14 in one pass instead of ~5.

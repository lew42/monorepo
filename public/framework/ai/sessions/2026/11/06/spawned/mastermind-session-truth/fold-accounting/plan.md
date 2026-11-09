# Plan: twins fold accounting

- `Server/FoldAccounting.mjs`: per manifest group, compare each moved-aside half to the merged home (cost = newest cache.jsonl summary usd, tasks = replay tally().created). Halves are one session recorded twice, so they are not added: merged must be >= each half.
- Causes: reader (merged cache version newer), unreadable (merged cost missing or 0), lost (anything else, any task drop).
- `Server/Truth.mjs` adds `fold` to each run; `public/live/truth/page.js` draws the table. Test: `Server/FoldAccounting.test.mjs`.
- Run against the main tree: a worktree has no cache.jsonl.

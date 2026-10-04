# AI cost per page (roadmap item 10b)

Third item in @mastermind-page-3's queue ("1. List gets events. 2. The Task class. 3. AI cost
per page (10b). 4. Then layout approval."). Full spec: [`ai/2026-10-02/task-class/requirements.md`](/framework/ai/2026-10-02/task-class/requirements.md),
"## Item 10b". Landed as its own small merge, per that brief's instruction ("three separate
small merges... three PRs, three landings, three outcomes") — split into its own task dir
(dated today, since items 16 and this were built in separate sessions) rather than piling a
second landing onto `task-class/task.jsonl`, which already closed with item 16's outcome.

Summary of the ask: a node script sums `cost_usd` (already computed by `Server/task-cost.mjs`
— never recomputed here, law 7) across every task log, splits it evenly across the page
folders that task's `action` lines touched, and writes `{"ai_cost": {usd, tasks, at}}` onto
each page's own log — same file, same convention `weight.js` already uses. The page header
shows "$N.NN of AI work · M tasks", linking to the AI log. Must not touch `Task.js`,
`core/Task/`, or `weight.js`.

verdict: pass
1. [note] The daily owner card now adds `unworked` to its flagged total (Servex/TaskLoop.js:145). A run in the worktree counts 272 unworked against 28 other flags, so the card would say "about 300 rows fell through today" and the day's real misses get lost in it. Simpler: keep `unworked` out of the `flagged` sum and give it its own clause in the card text, e.g. "28 flagged · 272 open tasks untouched over 7 days".
2. [note] The two docs give different numbers. The queue readme (public/framework/ai/queue/readme.md:22) and FollowUp's HEAD (Server/FollowUp.mjs:158) say "133 stale tasks". The new count finds 272, because it also counts `idle` and `waiting` tasks, not only the queue. Say what the 133 measured, or drop the number. The HEAD line also writes "7 days" as text where the page uses `UNWORKED_D`.
3. [note] There was no requirements.md in the task folder. I reviewed against the brief in page.jsonl (agent-base items 6 and 7). No page changed, so this covers only Requirements and Words.

## Requirements
- 1 "explain working 6/5" — yes — Servex/doc/dormant.md "Measured, and why working 6/5 happens": resumes and the front desk are never held by the cap; only new spawns queue. This matches the comment at Agents.js:836.
- 2 "measure RAM per agent" — yes — dormant.md gives about 0.7 GB per working agent with its child processes, 0.18 GB idle, and the PC-wide split. These numbers come from a live reading I can't re-check, but they add up: 6 × 0.7 ≈ 4.2 GB, and 5.2 − 2 × 0.7 ≈ 3.8 GB.
- 3 "set the cap to 8" — yes — Servex/agents/Agents.js:842 `|| 8`; dormant.md and compaction.md updated, and `working N/5` became `N/cap`.
- 4 "priority wind-down rule into the mastermind readme" — yes — Servex/agents/roles/mastermind.md, new section "Slots go to the highest priority": the trigger, the steps (stop at a safe point, write state, `stop_agent`, one line on the task), a never-wind-down list, and "the mastermind decides".
- 5 "daily follow-up counts open tasks untouched over 7 days" — yes — `FollowUp.unworked()` reads the whole state, not the days window (correct: the window would drop exactly these tasks). `node Server/FollowUp.mjs` in worktree/agent-resources prints "272 open tasks untouched over 7 days" and an `## unworked: 272` section. TaskLoop reads the `unworked` key from the `--write` console output.
- class page — n/a — no new class; FollowUp gains one memoized method.

## Words
- content 1 (plain, full sentences) — yes — the dormant.md "Measured" bullets and the mastermind section each open with the point, then the numbers.
- content (one takeaway) — yes — "the memory floor, not the count, is what stops the ninth" states the decision plainly.
- consistency — no — 133 against 272 (finding 2).

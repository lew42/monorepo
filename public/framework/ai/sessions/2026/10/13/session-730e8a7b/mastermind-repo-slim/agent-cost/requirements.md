# Agent cost: every Servex agent's spend is recorded and shown, not $0

Budget: $10. Load the `sub-mastermind` skill first. The owner's words: `../requirements-3.md` ask 5 ("the sessions page to see all the individual sessions is useful to help track costs and timing and what's currently active") and the asks tally (`ai/doc/asks-outcomes.md`): "cost tracking" asked 13 times, "token accounting" 9, "usage monitoring" 3 ("monitoring token usage across agents"). Your log is this dir's `task.jsonl`. CLAUDE.md: compute don't recall; one of everything; stream don't poll.

## The defect (mastermind, 19:36)

`GET :8090/agents` returns `cost: 0` for every task mastermind spawned today (31 of them, each of which ran many turns; e.g. `task-mastermind-skills-review` showed `cost: 5.598` once and `0` later, `task-mastermind-inbox-data` `0` with `context: 418947`). So the registry's cost field is not accumulated per agent across turns/resumes, or is reset on resume, and the Sessions page and the models page (`/framework/ai/models`, "last 24 h cost per provider") under-report. The mastermind could not compute cost per result by tier for that reason (`../task.jsonl`, 19:15).

## Deliverable

1. **Find where cost is written** (`Servex/agents/Agents.js`, `Sessions.js`, the SDK result's `total_cost_usd` per turn, `Servex/Usage.js`, `Server/spend-tree.mjs`, `ai/sessions/spend.json` or per-task `spend.json`): which value the registry stores, when it resets (resume? dormant? a new `claude_pid`?), and where the per-turn cost actually lands (if anywhere). Write it as five lines in your log with file:line.
2. **Fix once**: the registry row accumulates `cost` across turns and resumes (never reset on resume; a resumed session continues the same number), and each turn's cost is appended as a record (the task's `task.jsonl` `log` line with `cost`, or the existing per-task `spend.json` through its single writer), so a restart of Servex recomputes the total from the records. Test on a private Servex: spawn a stub, two turns, resume, check the sum equals the two turns.
3. **Show it**: the Sessions page row and the task card show the accumulated cost (they may already read the right field once it is filled); the models page's "last 24 h per provider" uses the records. Prove on three of today's task masterminds with the numbers in your log.
4. **Backfill today** from whatever per-turn records exist (the SDK session files in `~/.claude/projects/` carry usage per message; a read-only script sums them per agent) and write a one-screen table into this task dir: cost per task mastermind today, by model; the mastermind uses it for the cost-per-result note.
5. Card report; landing line checked with `tail -1`.

Fence: `Servex/agents/Agents.js` and `Sessions.js` (cost fields only), `Servex/Usage.js`, `Server/spend-tree.mjs`, the Sessions row and card components' cost field, this task dir. Tested on a private Servex port; the live Servex is restarted by the mastermind. Sonnet.

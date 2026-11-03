# usage: the pace line reads "At N% of pace with T left"

Budget: $3

The owner, by voice, 2026-10-15 (question 1dbb4025, logged in `../task.jsonl`):

> upgrade the usage calculation and wording. Currently it reports e.g. "1% of the week used, 11% of the week gone." He'd prefer the usage expressed relative to pace: used percent divided by elapsed percent, so that example is about 10% of pace (well under; it could be at 80 or 90% of pace). Desired output is one succinct line that includes the relative-to-pace percentage plus the time remaining, e.g. "At 10% of pace with 5 days left" or "At 50% of pace with 2 days left." Exact wording is flexible, but include the relative number and remaining time on one line. He thinks this should be a quick fix.

## Do

1. `Server/usage-now.mjs` (37 lines): it already computes `pace = used ÷ elapsed`. Make the FIRST printed line `At 9% of pace with 6 days 1 hour left (room to spend)`: the pace %, the time left until the week resets (days + hours; hours + minutes under a day), then the advice word. Put the raw detail (week used %, % gone, 5h session %, data age, the OK/OVER spawn note) on a second line. Keep the exit code (2 = over pace) and every computed value unchanged.
2. Find every other place that prints or documents the old wording ("of the week gone", "under pace by", "room to spend") and match it: start with `.claude/skills/check-claude-usage/SKILL.md` and grep `Server/`, `Servex/`, `.claude/`, `public/framework/ai/` (code and skill docs only; never rewrite logs or dated task records).
3. Smoke test: run `node Server/usage-now.mjs` and paste its output into your task log.
4. Work in a worktree (`take_worktree`), commit with a clear message, and tell your parent (mastermind-voice-opus) the branch. Don't merge it yourself; the parent reviews the diff and merges it.

## Not

No change to how usage is fetched or cached, nor to Budget.js enforcement.

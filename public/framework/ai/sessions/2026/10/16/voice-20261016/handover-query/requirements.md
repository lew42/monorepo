Budget: $6

# AI: handover is a query, not a hand-written file — plan only

Minion brief from mastermind-voice-20261016 (voice session 2026-10-16). Card: 2026/10/15/voice-session-2026-10-16-19-06. Sonnet. **Plan only: build nothing until the owner has seen the plan.**

## The owner's words (voice, question 37d0025a)

> handover must not be a hand-written file. One source of truth: session/task logs already hold what happened, landed, and is open. "Handover" = a query at read time: today's open and in-flight items, high-priority flags, latest per topic, with weekly and monthly summary queries over the same data; no new files, nothing agents must remember to write; rely on fail-proof node functions and tools that fire automatically, re-prompting when items are unresolved. Use the existing dev-server SessionIndex + ext/Query; fix the stale index (6 days, no scheduled rebuild) with an automatic rebuild. Dashboard default: last month.

## What exists (read these, nothing wider)
- `public/framework/ai/handover.md` today: hand-written LATEST sections by masterminds; links `doc/follow-up.md` (TaskLoop computes it daily).
- `Server/SessionIndex.mjs` + `Server/doc/session-index.md`: indexes every task.jsonl, registers the "tasks" source for `public/framework/ext/Query/` (QueryServer.mjs, readme.md).
- FollowUp / TaskLoop in `Servex/` (grep `follow-up`), the asks ledger `public/framework/ai/asks.jsonl`.
- Per-task files are `task.jsonl`; no session.jsonl rename was ever decided. Treat a rename as open question, not a step.

## One question per step
Write the plan at `public/framework/ai/doc/handover-query.md`, linked from `public/framework/ai/readme.md`. Each step settles ONE question and is committed before the next:
1. Why is the index 6 days stale (what triggers a rebuild today, what is missed)? Propose the automatic rebuild (watch, or rebuild on read when older than N) — smallest that is fail-proof.
2. The handover query: the exact Query calls for today's open + in-flight, high-priority flags, latest per topic; and the week / month summaries. Which fields already exist in task.jsonl; which are missing.
3. Re-prompting: which existing automatic thing (TaskLoop, a hook, the landing nag) re-prompts for unresolved items, and what it must call.
4. What happens to handover.md: becomes a page that runs the query (no hand-written text), the old text kept in git. Dashboard default range: last month.
5. Open: the task.jsonl → session.jsonl rename — cost (readers to change), yes/no recommendation.

## Rules
- Docs only, in a worktree; commit each step; merge to michael/dev. No Servex restart.
- Report on the card in one screen of plain sentences; post a log line at least every 5 minutes.

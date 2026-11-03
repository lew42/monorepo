# Past work, round 3: the files-touched numbers and the cheap pipeline first

Asked by the owner by voice on 2026-10-16 (question caabb169), relayed by mastermind-voice-20261016. Keep the report short.

## A. The files-touched numbers (compute these with a node script, never estimate)
- Of the 1,628 task.jsonl logs, count how many have at least one `action.files` entry and how many have none.
- Break that count down by the last day, the last week and the last month, if that is cheap.
- For the logs that have files, find out whether they usually touch one clean module or spread across many. Report the distribution.
- The point: this decides whether tagging by files touched is a workable fallback, since chat logs are nearly absent.

## B. Fold the owner's refined pipeline into section 9 of `public/framework/core/Page/doc/query.md`
1. FIRST, a pure-Node pass with no AI over the Claude SDK session transcripts. Extract only the owner's user prompts (the essence), optionally the final task result, and skip the assistant's middle turns and all tool output. That alone may be enough to tag and summarise most sessions. Report the typical extracted size per session.
2. Make sessions filterable by topic AND by cost. The cost per session already exists in the spend data: confirm that, and wire it in.
3. Fall back to the costly chunk-and-Haiku path only for sessions the cheap extraction can't resolve.
4. Run newest first: the last few days as a pilot, then the week, then the month. Do NOT process the full six-month history up front.
5. Reprocessing every session is fine for the cheap Node pass; the expensive AI pass stays bounded.

## Report
One screen: A's numbers, then the revised plan. Commit, then send the report to mastermind-voice-20261016. Budget: what is left of the $20 cap.

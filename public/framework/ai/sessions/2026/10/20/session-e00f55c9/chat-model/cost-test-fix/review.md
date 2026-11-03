verdict: fix
1. [fix] The task folder has only requirements.md and review/diff.patch: no task.jsonl or result note, so a fresh agent cannot see whether the fix landed or that the test was run green; the task is also not indexed in chat-model's record (the tracked tree still has the unfixed line at AISessionCost.test.mjs:72).
2. [note] The one-line change `Math.max(0, mid - 300)` at AISessionCost.test.mjs:72 matches requirements.md exactly and is the simplest correct fix; the trailing comment is on one line as the rules allow.
3. [note] With a log under 600 rows the "overlapping tail" now overlaps the whole first half (slice from 0), which still tests the replay-dedup path, so the case stays meaningful; no readme/doc in AISession mentions this test, so nothing is stale.

verdict: pass
1. [note] The task record `queue-and-follow/task.jsonl` lives only in the main tree and is untracked (`git ls-files` does not know it), with `now: "merging"` and no `landed_at` line. The branch no longer adds a copy (diff.patch has no task.jsonl hunk), so last round's merge clash is gone. The landing step still has to write `landed_at` and commit this file, or the record is lost.
2. [note] The doc comment above `Agents.blocked` (Servex/agents/Agents.js:634) names only the boot sweep as a caller that passes `landed: false`. `Servex.stale` (Servex/Servex.js:1304) now passes it too, whenever the spec names no task dir. One clause there would keep the comment true.
3. [note] The `kinds` list is shifted only on `result` events (Agents.js:1779). A turn that ends with an `error` event and no `result` would leave its entry behind, and every later turn would then be judged one off. follow.md:200 covers the merged-turn, `priority: "now"` and awaken cases, but not this one.
4. [note] Requirements are met. Ask 1: there was no RAM timeout. The real cause was a wrong "landed" match, now fixed (Servex.js:1304), and a dropped spawn now tells its parent. requirements.md's "Not built" section says why there is no automatic re-queue. Ask 2: the cause is named (`Agents.wake_parent`), short acks after a followed line no longer wake the parent (they still reach its inbox and the "Next:" note), and session-smart.md:50 tells followers to send news with `send_to_agent`. `node Servex/Gate-stale.test.mjs` and `node Servex/agents/Follow-ack.test.mjs` both print ok at worktree head b4c0c0c81.
5. [note] The docs are current and the work is indexed. dormant.md:183 and follow.md:198 each name their test. requirements.md links both docs. dictation-debug/session.jsonl:218 records the task, with its branch `worktree/queue-landed-drop`. A fresh agent could pick this up from the task folder: requirements.md holds the asks, the findings and what was not built, and task.jsonl holds every review round and answer.

## Requirements
- 1 "A queued task must not be abandoned for lack of RAM … the parent is told … never silently lost" — yes — no RAM drop exists; the wrong landed match is fixed (Servex.js:1304); a drop messages the parent (Servex.js:1306); Gate-stale.test.mjs ok
- 2 "Find who tells them to reply; followers should read silently and message only with something to say" — yes — cause named in follow.md:200 (`wake_parent`); short follow acks are quiet (Agents.js:1779-1784, wake_parent `quiet` at :992); session-smart.md:50 tells followers what to do; Follow-ack.test.mjs ok
- Class with live instances — n/a (no new class)
## Words
- Plain sentences, terms defined — yes — follow.md:198-200 and dormant.md:183 explain the cause before the fix
- One takeaway per section — yes — each new doc section is one rule plus its test
- Owner's words followed — yes — requirements.md quotes both asks and says what was not built and why

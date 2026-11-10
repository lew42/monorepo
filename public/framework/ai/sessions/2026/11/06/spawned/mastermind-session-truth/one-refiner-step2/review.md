verdict: fix. The work sits unmerged (commit 325571642 on `worktree/refiner-step2`); the session ended without landing.

## Asks
- [x] Move the parts brief into `ext/Refine/`, no second copy. Proof: new `ext/Refine/PartsBrief.js`; `PromptRecords.PARTS_BRIEF` imports it.
- [x] Switch `PromptRecords.live` to Sonnet, one named constant. Proof: `LIVE_MODEL = "claude-sonnet-5"`.
- [ ] Turn PromptTasks on. `node Servex/agents/PromptTasks.js status` still says `off`. The diff only documents the switch.
- [x] One lean test with a stubbed model. Proof: `Server/PromptRecords.live.test.mjs` prints `ok`.
- [ ] Docs say what is live now. The map reads as if PromptTasks is on today, and two sibling docs are stale.
- [ ] Report whether a Servex restart is needed. None was written. Answer: live after merge plus a restart; the on/off switch needs no restart.

## Fixes
```
Server/PromptRecords.mjs:231            "One Haiku call" -> Sonnet for live
ext/Refine/doc/prompt-records.md:37     "Haiku, one call per prompt" -> Sonnet live, Haiku review
core/Session/doc/prompt-breakdown.md:8  "one Haiku call (attach_to)" -> same
Server/readme.md                        list PromptRecords.live.test.mjs
prompt-refinement-map.md:5              "on while the file is absent" -> off until `on` is run
```

## Open
- Run `node Servex/agents/PromptTasks.js on` after the merge, or say in the brief that the mastermind runs it then.
- A prompt with one ask is never matched to an open task (`PromptRecords.mjs:201`, `todo.length >= 2`). It is only a sentence in the map. File it as a task on the session record.

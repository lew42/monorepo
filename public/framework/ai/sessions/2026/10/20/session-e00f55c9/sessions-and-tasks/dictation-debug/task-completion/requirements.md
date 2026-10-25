# Tasks: made fast, shown at once, and completed

Budget $5, Sonnet. Load the `minion` skill first. Card: [chat-show-when-your-words-reach-the-assi](/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/). Source: voice session v-sq8y7db (2026-10-25), relayed by session-smart-v-sq8y7db. **High priority.**

- [ ] Do not start until the owner okays [../proposal.md](../proposal.md) (its step 1).

## The ask

1. **Every task made in a session counts in that session's completion, and the session can check it.** Voice session v-sq8y7db is at about 4% (1 of about 26 done). Our system does not complete tasks properly.
2. **Tasks are made quickly and reliably, and show on screen at once.** The owner made a test task and saw nothing until the owner paused.

## What exists (read first, don't rebuild)

- [core/Task/doc/completion.md](/framework/core/Task/doc/completion.md): [`Servex/Dropped.js`](../../../../../../../../../../Servex/Dropped.js) flags an open task with no working owner and gives it a **Dropped code**, the reason it was flagged (such as `never-assigned` or `owner-gone`); `Task.rates()` and the `completion` query in [`core/Task/Task.js`](/framework/core/Task/Task.js) ([readme](/framework/core/Task/readme.md)) count a session's tasks.
- [core/Task/doc/cracks.md](/framework/core/Task/doc/cracks.md): where tasks fall through today, with counts.
- The completion project: `../completion/` (its `readme.md` and `session.jsonl`).

## Steps

1. **Measure, don't guess.** For v-sq8y7db, list every task with its state, its owner agent (if any), who made it and when, and its Dropped code. Write a node script for it and keep its output as a file. Two numbers must agree: the script's done/total and the `completion` query's.
2. **Name the cause.** Say, with file:line, why most of them stay open (for example: made by the smart assistant with no owner, so nothing ever works on them).
3. **Propose the fix in `plan.md` and stop.** The likely shape: every task made in a session gets an owner when it is made (that session's mastermind), the owner runs it or stops it with a reason, and the session's page shows "N of M done". Name one alternative.
4. **Time the screen.** From the moment a spoken ask is appended to the moment its task card is drawn, in both chat views. Say where the delay is, with file:line.

Never kill or restart the dev server, never drive the owner's tabs, never `git stash`. Findings go in `session.jsonl` as `log` lines. mastermind-dictation-2 reviews and merges.

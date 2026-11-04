# Ask 2c: rewrite the single seat's brief for `say` / `nothing` (Budget: $5)

Load the `minion` skill first. Work in the worktree `C:/Code/lew42/worktrees/qf-2` (branch `worktree/qf-2`), AFTER `minion-ask2a-say-tools` has landed its review fixes there (ask 2a is the tools and the gate; this step is only the words the seat reads). Tests first, commit by exact path, do not merge or push.

Read first: [owner-feedback-2026-11-03b.md](../owner-feedback-2026-11-03b.md) (asks 1 and 2, and the 14:15 additions), [ux/Dictate/doc/principles.md](/framework/ux/Dictate/doc/principles.md) ("brief changes are high-risk", "how the voice agent works"), [Servex/agents/doc/say-tools.md](/Servex/agents/doc/say-tools.md) (or the readme section on `say`), and the file to change: [Servex/agents/single-voice-assistant.md](/Servex/agents/single-voice-assistant.md).

## Why now
Ask 2a made plain text a muted `skip`. Until the brief says to call `say`, the live seat never speaks. So this step must land together with 2a.
Seat = the single voice assistant model; gate = the page releasing queued `say`s when the owner pauses.

## What the new brief says (cut, do not grow; shorter than today)
1. Every sentence arrives as `(sentence)`, a pause as `(pause)`, nothing else is instruction. Per sentence the seat does useful SILENT work (file a task, set a title, answer into a question card with `item`), and ends the turn with `nothing` when there is nothing to say.
2. The only way to be heard or shown a reply is `say({text, re?})`. Plain text is never a reply. A `say` is queued and released by the page when the owner has paused; the seat may `retract_say({id})` a stale one and say a newer one. Newest thing first.
3. No narration. Never "I've passed that along", "noted", "filed". Results of background work go on their question card, not into the chat while the owner talks.
4. Keep every existing rule about raw words: a task's `text` is the owner's words as heard, `from: {prompt, sentence}` (ask 1); do not touch those lines.

## The risk note (required, written FIRST, in `ask2c-brief-rewrite/risk.md`)
For EACH change to the brief (every bullet above, and each line you delete or reword): one line "risk of adding it", one line "risk of leaving it out", and the test that watches it. The owner asked for this in so many words ("a written risk of adding it and of leaving it out, plus a test on a replayed session, before it lands").

## The test (replay a real session, not a unit)
File: `Servex/agents/single-brief.test.mjs`. Replay the owner sentences of one named recent `v-*` session (needs a question, a task-like prompt, a long dictation) through the real assembled brief with a scripted stub model.
- [ ] Brief contains `say`, `nothing`, `retract_say`.
- [ ] Brief has no "reply on a pause" wording and no instruction to acknowledge.
- [ ] Scripted seat: no reply reaches the messages list before the gate.

Optional live run (one Sonnet turn per sentence, 5 sentences, under $0.30), logged in task.jsonl only, never committed as a test:
- [ ] Said `nothing` for plain sentences?
- [ ] Called `say` for the question?
- [ ] Narrated anything?

## Fences
Own: `Servex/agents/single-voice-assistant.md`, `ux/Dictate/doc/single-voice-assistant.md` (the user-facing copy, keep in step), the new test and the risk note. Not `Sessions.js`, not the chat-settings files.

## Report
One screen in your task.jsonl: the diff summary (words before/after), the risk note path, test commands and output, the live-run result if done. Then one line to the mastermind.

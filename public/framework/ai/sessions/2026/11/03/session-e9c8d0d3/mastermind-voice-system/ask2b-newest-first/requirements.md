# Ask 2b: read-aloud plays the newest reply first (Budget: $4)

Load the `minion` skill first. Worktree: take one with `take_worktree`. Tests first, commit by exact path, do not merge or push. Owner words: [owner-feedback-2026-11-03b.md](../owner-feedback-2026-11-03b.md) (ask 2, the 14:15 addition (a)); principles: [ux/Dictate/doc/principles.md](/framework/ux/Dictate/doc/principles.md).

## What
`public/framework/audio/Recite/Recite.js` queues whole replies oldest first (`queue()` at ~:142, chunks array). When several replies wait (the owner kept talking), the owner wants the NEWEST reply read first, and stale older ones skipped or last. The page-side gate already releases queued `say`s newest first, one at a time (Servex/agents/Sessions.js `release_say`, doc Servex/agents/doc/say-tools.md), so the read-aloud side must not undo that.

## Rules (decide inside these; log the choice and the alternative)
1. Sentences of ONE reply keep their order. Only the order BETWEEN replies flips: a reply that arrives while others are waiting (not yet started) plays before them. A reply already playing is never cut.
2. Add a `skip_stale` guard only if tiny: an older waiting reply older than 2 minutes is dropped, not read. If it is more than ~15 lines, leave it out and say so.
3. Agent updates held by the no-flood hold (`pending_updates`, `update_hold_ms`) keep their behaviour.

## Proof (tests first)
Extend `public/framework/audio/Recite/Recite.test.mjs` (or a new `Recite.order.test.mjs`): queue replies A, B, C while the first is "playing"; assert read order is [playing one], C, B, A; sentences inside each stay in order; a stale one is skipped if you built that. Run the existing Recite tests and `ReciteBubble.test.mjs` too.

## Report
One screen in your own task.jsonl: diff summary, the choices, test commands and output; one line to `mastermind-voice-system`. Update `audio/Recite/readme.md` with one line for the rule.

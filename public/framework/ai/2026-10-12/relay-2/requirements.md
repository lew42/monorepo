# An assistant in front of every mastermind, step 2

**The ask:** [ai/doc/asks.md](/framework/ai/doc/asks.md) **mastermind-assistant-relay** (asked 21x). Step 1 ([relay-asks](../relay-asks/STATE.md)) added a log-only `relay-bypass` line, live since the 11:30Z Servex restart.

## Done when
- [ ] Read the `relay-bypass` log by script: how often the owner's tabs reach a mastermind directly, from where.
- [ ] Route those through the assistant (it answers fast, relays the ask to the mastermind, files the card), keeping a direct path for the owner when they name the mastermind explicitly. Decide the exact rule, record the alternative.
- [ ] Proof: three owner-style prompts from a tab arrive via the assistant (card filed, mastermind gets the relayed ask), one explicit direct one goes straight. One batched Servex restart proven on a private port.
- [ ] Asks entry updated with commits.

Sonnet 5.5, medium. Worktree; commit each step; merge. Land with `finish-task`.

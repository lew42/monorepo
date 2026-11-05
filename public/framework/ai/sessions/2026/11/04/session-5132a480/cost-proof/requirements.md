# Is token accounting right?

Expected cost: about $3. Sonnet, medium effort. Findings first, and fix only what's proven wrong.

The owner's words: "I've asked multiple times in months past for proper token accounting... my confidence that it actually is being done properly is pretty low."

Read first: `public/framework/ai/AISession/doc/cost-accounting.md`, the `audit_session` tool (it recomputes a session's cost from the raw transcript), `recost` and the 10-16 cost fix. Don't build a second system.

## Prove it

1. **How it works, in one screen:** raw transcript → what writes the cost → where it lands → who reads it. Name each `path:line`.
2. **Recompute independently.** For 20 sessions (tabs, masterminds, minions, Haiku and Opus, one with many children), compute cost from the raw transcript with your own small script, not the existing code, using the rates in `public/framework/ai/system/models/`. Compare with the recorded cost and with what `audit_session` says. Show the table. Check the known traps: messages logged several times, cached reads, subagent transcripts, children counted twice in a parent, and a resumed session counted again. Session `e00f55c9` reports $3,002 in total ($645 own, $2,357 children), so check it specifically.
3. **Against the real limit.** `public/framework/ai/usage.jsonl` holds the weekly percent over time. For the week ending 11-04, does recorded spend per percentage point stay steady over the days? Tonight's rough figure was $17–20 per point. If it swings, say why.
4. **Where the money goes,** last 7 days: by model, and by role. Report the share from `clarity` and `reviewer` agents specifically: tonight they cost about $0.30 each per spawned agent, sometimes twice.

## Then

- Fix what's proven wrong, in a worktree, reviewed, with a test. If nothing is wrong, say so plainly.
- The truth goes in `cost-accounting.md`, replacing what's stale. `report.md` here is one screen, with the rerun command.
- Recommend, from the numbers: which job types can drop to Haiku or Sonnet, and whether `clarity` should run on small jobs.
- Zero footprint.

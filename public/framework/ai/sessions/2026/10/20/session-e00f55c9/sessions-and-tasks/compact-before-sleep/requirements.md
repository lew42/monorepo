# Servex: compact before sleep

**Source:** the owner's prompt `e008bc50-aaf1-4c3d-8f68-5cf167b87df6` in [`../../prompts.jsonl`](../../prompts.jsonl), routed by vscode-mastermind to mastermind-system-architect-3 (2026-10-23).

## The ask

Going dormant never compacted. Today Servex forces `/compact` only at the 400k ceiling or 500 MB, and nudges masterminds at 150k ([`Servex/doc/dormant.md`](../../../../../../../../../../Servex/doc/dormant.md), [`Servex/agents/doc/owner-2026-10-16-compaction.md`](../../../../../../../../../../Servex/agents/doc/owner-2026-10-16-compaction.md)).

1. When an agent is about to go dormant and its context is over a threshold (100k, or 50% of the window, whichever is lower; per role in `roles.js` `compact_after`), run `/compact` first, then sleep, so it wakes small.
2. Do it while the cache is still warm if possible.
3. Measure the cost of one compaction.
4. Minions and the standing front desk stay excluded.
5. Update `dormant.md` and the compaction doc as conclusions.
6. Worktree, test, review from the worktree, then log "ready: <branch> <sha>" and "needs restart". mastermind-deputy merges. Budget about $10.

## Done

- `Agent.sleep_compact()` plus a hook in `Agent.sleep("idle")`, in `Servex/agents/Agents.js`. `compact_done` sleeps afterwards. `roles.js` sets `MASTERMIND_COMPACT.sleep`.
- Warm cache: compaction runs at the sleep moment, which falls inside the 5-minute cache TTL for every default idle wait.
- Cost, from Servex's logs: 158k → 17k tokens for $0.24 in 61 s (Sonnet, warm).
- Test: `node Servex/agents/compact-before-sleep.test.mjs` (23 checks).

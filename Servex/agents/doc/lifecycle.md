# Agent lifecycle in node: landing nag, next step, compaction

Nobody should have to remember to land a task, start the next one, or shrink a long context. Node does it (CLAUDE.md law 7). All code is in `Servex/agents/Agents.js` (`Agent.landing_nag`, `next_briefs`, `oversized`); proof: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/landing-nag/landing-nag-proof.mjs` (14 checks).

## The landing nag
When a `task-mastermind` / `mastermind` turn ends with its task unlanded, no child still working, not `BLOCKED`, and its last words say *merged* / *merge commit* / *landed*, Servex sends it ONE message asking for the `assign.landed_at` line and a `card_reply`. The once-flag is `landing_nagged` on the registry row (survives a revive). If the agent is already stopped, a `log` line in its `task.jsonl` says so and the parent's harvest lands it. Before this, the Stop hook nagged only CLI sessions (`.claude/hooks/ledger.mjs`: "session ended (other) without landing").

## The next step
When a child's "done" wakes its parent and the child's task has landed, the wake adds `Next: <sibling dir> (brief <path>)` for each queued sibling whose `assign.after` names the child, that no agent has started, and whose every `after` has landed. Not covered: a `todo.md` line naming the next task (no machine-readable form yet). `Server/Steps.mjs` only nudges overdue steps, so there was nothing to reuse.

## Compaction (nudge, 2026-10-16)
`compact_after` on a `roles.js` row is `{tokens: 150000}` for `task-mastermind`, `mastermind`, `master-assistant`; `null` (never) for `minion`; other rows use `SERVEX_NUDGE_TOKENS` (200k). The minutes rule (45 min) is gone: age is not a reason.
Past the line, when a turn ends and the agent is idle, `Agent.nudge()` builds ONE message through `send()` (the heartbeat's path, `from: servex-compact-nudge`): "Context: N tokens, cache warm/cold (last turn M minutes ago). You are idle. Compact now unless something in flight needs this context." The agent decides; to compact it calls the `compact_self` tool as its last action and `Agent.compact()` runs `/compact` when that turn ends. Node never cuts in mid-flight. Sent once per idle period; again only after the context grew `NUDGE_GROWTH` (20k) since the last nudge, and the count resets after a compaction.
The only automatic `/compact` left is `Agent.oversized()`: a safety ceiling of `SERVEX_COMPACT_TOKENS` (400k) or `SERVEX_COMPACT_MB` (500 MB), at the end of a turn only. Standing front-desk agents are restarted fresh by `Layers.js`, never nudged or compacted.
Logged: `compact_nudge {context, cache}` and `compacting` (events), then `compact` (`before`/`after` tokens). Test: `agents/compact-nudge.test.mjs`. Why: [agents/doc/owner-2026-10-16-compaction.md](../agents/doc/owner-2026-10-16-compaction.md). Alternative not taken: no compaction, or restart fresh with a summary (loses the session id and cache).

A running Servex needs `node Servex/sustain.mjs --restart` to load this.

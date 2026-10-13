# Agent lifecycle in node: landing nag, next step, compaction

Nobody should have to remember to land a task, start the next one, or shrink a long context. Node does it (CLAUDE.md law 7). All code is in `Servex/agents/Agents.js` (`Agent.landing_nag`, `next_briefs`, `oversized`); proof: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/landing-nag/landing-nag-proof.mjs` (14 checks).

## The landing nag
When a `task-mastermind` / `mastermind` turn ends with its task unlanded, no child still working, not `BLOCKED`, and its last words say *merged* / *merge commit* / *landed*, Servex sends it ONE message asking for the `assign.landed_at` line and a `card_reply`. The once-flag is `landing_nagged` on the registry row (survives a revive). If the agent is already stopped, a `log` line in its `task.jsonl` says so and the parent's harvest lands it. Before this, the Stop hook nagged only CLI sessions (`.claude/hooks/ledger.mjs`: "session ended (other) without landing").

## The next step
When a child's "done" wakes its parent and the child's task has landed, the wake adds `Next: <sibling dir> (brief <path>)` for each queued sibling whose `assign.after` names the child, that no agent has started, and whose every `after` has landed. Not covered: a `todo.md` line naming the next task (no machine-readable form yet). `Server/Steps.mjs` only nudges overdue steps, so there was nothing to reuse.

## Compaction
`compact_after` on a `roles.js` row: `{tokens: 150000, minutes: 45}` for `task-mastermind`, `mastermind`, `master-assistant`; `null` (never) for `minion`. The mechanism already existed: `Agent.compact()` sends `/compact` as a turn (the SDK has no separate compaction option; the CLI command is the one), run at turn end by `oversized()`. Rows without the field keep the host default (200k tokens, 500 MB). Standing front-desk agents are restarted fresh by `Layers.js`, never compacted. Alternative not taken: no compaction, or restart fresh with a summary (loses the session id and cache).

A running Servex needs `node Servex/sustain.mjs --restart` to load this.

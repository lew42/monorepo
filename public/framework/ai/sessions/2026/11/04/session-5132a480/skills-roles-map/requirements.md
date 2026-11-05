# Map every skill and role, and which are used

Expected cost: under $1. Haiku. Stay under 60k tokens: write a node script that counts, and read its output. "None" is a fine answer for any row.

## What exists

- Skills: `.claude/skills/*/SKILL.md` (36), plus the plugin skills a session lists. Roles: `Servex/agents/roles/`.
- The log: `.claude/hooks/ledger.mjs` writes `{"log":{"msg":"skill: <name>"}}` into the active task's `task.jsonl` on every Skill call (`.claude/hooks/readme.md`, around line 72). Servex can also inline role skills without a Skill call, so check `Servex/agents/roles.js` and count those by role instead.

## Deliver

1. `Servex/doc/skills-and-roles.md`: one table. Name, kind (skill or role), one line on what it does, uses in the last 7 and 30 days, last used, and who loads it. State exactly which log each count came from and what it can't see (for example, a tab with no open task logs nothing).
2. A second short table: candidates to retire (no use in 30 days), candidates to merge, and any skill that only tells an agent to record something and could be a tool call instead. These are proposals. Don't delete or edit any skill.
3. Link the doc from `Servex/agents/roles/readme.md`, and commit the script beside the doc as `Servex/doc/skills-and-roles.mjs`, so the table can be rerun.

Work in a worktree (`take_worktree`), land with `merge.mjs`, and return the worktree. Leave no process running.

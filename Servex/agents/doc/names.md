# Names: skill = role = agent id

The owner's rule is that a role, the skill it loads, and its agent id prefix are the same word. `roles.js` is the one table that holds all three (plus model, effort and permission mode). An agent id is `<prefix>-<name>`, for example `minion-servex-port`.

Two rows do not match today. Instead of renaming skill directories (a dozen callers, and a rename needs the owner), each row has an `alias`, so either word works as a role: `spawn_agent({role: "sub-mastermind"})` behaves exactly like `role: "task-mastermind"`. The id prefix is whatever word the caller passed.

## Mismatches

- Role `task-mastermind` loads skill `sub-mastermind`. To match: rename the skill directory `.claude/skills/sub-mastermind` to `task-mastermind` (and every place that says "load the sub-mastermind skill"), or rename the role to `sub-mastermind`, which also changes the id prefix of live agents and the Dispatcher's spawns.
- Role `assistant` loads skill `every-prompt`. To match: rename the skill directory `.claude/skills/every-prompt` to `assistant` (its `say.mjs` path is used in many briefs), or rename the role to `every-prompt`, which would make ids read `every-prompt-fast`.

The other four rows (`minion`, `mastermind`, `master-assistant`, `log-assistant`) already match.

## Retired words (2026-09-29)

The owner retired "manager" and "master assistant" as words — say the role's real name instead.
The rows themselves are unchanged today (no behaviour change; this is names only):

- `page-mastermind` (alias `manager`) is what "manager" named — the per-directory mastermind
  the new [directory mastermind](/framework/ai/2026-09-22/tiers-design/doc/roles.md) tool will
  replace, once it exists.
- `master-assistant` is what "master assistant" named. Its "decide, then spawn the right
  mastermind" job now belongs to the voice session's **smart assistant** (`session-smart`).

`session-fast` and `session-smart` are two more rows that don't carry a skill at all (their own
fixed briefs, `session-fast.md` / `session-smart.md`, do that job instead) — the full table is
[the roles page](/framework/ai/2026-09-22/tiers-design/doc/roles.md).

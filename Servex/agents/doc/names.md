# Names: skill = role = agent id

The owner's rule is that a role, the skill it loads, and its agent id prefix are the same word. `roles.js` is the one table that holds all three (plus model, effort and permission mode). An agent id is `<prefix>-<name>`, for example `minion-servex-port`.

Two rows do not match today. Instead of renaming skill directories (a dozen callers, and a rename needs the owner), each row has an `alias`, so either word works as a role: `spawn_agent({role: "sub-mastermind"})` behaves exactly like `role: "task-mastermind"`. The id prefix is whatever word the caller passed.

## Mismatches

- Role `task-mastermind` loads skill `sub-mastermind`. To match: rename the skill directory `.claude/skills/sub-mastermind` to `task-mastermind` (and every place that says "load the sub-mastermind skill"), or rename the role to `sub-mastermind`, which also changes the id prefix of live agents and the Dispatcher's spawns.
- Role `assistant` loads skill `every-prompt`. To match: rename the skill directory `.claude/skills/every-prompt` to `assistant` (its `say.mjs` path is used in many briefs), or rename the role to `every-prompt`, which would make ids read `every-prompt-fast`.

The other four rows (`minion`, `mastermind`, `master-assistant`, `log-assistant`) already match.

# Roles — one readme per agent role

A **role** is the job an agent is started for: a minion does one narrow job, a mastermind decides and splits work. Each role has one readme in this folder, and that readme is everything the agent is told about its job.

**How an agent gets it.** The role's row in [`../roles.js`](../roles.js) names its readme (`readme: "minion"`). When Servex spawns the agent, it puts the whole file into the agent's first message, before the task. A VS Code tab reads it by hand: CLAUDE.md says "read your role's readme". The old skill (`.claude/skills/minion/SKILL.md`) is now one line pointing here, so `/minion` in a tab still works, and `skill_text()` in `roles.js` follows the pointer.

**Why here, beside `roles.js`.** The role table and the role text sit together, so the one switch and what it switches to are found in the same folder. The skills stay where Claude Code looks for them, as pointers.

## The roles

| Role (`spawn_agent({role})`) | Readme | Does | Tier (model today) | Use it when |
|---|---|---|---|---|
| `mastermind` | [servex-mastermind.md](servex-mastermind.md) | the systems architect: oversees quality, spend and coordination, fixes the system, not pages | architect (Sonnet, high) | a standing overseer of the agent system |
| (VS Code tab, `/mastermind`) | [mastermind.md](mastermind.md) | the executive: governs the budget, picks the top work, spawns minions | the tab's own model | the owner says "you are the mastermind" |
| `task-mastermind` (also `page-mastermind`, `directory-mastermind`) | [task-mastermind.md](task-mastermind.md) + the `page` skill | owns one task end to end: splits it, spawns minions, judges, lands | manager (Sonnet, medium) | one task with several parts |
| `minion` | [minion.md](minion.md) | one narrow job from a brief: a scan, a fix, a build | scan (Haiku, low); pass Sonnet for UI or class code | one job a brief can describe |
| `reviewer`, `checker` | [reviewer.md](reviewer.md) | fresh-eyes review of finished work against the owner's asks and every design system | manager (Sonnet, medium) | before a merge (`Server/review.mjs` starts it) |
| `clarity` | [clarity.md](clarity.md) | checks what a landed task wrote for the owner is clear; sends rewrites | manager (Sonnet, medium) | woken per landing by `Server/clarity.mjs` |

The model column is today's: the tier decides the model, in [`../tiers.js`](../tiers.js). Spend per role over the last week: [ai/doc/readme-system.md](../../../public/framework/ai/doc/readme-system.md).

## Still skills (no role readme yet)

- ⬜ `assistant`, `page-assistant` (skill `every-prompt`), `voice-assistant`, `master-assistant`, `log-assistant`
- ⬜ `voter` (skill `research`), `fixer` (`../fixer.md`), `session-fast` / `session-smart` (`../session-fast.md`, `../session-smart.md`: their own briefs, no skill)

## Open

- ⬜ Every readme here is over the 400-word target (words, 2026-10-22: mastermind 5,251 · minion 3,048 · task-mastermind 2,432 · servex-mastermind 2,114 · reviewer 859 · clarity 689). They were moved whole, unchanged; trimming them is the next pass. Move: [moves.md](../../../public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/moves.md).
- Improvements to a role still go in its skill folder's `improvements.md`.

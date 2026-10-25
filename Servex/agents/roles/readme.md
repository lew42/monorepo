# Roles — one readme per agent role

A **role** is the job an agent is started for: a minion does one narrow job, a mastermind decides and splits work. Each role has one readme in this folder, and that readme is everything the agent is told about its job.

**How an agent gets it.** The role's row in [`../roles.js`](../roles.js) names its readme (`readme: "minion"`). When Servex spawns the agent, it puts the whole file into the agent's first message, before the task (a mastermind spawned at a `path` also gets that path's readme chain and `mastermind.md` in its system prompt). A VS Code tab reads it by hand: CLAUDE.md says "read your role's readme". The old skill (`.claude/skills/minion/SKILL.md`) is now one line pointing here, so `/minion` in a tab still works, and `skill_text()` in `roles.js` follows the pointer.

**Why here, beside `roles.js`.** The role table and the role text sit together, so the one switch and what it switches to are found in the same folder. The skills stay where Claude Code looks for them, as pointers.

## The roles

| Role (`spawn_agent({role})`) | Readme | Does | Tier (model today) | Use it when |
|---|---|---|---|---|
| `mastermind` with a `path` (old words `ai-system-mastermind`, `servex-mastermind`: `mastermind` at `public/framework/ai/`) | [mastermind.md](mastermind.md), "Spawned at a path"; the path's own text is its `mastermind.md` (the AI system's: [public/framework/ai/mastermind.md](../../../public/framework/ai/mastermind.md)) | owns sessions, tasks, roles, skills and spawning when spawned at `public/framework/ai/`; fixes the system, not pages | architect (high) | the path's readme chain and `mastermind.md` ride in the system prompt; a normal mastermind, parented to its spawner |
| `core-page-mastermind` (subject mastermind; ids `mastermind-page`, `-2`) | [core-page-mastermind.md](core-page-mastermind.md) | architect of the page system: `core/Page`, `core/Item`, `core/Router`, `ext/JSONL`; reads the Item readme first; works its own queue | architect (high) | any change to pages, routing, parts or the log that streams them |
| `mastermind` (Servex spawn) | [mastermind.md](mastermind.md) | the executive: picks the top work, spawns minions | architect (high) | a mastermind spawned on Servex |
| (the owner's VS Code sidebar tab) | [vscode-mastermind.md](vscode-mastermind.md) | answers the owner fast, relays the essence of each dictation to a deputy, hands off all investigating, building, reviewing and merging | the tab's own model | the tab the owner dictates to |
| (VS Code tab, `/mastermind`) | [mastermind.md](mastermind.md) | the executive: governs the budget, picks the top work, spawns minions | the tab's own model | the owner says "you are the mastermind" |
| `page-mastermind`, `directory-mastermind` (the old words `task-mastermind` and `sub-mastermind` are now aliases of `mastermind`, so an old caller using those words gets its architect/high posture) | [mastermind.md](mastermind.md), "Owning one task end to end" + the `page` skill | owns one task end to end: splits it, spawns minions, judges, lands | manager (Sonnet, medium) | one task with several parts |
| `minion` | [minion.md](minion.md) | one narrow job from a brief: a scan, a fix, a build | scan (Haiku, low); pass Sonnet for UI or class code | one job a brief can describe |
| `reviewer`, `checker` | [reviewer.md](reviewer.md) | fresh-eyes review of finished work against the owner's asks and every design system | manager (Sonnet, medium) | before a merge (`Server/review.mjs` starts it) |
| `clarity` | [clarity.md](clarity.md) | checks what a landed task wrote for the owner is clear; sends rewrites | manager (Sonnet, medium) | woken per landing by `Server/clarity.mjs` |

The model column is today's: the tier decides the model, in [`../tiers.js`](../tiers.js). Spend per role over the last week: [ai/doc/readme-system.md](../../../public/framework/ai/doc/readme-system.md).

## Subject masterminds: one per system

A **subject mastermind** owns one system end to end: it decides what changes there, keeps that system's readme true, and splits the work. Ask the one that owns the subject; do not decide across systems from a generic mastermind.

| Subject | Role | Owns |
|---|---|---|
| The AI system | `mastermind` at `public/framework/ai/` (word: `ai-system-mastermind`) | sessions, tasks, roles, skills, the SDK, spawning, processes |
| The page system | `core-page-mastermind` (repeatable) | pages, routing, parts, `core/Item`, the JSONL streaming path |

Items, routing and JSONL streaming are part of the page system's mastermind until one of them needs its own role; add a row and a readme here then (a role row in `../roles.js` is what puts the text in the system prompt, so it survives compaction).

## Still skills (no role readme yet)

- ⬜ `assistant`, `page-assistant` (skill `every-prompt`), `voice-assistant`, `master-assistant`, `log-assistant`
- ⬜ `voter` (skill `research`), `fixer` (`../fixer.md`), `session-fast` / `session-smart` (`../session-fast.md`, `../session-smart.md`: their own briefs, no skill; smart runs on the `voice_smart` tier, Opus 5.5 medium, in `tiers.js`)

## Open

- ⬜ Every readme here is over the 400-word target (words, 2026-10-22: mastermind 5,251 · minion 3,048 · reviewer 859 · clarity 689). They were moved whole, unchanged; trimming them is the next pass. Move: [moves.md](../../../public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/moves.md).
- Improvements to a role still go in its skill folder's `improvements.md`.

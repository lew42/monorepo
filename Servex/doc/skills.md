# Skills: what Servex injects, and how often it worked

**Before (2026-10-12):** Servex wrote "Load the `X` skill, then: …" and the model had to call the Skill tool. `skill-reliability/MissSample.mjs` over 1,987 told skills: 96.5% loaded. 31 of the 70 misses are not misses (the agent ended before its first turn), so the true rate was **98.0%**; the other 39 were the model skipping it (29) or loading a different skill (10).

**Now:** `opening()` in `Servex/agents/roles.js` reads each role's `.claude/skills/<name>/SKILL.md` and puts the text in the first message, so loading is node's job and is 100% by construction. If a SKILL.md is missing it falls back to the old "Load the" request. Every fresh spawn appends a line to the `skills` log (`Agents.js`): `{agent, role, injected: [...]}` (`fallback: true` when nothing was inlined), so the rate is read, not remembered.

**Who gets what:** the table in `Servex/agents/roles.js` (`skill` / `skills` per role). Observers, voters and checkers have no row, so they get nothing; add a `skills:` entry to give them one.

**Trade-off:** the skill text is always paid for, even when the task would not need it (the model used to skip some). Alternative rejected: leave self-chosen skills (`new-task`, `finish-task`, `new-page`) to the model; their 66-80% is better fixed by tools (`close_task` refusing an incomplete log), see `public/framework/ai/2026-10-12/skill-usage-audit/recommendation.md`.

## The six never-called skills
- `assistant`, `master-assistant`, `log-assistant`: not in any role row; those layers read `Servex/agents/*.md` prompts directly, so the skill copy is never asked for.
- `fork-claude-session`: a manual how-to; `fork_self` is a tool now, nothing mentions the skill.
- `performance`: the description matches no moment an agent is in.
- `prompt-refine`: `Server/refine.mjs` and the Echo agent do the work; the skill name was never injected anywhere.
Pruning is `mastermind-skill-prune`'s; nothing deleted here.

Numbers: `public/framework/ai/2026-10-12/skill-reliability/data/misses.json`.

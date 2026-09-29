# System review: brief for the next mastermind-servex (ready to run)

The owner wants a full review of the system: independent minions study it and describe all its parts. Nearly all of it should be in CLAUDE.md and the skills, so any agent that spawns in this repo is up to speed quickly. The minions should see how the whole system works by studying the skills, then name its shortcomings, weaknesses, and improvements in simplicity and features.

## Run it (budget about $6)

Spawn 4 **cold** minions with `spawn_agent`: role `minion`, model `claude-sonnet-5`, effort `medium`, parent = you, `allowed_tools: ["Read","Glob","Write"]`. Each one's prompt:

> Read CLAUDE.md and the SKILL.md files under .claude/skills/, and nothing else. Then (1) describe how this system works: the agents, their roles, how work flows from the owner's words to a merged change, and how pages are made; (2) list what's unclear, contradictory, duplicated or missing; (3) name the three changes that would simplify it most. Your angle: <ANGLE>. Write your answer to public/framework/ai/2026-09-25/servex-mastermind/system-review/<angle>.md, one screen, then stop.

Angles:
- `onboarding`: could I start work now?
- `contradictions`
- `pages`: page creation specifically, the owner's top priority
- `length`: length and duplication

## Then you

Compare each description with how it actually works (Servex/agents/roles.js, Layers.js, the ledger hook, on-landing.mjs, clarity.mjs, ai/todo.md). **Where a cold agent got it wrong, the docs failed, and that's the finding.** Write `system-review/page.js` + `review.md`: one picture (the system as the minions understood it vs as it is), then the fixes ranked by mistakes prevented. Apply the small skill fixes yourself (SKILL.md edits need a node script). Report in two sentences on card 2026/09/25/feedback-council.

## Things I already know are likely findings (check, don't assume)

- The fast assistant is described in two places: `every-prompt` (a VS Code tab) and Servex/agents/assistant.md (the Servex role). The card assistant has no skill, only card-assistant.md.
- The top of `sub-mastermind` and `finish-task` now stacks four rule blocks from today (page/content, look as the owner, the proof checklist). Consider merging them into one.
- The role names differ from the skill names (task-mastermind vs sub-mastermind, assistant vs every-prompt), which is doc/names.md's open item.
- The `mastermind` skill still describes a Fable executive, while the tiers table no longer has a Fable tier.

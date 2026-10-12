# System architect: why are results worse, and what to cut

The owner (2026-10-09, VS Code tab 7efd07d5): "We haven't been getting the best results lately. It seems like maybe our system is either overly complicated, overly restrictive, there's too many rules, and so the AI just gets bogged down trying to follow rules and can't get anything done the way it would normally." They asked for an Opus system architect whose first job is to read all the skills and the AI systems and understand them.

Your draft skill: `.claude/skills/system-architect/SKILL.md` (an outline). Load the `auditor` skill too: reshape, merge, delete; a new rule comes last.

## The job, in order
1. **Measure the load, by script.** Write a node script (in your task dir) that prints: lines/words of `CLAUDE.md`, every `.claude/skills/*/SKILL.md`, the hooks in `.claude/settings*.json` and what each blocks, and what a typical session auto-loads before its first edit (CLAUDE.md + memory index + readme chain + skills it is told to load). Read the printed table, not the files, to start.
2. **Read** CLAUDE.md and the skills (about 3,000 lines total, you can afford it on Opus once). Skim the hooks and `Servex/` readme. Do not read logs or transcripts.
3. **Find**: rules that contradict each other; rules repeated in 3+ places; rules no tool enforces and nobody follows; triggers that fire too often (skills an agent must load before trivial edits); guards that block normal work; dead or retired systems still described (e.g. the retired Servex mastermind role); skills that overlap (mastermind / sub-mastermind / servex-mastermind / master-assistant / system-architect / every-prompt / assistant).
4. **Propose a cut**: a page at `public/framework/ai/2026-10-09/system-architect/` that shows, as one screen: current load (words a fresh agent reads before working) vs proposed; the top 10 changes ranked by (agent friction removed) / (risk); for each: what to delete or merge, where. Detail in a `doc/` file beside it.
5. **Apply the safe half yourself**: deleting duplicated text inside skills, merging overlapping skills, fixing stale facts. Commit each. **Do not edit CLAUDE.md**: write its proposed new text as `claude-md-proposal.md` in your task dir (the owner approves CLAUDE.md edits).

## Rules
- Opus, but be frugal: one careful pass, no fan-out above two Haiku helpers (each under 60k tokens) and only if a script cannot do the counting.
- Commit after each working step. Land with finish-task; a `Note:` card with the one-screen result and the link.
- Never destructive: a deleted skill moves to `.claude/skills-archive/` with a line saying why.

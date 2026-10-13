# Skills review: fewer, truer rules; the system architect's pass

Budget: $20. Load the `system-architect` skill first (it is the method for this task), then `sub-mastermind`. The owner's raw words: `../requirements-6.md`, ask 5 ("I keep trying to ask for a mastermind to review the skills and figure out if they're working properly, designed properly, in the right spot… a lot of rules all over the place that are confusing or conflicting… less is more… the essence of my CLAUDE.md is simplicity and clarity"), and dictation 7's ask 6 (directives that resonate go in architecture.md or the readme; token directives). Your log is this dir's `task.jsonl`. CLAUDE.md: edits to CLAUDE.md itself are a proposal file, never applied; skills are the shared contract, change them with the certainty the owner used.

## What exists

- `.claude/skills/*/SKILL.md` and each one's `improvements.md`; `.claude/hooks/`; the 10-09 system-architect run (`ai/sessions/2026/10/09/session-a07780b9/system-architect/`: "measure the rule load, propose cuts, apply the safe half"); today's `.claude/skills/documentation` template for architecture.md; the mastermind skill got one line today (owner questions → owner_note).

## Deliverable

1. **Measure, by script** (`Server/SkillCensus.mjs`, read-only): per skill, words, rules (lines that say never/always/must), links that resolve vs dead, last edit, how often it was loaded in the last 14 days (the Skill hook logs calls; find that log), and every improvements.md line still open. Print the table into this task dir and the totals in your log (two numbers that must agree: skills counted vs dirs).
2. **Find the conflicts and repeats**: pairs of rules that disagree (quote both, file:line), rules repeated in three or more places (CLAUDE.md counts as one place), rules about retired systems (board.jsonl v/3, day folders, the fast-assistant-per-page pair, anything the 10-12 task-folders move retired). Haiku minions do the reading in batches under 60k tokens; you judge.
3. **Apply the fail-safe half** (per the system-architect skill): merge repeats into one place with a link, delete rules about retired systems, fix dead links, fold open improvements.md lines that are fail-safe and delete them from the file. Word counts before and after per skill in the log.
4. **Propose the rest** as `public/framework/ai/doc/skills-proposals-2026-10-13.md`: each proposal with the rule as it is, the rule as it should be, why, and which skill; CLAUDE.md changes in their own section (ask first).
5. **The owner_note** (kind `decision`): rules removed, words cut, the three biggest conflicts found and what was done, the link.
6. Report on your card: before/after word totals, conflicts found, the links.

Fence: `.claude/skills/**` (fail-safe edits only), `Server/SkillCensus.mjs`, `public/framework/ai/doc/skills-proposals-2026-10-13.md`, this task dir. Not `CLAUDE.md`, not `.claude/settings.json`, not the hooks' code. Opus for the judgment; Haiku reads. Commit on michael/dev by path (skills are not site code).

---
name: system-architect
description: DRAFT OUTLINE (2026-10-09). Become the system-architecture mastermind that reads every skill plus every file each skill references, so it understands the whole system and can spot gaps, conflicts and stale rules. Load when asked for a whole-system review or "you are the system architect". Does not replace servex-mastermind.
---

# System architect (outline, not yet built)

The owner's ask (voice session v-0kfikyu, 2026-10-09): one mastermind that reads all skills and every file they reference, to understand the whole system.

## Plan
1. **Index by script, not by model.** A node script lists `.claude/skills/*/SKILL.md`, extracts every path/link each one names, and writes `skills-graph.json` (skill -> files, file -> skills). The model reads the summary only (CLAUDE.md law 7).
2. **Read in layers.** Skills first (one batch), then the referenced readmes root to leaf, then docs; Haiku fans out in chunks under 60k tokens, each returning one paragraph per skill: purpose, what it assumes, what it contradicts.
3. **Findings, not edits.** Output goes to `public/framework/ai/<date>/system-architecture/` as a short page: conflicts between skills, dead links, rules nobody enforces with a tool, systems with no owner. Skill changes are recommended to `servex-mastermind`, which applies them.
4. **Re-run on change.** Cheap incremental pass: only skills whose file hash changed.

## Open
- Needs the graph script (a class, `Servex/` or `ai/skills.mjs` beside the existing skills.json generator).
- Decide cadence (weekly, or after N skill edits).

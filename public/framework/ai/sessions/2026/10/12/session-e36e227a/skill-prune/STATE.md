# Skill prune, 2026-10-12: the safe half of the [skill-usage audit](../skill-usage-audit/recommendation.md)

**Result:** skills went from 34 to 32 and from 39,609 to 33,082 words (about 55.5k to 46.3k tokens). `mastermind` fell 7,982 to 3,672 words and `sub-mastermind` 4,240 to 2,478. Raw numbers: [before](bloat-before.json), [after](bloat-after.json), from `SkillBloat.mjs`.

- ✅ **Roles:** `Servex/agents/roles.js` has `reviewer` and `checker` (load `review`) and `voter` (loads `research`). The module imports and resolves all three. ⚠ Live only after the next `node Servex/sustain.mjs --restart`; I did not restart (it refuses while agents work and would stop this session), so batch it with the next one.
- ✅ **Archived** to [`.claude/skills-archive/`](/.claude/skills-archive/MANIFEST.md): `assistant`, `performance`, `prompt-refine`. **Kept:** `log-assistant` and `master-assistant` (a role row loads each), `fork-claude-session` (`new-task` and `check-claude-usage` still point at it).
- ✅ **Retired names** (mastermind-servex, AI 2, council, `ai2/`) replaced in 6 skills and `page-assistant.md`. A live doc path `doc/ai2/card-standard.md` stays because the file really is there; `skills.json` is generated (`skills.mjs`), so rerun it.
- ✅ **Trims:** history, repeated owner quotes and sections duplicated inside the file (usage, Haiku default, land, review-before-merge) are cut; every rule that still applies is kept.
- ⬜ Not touched, as asked: `CLAUDE.md`, and `servex-mastermind` (1,500+ words, same trim would fit).

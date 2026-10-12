# Skills and rules: are they used? (audit, 2026-10-12)

**Short answer:** skills are used when an agent is *told* to load one, and almost never otherwise. The fix is to enforce, not to reword. Numbers come from `SkillUsage.mjs` and `SkillBloat.mjs` (data in `data/`); nothing here is from memory.

### 📊 What the numbers say
- **8,067 sessions scanned, 3,729 Skill calls** (1,912 sessions called at least one). Top: `minion` 1,012 · `clarity` 592 · `content` 344 · `finish-task` 315 · `sub-mastermind` 258 · `new-task` 205.
- **Never called:** `assistant`, `log-assistant`, `master-assistant`, `fork-claude-session`, `performance`, `prompt-refine`. **Called 1–5 times:** `system-architect`, `ui`, `naming`, `navigation`, `color`, `decide`, `auditor`, `review`, `research`, `openrouter`.
- **Told vs not told** (Servex prefixes a role's first prompt with "Load the `X` skill"): minion 649 of 704 loaded it, clarity 591/591, task-mastermind 182/186, mastermind 40/40. Reviewers, checkers, voters and proofs are told nothing and loaded a skill in 2 of 518 sessions.
- **Self-chosen skills at the real moment** (counted from real tool calls, not prompt text): sessions that opened a task loaded `new-task` 175 of 263 times (67%), closed a task and loaded `finish-task` 264 of 333 (79%), created a page and loaded `new-page` 12 of 15 (80%). Better than feared; the misses are the ones with no reminder.

### 🧱 Bloat an agent pays
- `CLAUDE.md`: **4,081 words (~5,700 tokens)** every session. The 2026-10-09 proposal ([claude-md-proposal.md](../2026-10-09/system-architect/claude-md-proposal.md)) is 1,172 words; it was never applied.
- 34 skills, 39,609 words in all; their descriptions alone (~1,970 words) ride in every session. Biggest bodies: `mastermind` 7,982, `sub-mastermind` 4,240, `ui-test` 4,115, `minion` 3,114.
- Sentence-level duplicates with CLAUDE.md: only 5 (e.g. "write classes, not function bags" in `code`). Duplication is not the main bloat; **length is**.
- Retired systems still named in skills: `mastermind-servex` (8 mentions), "AI 2" (5), `council` (3), `ai2/` (4), `ai/v/3` (2).

### 🔍 Why skills go unused (five sampled cases)
1. Reviewer, checker, voter agents: never told, so never load (roles.js gives them no `skills:`).
2. "On duty" observer tabs: have the Skill tool but their prompt says "answer nothing", so no trigger.
3. Rules already restated in CLAUDE.md: agent feels covered, skips the skill.
4. A tool exists that does the job (`create_page`, `close_task`), so the skill is bypassed by design.
5. The skill list shows only a one-line description; vague ones (`performance`, `naming`) never match a moment.

### ✅ Recommendation (decided; the alternative is named)
- **CLAUDE.md**: cut to the 1,172-word proposal (laws + traps + where to look). Alternative: keep it and trim by 30%; rejected because half of the current text is owner voice and history, which cost tokens every session.
- **Module readme / `doc/`**: how-to and per-system detail (class cards, paging, Servex operation). Agents read these anyway through the readme chain.
- **Skill**: only a procedure an agent follows once per task (`new-task`, `finish-task`, `new-page`, `minion`, role skills). Keep ~12; the rest become `doc/` pages or die. The six never-called ones are candidates to archive (never delete).
- **Enforced tool or hook**: anything an agent must not forget. Servex runs tools in its own process ([tool-process.md](/Servex/doc/tool-process.md)), so `close_task` can refuse until the log is complete, and `create_page` can write the first page line itself. Alternative: more prose; the told-vs-not-told numbers show prose reminders only work when injected.
- **Inject, don't hope:** give reviewer, checker, voter roles a `skills:` entry in `Servex/agents/roles.js`, so they get the same "Load the X skill" prefix that gets 95%+ compliance.
- **Number of systems:** three layers, named by their strength: **Laws** (CLAUDE.md), **Guides** (readmes and `doc/`), **Procedures** (skills, tools, hooks). Today "skill", "rule", "instruction" and "readme" all blur into one.

### Next
Owner approves cutting CLAUDE.md; then a `system-architect` pass applies it. Nothing was edited here.

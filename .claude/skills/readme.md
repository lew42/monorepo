# Skills

A skill is a procedure or a reference an agent loads only when it needs it, so it costs context only then. `CLAUDE.md` is loaded by every agent on every turn, so it holds only the laws every agent needs; everything else is a skill.

## Where a rule goes (decided 2026-10-20, system architect)

- **`CLAUDE.md`:** a law every agent needs on every turn. Paid always, so one line each, linking the detail.
- **Trigger skill:** a procedure tied to a moment (open a task, land it, decide, name a thing). Loading it at that moment refreshes the procedure right when it is used, which a CLAUDE.md paragraph read an hour earlier does not.
- **Reference skill with sub-skills:** domain knowledge loaded once per session; a big domain names smaller ones instead of holding them (`code` → `css` → `new-css-class`; `page` → `layout`, `navigation`, `ui`, `color`).
- **Role skill:** preloaded by Servex for a role (`Servex/agents/roles.js`), so its size is paid by every agent of that role. Keep it short. ⚠ The Servex role `mastermind` loads `servex-mastermind`; the `mastermind` skill is what a tab loads with `/mastermind`.

Usage data: `node Server/SkillCensus.mjs` (loads logged by `.claude/hooks/ledger.mjs` on every Skill call, sizes, dead links). A one-off census with preloads and references: [census.md](../../public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/skills-audit/census.md). Loads undercount: only calls made while a task is open are logged.

## The skills (2026-10-20)

| Kind | Skills | Verdict |
|---|---|---|
| Trigger | new-task, finish-task, decide, make, past-work, research, skill-improvement, documentation, content | keep. `make` shows 0 loads although law 8 depends on it: watch it |
| Reference | code → css → new-css-class; page → layout, navigation, ui, color; ui-test, check-claude-usage, fork-claude-session, figma (2026-10-20: before any Figma design work) | keep. `new-css-class` is already folded into `css`; it stays as a 13-line alias because agents call it by name (71 loads). `fork-claude-session`: 0 loads, no role; archive if still unused by 2026-11-20 |
| Role | minion, mastermind, sub-mastermind, servex-mastermind, system-architect, master-assistant, every-prompt, voice-assistant, voice-mastermind, log-assistant, clarity, auditor, review, openrouter | keep; trim the big ones (below) |

## Next (cost per spawn, biggest first)

- ⬜ `minion` (19.5 KB) is preloaded into every minion: trim it to the never-list and the landing steps, the rest one link down.
- ⬜ `mastermind` (29.6 KB) is the largest skill: move the rarely-needed sections (CLI fallback, grouping, branches) to a doc.
- ⬜ `servex-mastermind` (11.4 KB) is preloaded for every Servex mastermind, while `system-architect` says that role is retired: fold what is still used into `system-architect` and repoint `roles.js`.

No skill was merged or deleted in this pass: none was plainly safe (each is called by name or preloaded by a role).

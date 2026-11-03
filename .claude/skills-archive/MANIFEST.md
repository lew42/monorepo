# Archived skills (never deleted; move a folder back into `.claude/skills/` to bring it back)

Source: `public/framework/ai/sessions/2026/10/12/session-b5cae4be/skill-usage-audit/recommendation.md` (zero calls in 8,067 sessions).

| Skill | Old path | Why archived |
|---|---|---|
| assistant | `.claude/skills/assistant/` | Only held `say.mjs`; nothing references it (live copy is `every-prompt/say.mjs`). |
| performance | `.claude/skills/performance/` | Never matched a moment; nothing references it. |
| naming | `.claude/skills/naming/` | Merged into `make` (step 1, name it), 2026-10-13, skills-review: the owner asked for one skill for naming, placing, classing and showing a new thing. |
| new-page | `.claude/skills/new-page/` | Merged into `make` (its body is `make/page.md`, its improvements.md moved too), 2026-10-13, skills-review. |
| prompt-refine | `.claude/skills/prompt-refine/` | Superseded by `ext/Refine` and `Servex/agents/Echo.js`; no role loads it. |

Kept, with the reason: `log-assistant` and `master-assistant` (a `roles.js` row loads each); `fork-claude-session` (`new-task` and `check-claude-usage` still point at it).

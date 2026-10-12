# Archived skills (never deleted; move a folder back into `.claude/skills/` to bring it back)

Source: `public/framework/ai/2026-10-12/skill-usage-audit/recommendation.md` (zero calls in 8,067 sessions).

| Skill | Old path | Why archived |
|---|---|---|
| assistant | `.claude/skills/assistant/` | Only held `say.mjs`; nothing references it (live copy is `every-prompt/say.mjs`). |
| performance | `.claude/skills/performance/` | Never matched a moment; nothing references it. |
| prompt-refine | `.claude/skills/prompt-refine/` | Superseded by `ext/Refine` and `Servex/agents/Echo.js`; no role loads it. |

Kept, with the reason: `log-assistant` and `master-assistant` (a `roles.js` row loads each); `fork-claude-session` (`new-task` and `check-claude-usage` still point at it).

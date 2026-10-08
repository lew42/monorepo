# Systems map: where each major system lives

One row per system: its entry readme, its size and last change (computed 2026-10-08 with `git log`, not remembered), and what is wrong with it. A readme over ~100 lines is marked **long**.

| System | Lives in | Entry readme | Lines · last change | Note |
| :--- | :--- | :--- | :--- | :--- |
| AI (tasks, cards, board, System tab) | `public/framework/ai/` | [readme.md](readme.md) | 71 · 10-08 | fresh; decisions in [doc/architecture.md](doc/architecture.md) |
| Servex (the always-on process, agents) | `Servex/` | [Servex/readme.md](/framework/servex/) | 388 · 10-03 | **long**; decisions in `Servex/doc/architecture.md` |
| Servex agents (roles, spawn, sessions) | `Servex/agents/` | `Servex/agents/readme.md` | 289 · 10-04 | **long** |
| Agent SDK (how an agent is started) | `Servex/agents/Agents.js` | `Servex/doc/sdk.md` | 50 · 10-08 | new |
| Models (Anthropic, OpenRouter, local) | `Servex/ext/openrouter/`, `Servex/ext/local/`, `ai/system/models/` | `Servex/ext/local/readme.md` | n/a | OpenRouter has no readme, only `gaps.md` and `decisions/` |
| Sessions (voice and chat) | `public/framework/ai/sessions/` | [sessions/readme.md](sessions/readme.md) | 177 · 10-08 | **long**; owned by minion-session-class |
| Dashboard (AI 2) | `public/framework/ai2/` | `ai2/readme.md` | 387 · 10-06 | **long**; the AI readme calls it retired in places, the System tab still links it |
| Page system | `public/framework/core/Page/` | `core/Page/readme.md` | 105 · 10-06 | about right |
| JSONL streaming | `public/framework/ext/JSONL/` | `ext/JSONL/readme.md` | 36 · 10-02 | short and old |
| Transcription (Whisper, Dictate) | `public/framework/ux/Dictate/` | `ux/Dictate/readme.md` | 365 · 10-05 | **long** |
| Chat, Refine, Session widgets | `ext/Chat/`, `ext/Refine/`, `ext/Session/` | their readmes | 40 · 53 · 51 | fine |
| Skills | `.claude/skills/` (34) | `/framework/ai/skills/` | n/a | see sizes below |
| CLAUDE.md | repo root | itself | 88 lines, 15.7 KB | read by every agent |
| System prompts agents receive | `Servex/agents/*.md`, `Servex/agents/brief.js` | `Servex/agents/readme.md` | n/a | per-role prompts; not yet measured |

## Skill size (bytes, largest first; about 4 bytes per token)

`mastermind` 47 KB · `sub-mastermind` 27 KB · `ui-test` 26 KB · `minion` 25 KB · `fork-claude-session` 19 KB · `servex-mastermind` 12 KB · `finish-task` 9 KB · `research` 9 KB.

A mastermind loads its 47 KB skill (~12k tokens) on top of CLAUDE.md (~4k) every turn it re-reads. That is the cheapest saving on offer; see `2026-10-08/ai-system-docs/findings.md`.

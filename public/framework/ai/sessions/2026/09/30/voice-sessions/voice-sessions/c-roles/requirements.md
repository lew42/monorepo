# One name per role, and one live log per task

Load the `minion` skill first. Your parent is task-mastermind-voice-sessions. The whole task is [../requirements.md](../requirements.md) (items 6, 7, 9, 15). The source of truth is [../design.md](../design.md), whose roles table the Servex mastermind updated at about 7:55 PM.

## Where you work

Worktree `C:/Code/lew42/worktrees/qf-9`. A sibling minion is editing `Servex/agents/Sessions.js`, the `session-*.md` briefs, `tools.js`, `ServexProxy.js` and `ext/Session/` there right now, so **don't touch any of those**. Commit by exact path.
**Fence: docs only**: `public/framework/ai/2026-09-22/tiers-design/doc/roles.md`, `.claude/skills/every-prompt/tiers.md`, `Servex/agents/readme.md` and `Servex/agents/doc/` (a names doc if one exists), `public/framework/ext/AITask/readme.md` (item 15), and comments only in `Servex/agents/roles.js` (no behaviour change: aliases stay).

## Deliverables

1. **The names, reconciled.** The owner (6:40 PM, `../audio/owner-words.md`, "Continued"): per voice session there is a **fast assistant** (transcribe and show the words fast, nothing else) and a **smart assistant** (hears everything, decides, launches masterminds, routes technical questions). "Manager" and "master assistant" go. "Global assistant" now means a voice session's smart assistant. The **directory mastermind** replaces the per-page manager. Write the roles page as ONE table, one row per role: name, what it does, model and effort, who starts it, and the skills it loads. The rows are: fast assistant, smart assistant, directory mastermind, task mastermind, minion, Servex mastermind, plus any role the code still spawns (clarity, log-assistant, reviewer). Old words are listed once, in a "was called" column, never used elsewhere. Say which skills the smart assistant shares with a task mastermind (item 9: `sub-mastermind`'s judging and landing parts? read both skills and decide). Mark what is built today (`session-fast` and `session-smart` in roles.js, Sessions.js) and what is not yet (the directory mastermind tool).
2. **The echo pattern (item 9):** the smart assistant and a mastermind both follow one voice session at once. One line on the roles page, linking `../follow/requirements.md` (the `follow(path)` Servex tool, being built by another task).
3. **One live log per task (item 15).** All 31 of today's task folders have a page.jsonl, and 24 also have a task.jsonl. Decide which one is the task's live log that agents `follow`. Record the decision with `node Server/decide.mjs` (load the `decide` skill; it walks you through it), then say it in one line in `ext/AITask/readme.md`, linking the decision. Look at what each file actually holds in two or three of today's folders before deciding.
4. Row 34's "an assistant in front of any session" and "who does what in the chat room" sections could not be found on disk. If you find them (search `public/framework/ai/2026/09/28/` and `.claude/prompts`), reconcile them too. If not, say so in one line.

Keep every page short and plain (the `content` skill). Reply with the commits and anything left over.

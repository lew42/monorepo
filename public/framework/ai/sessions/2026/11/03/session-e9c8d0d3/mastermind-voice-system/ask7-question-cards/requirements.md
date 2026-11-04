Budget: $8. Load the `minion` skill first. Worktree: C:/Code/lew42/worktrees/voice-qcards (branch from compliance/dev). Run `npm ci` in its `Servex/` if the SDK is missing (no new dependency, never symlink node_modules). Revert regenerated `files.jsonl` before committing.

# Ask 7: question cards (the owner's words)
Source: public/framework/ai/sessions/2026/11/03/session-e9c8d0d3/mastermind-voice-system/owner-feedback-2026-11-03b.md, item 7. Also read public/framework/ux/Dictate/doc/principles.md, public/framework/ext/Chat/v3/readme.md, public/framework/ux/Dictate/readme.md (the "A Question card moves to the end of the chat when answered" line), ext/Chat/readme.md.

1. A question becomes a question card IN PLACE (where the owner's sentence is), its punctuation fixed.
2. The answer goes ON the card (not as a separate reply far away).
3. A far-off answered card (the answer lands long after the question, other content in between) is resurfaced near the end as a reference with a back arrow that jumps to the original card.
4. A repeated question links to its existing card instead of making a second one.

# Method
- FIRST write plan.md beside this file (10-20 lines): what exists today (find how Question/Task messages are made: Servex/agents/tools.js, ChatWriter.js, Message.js, ext/Chat/v3/placement.js, ChatV3.js, Widget.js `show_task`, `ChatV2Model.newly_answered`), what you will change, what you will NOT touch. Reuse, never a second system (CLAUDE.md law 6). Ask 3 (item adds a card by id) and the move mirror (ChatWriter.move_line) are already merged; use them.
- Tests first (red), then build, small commits. Server tests in Servex/agents/*.test.mjs; V3 tests beside ChatV3 (node-runnable where possible).
- Keep the seat brief Servex/agents/single-voice-assistant.md under 900 words (enforced by Sessions.single.test.mjs); prefer code over brief edits.
- Do NOT build batching, log mode, or anything not listed. If a part is too big, land 1+2 and write the rest as a ⬜ line in the module readme, saying why.
- Update the readme chain truthfully (ext/Chat/v3/readme.md, ux/Dictate/readme.md pointer, a doc/question-cards.md linked from it). No dated logs.
- Never: git stash, kill the dev server, drive the owner's tabs, push, edit CLAUDE.md.
- Report one screen: what changed (file:line), tests run and their counts, what is unproven. Log in task.jsonl in this folder.

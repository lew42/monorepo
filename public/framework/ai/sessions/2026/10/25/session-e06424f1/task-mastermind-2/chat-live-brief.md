# Brief: chat-live (step D)

Budget: $8. Load the `minion` skill first. Work ONLY in worktree `C:\Code\lew42\worktrees\chat-live` (branch worktree/chat-live, dev server http://localhost:57224); `cwd` is that worktree. Never touch the main tree, never restart servers, never `git stash`, never drive the owner's tabs. Commit exact paths after each step. Do not merge: report to `task-mastermind-2`.

Requirements (the owner's asks, read all): `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/chat-live/requirements.md`, including the owner notes at the bottom (items 10-15). Read first: `public/framework/ext/Chat/v2/readme.md`, `public/framework/core/Task/doc/prompt-record.md`, `ux/Dictate/doc/` (wake-policy.md). Reader/model code that already merged: `ext/Chat/v2/ChatV2Model.js` (uses core `sentences.js`).

Order:
1. Diagnose with evidence first (item 13): screenshot real bubbles from a real session file (headless, worktree URL), find why paragraphs start lowercase / a sentence splits across two paragraphs. Cause in 3 lines in `chat-live/result.md` (in the task folder `task-mastermind-2/chat-live/`, not plan.md).
2. Make ONE mock screenshot of the six phase looks (item 10), save `task-mastermind-2/chat-live/shots/phases-mock.png`; choose the best, log the alternative, build it in V2 (and V1 if it shares the code path). Gray = arrived not sent, black = sent to fast, refined = non-colour mark, never reverts; per-sentence span with subtle border.
3. Replace the per-message "fast ... smart ..." marks (requirements note 17:31): nothing when handled, a mark only when pending/wrong. Brain-dots (`working:{by,at}` getter exists on Prompt/Question) only while set.
4. Silence hallucinations ("Thank you.", "Thanks for watching.", "Sure.") dropped/greyed (client side in ux/Dictate).
5. Lines survive refresh, a long pause still sends (items 6-8) with a headless test.
6. Three settings checkboxes (item 15), all checked by default. The fast-seat cleaning (item 12) is a text change in `.claude/skills/voice-assistant/SKILL.md`; the Servex-side writer (`Servex/agents/Sessions.js`, `PromptLines.js`) is OUT of your fence: put the exact change in `chat-live/proposal.md`.

Fence: `ext/Chat/`, `ux/Dictate/` (client files), `ext/Session/`, the voice-assistant SKILL.md, your own `chat-live/` folder. Not `Servex/`. Resolve found problems now; "left open" needs a reason. Run `node public/framework/ext/Chat/v2/ChatV2.test.mjs http://localhost:57224` and any Dictate tests. Update the readmes you change (what/structure/who writes/who reads). Final report one screen, UI first (shots), mapping each item 1-15 to done/open.

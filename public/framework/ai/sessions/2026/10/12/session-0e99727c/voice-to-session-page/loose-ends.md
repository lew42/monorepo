# Transcription `now` loose ends — checked against the repo

Source: the "Transcription and refinement" block of [by-system.md](/framework/ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task/by-system.md). Each row checked by reading the files or git, not by the label. "Closed" means the work exists; no other task's `task.jsonl` was edited (decision: those files are other agents' runtime state, so the verdict lives here).

| Row | Verdict | Evidence |
|---|---|---|
| Interactive request cards in chat (prompt-card) | **Partly**: the five stages and the cards now draw live on the session page; the chat bubble still has no interactive cards | `ext/Refine/prompt-card.js` is used by `ai/v/3/prompts.js` and `ai/cards/faces.js`, not by `ext/Chat`; new: `ext/Refine/stages/CardsStage.js` |
| Raw sentence highlight | **Closed**: algorithm is wired | `ext/Refine/engine.js` and `Refine.js` use the raw-match logic |
| voice-pipeline (2026-10-04) | **Closed**: the commits are in history; review verdict was "fix" with 2 small notes, never landed formally | `dfc3f7c36`, `ec6d7692e`; `review.md` |
| minion-cost-model | **Still open**: the agent was stopped on purpose and the dir holds only requirements and page | no result file, no code |
| b-structure | **Closed**: both runs have `out/` results and the review replies say "fixed" | `b-structure/out/1-820pm`, `2-710pm` |
| push-to-talk proof | **Closed**: `proof.md` and 7 screenshots exist | `ptt-proof/proof.md` |
| push-to-talk wiring | **Closed by code**: `ux/Dictate/push-to-talk.js` exists and `Dictate.toggle` is wired; not re-run in a browser here | `Dictate.js`, `push-to-talk.js` |
| fix-android | **Closed**: report with before/after table; the last fix `6827cae8f` is an ancestor of `michael/dev` | `fix-android/report.md` |
| voice-dir-404 | **Closed**: voice-session dirs now carry `task.jsonl` | `ai/2026-09-30/voice-session-*/` |
| chat-merge | **Closed**: `refine()` and `fill()` are in `ext/Chat/Chat.js` | `Chat.js` lines 43-47, 176 |

What this task resolves of them: the voice-to-page loop (first row, partly). Left open: minion-cost-model, and prompt-card inside the chat bubble.

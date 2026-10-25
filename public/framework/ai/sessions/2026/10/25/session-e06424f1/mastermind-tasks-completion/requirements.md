# Tasks tab in the dictate drawer (task t-tasks-tab)

The owner's ask (voice session v-sq8y7db, `/framework/ai/sessions/2026/10/25/v-sq8y7db/`): every unfinished task lowers the completion score, tasks are always prioritized, and the chat surfaces the open ones, as a Tasks tab beside AI, Debug, Docs and Settings.

Deliverables, in `public/framework/ext/drawer/` (worktree qf-4, branch worktree/qf-4):

1. A `Tasks` row in `AIPage.VIEWS`, routed as `<path>/ai/tasks/`.
2. The tab shows one strip, "Done X of Y" with a percent and a meter, then the open tasks highest priority first (then in the order asked), each with its state icon, text, parent prompt ("from: ...") and phase. Prompts nobody has filed a task for show as open ("no task filed for this yet"). Done and stopped tasks fold behind "show N done". A task stopped as duplicate, noise, standing, filler or superseded leaves the count.
3. It streams from the session's own session.jsonl (`chat.file()`), computed in code by `TaskTally` from the same `ChatV2Model.fold` the chat uses. No AI, no server call.
4. `TaskTally.test.mjs` passes (`node TaskTally.test.mjs`); readme bullet in `ext/drawer/readme.md`.

Proof: headless shots at 400, 1200, 1920, 3440 in `shots/` beside this file (session id seeded into sessionStorage `lew42-voice-session`; page `/framework/core/ai/tasks/`), the tally of the real session reads "Done 7 of 39".

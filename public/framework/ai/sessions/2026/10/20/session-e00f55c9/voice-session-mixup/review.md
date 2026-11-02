verdict: fix
1. [fix] The diff commits unrelated `files.jsonl` churn. The worst one is `ux/Dictate/playground/walkthrough/shots/files.jsonl` (+6 lines), which marks all six walkthrough pngs as `gone`. The worktree just lacks them, but they exist on michael/dev, so after the merge that index would be wrong. Drop the hunks in the 6 `files.jsonl` files from both commits, since the brief says "commit by path".
2. [fix] The silent join before the first sentence has no test. That is `maybe_offer` calling `resume_to` within `JOIN_IDLE_MS` (ux/Dictate/chat.js:305), the fix for the owner's "random message popped into the chat". The first review asked "Also test it". Tests 5 and 6 in `ux/Dictate/test/active-session.mjs` cover `latest_voice`, `is_other_session` and switching, but not "open the drawer with a session that spoke 5 minutes ago: its history is on screen and nothing new draws under the first sentence".
3. [note] Test 5's guard check calls `is_other_session` directly. It does not prove that a late line from the session just left is dropped by `draw()` in a mounted chat. That is enough for a one-line guard, but an end-to-end check would match the brief's "test first" better.
4. [note] The ask "a reply always goes to the session its question came from" still has no test and no sentence in findings.md (first review, note 6). Its evidence suggests this already held (the smart seat answered in `v-qfzrnhh` 4 s later). Say so in one line.
5. [note] There are still two copies of the "resume the project's newest session" rule: `Sessions.create()` (Servex/agents/Sessions.js:880-884) and `Layers.session_for()` (Servex/agents/Layers.js:584). Only the first filters to `v-` sessions and uses `idle_ms` (first review, note 5). This is worth one shared method.
6. [note] One comment is stale: Servex/agents/Sessions.js:882-883 still says "a session on this page spoke within `resume_ms`", but with no card it is now project-wide and `idle_ms`. Also, `idle_ms` doubles as the pair-sleep timer (Sessions.js:1495), so setting `SERVEX_SESSION_IDLE_MS` now moves the resume window too. A line in the comment would say so.
7. [note] Checked: in the worktree, `node Servex/agents/Sessions.test.mjs` prints "29 checks passed". First review fixes 1, 3 and 4 are done: one 30-minute window on both sides, a guard test, and all four docs reworded. The Servex change needs a restart, which is vscode-mastermind's, and findings.md says so. A fresh agent could continue from findings.md plus the two reviews.

## Requirements
- 1 "Prove what happened from the logs" — yes — findings.md names `v-u48msei` vs `v-qfzrnhh`, the page-scoped `recent()` plus start-time age, and the "green checkmark" at `v-qfzrnhh/session.jsonl` lines 652-663, replayed by `attach()`
- 2a "last session is the most recent one" — yes — `latest_voice` (chat.js) and `create()` without a card (Sessions.js:880) both pick the newest `v-` by `last_at`; Sessions.test.mjs adds a check, and active-session test 5 covers it
- 2b "a message from session A never shows in session B" — yes, partly tested — `draw()` guard plus the silent join before speaking; the join itself is untested (finding 2)
- 2c "a reply always goes to the session its question came from" — not addressed explicitly (finding 4)
- 3 "after a switch every new sentence goes to the session now selected, no pause" — yes — active-session test 6 sends A, B, A with no wait
- Class with live instances — n/a (no new class)

## Words
- findings.md: plain, short and evidence-led — yes
- Doc rewording (ext/Session/readme.md:7, doc/architecture.md:14, Servex/agents/doc/architecture.md:22, ux/Dictate/doc/chat-notes.md:17) — yes, now says project-wide and 30 minutes; chat-notes still opens with "the tab's newest OLDER session", which is slightly off since it is now the project's (note-level)

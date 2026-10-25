# Order fix steps 2 and 3: one clock for every bubble

Budget: $6. Load the `minion` skill first. Read `report.md` in this folder ("The fix (short plan)", steps 2–4) and the owner's ask in `../requirements.md` line 83 and 121 (misordered bubbles: fix it at the data). Step 1 is on michael/dev (ce1f45f58: `retag_piece` changes the id only).

## Do
1. Work in `C:\Code\lew42\worktrees\dictation-order-2` (branch worktree/dictation-order-2, registered). First `git merge michael/dev` (the perf work, c86a344c3, changed `ux/Dictate/chat.js`, `Dictate.js`, `Widget.js` and `ext/Session/Session.js` this morning: build on it).
2. Step 2: `Session.say`'s answer carries Servex's `at`; keep `Session.clock_offset` (Servex `at` minus the request's midpoint, updated each answer) in `ext/Session/Session.js`, and have `ComposerMic.stamp()` add it, so a phone-drawn bubble sits on Servex's clock.
3. Step 3: `ux/Dictate/chat.js` `deliver` sends `said_at: entry.at` with `Session.say`; Servex's `/api/session/say` (find it in `Servex/agents/Sessions.js` or its route; `rg -n "session/say" Servex`) writes `said_at` on the chat line, and the chat orders a reload by `said_at ?? at`. Servex code goes live only after a Servex restart, which you do NOT do: the client must work with and without `said_at` on the line.
4. Proof: `node public/framework/ux/Dictate/test/order.mjs <worktree url>` passes, including a third run where a reply sits between the two sentences (the cross-bubble case, now KNOWN). Also `flicker.mjs`, `reconnect.mjs`, `refresh.mjs`, `earlier.mjs`. Get the worktree URL from `.worktrees.json` in the main repo (`port`).
5. Docs: `ext/Chat/doc/notes.md` #bubble-order and `ext/Session/readme.md` say what the code does now (one clock, `clock_offset`, `said_at`).
6. Commit by path in the worktree after each step. Log each finding as a `log` line in this folder's `session.jsonl` (`node .claude/hooks/append.mjs <file> <json file>`). Then message the parent (`mastermind-dictation-2`) two sentences and stop. Don't merge: the parent reviews and merges.

Fence: `ext/Session/Session.js`, `ext/Chat/Chat.js`, `ext/Chat/ComposerMic.js` (wherever `stamp()` lives), `ux/Dictate/chat.js`, the Servex say route, their docs and `ux/Dictate/test/order.mjs`.

Never: kill or restart the dev server or Servex, stash, push, drive the owner's tabs, or `git add -A` (files.jsonl rows are auto-written noise: add by path).

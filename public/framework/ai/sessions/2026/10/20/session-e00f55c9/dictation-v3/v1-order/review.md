verdict: fix
1. [fix] The fix only works for bubbles that carry `data-sender`. A Task row from `Widget.js` `show_task` (`chatbox-task chatbox-reply`, around Widget.js:462) has no `data-sender`, so `answered_below()` (Chat.js, new) ignores it. If a Task lands below the owner's open bubble, the next sentence still merges, and `speak()`'s re-anchor (`Chat.js:283`, `$box.el.append(last)`) drags the owner bubble down past it. That breaks the owner's rule, "nothing already on screen jumps above or below a later arrival". Either count `.chatbox-task` rows that are not `[data-under]` in `answered_below()`, or add a live test proving a Task row does not move the open bubble.
2. [fix] The `ext/Chat/doc/notes.md` bubble-order paragraph (diff line 42) says the re-anchor in `speak()`/`put_line` "only moves a bubble past its own annotation rows". Finding 1 shows that is not true for Task rows. The comment above the re-anchor, `Chat.js:282` ("the open bubble always stays last, even if a reply landed after it … 2026-10-25"), was not touched and still states the retired rule. Bring both in line with the code.
3. [fix] The brief asks for the cause as a `log` line in this folder's `task.jsonl`, and for review answers there. This folder has no `task.jsonl`. The cause was written to `session.jsonl` (line 2) instead. Either file the log where the brief says, or note in the folder that `session.jsonl` is now the task log, so the merge step (`--review-dir`) and a fresh agent can find the answers.
4. [fix] `ux/Dictate/readme.md` (diff line 114) still describes `test/chat-sent.mjs` as covering "the open bubble re-anchoring below one", which is the old rule. The cause log also says `chat-sent.mjs` and `earlier.mjs` fail on `michael/dev` both with and without this change. The brief requires the full suite to pass, so either fix those two tests or record their failure as a known, separate issue in the readme or a task. Don't leave it only in a log line.
5. [note] The incident replay in `test/v1-order.mjs:241-258` probably passes on the old code too: the cause log says "replaying the session lines alone gives the right order". The bug is reproduced only by the synthetic live case (run 2). Also, the incident check only tests that the last two pieces are OWNER then REPLY, plus the no-swap check. The brief asked for "the order V1 renders is arrival order", which needs a full comparison against the fixture's `at` order.
6. [note] `ext/Chat/readme.md` now says v2 (`ChatV2.js` `patch()`) "still re-anchors its open bubble". That is honest, but it means V1 and v2 now follow opposite rules. This goes against "one of everything", so open a follow-up task to bring v2 in line.
7. [note] `shots/live-400x860.png`: the top band shows five stray task-log rows from the `/framework/ext/drawer/` host page ("started: Drawer README links…"). They are test noise, not the chat. `shots/incident-400x860.png` reads correctly in arrival order: the smart reply sits above "Oh, yeah, I mean…", and the 21:05:48 reply is last.
8. [note] The diff is a reasonable size for the bug. It adds one predicate in `mergeable()`, one `drop_draft()` in `Widget.Thread.live()`, and the `clock.offset` stamp. I see no simpler fix. The rejected alternative is written down.

## Requirements
- "a smart reply spoken after the owner's newest line is drawn ABOVE it" fixed — yes, for reply bubbles: test/v1-order.mjs live run; shots/live-400x860.png shows owner, reply, owner, reply. Task rows are not covered (finding 1).
- "replies appear in arrival order, below everything already shown" — mostly: the no-swap check in v1-order.mjs:233; Task rows are the gap.
- Copy lines 1562–1640 into a fixture, session file untouched — yes: test/v1-order-fixture.jsonl, 79 lines.
- Find the cause first, log it in task.jsonl — the cause was found (the open bubble re-anchors, plus a phone-clock `data-at`) and it says arrival order is the key, but it was logged to session.jsonl (finding 3).
- Extend order.mjs or a sibling with the fixture — yes: v1-order.mjs, and order.mjs's "reply between" now expects sentence, reply, sentence.
- Every existing case and the full suite pass — no: chat-sent.mjs and earlier.mjs fail (said to fail before this change too) (finding 4).
- One headless shot at 400x860 in shots/ — yes: two shots, read above.
- Update ux/Dictate/readme.md in the same commit — yes (diff line 114), but chat-sent's line is stale (finding 4).
- Land: merge, smoke test, empty `git log michael/dev..worktree/v1-order` — not yet: worktree/v1-order is still one commit (594cff599) ahead. This is expected at review time.
- Class with live instances — n/a: no new class.

## Words
- The docs are plain and give the reason ("why", plus the rejected alternative) — yes: notes.md diff line 42.
- The notes.md paragraph is one ~250-word block — note: it could be split into rule, why, proof.
- Stale wording — no: Chat.js:282 comment and the readme's chat-sent line (findings 2, 4).

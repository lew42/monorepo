verdict: fix
1. [fix] The chat line's new `said_at` field is missing from the session-file schema: `ext/Session/doc/sessions.md:11` lists every field of an owner chat line and does not name `said_at`, or say that ordering reads `said_at ?? at` while ids stay `at`. Fix: add one line there that links to `ext/Chat/doc/notes.md#bubble-order`.
2. [fix] On reload, pieces inside one bubble are not ordered by `said_at`. `put_line` (`ext/Chat/Chat.js:697-701`) pushes a mergeable line onto the end of the last bubble and sets `last.dataset.at = at`, which can move backwards. So a slow send written after a later one still reads out of order within the bubble. Only `place()` orders, and it orders whole bubbles. Yet `notes.md:143` says "a reload keeps the order the owner spoke in". Fix: insert the piece by `at`, the way `speak` does, or narrow the doc's claim.
3. [fix] A fresh agent would read this task as unfixed. The task's landing `outcome` in `order/session.jsonl` still says "[ ] fix: not committed", and `order/report.md` ("The fix (short plan)") never says that steps 1–4 are now built (step 1 at ce1f45f58; steps 2–3 at 2cce08cea on `worktree/dictation-order-2`, not merged, Servex restart pending). Fix: update the outcome, and add a "Status" line to report.md.
4. [note] Names don't match the code. `ux/Dictate/test/order.mjs:102` says `clock_offset`, and report.md and steps-2-3.md say `Session.clock_offset`, but the code exports `clock.offset` (`ext/Session/Session.js:93`). The test's header (`order.mjs:8-11`) still calls the third run "the KNOWN case … it waits for one clock" and in the same sentence says it now fails the run.
5. [note] `order.mjs` doesn't test the `said_at` path. Its stubbed `say` (`order.mjs:35-39`) ignores `body.said_at`, and no run reloads the file, so step 3's "reload orders by said_at" is unproven. I re-ran it on the worktree (port 62998): all three runs `ok`, exit 0.
6. [note] `clock.offset` stays 0 until the first `say` answer arrives. So the first sentence after a page load is stamped on the phone's clock, and if a resumed session's reply is already on screen, that first bubble can still jump above it. `session/new` and `resume` could seed the offset the same way.
7. [note] `Session.say` is now `async` (`ext/Session/Session.js:79`), and Servex writes `said_at` only after a restart (`Servex/agents/Sessions.js:949`). Both are handled: the route passes the body straight through (`Sessions.js:1472`), and the client falls back to `at`. Merge and restart together.

## Requirements
- Brief for this change (`steps-2-3.md`)
- 2 "keep Session.clock_offset … ComposerMic.stamp() adds it": yes. `Session.js:85-87` and `Mic.js:657` do it, under the name `clock.offset`.
- 3 "deliver sends said_at; Servex writes it; reload orders by said_at ?? at": partly. It is sent (`chat.js:176`), written (`Sessions.js:949`) and read (`Chat.js:653`), but pieces inside a bubble are not reordered (finding 2).
- 4 "order.mjs passes including a reply between": yes. My re-run: 3× ok, exit 0.
- 5 "notes.md #bubble-order and Session readme say what the code does": yes, but the sessions.md schema is stale (finding 1).
- 6 "commit by path, log in session.jsonl, don't merge": yes. Commit 2cce08cea; log line at 10:44:42.
- Owner's ask ("fix it at the data", `../requirements.md` Part 3 item 4): yes. The order now rides on one clock and is stored on the line.
- Class with live instances: n/a (no new class; `clock` is a plain object).

## Words
- content 1 (plain, clear sentences): yes. The `notes.md` paragraph and the readme bullet are full sentences.
- content (terms defined): yes. `said_at` and `clock.offset` are each defined where they first appear.
- content (no stale wording): no. See findings 3 and 4.

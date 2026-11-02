verdict: fix
1. [fix] The brief asked for "one function that names the active session, used by all three places", but `chat.active()` (chat.js:455) is read only by the Sheet, and only for its `fresh` flag. The Sheet still takes the session itself from `chat.current()` (Sheet.js:79, 89, 105), and `ensure`/`attach` read `ctl` directly. So doc/chat.md "The active session" is wrong when it says the send, the view and read-aloud "all read it". Either have Sheet.follow read `chat.active()` once and use `.session` (the simpler shape), or reword the doc to say all three share `GLOBAL.ctl` and only the Sheet calls `chat.active()`.
2. [fix] `ext/drawer/readme.md:34` (Read-aloud) still says that with no session the Sheet follows "the latest one within `JOIN_IDLE_MS`". After New session it now follows none, so this line is stale. The module that owns the changed code needs that exception, linked to doc/chat.md#the-active-session.
3. [fix] The new proof `test/active-session.mjs` is not listed in `ux/Dictate/readme.md`. Line 34 lists the other proofs (`test/refresh.mjs`, `test/chat-sent.mjs`, …), so a reader of the readme won't find this one. Add it there: it is mocked and free, unlike `test/new-session.mjs`.
4. [note] Row 1 of the doc table, and the claim "a tab with no session is deliberate only after New session" (doc/chat.md, last paragraph), skip one case. On first open, before the first sentence, `ctl.session` is null, so the view shows no session while read-aloud already follows `v-old`. The two agree once the sentence joins `v-old`, but the brief asked about exactly this moment ("ever a moment with no active session"). Name it in the doc.
5. [note] Deliverable 1 is a single `log` line in `session.jsonl` with all four rows packed into one string. The brief asked for one row per case. Row 2's view column also has no line number ("attach via subscribe").
6. [note] The log names commit 04d651007, but the branch is now at 394325bf9 (a second commit that rewords the comment and fixes Sheet indentation). The ledger also shows "session ended (other) without landing", so the task has no outcome line. A fresh agent can continue from the log line and the branch `worktree/dictation-active-session`, but the mastermind should land the task once it merges.
7. [note] I re-ran `node public/framework/ux/Dictate/test/active-session.mjs http://monorepo.localhost .` in the worktree: ALL PASS (11 checks). Check 3 ("read-aloud opens no older session's stream") would fail without the fix: the old fallback would open `v-old`'s stream after reset. So the test does prove the bug fix.

## Requirements
- 1 "for each of the four moments … next sentence goes to the session the chat view shows?" — yes. The test's four "sentence goes to" checks pass. Before the first sentence of case 1, the view shows none (note 4).
- 2 "Does the Sheet's read-aloud follow that same session?" — yes now. It did not after New session before the fix: Sheet.js `follow` fell back to `recent_project` and found the old session.
- 3 "ever a moment with no active session, or with two?" — partly answered. "Two" never happens. "None" happens after New session (deliberate) and also on first open before the first sentence, which the report leaves out (note 4).
- Deliverable 1 "a table as log lines in task.jsonl, file:line, mismatch marked" — mostly. It is one log line in session.jsonl, the mismatch is marked, and a few file:line refs are missing (note 5).
- Deliverable 2 "one function … used by all three places; worktree; headless check; node --check; commit; don't merge" — partly. The worktree, test, commit and no-merge are all done, but the one function is not used by all three (finding 1).
- Deliverable 3 "a short section 'The active session' in doc/chat.md" — yes, but one sentence in it is inaccurate (finding 1).
- New class? — n/a. `chat.active` is a function on an existing module, not a class.

## Words
- The doc section is short, with a plain table and a test link — yes.
- Accurate — no. "All read it" overstates what the code does (finding 1).

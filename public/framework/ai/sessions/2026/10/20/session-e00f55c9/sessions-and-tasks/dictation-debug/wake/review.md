verdict: fix
1. [fix] The pause timer ignores the floor, so "paused 6 s" can fire while the owner is talking. `WakePolicy.add()` (Servex/agents/WakePolicy.js:250) starts the gap timer when a thought is released, after 2.5 s of quiet. Nothing restarts it when `set_floor(s, "speaking")` (Servex/agents/Sessions.js:967) says the owner has started again. The old `gather()` re-armed while `this.speaking(s)` was true; that check was deleted (diff, Sessions.js:105 old). So 2.6 s of quiet plus about 3.4 s of the next sentence counts as a 6 s pause. The result is one Opus wake per thought in steady dictation, which is the thing the brief asked to stop. Fix: have `set_floor` clear or hold the session's waker timer while the floor is `speaking`, or keep the old `speaking` re-arm in the timer's callback. Then add a Sessions test: release a thought, set the floor to `speaking`, advance 4 s, and expect no wake.
2. [fix] The replay has the same blind spot. `replay.mjs` feeds the old releases to the new gate on a fake clock and never tells it when the owner is speaking. So the 40 wakes in `after.json` and the line in report.md, "real pauses are either under 3 s or over 50 s", count speaking time as pause. Re-run the replay once fix 1 is in, and re-quote the after numbers.
3. [fix] public/framework/ext/Session/doc/sessions.md:119 still says the smart seat's "1.5 s quiet gap keeps restarting while the floor is `speaking`". The comment on `floor()` (Servex/agents/Sessions.js:955) says the same. After this diff neither is true for spoken lines. Update both to match the rule as it ends up after fix 1.
4. [fix] The new route `POST /api/session/settings` is missing from the route table in public/framework/ext/Session/doc/sessions.md (lines 71–82). It is the one door the settings panel will use, so add its row there: `{session, gap_ms?, every?}` → `{ok, gap_ms, every}`.
5. [fix] The diff adds `WakePolicy.js` and `WakePolicy.test.mjs`, but the `agents/` row of Servex/readme.md:44 does not list them. That row is where a fresh agent looks up what is in `agents/`, so add both files (laws 9 and 10).
6. [note] The brief asked for findings as `log` lines in `wake/task.jsonl`. They are in `wake/session.jsonl` (the log, commit and assign lines are all there). Fine if `session.jsonl` is now the task log's name; otherwise the board reading `task.jsonl` will not see them.
7. [note] The real saving is small: 44 → 40 wakes and about −10% tokens per minute. The report says why, and it says the bigger lever is the ~74k tokens each wake re-reads. That lever is recorded only in report.md and a log line. File it as a task or an ask so it is not lost.
8. [note] For a release with no quiet event, `release_thought` passes `quiet: this.hold_max_ms` (Sessions.js:1048). That counts 8 s with no event as 8 s of silence, so the batch flushes at once. That is a fair guess, since no line arrived in those 8 s, but it is a guess. A comment on that line would say so.

## Requirements
- 1 "Before: per session minutes, owner lines, smart wakes, tokens and dollars, tokens per minute, by a node script; output kept as before.json" — yes — before.mjs + before.json; report.md: 15.9 min, 61 lines, 44 wakes, 203,897 tokens/min, $1.14
- 2a "a pause past the quiet gap (knob, default from the numbers, 4–8 s)" — no — the knob is there (gap_ms 6000, chosen from the replay), but the pause it measures includes speaking time (finding 1)
- 2b "a question or being addressed (keep what exists)" — yes — `is_question`/`is_addressed`, and the ❓ reaction flushes first (Sessions.js:1008)
- 2c "every N owner sentences (knob, default 6)" — yes — `WAKE_DEFAULTS.every = 6`, test "20 sentences with no pause"
- 2d "any other wake path joins the gather, or is justified in one comment line" — yes — gather, release_thought, quiet and owner_reacted feed the gate; the respawn re-send has its comment (diff, Sessions.js:65)
- 2e "both knobs in one place Servex reads; say where" — yes — the `wake` field in sessions.json, set by `settings()`; defaults in WakePolicy.js; documented in ux/Dictate/doc/wake-policy.md
- 3 "unit test, fake clock: 20 sentences, 2 min, three pauses → 3–4 wakes" — yes — WakePolicy.test.mjs, first check (4 wakes); but no test covers the floor turning back to speaking (finding 1)
- 3b "replay one real session, wakes before vs after" — yes, but the after number counts speaking time as pause — replay.mjs, after.json (finding 2)
- 4 "After: expected tokens per minute beside before" — yes — report.md table: 203,897 → 182,607
- Deliverable "report.md, one screen" — yes; "findings as log lines in wake/task.jsonl" — partly; they are in session.jsonl (finding 6)
- "Don't merge, don't restart Servex" — yes — report.md and the last log line say ready, not merged
- New class shows live instances — n/a — WakePolicy holds only short-lived per-session batches; `knobs()` comes back from the settings call
- A fresh agent could continue from this folder — yes — requirements, the worktree branch name, scripts, numbers and the open lever are all here

## Words
- content: plain and short — yes — report.md is one screen, and its "honest reading" says plainly how small the saving is
- content: the docs match the code — no — sessions.md:119 and the `floor()` comment are stale, and the settings route is missing from the table (findings 3, 4)
- content: no unexplained jargon — yes — wake-policy.md opens with what the two seats are before the rule table

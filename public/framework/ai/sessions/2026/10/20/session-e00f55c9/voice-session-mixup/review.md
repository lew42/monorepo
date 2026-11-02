verdict: fix
1. [fix] findings.md is now stale. Its "Two copies of the resume rule" section says `Layers.session_for()` and `Sessions.create()` "stay separate for now; unifying them is a follow-up", but this diff (branch `worktree/voice-resume-one-rule`, commit 43df9c2b0) is that follow-up. Rewrite the section to one line: card prompts now resume through `Sessions.create`, so they use the 30 min `idle_ms` window and only `v-` sessions.
2. [fix] The Session docs still describe the old per-page, one-hour resume, which this diff makes the only rule left for card prompts too. `ext/Session/doc/sessions.md:88` says "started on this page… less than an hour old (`SERVEX_SESSION_RESUME_MS`)". `ext/Session/readme.md:42` says the offer uses `recent(page, {limit: 1})`, and `readme.md:43` says "spoke within the last hour". With no card, all three are now project-wide and 30 min (`idle_ms`).
3. [fix] This follow-up has no record of its own in the task folder. It has no brief and no landing line, and session.jsonl only holds the two `commit` lines. A fresh agent cannot tell that `worktree/voice-resume-one-rule` exists, is unmerged, and needs a Servex restart. Add one log line naming the branch, what it changes, the tests run, and the restart.
4. [note] Card prompts behave differently now, on purpose but without a record. Before, an owner prompt on a card resumed the project's newest session of any kind within 1 hour; now it is the newest `v-` session within 30 min. When nothing is that recent, the new session's home is `nearest("/framework/ai2/<id>/")` rather than the card's folder (`Servex/agents/Layers.js:528`, `card` dropped). Say so in findings.md beside fix 1.
5. [note] `Servex/agents/Sessions.js:881` still says "spoke within `resume_ms`". With no card it is `idle_ms` (this is note 6 from the earlier review, still open). Because `idle_ms` is also the pair-sleep timer, `SERVEX_SESSION_IDLE_MS` now moves the resume window for card prompts as well.
6. [note] The fake `create()` in `Servex/agents/layers.test.mjs:62-64` always resumes the newest session, whatever its age. The test therefore cannot catch a window regression in Layers. That is acceptable, because `Sessions.test.mjs` owns the window.
7. [note] `.claude/hooks/jsonl-guard.mjs` (commit 134b2488e, scratch-file naming) has nothing to do with this task and rides on the same branch. It is harmless and one line, but commit-by-path would keep it as its own landing.
8. [note] Checked in the worktree `C:/Code/lew42/worktrees/voice-resume-one-rule`: `node Servex/agents/layers.test.mjs` prints "55 checks passed", and `node Servex/agents/Sessions.test.mjs` prints "29 checks passed". The change is simpler than before (-28/+10) and fixes law 6. The only caller paths are `card_prompt_session` and the page send at Layers.js:608, and both pass page paths that `create()` accepts.

## Requirements
- 1 "Prove what happened from the logs" — yes — findings.md, evidence section (unchanged by this diff)
- 2a "'last session' is the most recent one" — yes — card prompts now share `Sessions.create`'s project-newest rule (Layers.js:584)
- 2b "a message from session A never shows in session B" — n/a
- 2c "a reply always goes to the session its question came from" — yes — findings.md says so; this diff doesn't touch it
- 3 "Session switching" — n/a
- New or changed class: no new class; `Layers` and `Sessions` were already live at the Servex agents page — note
## Words
- Plain and short — yes — the Layers.js:575-577 comment is three lines and names its source
- Stale words left behind — no — findings.md "Two copies…", sessions.md:88, readme.md:42-43, Sessions.js:881 (findings 1, 2, 5)

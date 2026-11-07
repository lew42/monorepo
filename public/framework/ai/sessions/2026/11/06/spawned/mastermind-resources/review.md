verdict: fix
1. [fix] The ask isn't written down anywhere in this task folder. There is no `requirements.md` at the folder root, and there is no task line in `session.jsonl` for the idle-held note or the page-file doc. Earlier pieces each got a subfolder with a brief (`relief/`, `leaks/`, `errors/`); this one did not. The owner's words exist only in the agent's raw transcript (voice-app message, 2026-11-07T06:16:32Z), so a fresh agent could not tell what was asked or whether it is done. Add a brief (or a task on `session.jsonl`) that quotes that message and links commit 9433a47e2 on branch `worktree/relief-idle-note`.
2. [fix] `Servex/readme.md` doesn't index `Relief.js`: a search for "Relief" in it finds nothing. Its doc list (`Servex/readme.md:83`) describes `doc/processes.md` as "closing a task leaves nothing running; who started a pid" and leaves out both early relief and the new page-file section. Add a row for `Relief.js` and name both sections in that link (Law 11).
3. [note] voice-app asked to be told the doc path so it can close its `page-file` task (`cloud-voice-app-20261106/session.jsonl:506`, still waiting on the owner). Nothing in the task folder shows the path was sent yet. After the merge, send `Servex/doc/processes.md#the-page-file-insurance-not-the-fix`.
4. [note] Two comments in `Servex/Processes.js` are now out of date. Lines 77 and 121 say `idle_s` exists "for Games.js", but `Relief.note()` now reads it too.
5. [note] A held note is only re-checked at the next relief run, which comes every 15 minutes and repeats the sweep and sleep steps. So a 10–14 minute absence can fall between runs and be missed. A simpler option: keep a "note pending" flag and check `idle_s` on the 1-minute `tick` (`Servex/Relief.js:55`). This isn't required by the ask.

## Requirements
- 1 "Write it into your performance/RAM notes as a recommendation with its caveats: 48 GB helps short peaks, not leaks; leak accounting (pid start/exit) is the real fix" — yes. The new section "The page file: insurance, not the fix" in `Servex/doc/processes.md` covers peaks vs leaks, names leak accounting and `leaks.mjs` as the real fix, and gives the alternative.
- 2 "tell me the doc path and I'll close my task against it" — not shown (finding 3).
- 3 "Never close Michael's own apps (Figma, VS Code, Chrome). At most, suggest it" — yes. `Relief.note()` only posts an `owner_note`, and the doc says "only ever a suggestion in a note, never an action".
- 4 "only when he seems idle (e.g. GetLastInputInfo shows no input for N minutes)" — yes. `Relief.js` holds the note until `procmon.now.idle_s` ≥ `note_idle_min`×60 (default 10, set by `SERVEX_RELIEF_NOTE_IDLE_MIN`). The snapshot really carries `idle_s` (`Servex/Processes.js:266`). With no reading, the note is held, which is the safe side.
- 5 "Keep to the 80% pace band: no new Opus agents" — yes. No agent was spawned for this change.
- Test — yes. `node Servex/Relief.test.mjs` in the worktree printed "9 checks pass"; the new check covers held, no reading, and posted once away.
- Class page (live instances) — n/a: the diff adds no class.
- Fresh agent can continue from the folder — no (finding 1).

## Words
- The processes.md paragraphs are plain and complete sentences. Each bullet starts with its point, and the alternative is stated — yes.
- Code comments match the surrounding density — yes.
- The doc says "agreed with the owner" and does not use the owner's name — yes. The diff doesn't write the name anywhere either (the transcript does, but the diff does not).

No page was changed, so there are no shots; only Requirements and Words are answered.

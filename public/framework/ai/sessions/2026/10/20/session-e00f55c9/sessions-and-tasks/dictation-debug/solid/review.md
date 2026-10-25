verdict: fix
1. [fix] The two links this diff adds point to a section that doesn't exist: `test/refresh.mjs:12` and the `Sheet.keep_on_reload` comment (`ext/drawer/Sheet.js:37`) both name `ux/Dictate/doc/debug-tab.md#refresh-then-dictate`, but on `worktree/dictation-solid` that doc has no such heading. The diff doesn't touch the doc at all, so step 2's cause and fix (the pill covering the mic, the 1 s deferred reload, the two starts at once, the worklet retry) are written down only in `session.jsonl` log lines.
2. [fix] `dev/Socket/readme.md:27` is now stale: it says the pill "never reloads by itself", yet `defer()` still reloads by itself once the page has been quiet `QUIET_MS` (30 s). The readme also doesn't mention the new `QUIET_MS`, the `stash` event or `socket.restored` (Socket.js:19, :263, :276). Anyone reusing them would have to read the code.
3. [fix] `test/refresh.mjs` isn't indexed. `ux/Dictate/readme.md:3` and `:17` list the proofs (`stall`, `debug-tab`, `deltas`, `sheet-steps`, `reconnect`) without it, and `test/files.jsonl` has no `refresh` row.
4. [fix] A fresh agent couldn't continue from this folder. Steps 3 and 4 aren't built. The log says they are "prepared as patch scripts (Temp/solid/patch3-5.mjs) plus the new DictateDebug.js/.css … test/errors.mjs", but no `Temp/solid` exists in the repo or in worktree `qf-8`. Step 2 (c3056d659, a1ddb7c89) is unmerged, there is no `show:` line for it, and `shots/` doesn't exist. Commit that prepared work, or note in the folder where it is.
5. [fix] The `deferred` scenario overclaims (`test/refresh.mjs:117`). It waits only 6 s, then reports "no reload by itself, the pill waits for the owner", but the page does reload by itself at 30 s. Either reword the line ("not within 6 s"), or make the deferred reload wait for the pill, which is what the readme promises.
6. [note] `Dictate.again` is cleared only on the Whisper branch of `stop()` (Dictate.js:373). With the browser engine, a press during `transcribing` leaves it `true`. The next Whisper stop would then restart the mic without being asked. One line, `this.again = false` in `start_now()`, closes it.
7. [note] `DictationBar.note` is a class-wide static (DictationBar.js:22), so every bar on the page shows the "page reloaded" reason, and any mic starting clears it for all of them. That's fine with one sheet bar. A per-bar note would be safer if the drawer and the sheet both mount bars.
8. [note] The diff is simple and targeted. Each change answers one cause the test found (the pill moved, the reload waits until the page is quiet, start runs one at a time, the worklet load retries, `chunks` exists from the start), and `proof/refresh-5-runs.txt` shows all 6 scenarios passing 5 runs in a row, exit 0. I found nothing simpler.

## Requirements
- Scope: the diff is step 2 only. Step 1 merged earlier (afcc2dca4, per `session.jsonl`); steps 3 and 4 aren't in the diff or on the branch.
- 1 "Reconnect … names what it reconnects … only past a grace period … can never throw" — n/a for this diff (merged separately, proof `test/reconnect.mjs` 8/8 per the log)
- 2 "refresh the page, press the mic, nothing works … fix it" — yes — `test/refresh.mjs` plain/pill/deferred/restart/twice pass; the fixes are Socket.js:185 (quiet window), :21 (pill off the mic), Sheet.js:34 (the sheet comes back)
- 2 "the mic sometimes won't start: whatever the cause, the mic button says why" — yes — single-flight `start()` (Dictate.js:113), `WorkletError` explained (Dictate.js:155), `DictationBar.note` after a reload, "finishing the last sentence, then listening again" during transcribing
- 2 "a test (`test/refresh.mjs`) that passes 5 runs in a row" — yes — `proof/refresh-5-runs.txt`: run 5/5 all passed, exit 0
- 2 "build, prove, smoke, commit, merge … show: line … message your parent" — no — committed, not merged; no `show:` line for step 2 (finding 4)
- 3 "Every error caught, deliberately" — no — not in the diff (finding 4)
- 4 "A compact Debug tab … lights, log, resize handle … shots at 390 and 1920" — no — not in the diff; no `shots/` (finding 4)
- Done when: "`ux/Dictate/doc/debug-tab.md` updated" — no — the doc isn't touched, and the anchor this diff links is missing (finding 1)
- Class with live instances — n/a — no new class; `Socket`, `Dictate` and `Sheet` gain fields and methods only

## Words
- Comments are plain sentences that say why and name the proof — yes — e.g. Socket.js:19, Dictate.js:110, capture.js:218
- The owner-facing strings are clear — yes — "the page reloaded because a file changed: tap 🎤 to keep talking", "finishing the last sentence, then listening again", the `WorkletError` message says the mic was released
- The test header explains each scenario in one line — yes — `test/refresh.mjs:1-12`

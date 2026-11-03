# Refine page: one dictation widget, still buttons, a visible Whisper connection

The owner (2026-10-09 ~17:00, VS Code tab 7efd07d5) retested [Refine](/framework/ext/Refine/) after this afternoon's "Nothing to refine" fix (`doc/nothing-to-refine-2026-10-09.md`): transcription now works, but "the refine extension doesn't seem to be working". Their list:

1. **One widget.** Refine must use the same dictation widget as everywhere else, not its own instance or variant (law 6). `RefineDemo.js` imports `ux/Dictate/Dictate.js`, but `ux/Dictate/` also has `Widget.js`, and `audio/` has `Voice`, `PushToTalk`, `Transcriber`: find which one the other pages use, and make Refine use that one. If two real versions exist, say which is the survivor in a doc line; do not delete the other (move aside only if unused).
2. **Buttons never move.** The mic button grows taller as the text wraps; Refine and "Record next prompt" sit inline with the live transcript and move while the owner talks. Put the controls in a fixed toolbar row (fixed size, icon laid out properly), the transcript in its own box below/beside. Nothing the reader might click shifts while text arrives.
3. **Plain status words.** The status line says "mic hearing audio, socket connected, whisper first answer". "First answer" means nothing to the owner. Rename to plain steps, e.g. Mic: on, level ok. Whisper: connected / last reply 0.4 s / error: why.
4. **Whisper: diagnose the flow.** It "fails a lot, there are a lot of errors, and that shouldn't happen". Find out (by script, from the real logs: Servex `server_logs` for whisper-server, the ErrorLog day file `ext/ErrorLog`, browser console) how many requests fail and why. Answer in a short `doc/whisper-flow-2026-10-09.md`: is it HTTP or the socket, what each failure is, the fix. Fix the top cause if it is safe.
5. **A connection view.** One small row of steps: mic on → level meter (one exists in `audio/LevelMeter`, reuse it) → Whisper reachable → transcript → refine. Whisper reachability is checked **once on page load** (and on a manual retry click), never by polling. Each step green / red with the reason.
6. **Refine itself works** end to end after a dictation: a manual test, headless where possible (`ext/Refine/test`), screenshot as proof.
7. Note only (do not fix unless trivial): the owner says the `audio/Transcriber` page layout "is all broken". Put one line in `audio/readme.md` or its doc.

## Fence
You own `ext/Refine/`, `audio/Transcriber/`, and the Refine-facing parts of `ux/Dictate/`. Dictate is used by other pages (the voice chat): any change to it must keep them working; check `/framework/ux/Dictate/` and the dev bar mic before merging. The session-detail and sessions-grid minions own `ai/AISession/`; do not touch it.

## Rules
Sonnet. Worktree, smoke-test at 1400 and 400 wide, commit each step, merge with `Server/merge.mjs`. Scripts read logs, not the model. Land with finish-task, one screen with a screenshot of the Refine page.

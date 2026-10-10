# Audio: fewer tools, one demo you can see — requirements

The owner (2026-09-30): pressed Push-to-talk, the button lit up, "maybe it was working but there was no visible demo… maybe some of these things need to be combined into a single demo". And earlier: which of the audio tools are bloated or could be merged?

## Asks
1. **Consolidate framework/audio/ to three tools**:
   - **MicStream** absorbs MicPicker (device choice = a setting), LevelMeter (level = a value its View shows) and PushToTalk (a "hold" mode). Keep the old classes as thin aliases or remove them only after every caller moves; keep v1 pages reachable (e.g. /v1/).
   - **Recorder** (MediaRecorder) — stays.
   - **Transcriber** (Whisper | Chrome engines) — stays.
2. **One copy of the mic code**: ux/Dictate is rebuilt on MicStream + Transcriber (today MicStream is a COPY of Dictate's capture.js and Whisper's silence rule is copied too). One implementation, behaviour unchanged (prove with the playground + the ✦ sheet).
3. **ONE live demo on /framework/audio/** at the top: pick a mic, see the level move, hold-to-talk or toggle, see the transcript appear (partial grey → settled), optionally record and play back — every part VISIBLY doing its job, each part's live state View beside it.
4. Readme: the three tools, the web API each wraps, and how Dictate assembles them (a small diagram).

## Rules
Pool worktree, smoke test (links followed), merge.mjs, one fresh reviewer, screenshots 400 + 1920. Test with a fake media stream. Don't break the ✦ sheet or the drawer. Budget ~$10, hard. At most 2 minions.

## Added (the owner, 2026-09-30 about 12:50 PM, from the phone; screenshots phone-dictate-1.jpg, phone-dictate-2.jpg here)

"There's so much text on the page before anything useful… the button is so far down the page… then the actual transcription is below another paragraph or two."

5. **ONE dictation widget, configurable, the same everywhere:** the compact widget from the ✦ sheet (chat bubbles for each settled sentence, the mic, the live line) IS the widget. The drawer, the sheet and the Dictate page all use the same code, with CONFIG options: show the level; show the source picker; a debug bar (raw vs clean toggle, Chunks, Corrections, Live, Side by side); the revision level.
6. **The Dictate page's Overview is the widget FIRST:** right under the title and tabs, with no paragraphs before it. The explanation moves below it or into Docs. The debug bar is ON on this page (small filter or toggle buttons, collapsed by default), and OFF in the sheet.
7. **Mobile:** the tabs take three rows; group them or put extras behind "more ▾" (coordinate with mastermind-page's tab-row finding).


# Fix: the phone repeated every sentence, beeped after every pause, and stopped on "aborted"

The owner's report, 15:35 on 2026-10-01 (session `ux/Dictate/ai/v-6jvcrk2.jsonl`, line 331):
an "abort error", then the layout shifted; the transcript repeated itself ("there's a lot of
beeping there's a lot of beeping…"); lots of beeping.

## Cause, from the real logs
- `whisper.jsonl` shows no request between 15:18:45 and 15:36:50, so the 15:34 dictation used
  Chrome's own recognizer: the phone's 800 ms check for whisper had timed out.
- Chrome on Android sends the whole phrase so far in every final result. `heard_browser()`
  committed each one, so the box filled with "so so tell so tell me…".
- Android ends the recognizer after every pause (its own beep, twice) and often reports
  "aborted". `browser_error()` treated that as a stop, which showed an error line and ended the mic.

## Fix (`ux/Dictate/Dictate.js` only, plus a `doc/decisions.md` entry)
1. `browser_fresh()`: a result that repeats or extends the last one adds only its new words.
2. "aborted" and "no-speech" don't stop the mic; `onend` restarts it as before.
3. `detect_engine()` waits 2.5 s instead of 0.8 s.

## Proof
`proof.mjs` (headless, fake mic, whisper blocked, Android's recognizer simulated, Servex stubbed):
`MSYS_NO_PATHCONV=1 WT=<worktree> node proof.mjs /framework/ux/Dictate/ demo 400 after`

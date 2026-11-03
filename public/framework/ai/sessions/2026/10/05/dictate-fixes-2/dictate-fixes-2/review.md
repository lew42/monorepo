verdict: fix

1. **[fix] Three errors now show nowhere.** `Composer.js:82` stopped showing `on_error` as a note, trusting the new always-visible `$diag` status line instead. But three of `Dictate.js`'s own error calls never update `$diag`:
   - `:374` `insecure_context_message()` — the owner's own setup (plain `http://`, phone)
   - `:651` Whisper goes quiet mid-segment
   - `:748` the browser's 6-second silent-failure watchdog

   Each one now vanishes instead of showing — worse than the old "stale error" complaint. Fix: call `log_step("mic", …)` before each, matching the pattern the watchdog and `browser_error()` already use.

2. **[note, no change] Revival race looks safe.** `Mic.js`'s `watch_capture()` re-arms inside the same `try`, before `reviving` clears in `finally` — a second `track.ended` can't race past the guard.

3. **[note, accepted] `note()`'s 4s revert is a timer, not a recovery check.** Fine today (nothing takes longer than 4s); worth revisiting if a slower `deliver()` shows up. Logged in `decisions.md`.

The one-status-line design itself is right — `$diag` leaving the hidden menu, one line per stage. The bug was only three missed call sites.

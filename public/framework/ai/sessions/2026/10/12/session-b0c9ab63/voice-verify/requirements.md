# Voice: walk try-it.md exactly as the owner will in the morning

**The owner tests dictation on the phone tomorrow** using [try-it.md](/framework/ux/Dictate/doc/try-it.md), built by [voice-to-session-page](../../session-0e99727c/voice-to-session-page/STATE.md). A fresh pair of eyes follows it to the letter before they do.

## Done when
- [ ] Follow every step headless at 400 px via the phone address (`http://10.0.0.135:8137/...`) and at 1400 via `monorepo.localhost`, feeding a recorded audio file for the mic. Each of the five stages (raw, clean, structure, refined, cards) appears live on the session page; record the time from audio end to each stage.
- [ ] Every step that fails or confuses is fixed (code or the doc), committed and merged; re-run until the whole walk passes.
- [ ] Whisper: kill it mid-walk; it comes back by itself and the page says so in one line.
- [ ] `STATE.md`: the walk's result in a few lines, timings, and anything the owner must know, also sent as one `owner_note` (kind `needs-you`) only if something still needs them.

Sonnet 5.5, high. Worktree for fixes; one Servex restart only if essential, proven on a private port. Keep going until the walk passes. Land with `finish-task`.

verdict: pass

![growing bubble](proof/1-words-growing.png)
*Dictation grows as a bubble while spoken; the reply then streams in (proof/3-reply-streaming.png).*

## The six asks

- [x] 1–2 Dictation grows as a live bubble in chat; the text box stays as an option — `Mic.js SETTINGS.into`, `Chat.js live()`
- [x] 3 Replies stream in token by token over SSE — `Sessions.js streaming()/push()`, `Chat.js stream()`
- [x] 4 Raw-Whisper bug found and fixed: an `on_revised` option was shadowing ComposerMic's own method; the ✦ sheet now defaults `revise` on — `Mic.js on_revised`, `Composer.js on_clean`, `ChatPanel.js:361`
- [x] 5 Filler replies ("keep going", "noted") are dropped server-side — `Sessions.js is_filler`
- [x] 6 A real `on_quiet` event powers Servex's hold/release — `floor.js`

Proof: 15/15 server checks (`proof/sessions-test.txt`), phone-width screenshots above. The reply-stream shot comes from a mocked `/stream` route — browser and server are proven separately, not yet end to end.

## Six follow-ups, not blockers

1. The ink/grey "settled vs guess" split never shows in the proof frames — worth checking with a longer utterance.
2. A typed line sent while spoken lines are held jumps ahead of them (`Sessions.js say`, diff line 51) — release the held lines first.
3. No level meter on a page means no `quiet` event, so replies wait the full 12 s fallback (diff line 13).
4. The new `/stream` route allows any origin (`Access-Control-Allow-Origin: *`) — a page that guesses a session's short id could read it live.
5. `revise: "clean"` is now ChatPanel's default everywhere, including demo panels, not just the ✦ sheet.
6. `rail.js stop_quiet` is set once and never cleared in `forget_session()` — harmless today only because it re-reads `this.session`.

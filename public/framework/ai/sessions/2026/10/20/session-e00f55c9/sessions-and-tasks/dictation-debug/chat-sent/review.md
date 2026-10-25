verdict: fix
1. [fix] Ask 1 (refresh loss) was never done: session.jsonl's own log says "NOT STARTED: refresh-loss repro and fix". No headless reload test was run, and nothing was fixed. The only thing logged is the suspected cause (`ext/Session/Session.js:34` has no keepalive).
2. [fix] Ask 1 extended: Chat v2 shows no sent marks. `shots/v2-400-1-sent-smart.png` still reads "Nothing said in this session yet", and `test/chat-sent.mjs:529` checks the marks only when `!v2`. The owner asked for both stages on each bubble, and the shared code in `ext/drawer/ChatView.js` draws no `{sent}` lines.
3. [fix] Ask 1 extended: no verdict was logged on (a) feeding the fast assistant one sentence at a time or (b) a setting for how often it is fed. Each appears only as "NOT STARTED" in session.jsonl.
4. [fix] Ask 4 is not done. The diff adds no `⬜` "chat" line to `ux/Dictate/readme.md` or to `ext/Chat/v2/readme.md`, and neither readme links the other.
5. [fix] Ask 5 is only partly met. In the bubble chat, `Widget.js:463` `show_task` appends the Question at the end of the thread, not under its Prompt (`shots/bubbles-400-3-scrolled-up.png`: there is no prompt above it). Neither view gives the Question a way to be answered. The test also used a stub, not the real session v-sq8y7db that the brief named.
6. [fix] Asks 6–9 (raw words live in v2, no flash from raw to cleaned, a clearer send moment, the long pause that did not send) have no code in the diff. They exist only as planning notes ("FLASH Q1–Q3") in session.jsonl. Either build them or move them, by name, to a follow-up brief so they don't look delivered.
7. [fix] The docs are stale or missing pieces. `ext/Chat/doc/notes.md#sticky-scroll` (line 83) says `sticky_scroll` serves `chat()` and `Thread`, but ChatView v2 now uses it too, through a MutationObserver. The new `{sent:{to, at, re, delay_ms}}` session line (`Servex/agents/Sessions.js` `mark_sent`) is not documented in the Dictate readme or its doc/. The new proofs `test/chat-sent.mjs` and `test/chat-gray.mjs` are missing from the proofs list at `ux/Dictate/readme.md:26`.
8. [fix] A fresh agent could not continue from this folder alone. The last log line ("ROUND 1 done", session.jsonl) uses item numbers that do not match requirements.md: its "item 5 gray labels" and "item 7 dedupe" are not in the brief. It also never lists what is still open. Add one line that maps each numbered ask to done or open.
9. [note] The jump button is not in the same place in the two views. In bubbles it sits at the bottom left, beside a message (`shots/bubbles-400-3-scrolled-up.png`). In v2 it sits at the bottom right, touching the end of a text line (`shots/v2-400-3-scrolled-up.png`). The brief says it must never cover messages; the right margin in `Chat.css:60` does not hold in the bubbles box.
10. [note] The shots were taken at 400 and 820, not 1200 or 1920. The log explains why: the sheet is not mounted at 52em or wider. `shots/mic-light.png` draws the mic as a stretched oval, which looks like an artifact of the test harness. The new mic colours `#1f2328` and `#e9ebee` (`DictationBar.css:248-249`) are hard-coded instead of theme tokens, so check them in dark mode.
11. [note] A line that never goes through `say`/`release_thought` (for example, one routed straight to smart) will show "fast …" forever (`Chat.js` `sent_badge`). Only live lines are tracked, so this does not touch history, but the badge could hide a seat that does not apply.
12. [note] Ask 2 (the small button and one shared scroll lock) and ask 3 (the light mic) look met in code and in the shots. ChatView now reuses `sticky_scroll` (CLAUDE.md law 6), and the bubble proof's checks pass. A simpler option for v2 would be calling `scroll.pin()` from ChatV2's own patch step instead of a subtree MutationObserver.

## Requirements
- 1 "A sent mark on each line… check whether lines before a refresh are lost" — partly — bubbles only (`shots/bubbles-400-1-sent-smart.png` "fast ✓ 0.4 s · smart ✓ 3.1 s"); refresh not done; v2 none; (a)/(b) no verdict
- 2 "A smaller jump-to-newest button… Chat v2 too" — yes — round "↓" in both views, `shots/*-3-scrolled-up.png`, `*-4-jumped.png`
- 3 "A light mic background" — yes — `DictationBar.css:248`, `shots/mic-light.png`
- 4 "Chat, not dictation" readme lines — no — the diff touches no readme
- 5 "Open Questions show under their Prompt" — partly — the bubbles view draws it at the end, with no answer; v2 already drew it (`shots/v2-400-3-scrolled-up.png`)
- 6 "Raw transcription on screen in real time in Chat v2" — no
- 7 "No flash from raw to cleaned" — no; named only in the log (`ext/Chat/Mic.js:510`)
- 8 "A clearer send moment" — no
- 9 "Why a long pause once did not send" — no; candidate paths only (`Mic.js:607`, `:621`)
- Class page with live instances — n/a, no new class

## Words
- New reader-facing text says "chat"? — yes — the badge titles ("Reached the fast assistant…") and the GUESS/LIVE_SENT titles use no "dictation"
- Plain, clear sentences — yes — `Chat.js:10-11` titles are full sentences
- Badge text "fast ✓ 0.4 s · smart …" — yes, though terse; the title explains it

verdict: fix
1. [fix] Ask 1, the refresh check, is still not reproduced. The brief asks for a headless reload test before the cause is logged. session.jsonl only names a suspected cause from reading the code (`ext/Session/Session.js:34` has no keepalive, `ext/Chat/Mic.js:70`); no test reloaded the page and checked whether the lines arrived.
2. [fix] Ask 1 extended, suggestions (a) and (b): no verdict is logged yet. The "REVIEW ANSWER" line in session.jsonl still lists both as open. Each needs one log line saying build or skip, and why. The `answer_quiet_ms` setting the minion found makes (b) look cheap.
3. [fix] `ux/Dictate/doc/notes.md:580` (the new "The `sent` line" section) says chat.js passes the line "to `Widget.mark_sent`". That is a different, older method (`Widget.js:662`, the echo mark). The `{sent}` line really goes to `Thread.sent` / `apply_sent`, so a reader following the doc lands in the wrong place.
4. [fix] The sent badge uses `--prime` for text (`ext/Chat/Chat.css`, `.chatbox-sent-done`) at 0.72em. framework.css:60-66 says that on lew42 `--prime` is 2.25:1 as ink on white and that text must use `--prime-ink`. The badge in `shots/v2-400-1-sent-smart.png` is faint orange on white. The owner asked for the badge to be easy to see, so use `--prime-ink`.
5. [fix] A fresh agent can't tell what is finished from this folder. The last commit, 0d3727c74 (v2 sent marks, Questions under their Prompt, jump button on the right in both views, docs), has no log line in session.jsonl. The newest log line, "REVIEW ANSWER", still lists v2 sent marks and the button side as open. Add one line that marks each numbered ask, 1–9, done or open, and names where 6–9 went (the round-2 task `../chat-see-your-words-live-and-know-when-t/`).
6. [note] Ask 5: an open Question now sits under its Prompt, and the proof checks this against the real session, read-only (`test/chat-sent.mjs:704-710`). The row has no way to complete or answer it, though `core/Task/Question.js` has `complete()`. The brief asked for one "if the Question class already has one", so this is worth a button or a logged reason.
7. [note] `test/chat-sent.mjs:705` hard-codes `C:/Code/lew42/monorepo/...` and reads the real session by line numbers [28, 29, 32, 36, 37]. The test runs only on this machine, from the main tree. A path relative to `import.meta.url`, plus a search by id instead of line numbers, would be sturdier.
8. [note] `test/chat-sent.mjs` writes `tmp-chat-sent.jsonl` into `public/…/test/` and deletes it only at the end of `round()`. A failed run leaves the file in the served tree.
9. [note] The mic colours `#1f2328` / `#e9ebee` (`DictationBar.css`) are hard-coded rather than tokens. A light disc with dark ink reads in both themes, so this is about consistency, not contrast.
10. [note] A line routed straight to smart, without passing through the fast seat, would show "fast …" forever (`Chat.js` `sent_badge`). This affects only live lines.

Widths given: no review.mjs shots; the minion's own shots are at 400 and 820 (the sheet is not mounted at 52em or wider, see session.jsonl "ROUND 1 done").

## Requirements
- 1 "A 'sent' mark on each line" — yes — `shots/bubbles-400-1-sent-smart.png`, `shots/v2-400-1-sent-smart.png`: "fast ✓ 0.4 s · smart ✓ 3.1 s"; Servex `Sessions.mark_sent` writes `delay_ms` from `said_at`
- 1 "Check whether lines dictated before a page refresh are lost: reproduce it headless" — no — cause read from code only, no reload repro (finding 1)
- 1 ext. "show both stages… inline" — yes — both views draw the shared `sent_badge` (ChatV2.js:126, Chat.js `piece_body`)
- 1 ext. "Evaluate two of the owner's suggestions and log your verdict" — no — finding 2
- 2 "A smaller jump-to-newest button… verify scroll lock… screenshots" — yes — `shots/*-2-pinned … -4-jumped.png` in both views; ChatView.js now uses the one `sticky_scroll`
- 2 "Chat v2 too… one shared piece of code" — yes — `ext/drawer/ChatView.js:47-51`
- 3 "A light mic background" — yes — `shots/mic-light.png`, DictationBar.css
- 4 "'Chat', not 'dictation'… one ⬜ line in each readme, each linking the other" — yes — landed on michael/dev (`ux/Dictate/readme.md:5`, `ext/Chat/v2/readme.md:3`)
- 5 "Open Questions show under their Prompt" — yes — proof against q-1792961349 (`test/chat-sent.mjs:710`); answering it: no (note 6)
- 6–9 (raw words live in v2, no flash, a clearer send moment, the long pause) — n/a this round — the owner approved round 1 as the safe fixes only (`../chat-see-your-words-live-and-know-when-t/task.jsonl` line 8); not yet recorded as moved (finding 5)
- New class shows its live instances — n/a — no new class (methods on Thread and ChatV2Model)
## Page structure
- n/a — no page changed shape; the chat sheet only gained a badge and a row
## Navigation
- techniques: a sheet (the ✦ chat), the ↓ jump button
- jump button small and out of the way — yes — 1.75rem round, bottom right in both views (`shots/v2-400-3-scrolled-up.png`)
## Layout
- yes — `shots/bubbles-400-5-question.png`: the Question row reads as one bubble
## Sizing
- yes — the badge is 0.72em on one line (`white-space: nowrap`)
## Wrapping
- yes — no wrap in the 400 shots
## Spacing and padding
- yes — `shots/v2-400-1-sent-smart.png`: the badge sits one line under the text
## Colour and contrast
- sent badge text contrast — no — `--prime` as text (finding 4)
- mic disc — yes — light disc, dark ink (`shots/mic-light.png`)
## Flow
- yes — scroll lock: pinned → scrolled up and held → jumped and following again (`shots/*-2…-4`)
## Words
- reader text says "chat"? — yes — the new titles (`GUESS_TITLE`, `LIVE_SENT_TITLE`, the badge titles) say what they mean in plain words
- docs current — no — `ux/Dictate/doc/notes.md:580` names the wrong method (finding 3)

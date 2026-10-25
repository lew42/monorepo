# Chat: your words live on screen, with three clear states

Budget $5, Sonnet. Load the `minion` skill first. Card: [chat-show-when-your-words-reach-the-assi](/framework/ai/sessions/2026/10/25/cards/chat-show-when-your-words-reach-the-assi/). Source: voice session v-sq8y7db (2026-10-25), relayed by session-smart-v-sq8y7db. Round 2 of [../chat-sent/](../chat-sent/requirements.md): it carries that brief's open items 6-9 (renumbered here) plus what round 1 left open. The owner approved these as safe fixes; nothing here changes the shape.

**Fast** is the voice assistant, the quick first pass that places each sentence as the owner speaks ([voice-assistant skill](../../../../../../../../../../../.claude/skills/voice-assistant/SKILL.md)). **Smart** is `session-smart-<voice id>`, the slower agent that refines the sentences afterwards (title, summary, tasks). How a line travels between them: [ux/Dictate/doc/pipeline.md](/framework/ux/Dictate/doc/pipeline.md).

Start after round 1 (`../chat-sent/`) has merged, from current `michael/dev`.

## The asks at a glance

- [ ] 1. Raw text live in Chat v2
- [ ] 2. No flash on send
- [ ] 3. Three states, one cue each, that never revert
- [ ] 4. Periods
- [ ] 5. One steady send cue
- [ ] 6. The long pause that did not send: finding
- [ ] 7. The long pause: fix
- [ ] 8. Lines survive a page refresh
- [ ] 9. Two verdicts on feeding the fast assistant

## The asks

1. **Raw text on screen live in Chat v2** (priority). Today the owner sees nothing in v2 until pausing. Draw the mic's live draft (`ext/Chat/Mic.js:206`, `draw_caption`) raw, at the end of the current paragraph, in place, and remove it when the real line arrives.
2. **No flash on send.** Today the long raw text shows, then the cleaned text replaces it (`Mic.js:510` under the "Clean transcription" setting, drawn by `ux/Dictate/Widget.js:800`). Settle into the cleaned sentences in place, without a flash; keep the raw behind "show raw".
3. **Three clear states, in both views, with separate cues that never revert:**
   - **Live** (light gray text): heard, not sent yet.
   - **Sent to fast** (black text).
   - **Refined by smart**: a cue that is not a text colour, such as a small mark or a left rule. Pick one and name the alternative.
   - The bug the owner saw: a bubble was black, then the whole chunk went light gray after a pause, then black again. One colour change is used both for each sentence's state and for the whole bubble's "sent, waiting" fade (`.chatbox-live-sent`, `ext/Chat/Chat.js:801`), so it goes back and forth. Give the whole-bubble state its own cue (not text colour), so a sentence that is black never turns gray again.
   - In a long bubble every sentence shows its own state, not only the newest.
4. **Periods.** Sentences are not getting their periods. Find where the period is lost (whisper output, the cleanup, or the joiner), with file:line, and fix it.
5. **Send moment.** Replace the "Sends when you pause" flicker with one steady cue: for example, the live gray line turns black with a 1 s "Sent" tick. Name the alternative you rejected.
6. **Finding: why a long pause once did not send.** Which path dropped it, with file:line. Candidates: `auto_check` returns silently in some states (`Mic.js:607`); a second send is dropped while the cleanup is pending (up to 5 s); the server holds a "speaking" line until a quiet event or 8 s (`Servex/agents/Sessions.js:984`, `:1109`).
7. **Fix** that path, with a headless test that would have caught it.
8. **Lines survive a page refresh.** Reproduce headless: dictate or inject lines, reload before they send, see whether they arrive. The suspected cause: `ext/Session/Session.js:34` sends without `keepalive`. Fix it, or log the cause with file:line.
9. **Two verdicts, logged; build only if cheap:** (a) the fast assistant gets each sentence as soon as whisper ends it with a period, instead of after a pause; (b) how often the fast assistant is fed becomes a setting.

UI over text everywhere (the owner): each state is shown, not written; anything that can be clicked or expanded is.

## Check and land

Work in your own worktree, committing each step by exact path. Screenshots at 400 and 1200 of each state into `shots/`, force-added (`git add -f`), and read them yourself. Log findings as `log` lines in this folder's `session.jsonl`, ending with one line that maps each ask above to done or open. Report one screen to mastermind-dictation-2, which reviews and merges. Never kill or restart the dev server, never drive the owner's tabs, never `git stash`.

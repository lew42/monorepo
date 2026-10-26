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

## Owner note 2026-10-25

Whisper emits "Thank you." (and similar) when it is sent silent audio; the owner did not say it. The live raw text should drop or grey known silence hallucinations ("Thank you.", "Thanks for watching.") when the chunk has no speech energy. Source: [v-sq8y7db session.jsonl](/framework/ai/sessions/2026/10/25/v-sq8y7db/), 17:30.

## Owner note 2026-10-25 (17:31): the per-message "fast ... smart ..." marks

The sent marks under EVERY message ("fast ...", "smart ...") mean nothing to the owner; he asked for sent-visibility, not this. Replace: show nothing per message once handled (details in a tooltip or the detail view); show a mark only when something is pending or wrong (not yet sent); show the brain-dots only while the smart seat is actually working on a specific chunk or question (his real ask: see that a reply to that chunk is being drafted; uses the working:{by,at} flag from the roles step). Source: [v-sq8y7db](/framework/ai/sessions/2026/10/25/v-sq8y7db/).

## Owner notes 2026-10-25 (17:40–17:55), added by task-mastermind-2; source [v-sq8y7db](/framework/ai/sessions/2026/10/25/v-sq8y7db/session.jsonl)

10. **Six phases, legible and never reverting.** 1 raw whisper (interim), 2 finalized whisper, 3 chunked into sentences, 4 sent to fast, 5 cleaned/placed, 6 refined by smart. Each sentence is a span with a subtle border so the sentence structure shows; the span's highlight/state shows its phase; each major phase is clearly distinct; colour variants are fine, but the 3-state cue stays simple: gray = arrived, not sent; black = sent to fast; refined = a non-colour mark. First make ONE small mock screenshot of the six looks (`shots/phases-mock.png`), then build the one you judge best (don't wait for a yes; say the alternative).
11. **Colouring today is "way off"** and does not help him understand; the cue must be stable (the bubble-wide fade bug above).
12. **Fast seat cleans each sentence it places:** punctuation (missing periods/question marks), filler words, capitalization. The cleaned sentence goes into the Prompt record; raw stays untouched (refresh/replay shows the clean one). Check what `.claude/skills/voice-assistant/SKILL.md` and `every-prompt` say now and update the skill text (the seats pick it up on next respawn).
13. **Diagnose with a screenshot of real bubbles:** paragraphs starting lowercase, capitals where they should not be, and ONE sentence split across TWO paragraphs (must never happen: a sentence is placed whole, only between sentences). Report the cause in 3 lines (placement splitting mid-sentence? interim vs final text? whisper chunk boundaries?) and fix it together with item 12.
14. **Facts (from the smart seat):** Whisper has no final flag. `Dictate.js:511` sends "interim" every 900 ms (`resend_ms` L816) with the whole growing window; finality = 700 ms pause (L813) or 15 s cap (L814) -> `close_segment` L521 -> final request L537 -> `commit` L557 -> `Sessions.js` say L930. No overlap between segments, so words cut at the 15 s cap can fragment. Send-on-final hooks `commit()`; consider overlap, or cutting the cap at a pause.
15. **Settings:** three checkboxes in the dictation settings, "send on period", "send on question mark", "send on comma", ALL CHECKED by default; they control where the text is cut into sends. (Replaces the earlier comma proposal for `core/Task/sentences.js`; run-ons stay chunked together when there is no clear end.)

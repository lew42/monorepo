# Why "now?" showed above "Can you hear me?"

**The render puts them out of order, because the chat's ordering time comes from two different clocks.** The log is in the right order, and so is everything Whisper and the placement step did. Proof: [`ux/Dictate/test/order.mjs`](/framework/ux/Dictate/test/order.mjs) fails today (commit `f133bedd0` on `worktree/dictation-order`).

## What the record shows

Session [`2026/10/25/v-xhx7fmx`](/framework/ai/sessions/2026/10/25/v-xhx7fmx/), `session.jsonl` lines 30–31. Servex wrote them in the right order, with its own (PC) clock:

- `{"chat":{"at":"2026-10-25T00:59:15.638-05:00", … "text":"Can you hear me?", "cues":{"mic_on_at":"…05:59:11.929Z","pauses":[{"start":2369,"end":null,"ms":798}]}}}`
- `{"chat":{"at":"2026-10-25T00:59:15.922-05:00", … "text":"now?", "cues":{… "pauses":[{"start":3168,"end":null,"ms":262}]}}}`

**The phone's clock was behind the PC's.** The phone stamps `cues` at send time: the second line went at phone time 15.359. That send waits for Servex's answer to the first (`Mic.js` `post_held`), written at PC time 15.638. So the phone was at least 0.28 s behind.

**The other two layers are clear.** `whisper/bucket.jsonl` stops at 2026-10-24 23:31, so there are no raw Whisper replies for this moment. The session has no `place` lines at all, so the placement step did not act. Its absence (0 placements over 58 chat lines) is a separate question.

## How the render gets it wrong (file:line)

1. `ext/Chat/Mic.js:648`: `take_out` stamps each sentence with the **phone's** clock (`ComposerMic.stamp`). `Widget.show_out` draws it as a bubble piece, ordered by that `at`.
2. `ux/Dictate/chat.js:184`: once `Session.say` answers, `panel.retag(entry.at, r.at)` hands the piece **Servex's** `at`.
3. `ext/Chat/Chat.js:238-241` (`retag_piece`): changes the piece's ordering time too (`pc.at = t`). "Can you hear me?" is now stamped 15.638 on the PC's clock.
4. `ext/Chat/Chat.js:200` (`speak`): "now?" is drawn with its phone stamp (about 15.3) and inserted before the first piece with a later `at`. That puts it in front of "Can you hear me?".

`order.mjs` replays this on the phone sheet with every Servex call stubbed. When both clocks agree, the chat reads in order (ok). With Servex 1.5 s ahead, it reads `"now?" then "Can you hear me?"` (FAIL).

The same cause predicts a second symptom, not yet tested: a new owner bubble can jump above the assistant's previous reply, because `place()` compares a phone-time bubble with a Servex-time one (`Chat.js:18`).

## The field that should carry the order

**One clock: Servex's.** Every `at` the chat compares should be Servex time. The phone's stamp still sets the order of the owner's own sentences: it is unique and always rising, so it is a sound sequence. The fault is mixing it with a second clock.

## The fix (short plan)

1. **`ext/Chat/Chat.js` `retag_piece`:** change the id only, never `pc.at`. I tried this one change: `order.mjs` then passes at both skews. It was reverted, since the brief fences off code edits here.
2. **One clock for new stamps:** `Session.say`'s answer gives the offset (`r.at` minus the midpoint of the request). Keep it on `Session` (`Session.clock_offset`), and have `ComposerMic.stamp()` add it. Phone-drawn bubbles are then on Servex's clock, so `place()` sorts them correctly against the replies.
3. **Into the record:** `chat.js` `deliver` sends `said_at: entry.at` with `Session.say`, and Servex writes it on the chat line. Then a reload orders the lines by the same key the live screen used, even when a slow send lands after a later one (the `DELIVER_MS` path in `Mic.js:677`).
4. **Proof:** `order.mjs` passes. Add a third run in which a reply sits between the two sentences, to cover the cross-bubble case.

**Who:** step 1 is a three-line edit in `ext/Chat/Chat.js`. The `solid/` builder is editing `ux/Dictate/` and `ext/drawer/`, so steps 1–2 should land through the parent, after `solid/` or folded into it.

**Docs this makes out of date:** `ext/Chat/doc/notes.md:70` (it says `retag_piece` only changes the id, but the code also moves `at`) and `:141` (#bubble-order) and the Dictate chain diagram (Part 7 item 7), which should name "one clock" at the bubble step.

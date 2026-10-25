# The flicker — why your words vanished and came back, and the fix

**The rule (the owner, 2026-10-24):** while dictation is on, your words appear in place in the chat bubble, as if already sent. Nothing you are reading vanishes or moves. A later stage (the clean-up, the refine) may change a word only in place.

## What was wrong (reproduced 2026-10-25, `test/flicker.mjs`, before the fix)

A pause sends everything you said. Three steps broke the rule:

1. **The words left the draft before the sent bubble existed.** `ComposerMic.send_screen()` emptied the growing draft at once, then waited: for the live refine (up to 1.5 s) and for every earlier sentence still being sent (each `Session.say` can take up to 10 s). Only then did the sent bubble appear. In the run, both sentences were gone for 0.9 s.
2. **A slow send wiped the next sentence.** When that send finally landed, `Widget.submit_entry()` dropped whatever draft was live, which by then was the next sentence you were saying.
3. **A redraw put new words before old ones.** Any redraw of the bubble (a ✓ mark arriving, a merge) re-added its sent pieces after the draft, so the words swapped order until the next Whisper guess.

## The fix

- **Show first, send after.** When words leave the draft, `ComposerMic.take_out()` ([ext/Chat/Mic.js](/framework/ext/Chat/Mic.js)) gives them an `at` and hands them to `on_out` in the same step. The chat (`Widget.show_out()`, [Widget.js](../Widget.js)) draws them as the sent piece in the draft's exact spot. The send follows later with the same `at`; if the refine changed the text, only that piece is swapped (`patch_piece` in [ext/Chat/Chat.js](/framework/ext/Chat/Chat.js)).
- `submit_entry()` no longer touches the draft, and `Thread.refresh()` puts the draft back at the end after any redraw.
- **Timing on the Debug tab:** the Sent row says how long the words waited before going out and how long Servex took (`sent “…”; on screen at once, sent 0.6 s later (clean-up and queue), Servex took it in 3.0 s`), and the AI row says how long the answer took after the send. The Transcripts row already showed Whisper's time.

## The proof

`node public/framework/ux/Dictate/test/flicker.mjs <base-url> [shots-dir] [plain|clean]` plays three sentences into the phone sheet: Whisper's growing guess, its final, the clean-up (scenario `clean`), a pause that sends, and more talking while that send is still open (Servex stubbed, answering in 3 s). It takes a shot about every 150 ms and counts the words that left the screen between two shots, and how many of those the clean-up explains. The two numbers must agree, and no word may change place.

| Run | Words gone | Explained by the clean-up | Words moved |
|---|---|---|---|
| plain, before | 7 | 0 | 2 |
| clean, before | 22 | 3 | 4 |
| plain, after | 0 | 0 | 0 |
| clean, after | 2 | 2 | 0 |

Shots and numbers: [flicker/shots/](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/flicker/shots/) (`before-clean-030.png`: the empty chat; `after-clean-030.png`: the same moment, words in place).

**Not covered yet:** `ext/Chat/ChatPanel.js` uses the same composer without `on_out`, so its chat still draws a sentence only when the send lands. Wiring it is one `on_out` line once its thread has a `show_out`.

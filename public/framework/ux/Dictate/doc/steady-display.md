# Steady display: why the chat jumps, and the fix (proposal, 2026-11-03)

**The complaint.** While dictating, the chat is "jumpy": a lot happens, and the assistant's clean-up edits rewrite the words you are reading. Wanted: fewer edits and replies from the assistant, a steadier live transcription. Measured on session `v-z0jonhy` (the single assistant, 41 spoken sentences).

## Why it jumps (measured, not guessed)

1. **Most clean-up edits change nothing.** Of 41 `improve` edits, 24 were the identical words, 8 changed only punctuation or case, and 9 changed a word. Each one is still a `place` line plus a `clean` line, and each redraws.
2. **The redraw replaces the whole thing, even for identical text.** First view (`ext/Chat/Chat.js` `fill()`): every text node of the bubble is removed and drawn again; an `improve` swaps the plain line for the raw/improved pair (`revision_pair_node`) even when the two are equal (`Widget.place`, `ux/Dictate/Widget.js` ~:596). Chat V3 (`ext/Chat/v3/ChatV3.js` `update()` ~:134): any line for a card, a sentence, a `sent` mark, a `clean`, a reply, empties the card and rebuilds all of it, which also loses the reply being written, the open "show raw" and the scroll spot.
3. **The rewrite lands seconds late.** The clean-up arrives a median 2.4 s (up to 9.6 s) after the sentence, so you have read the raw words by then.
4. **Seven lines per sentence.** Each sentence writes about seven lines (prompt, chat, sentence, `sent`, its mirror, `place`, `clean`); each is a redraw trigger.

## The fix, in the order to build

1. **Never write or draw a no-op edit.** Servex drops an `improve` whose text equals the raw words (code, in `Sessions.js` where the `place` line is accepted); the page ignores one too (`Widget.place`, V3 `clean`). The single assistant's brief (`Servex/agents/single-voice-assistant.md`) says: edit only when a word or the punctuation is actually wrong. Cuts about 60% of edits at no cost to quality. Small.
2. **Never rewrite text you are reading.** A clean-up for a sentence is held while you are still talking (the floor is "speaking", or the sentence's bubble is the open one) and applied at the pause, all together, in one redraw. The raw words stay as they are until then. Client-side, in `Widget.place`; V3 does the same in `update()`.
3. **Patch, don't rebuild.** V3 `update()` changes only the node that changed (the paragraph text, the reply) instead of emptying the card; it keeps the partial reply, the "show raw" state and the scroll. Redraws are coalesced to one per frame. Medium.
4. **Optional, fewer model turns:** the assistant files the cleanups for several sentences in one turn at the pause cue instead of one turn per sentence. Cheaper and calmer, but the first clean text shows later. Try after 1 to 3 and compare.

## Batching sentences to the assistant (asked 2026-11-03)

Today the single assistant gets one model turn per sentence (`single_say`, no hold), then a second turn for the pause cue. Recommended: keep the raw sentence reaching the session at once (the raw log stays instant), but hand the assistant the held sentences once per pause (the quiet already used for `hold_thought`/`release_thought`, ~2.5 s, or a cap of about 5 sentences or 20 s so a long monologue is not held forever), with the cue in the same turn. One of everything: reuse the fast seat's thought hold, not a new timer.

- **Latency:** the cleanup and the reply arrive at the pause, one turn instead of two; mid-speech nothing changes, which is what steadies the display. Cost: a short sentence's cleanup shows ~1-2 s later than now.
- **Jumpiness:** best of the options: no cleanup edits at all while you talk.
- **Cost:** fewer model turns; the saving is small on one-sentence questions (this session: 34 quiet moments for 41 sentences) and large on long dictation. Not yet measured per sentence.
- **A middle ground, as a setting** (the owner likes sending a sentence at a time, but finds it a little too much): "hand the assistant what you said every N sentences, or at your pause, or after S seconds, whichever comes first", the same two knobs `WakePolicy` already has for the smart seat (`every`, `gap_ms`; `Servex/agents/WakePolicy.js`), so one policy, not a new one. N = 1 is today's one at a time and stays available; the proposed default is N = 3 with the pause and a 20 s cap. Per session, in the gear panel beside the assistant row ([settings.md](settings.md)).
- **Not recommended:** raising `sentences_per_send` on the page (it delays the raw words themselves).

## The proof

`ux/Dictate/test/flicker.mjs` (scenario `clean`) counts words that left the screen and words that moved: after steps 1 and 2 it should show 0 words gone while talking, and an applied clean-up only at the pause. Add a check that a redraw of a card keeps its partial reply and open raw text.

## Not covered

The Whisper growing guess itself (the faint draft changes as Whisper revises it): already held in place by [flicker.md](flicker.md); only the clean-up path is addressed here.

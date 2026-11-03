# asks-transcription: state

**Result:** [ux/Dictate/doc/asks.md](/framework/ux/Dictate/doc/asks.md) (19 clusters: 7 open, 4 partly, 8 done), linked from the [Dictate readme](/framework/ux/Dictate/). Built by `gen.mjs` from `filter.mjs` (578 voice prompts out of 4,497) and 6 Haiku tag passes (83 tags; 45 quotes found verbatim, so counts are a floor). Statuses were checked by Sonnet against readmes, role tables and files, not every line of code.

## Built tonight (top small open asks)
- **Long prompt refine:** the Refine button keeps the latest 19,000 characters instead of failing at 20,000 (`AISessionConversation.fit`).
- **Idle Whisper crash:** `VoiceStrip` re-checks Whisper when the tab becomes visible again, so a sleeping phone learns of a crash before the mic is pressed.
- **Voice walk re-run** after both: desktop and phone (`walk-*.txt`) show raw and clean at the first words, structure, refined and cards 7 s (desktop) and 10.7 s (phone) after Refine; the baseline was 6.6 s, and Haiku latency varies.

## Not done, and why
Voice model policy, prompt cards to board cards, the VS Code path and a Whisper status stream all need a Servex restart or the owner's call (https, models); they are the top of the doc's Open list.

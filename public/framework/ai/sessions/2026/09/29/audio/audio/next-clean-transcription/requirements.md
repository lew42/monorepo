# Next task: clean transcription mode, structure, and audio cues

The owner's words, verbatim: [`../owner-words.md`](../owner-words.md), section "Continued (about 8:20 PM)". They are the acceptance test. Written by task-mastermind-audio as the next brief: the audio task was told to land with nothing added (mastermind-servex-7), so this is its own task. Relayed by servex-mastermind-opus; its summary follows, and the verbatim words win where they differ.

## Build in this order: 1, then 4, then 3, then 5

1. **Clean transcription mode is the default view.** Raw Whisper is paired with the FAST assistant's clean-up: no "ah" or "um", the words and their order kept, nothing dropped, swapped or added (except an obvious mis-transcription). The UI shows the CLEAN text; the red/green strike-through diff moves to a debug mode. Feed the fast assistant small, frequent pieces as Whisper streams; it may also smooth punctuation and garbled seams. Still fix seams in code (local agreement), since that is better.
2. **Raw stays reachable:** from the clean text, dig back to exactly what Whisper produced, streaming internals included (the playground's Chunks view already shows those).
3. **Real structure:** `Server/refine.mjs`'s "structured" rung only condenses today. Build an information hierarchy: H1 = the thing discussed (e.g. "Page class"), H2 = familiar names for its parts ("Layout"), bullets under each, in the owner's own names. Each rung its own model and prompt, configurable.
4. **Don't respond while the owner is still talking** (replies may be spoken aloud later).
5. **Audio cues to the fast model:** pause start and end, with durations (from the level meter), so it has a real-time sense of the speech. Research what Whisper gives (timestamps, no_speech_prob) and what the meter gives.

## What exists (from the audio task, merged in b1b82d33)

- [`ux/Revise`](/framework/ux/Revise/): levels clean · edit · summary, each `{prompt, model}`, served by Servex `/api/tidy` (`Servex/agents/tidy.js`; needs a Servex restart to take `level`).
- [`ux/Dictate`](/framework/ux/Dictate/): option `revise:`; the playground has Raw, Chunks (with pause/forced cut markers), Corrections, Live, Side by side.
- [`audio/Transcriber`](/framework/audio/Transcriber/): `Transcriber.Whisper` is a rolling local-agreement window (measured 0 errors vs 2+1 on a 52 s test); used so far only by the [Dictate/Parts variant](/framework/ux/Dictate/variants/parts/). [`audio/MicStream`](/framework/audio/MicStream/) has the level history for pause cues.
- A revision is logged as a chat line with `re` (the raw line's `at`) + `level`.
- Open review notes: [`../next-chat-hitl/requirements.md`](../next-chat-hitl/requirements.md), last section.

Pool worktree, smoke test, merge.mjs, one fresh reviewer, screenshots at 1920 and 400. Keep v1 reachable.

## Small notes from the audio task's second review

- The three assembly pages (`audio/sound-recorder`, `push-to-talk`, `mic-to-text`) lead with a code block; put the live demo first.
- `Dictate.sample()` resets `this.sampling` only on the normal exit; wrap the loop in `try/finally`.

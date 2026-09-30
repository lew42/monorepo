# /framework/audio/: requirements

The owner's words are in `owner-words.md`; read them in full. They're "going all in" on audio.

## Asks (tick each against the owner's words)

1. **A new top-level `framework/audio/`,** listed in framework's `children:`, with a readme and a page. It's a LIBRARY of audio building blocks, pure audio, not AI: the microphone chooser, live level meters, a recorder (record, play, save), audio streams, and push-to-talk. Each is a small class with its default view (the item-ui pattern) and a demo.
2. **Transcription is separate from dictation:**
   - **Transcription** = an audio stream into a text stream. Engines: local Whisper (via the page-origin /whisper proxy) and Chrome's recognizer. It goes in audio/ (e.g. `audio/transcribe/`), with a swappable engine.
   - **Refinement** = an LLM plus a prompt that cleans or curates the text, at LEVELS (near-raw: fillers and punctuation only; light; heavy: summarized and organized). Usable for prompts AND for writing (e.g. a blog post from rambling). Models and prompts can be swapped. It's the AI step, so it stays out of audio/ (e.g. with ux/Dictate, or its own module; propose where).
   - **Dictation** = the whole system assembled: audio, then transcription, then refinement, then where it goes. ux/Dictate can stay where it is, rebuilt on the audio/ parts. Moving it is optional; if you move anything, update EVERY reference.
3. **Composable:** show three assemblies built from the same parts, as demos: a plain sound recorder; Discord-style push-to-talk streaming (the shape, even if it's local-only); and mic → Whisper → text.
4. **Visibility into transcription** (the owner asked for this before): see the Whisper chunks, the revisions and timings, and the raw vs refined text side by side. Reuse the dictation playground; don't rebuild it.
5. **Does anything USE the refinement today?** The playground shows corrections, but no page may use them. Wire refinement into the real dictate path where it belongs, with its level chosen by the caller.
6. **One consistent chat widget:** the same component in the desktop drawer and the mobile sheet. Its height is variable: it starts small, grows to a maximum, then scrolls. Coordinate with task-mastermind-mobile-nav, which owns the drawer and sheet today.

## Rules
Keep v1 of ux/Dictate reachable. Use a pool worktree, the smoke test with links followed, merge.mjs, one fresh reviewer (not six), and screenshots at 1920 and 400. At most 3 minions; memory is tight. Budget about $15. Post your session id and then progress on card 2026/09/29/audio-a-library-of-audio-parts-transcrip.

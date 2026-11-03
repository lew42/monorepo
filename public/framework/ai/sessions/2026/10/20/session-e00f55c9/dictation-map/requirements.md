# Dictation: how it really works today, and one chat view fed by the session log (you are a mastermind)

**The owner (2026-11-01), the essence:**
- **Map it:** "study the dictation system to help answer some questions about how it works." There was a system-map fan-out for the voice agents: find it (`past-work`, `public/framework/ai/past-work-index.md`). The map covers the classes and **every role and its prompt** (the voice agents' descriptions).
- **The fast and smart assistants:** do we still have both? There was a request to roll them into one, yet session data shows both still being spawned.
  - Is the fast one doing anything?
  - Do both get the full Whisper transcription (the owner calls that "echo mode")?
  - Or does the fast one clean the raw text (capitalization, punctuation, filler words) and the smart one get only the cleaned text?
  - Answer from the code and real session logs, not from docs.
- **Chat V1, V2, V3:**
  - **Same data:** they should be versions of one interface that all read the same session data and write the same structures.
  - **V1:** still uses "pseudo lines" in `session.jsonl` (`chat`, `place` and other commands that aren't proper item deltas).
  - **V2:** showed only refined prompts, never the live raw Whisper text.
  - **V3:** where is it, and does it work?
  - **The owner's view:** V1 was the best experience, because it showed the live transcript in real time.
- **Work with the voice read-aloud mastermind** (`../voice-recite/`): you own Whisper and the chat views that turn the session log into messages; it owns reading replies aloud. Agree together where `Recite` plugs in.

## Do

1. **`map.md` here, one screen first, detail below:**
   - the path from mic to Whisper chunks, to raw text, to the cleaned text, to the prompt, to the session log, to each chat view, with the class and file at each step;
   - each assistant role, with its prompt file, its model and what it receives;
   - which of V1/V2/V3 read which lines;
   - what's dead or duplicated.

   A node script does any counting from real logs. Helpers on Haiku or Sonnet may search.
2. **`answers.md`:** the fast/smart answer, the echo-mode answer, and V3's state, with evidence.
3. **`plan.md`:** one chat view that shows the live raw transcript (what V1 did well) and the refined prompt, reading proper session lines. Say what happens to the pseudo lines: migrate them, or read both for a while. Mark it "ask first" before any big move.
4. **Coordinate:** append a short "for voice-recite" section to `../voice-recite/dictation-notes.md`, naming where a reply's text becomes available and where a playback line can sit in the view. Read their `plan.md` when it appears.

## Fences

- **Read-only, except** this folder and `../voice-recite/dictation-notes.md`.
- No code changes yet; plan only. Commit by path. No `python`.
- **Budget:** about $15.

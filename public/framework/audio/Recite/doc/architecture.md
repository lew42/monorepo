# Recite: decisions

Built 2026-11-01 in the voice-recite task ([requirements](/framework/ai/sessions/2026/10/20/session-e00f55c9/voice-recite/requirements.md), [plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/voice-recite/plan.md)).

- **Kokoro-82M on the CPU, not a GPU model.** It reads 6x faster than real time on this CPU (11 s of speech in 1.7 s), so it takes no VRAM from Whisper (2 GB) or the local LLMs. Rejected for now: Piper (more robotic), Chatterbox or XTTS (3–4 GB of VRAM, about real time; the option if a cloned voice is wanted). The server's `/speak` route would stay the same.
- **The names are the owner's:** `Voice` is one voice or persona, `Recite` is the overall control. `Voice` already existed (the browser's speechSynthesis), so it was extended, not duplicated (law 6).
- **One `<audio>` element, not Web Audio.** The element keeps its place when paused, keeps playing with the screen locked, and gives Android's lock-screen and headphone controls (Media Session). Web Audio gives none of those.
- **Sentence by sentence, two ahead.** The first sentence is kept short, so the first sound comes in about 0.4 s. Each sentence's length comes back in the `X-Recite-Seconds` header, which builds the timeline for back 10 s.
- **Barge-in in two steps.** A level alone pauses for wind or a truck, so a loud moment pauses at once and Whisper decides. Whisper's silero VAD returns no text for noise (tested with `silence.wav` and a fake wind clip), and reading resumes. After a noise verdict the trigger level rises to that noise and fades over about 10 s, so steady wind stops pausing it.
- **Echo is checked by words.** If most of what Whisper heard is in the sentence being read, it was the speaker, and reading resumes.
- **The chat's wire, not a chat view.** Recite hears replies from the session's live wire (`Session.stream`), which feeds all three chat views, so it works whichever view is on. Advised by the dictation-map task ([dictation-notes.md](/framework/ai/sessions/2026/10/20/session-e00f55c9/voice-recite/dictation-notes.md)).
- **Never two mics.** With the chat's own mic on, barge-in listens to that mic's level, and the owner's line arriving on the wire is the check (no line in 5 s means noise).
- **Read new replies is on by default only on a phone** (coarse pointer), so a desk tab does not start talking by itself.

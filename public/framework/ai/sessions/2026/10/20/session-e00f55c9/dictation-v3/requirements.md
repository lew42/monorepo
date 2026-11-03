# Web dictation V3: show replies and live words, pause the fast seat, merge read-aloud (you are a mastermind)

This is the web dictation system, NOT the Claude app voice agent (see `../voice-bridge/requirements.md`, "Who's who"). Read [../dictation-map/](../dictation-map/) (`map.md`, `answers.md`, `plan.md`) and [../voice-recite/handoff.md](../voice-recite/handoff.md) first.

**The owner (2026-11-01):**
- **V3's own asks:** follow V3 back to the session where the owner asked for it, and read those prompts. The owner remembers asking for:
  1. raw Whisper text in the cards in real time;
  2. refined clean sentences, each with its own id;
  3. titles and summaries with 100% prompt coverage.

  Check each against what V3 does.
- **V1's live streaming** of the raw words in chat bubbles is the bar V3 must meet. The dictate widget kept recording while the owner switched V1↔V2; keep that across V1/V2/V3.
- **V3 must show the replies:** 94% of the smart seat's replies are written only as old-style chat lines today.
- **Pause the fast seat** (`voice-assistant`, Haiku) if the map's evidence holds. Check first whether anything still depends on its output, such as prompt refining.
- **Read-aloud** (`audio/Recite`, Kokoro):
  - one chat system: Dictate plus Recite, with the voice choice in the existing dictation settings;
  - a way to sample the voices (play a line in each);
  - "switch your voice", by voice command, changes it;
  - replies meant to be read aloud avoid tables and spell out what reads badly;
  - answer how much RAM and CPU Kokoro uses (the owner asked).
- **The read-aloud picked up its own voice:** Whisper heard "Here is a reply. Read aloud." several times. Make sure the mic doesn't transcribe the read-aloud: echo cancellation, or muting the transcript while it speaks.

## Do

Build in a worktree after the merge of `voice-recite` lands (`git log michael/dev` shows it). Use `node Server/review.mjs`, and leave the merge to the owner. Write `findings.md` with the V3 trail and what changed.

**Fences:**
- Never restart Servex during a voice call. No `python`. Commit by path.
- **You may spawn** helpers with `spawn_agent`.
- **Budget:** about $35.

## Added by the owner, relayed 2026-11-01 17:05

- **Voice quality:** Kokoro sounds robotic. A short `voice-models.md` (beside `audio/Recite`): what Kokoro is, its real RAM and disk use, why it runs on the CPU; the best local GPU options that fit beside Whisper's 2 GB in 12 GB (Chatterbox, Orpheus, Sesame CSM, Dia, F5, XTTS, anything newer); the cloud options (what the Claude app uses if knowable, ElevenLabs, OpenAI TTS). Quality, VRAM, latency, controls (speed, pitch, emotion). Recite's `Voice` class takes more than one engine, so a better model plugs in. Speed and any other voice parameters in settings, with a sample button.
- **Document as you build:** each new class and module gets its readme and class doc in the same commit ([doc/rules.md](/framework/doc/rules.md)), without being asked.

## The owner's priorities, relayed 2026-11-01 17:25 (these order the work)

1. **Kokoro read-aloud working end to end** as the reliable fallback: a reply read aloud in the web chat over `monorepo.lew42.com`, and a back-and-forth conversation. "It's not quite working yet": find out why first, once voice-recite is merged.
2. **Chatterbox-Turbo as a second engine** behind one adapter (`Voice` takes an engine), switchable in settings, on the GPU (about 2–3 GB beside Whisper's 2 GB).
3. **Servex supervises the models:** only ONE voice engine loaded at a time (switching unloads the other), and an idle shutdown (about 10 minutes unused, then stopped; started again on demand) for the voice engine AND whisper-server. No zombies: a Servex restart leaves exactly one of each, or none.

Document each piece as it is built.

# Web dictation: V3 shows replies and live words, the fast seat paused, and read-aloud folded into one chat with voice settings (you are a mastermind)

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

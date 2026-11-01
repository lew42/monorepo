# Read the AI's replies aloud: a local voice, a Recite playhead, barge-in (you are a mastermind)

**The owner (2026-11-01), the essence (the full dictation is logged by prompt-relay for this session, 2026-11-01):**
- **What it is:** text to voice, so the LLM's replies in the chat or dictation widget are read aloud, like the Claude app, and the owner can use the site on a walk without reading.
- **The model:** a local text-to-voice model that fits beside Whisper in **12 GB of VRAM**. Check Whisper's current model and its real VRAM use first, then budget both. Find out how voices work (voice files). Several voices would be fun.
- **Names (the owner's lean):** a **`Voice` class, one per voice or persona**, and a **`Recite` class**, the overarching control: playback, loading the model, reconnecting. "Recite" is text to voice, the reverse of transcription.
- **A playhead:**
  - **pause/resume:** the play button turns into pause while it reads;
  - **back 10 s;**
  - **restart from the beginning;**
  - **one small, unobtrusive control line,** not floating buttons.
- **Interruption:** when the owner starts talking, it pauses to listen and remembers its place.
  - Volume alone misfires on a breeze or a passing truck, so add a resume button, an adjustable threshold, and a mic-mute that switches to manual playback.
  - Check whether Whisper or its chunking can tell speech from noise.
- **Architecture:** fit it into the existing chat and dictation classes properly, not hacked in. Find how they relate:
  - `ux/Dictate`;
  - `ext/Chat` (the original, `v2/ChatV2.js`, `v3/ChatV3.js`);
  - `ext/Refine`;
  - any reshaping work already done (`past-work`, `public/framework/ai/past-work-index.md`).
- **The voice agent:** coordinate with it (`Servex/ext/remote/doc/cloud-voice-agent.md`), so it works from the phone through the public site URL that the sibling task `../remote-site-tunnel/` is building.
- **Done, in priority order:**
  1. the owner can test it on the walk;
  2. at least: a reply is read aloud in one chat view on the phone, with pause/resume and barge-in.

## Do

1. **Look:**
   - the VRAM numbers (`nvidia-smi`; the whisper-server settings);
   - two or three candidate local voice models: quality, VRAM, speed, how to run them on Windows without a new npm dependency (a separate local server like whisper-server is fine);
   - the chat and dictation class map.

   Write `plan.md` here, with the choice and the alternative.
2. **Build in a worktree.** Run the model as a supervised local server (Servex supervises servers, the way it does whisper-server), with `Voice` and `Recite` classes under `ux/` or `audio/`, beside Dictate (name and home first). Then:
   - a demo page that shows it working;
   - the readme and class docs (`public/framework/doc/rules.md`);
   - `node Server/review.mjs`.
3. **Hand-off:** give the merge command and what to try on the walk.

## Fences

- **Worktree for code;** never merge. Don't restart Servex during a voice call.
- **No `python -` or heredocs** (they hang here). A real `.py` file for a model server is fine if that's what the model needs.
- **You may spawn** Sonnet or Haiku helpers.
- **Budget:** about $40.
- Report progress to the mastermind tab at least every 20 minutes.

Budget: $4

# Voice models for read-aloud: what Kokoro costs, and what sounds better

Load the `minion` skill first. Owner's words: [../requirements.md](../requirements.md), section "Added by the owner" (voice quality) and the bullet "answer how much RAM and CPU Kokoro uses". Kokoro "sounds robotic".

**Deliverable:** one file, `voice-models.md` in THIS folder (the mastermind moves it into `public/framework/audio/Recite/doc/` later). About one screen plus one table. Plain sentences, newcomer-readable (CLAUDE.md law 2). Lead with the answer.

1. **Kokoro, measured, not recalled.** recite-server (Kokoro-82M) runs right now on port 8177 (started by hand, python). Find its PID (`Get-NetTCPConnection -LocalPort 8177` in PowerShell), then read its working set and private memory, and its CPU while idle and while rendering one long sentence (POST to it; the API is in `git show task/voice-recite:Servex/ext/recite/readme.md` and the server file that readme names). Give: RAM idle, RAM peak during a render, CPU % during a render on this machine (name the CPU from `Get-CimInstance Win32_Processor`), seconds to render one 20-word sentence, and the model's size on disk (find its files). Why does it run on the CPU (read the server code: the device choice) and would the GPU help?
2. **Local GPU options** that fit beside Whisper (about 2 GB VRAM) on a 12 GB card: Chatterbox, Orpheus, Sesame CSM, Dia, F5-TTS, XTTS-v2, and anything newer a web search finds (2026). One table row each: quality (one honest word plus a source: a leaderboard such as TTS Arena, or a reputable review), VRAM, latency to first audio, controls (speed, pitch, emotion, voice cloning), licence, notes on running it on Windows. Link each claim's source.
3. **Cloud options:** what the Claude app's voice uses (say "unknown" if no public source says), ElevenLabs, OpenAI TTS (gpt-4o-mini-tts and newer), and one or two others the search turns up. Price per hour of speech, latency, controls.
4. **Recommendation:** the one local model to try next and why; the one cloud fallback. Two sentences each, with the alternative.

**Never:** run `python` yourself, start or stop recite-server, restart any server, stash, or edit any file outside this folder. Log progress lines in your own task.jsonl (`node .claude/hooks/append.mjs`). If short of budget, cut the cloud section first.

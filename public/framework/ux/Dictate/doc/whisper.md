# How Dictate talks to Whisper

**It's not a stream and not a socket. It's a request every ~1.5 seconds.**

## The steps
1. **Mic → samples.** The browser opens the mic (`getUserMedia`) and an `AudioWorklet` (`pcm-worklet.js`) hands raw samples to the page.
2. **Samples → WAV.** While you talk, the page keeps the current *segment* (everything since the last pause) and wraps it as a short WAV file (`capture.js`, `wav()`).
3. **WAV → Whisper.** About every 1.5 s the page `POST`s **the whole segment so far** as `multipart/form-data` to `/whisper/inference`. The dev server passes it to `whisper-server` (a local program on port 8178, started by Servex, running on the GPU).
4. **Whisper → text.** `whisper-server` transcribes the whole segment and answers with its text, typically in **80–100 ms** for 10 s of audio.
5. **Text → screen.** The page replaces the live line with the new text.

## Why the words "heal"
Each request sends the **whole growing segment**, not just the new part. So every answer is Whisper's latest best guess for everything said so far; with more audio it often fixes earlier words. When you pause, the segment closes and its last answer is final.

## What the "socket" is
The site's live connection, used for chat and page updates. **Not** part of the audio path.

## What's logged today
The final text of each sent line, in the voice session's file. The individual 1.5 s answers and their timing are **not** logged yet: planned in [voice-pipeline](/framework/ai/sessions/2026/10/05/voice-pipeline/voice-pipeline/), along with a live view of each request.

Numbers and history: [decisions.md](decisions.md) ("The numbers").

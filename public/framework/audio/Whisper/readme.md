# audio/Whisper

The local whisper-server as objects, and a log of every request to it.

- `Whisper.js`: `class Whisper` (url, status up/down, ping, restarts seen, its sessions) and `Whisper.View`. `Whisper.shared` is one per page.
- `WhisperSession.js`: `class WhisperSession`, one per dictation surface. `record(line)` logs each request (audio size, seconds, reply, latency) and notes revisions where an earlier word changed. Lines are appended to a per-day log under `ai/whisper/`. Has `WhisperSession.View`.
- Not the same as `audio/Transcriber` (the engine that sends audio).
- Used by [Refine](/framework/ext/Refine/). Details and open gaps: `ext/Refine/doc/refine-v3-2026-10-09.md`.

# audio/Whisper

The local whisper-server as objects, and a log of every request to it.

- `Whisper.js`: `class Whisper` (url, status up/down, ping, restarts seen, its sessions) and `Whisper.View`. `Whisper.shared` is one per page.
- `WhisperSession.js`: `class WhisperSession`, one per dictation surface. `record(line)` logs each request (audio size, seconds, reply, latency) and notes revisions where an earlier word changed. Lines are appended to a per-day log under `ai/whisper/`. Has `WhisperSession.View`.
- `WhisperLog.js`, `WhisperLogRows.js`: the one numbered log of every Whisper reply and every step to the Cleaned list, and its table at [Whisper log](/framework/audio/Whisper/log/) (`log/page.js`). `WhisperSession.record` writes through it. Doc and a real proof run: `doc/whisper-log.md`.
- Not the same as `audio/Transcriber` (the engine that sends audio).
- Used by [Refine](/framework/ext/Refine/). Details and open gaps: `ext/Refine/doc/refine-v3-2026-10-09.md`.
- **Is the raw reply saved?** Plain answer, what was lost and how it is now saved: `doc/raw-log.md`.

## The owner's direction, 2026-10-20 (19:05)

- **Where the log should go:** into the voice session itself. When the mic turns on, the Dictate widget is what creates the assistant (an SDK agent with its own session id; it should work in text-only mode too, so it is just *an assistant*), and every Whisper line could be written to that session's record in the dated store (`ai/sessions/YYYY/MM/DD/<session>/`), the one system for everything dated, instead of a per-day file here. Today there are two logs in two places: the per-day files under `ai/whisper/` (last written 2026-10-12) and the raw replies in Servex's own `logs/whisper-raw` file (one file, not dated, outside the repo). The structure of the log is worth keeping: save it, then review it.
- **Home:** maybe `ai/` rather than `audio/`. Whisper is an AI system and an audio system; the overlap is real. A note, not a move.
- **The raw demo:** the owner wants a page that shows raw Whisper lines as they come. The [log page](log/) is the numbered table of real rows; the raw replies are not on the site.
- 19:20: `ai/whisper/<date>.jsonl` is a second dated system; the rule is one data system for every log kind (see [core/Item/doc/store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md)). For now a temporary bucket per session is fine; the raw lines may turn out useless once the flow is understood. The page as found: three demos, the first does nothing, the second shows no log or structure.

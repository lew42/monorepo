# The Whisper demo: every reply from the speech server, as it arrives

The demo at the top of the [Whisper page](/framework/audio/Whisper/) shows each answer whisper-server sends back, one row per answer, newest last. Press the mic and talk, or press **Replay** to watch a recorded dictation play back at its real speed. Click a row to open everything that answer carried.

## How a reply amends itself, then settles

Whisper does not stream. While you talk, `ux/Dictate` sends the **whole growing recording** again about every 1.5 s, and each answer is a fresh guess at all of it: an **interim** row. A guess can change words it already said (the row says **amended**). When you pause (~0.7 s), Dictate sends the finished recording one last time: the **final** row. The final replaces every interim of that segment, and those interim rows are marked **replaced by #N**. "Interim" and "final" are Dictate's words, not Whisper's: the server is stateless and just transcribes what it is sent (`doc/whisper-log.md`).

## Class architecture

| Class | File | Job |
|---|---|---|
| `WhisperDemo extends View` | `WhisperDemo.js` | The demo: sticky header (mic, Replay, Whisper only / every step, maximize), the scrolling rows, sticky footer (what you are looking at, counts). Two tabs: **Log** and **Class** |
| `WhisperDemo.Detail extends View` | `WhisperDemo.js` | One answer drilled down: the basics (kind, time, latency, audio length), then each segment with its confidence, then the raw JSON |
| `WhisperLog` | `WhisperLog.js` | The store and its writer: `WhisperLog.record()` appends one line to the bucket; `WhisperLog.path()`, `WhisperLog.local()` |
| `WhisperLogRows` | `WhisperLogRows.js` | Pure reading rules: `annotate()` (amended / grew / same), and `supersede()` (which final replaced which interims) |
| `Dictate` | `ux/Dictate/Dictate.js` | The mic. Its `log_whisper()` writes every reply through `WhisperLog.record()`, on every surface |
| `JSONL` | `ext/JSONL/JSONL.js` | `live()` tails the bucket, so a dictation in any tab shows up here |
| `InspectCard` | `ux/Content/Object/Inspect.js` | The Class tab: the class card beside the live instance |

Composes: `WhisperDemo` has one `Dictate` (the mic), one `JSONL` (the tail), and opens one `Detail` per clicked row. Who feeds it: every `Dictate` on the site (chat composer, voice strip, widget, Refine) through `log_whisper()`; Replay feeds it from the same lines, or from the committed sample run `doc/proof-2026-10-16.jsonl` when the session has none.

The [Whisper log](/framework/audio/Whisper/log/) page is the same view with **every step** on (what Dictate, the composer and Refine did with each answer).

## Where the data lives (one store)

- **File:** `public/framework/ai/whisper/bucket.jsonl`, one temporary bucket (git-ignored; written through the dev server's `FsFile.append`). **New session** appends a `{src:"bucket", kind:"new"}` line, and the demo shows only the lines after the last one. No date, index or query code.
- **A line:** `{seq, run, t, at, src:"server", kind:"interim"|"final", msg, server, req, segment, ms, bytes, seconds, session}`; `server` is the whole reply (`verbose_json`: segments with `avg_logprob`, `no_speech_prob`, word probabilities). Other `src` values (`dictate`, `composer`, `refine`) are written by `WhisperLog.attach()`.
- **Writer:** `Dictate.log_whisper()` → `WhisperLog.record()`. **Reader:** `WhisperDemo` and `WhisperLog` (the table) via `JSONL.live()`.
- **Decision (2026-10-20):** this bucket is the one store, temporary (the owner: "a temporary bucket for Whisper logs"); Dictate no longer posts to Servex's `whisper-raw` log. Alternative kept in mind: the voice session's own record in the dated store, the owner's direction in `readme.md`, once `core/Item/Dated` slice 2 lands.

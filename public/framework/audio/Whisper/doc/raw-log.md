# Is the raw Whisper reply saved? (checked 2026-10-17)

**Update 2026-10-20:** Dictate now writes every reply to the WhisperLog bucket instead of Servex's `whisper-raw` log, so the [Whisper page](/framework/audio/Whisper/) can show them live: [demo.md](demo.md). The text below is the 2026-10-17 state.

**Short answer: before this change, no — except on one demo page.** The owner's guess was right.

## What was saved

- **The sentence that is sent off.** When a finished sentence goes out, `ux/Dictate` posts `{type:"prompt", via:"whisper", text}` to Servex's prompt log (`Dictate.log_prompt`), and it reaches the session's record. That text has already been through the split on the period and the clean-up.
- **The Refine demo only.** `ext/Refine/RefineDemo.js` sets `on_whisper`, so its replies are written to `ai/whisper/<date>.jsonl` (git-ignored) by [`WhisperLog`](WhisperLog.js). Only two day files exist (2026-10-09, 2026-10-12): nobody dictates on that demo page day to day.

## What was lost, on every real surface

The chat composer (`ext/Chat/Mic.js`), the voice strip and the widget never set `on_whisper`. Their Whisper replies were shown for an instant and dropped:

- the **raw text** before the split on the period,
- every **interim** guess,
- the **segment timings**, `avg_logprob` (confidence) and `no_speech_prob` (the chance it was silence), because the request asked for `response_format=json`, which carries the text only.

## Where it belongs (Item, List, Page)

A `Page` extends `Item` and holds any number of lists. The Whisper log is **one more list of lines**: an append-only stream of replies, each line one item. It is a stream beside the page's other lists (its prompts, its cards), not a field on an item. Today it is a single global Servex log, `whisper-raw`, with a `session` field on each line; a per-session copy is a script's job (filter by `session`), never a second writer.

## The save (decided)

Every Whisper reply is appended as one line to the Servex log `whisper-raw` (`POST /log/whisper-raw`: Servex is the single writer, so lines never tear). Finals ask Whisper for `verbose_json` (about 70 ms more, once per sentence) so the segments and confidence are kept; interims stay text only so the live loop is not slowed. A switch, `Dictate.prototype.log_raw`, turns it off. Alternative rejected: a `whisper.jsonl` written from the browser beside each session's `page.jsonl` (`FsFile.append`): it goes through the dev server, a second writer, and it does not exist on the static site.

How it is built and proven: "How it is saved" below. The log table that reads the day file is [Whisper log](/framework/audio/Whisper/log/); doc: `doc/whisper-log.md`.

## How it is saved (landed 2026-10-17)

- **One method.** `Dictate.log_whisper()` in [`ux/Dictate/Dictate.js`](/framework/ux/Dictate/Dictate.js) runs after every `transcribe()` and posts one line to Servex, fire and forget, never awaited, never throws (it reuses `post_prompt`). Every surface that extends `Dictate` gets it: the chat composer, the voice strip, the widget, the Refine demo.
- **The log is named `whisper-raw`**, not `whisper`: Servex already keeps a `whisper` log of the Whisper server's own console output. Read it with `GET http://127.0.0.1:8090/log/whisper-raw?n=20`.
- **A line** is `{type:"whisper", kind:"interim"|"final", ms, text, raw, bytes, seconds, req, segment, session, segments?}`. `raw` is the reply before the split on the period; `segments` (finals only) holds `start, end, text, avg_logprob, no_speech_prob`.
- **Finals** ask Whisper for `verbose_json`; interims stay `json`, so the live loop is no slower. Set `Dictate.prototype.log_raw = false` to switch it all off.
- **Not a replacement for the debug day file.** The Refine demo's `ai/whisper/<date>` file (git-ignored, written through the dev server) is unchanged; this is a second, always-on copy through the single writer.
- **Session.** `session` is `this.session` when a surface sets one (`ComposerMic` does); it is empty on the plain demo page. A per-session file is a script that filters by it.
- **Proof.** [`raw-log-proof.mjs`](/framework/audio/Whisper/doc/raw-log-proof.mjs) talks the jfk recording into the fake mic on the Dictate page and reads the log back: 7 lines, the final carried 2 segments. The first interim and the final are in [`proof-raw-log-2026-10-17.json`](/framework/audio/Whisper/doc/proof-raw-log-2026-10-17.json).

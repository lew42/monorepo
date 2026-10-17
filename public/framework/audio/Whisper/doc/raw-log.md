# Is the raw Whisper reply saved? (checked 2026-10-17)

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

A `Page` extends `Item` and holds any number of lists. The Whisper log is **one more list of lines**: an append-only stream of replies, each line one item. It is a stream beside the page's other lists (its prompts, its cards), not a field on an item. Today it is a single global Servex log, `whisper`, with a `session` field on each line; a per-session copy is a script's job (filter by `session`), never a second writer.

## The save (decided)

Every Whisper reply is appended as one line to the Servex log `whisper` (`POST /log/whisper`: Servex is the single writer, so lines never tear). Finals ask Whisper for `verbose_json` (about 70 ms more, once per sentence) so the segments and confidence are kept; interims stay text only so the live loop is not slowed. A switch, `Dictate.prototype.log_raw`, turns it off. Alternative rejected: a `whisper.jsonl` written from the browser beside each session's `page.jsonl` (`FsFile.append`): it goes through the dev server, a second writer, and it does not exist on the static site.

How it is built and proven: see "How it is saved" below once it lands. The log table that reads the day file is [Whisper log](/framework/audio/Whisper/log/); doc: `doc/whisper-log.md`.

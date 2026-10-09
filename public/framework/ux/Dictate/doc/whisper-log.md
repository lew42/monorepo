# Whisper log, and where the period comes from (2026-10-09)

**What it is.** `WhisperLog` (`ux/Dictate/WhisperLog.js`) shows every answer Whisper gives: each grey interim guess and each final chunk, with a time and how long Whisper took. It is on the [Refine](/framework/ext/Refine/) page, under the class card. Dictate calls `on_whisper({kind, ms, text, raw})` from `transcribe()`, the one place Whisper's reply passes; `WhisperLog.record()` appends it to `/framework/ai/whisper/<date>.jsonl`; the view tails that file with `JSONL.live()`. Nothing is written unless a page wires `on_whisper`.

**The period.** Nothing in our path adds one. `transcribe()` returns Whisper's own text with only whitespace collapsed (newlines between Whisper's segments become spaces). So a sentence-ending period comes from **Whisper itself**: it punctuates as it transcribes, and the grey interim guess shows it too. Check it yourself: the log keeps `raw`, exactly what whisper-server sent, before our tidy-up. The one other stage that could change text is Refine's `clean()` (an LLM step, only after you press Refine), which never touches the box.

**If you do not want the period.** Options, not built: strip a trailing `.` in `transcribe()` (cheap, but also drops real ends), or pass whisper-server a prompt without punctuation. Owner's call, so left as is.

**Streaming later.** The log is already a stream (JSONL append + `live()`); Refine's own stream can use the same file shape.

# Whisper debug log — read the actual log file for the whisper process

The owner's own old idea, rebuilt with `Logger`/`LogView`: run a real `Transcriber.Whisper`
against a saved clip (no mic needed), and turn every tick into a nested card — the seconds of
audio sent, the raw whisper-server text, what agreed and committed, and the seam a forced
commit leaves.

See it: [/framework/core/Page/card/log/whisper/](/framework/core/Page/card/log/whisper/)

## Use

Load the page and click **Start with this clip** — the JFK clip plays in real time through
`ClipMic` (a fake microphone reading a WAV file), `Transcriber.Whisper` transcribes it every
second, and the log fills in live. **Use the mic instead** does the same with a real
microphone. **Download JSONL** saves the run; the file picker below it reads one back for
comparison.

## Watch out

- **`audio/**` and `ux/Dictate/**` are read-only here** — `ClipMic` and `Instrument.js` only ever call them, never edit them; the substitution mechanism is [doc/clipmic.md](doc/clipmic.md).
- **This page deliberately logs partial guesses**, which a real dictation UI never would — the owner's own ask for this debug tool, never copy the pattern into a production listener.
- **A forced commit's group is always labelled "a seam"**, even `Whisper.stop()`'s own final flush — [doc/clipmic.md](doc/clipmic.md) has why.
- **The CSS prefix here is `log-whisper-*`, not `whisper-*`** — this page nests inside `core/Page/card/log/`, not a namespace of its own.

## More

- [doc/clipmic.md](doc/clipmic.md) — how a WAV file becomes a fake microphone, and the
  instrumentation that turns `Transcriber.Whisper`'s calls into one log group per tick
- [../readme.md](../readme.md) — `Logger`/`LogView`, the module this page is built on
- [`Instrument.js`](Instrument.js) — the wiring, read top to bottom
- [`audio/Transcriber/`](/framework/audio/Transcriber/) — the engine this page runs, unmodified

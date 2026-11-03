# ClipMic and the tick-by-tick log

One topic: how a saved WAV file becomes a fake microphone, and how each of `Transcriber.
Whisper`'s ticks becomes one log group. Both files only ever CALL `audio/**` — neither edits
it; that tree is read-only for this task, owned by another one.

## ClipMic: a WAV file playing into the real worklet pipeline

`MicStream.start()` does four things: open a real microphone (`getUserMedia`), build an
`AudioContext` + the `lew42-pcm` worklet, connect the microphone's stream into that worklet, and
wire the worklet's messages into `this.chunks` (the buffer `snapshot()` / `cut()` / `cut_at()`
read). `ClipMic` wants every one of those EXCEPT the first — it isn't a real microphone.

Rather than copy the last three steps (which would silently drift the first time `MicStream.js`
changes), `ClipMic.start()`:

1. Decodes the clip (`fetch` + `AudioContext.decodeAudioData`) into an `AudioBuffer`.
2. Plays it into a `MediaStreamDestinationNode` — this produces a REAL `MediaStream`, the exact
   type `getUserMedia` would have handed back, just sourced from a file instead of hardware.
3. Stands in for `navigator.mediaDevices.getUserMedia` — for the one call `MicStream.start()`
   makes, and only while that call is in flight — so `super.start()` runs its own, real,
   UNMODIFIED code and never knows the "microphone" was a file.

The clip only starts playing AFTER `super.start()` returns (the worklet has to exist before
audio reaches it, or the first fraction of a second is lost into a graph that isn't wired up
yet — caught and fixed while building this).

`stop()` adds one thing `MicStream.stop()` doesn't need: stopping the clip's own
`AudioBufferSourceNode` and closing the decode context, on top of everything `super.stop()`
already does.

## Instrument.js: one group per tick

`instrument_whisper(whisper)` replaces three of the instance's own methods — `tick`,
`transcribe`, `commit_all` — with wrappers that open a `Logger` group around the real call, and
composes one more listener onto `on_final` (the same pattern `Transcriber.Transcript` and
`Transcriber.View` already use on this class). It does NOT edit `Whisper.js` — every wrapper
calls the ORIGINAL method it replaced (captured before replacing it), so the engine's own logic
never changes, only what gets logged around it.

- **A skipped tick is one muted line, never a group.** `tick()` itself returns early twice —
  already sending, or not loud enough — and the wrapper checks the exact same two conditions
  BEFORE deciding whether to open a group, so a quiet stretch of audio doesn't fill the log with
  empty ticks.
- **`transcribe()` nests inside `tick()`'s group automatically** — it's called FROM `tick()`,
  and `Logger`'s groups are a simple stack, so no special wiring makes that happen. Its own
  group duration (a plain `LogView` feature, not built for this page) IS "the ms the request
  took" the brief asked for.
- **"Committed" logs from exactly ONE place: the `on_final` hook** — not from `commit_all`'s own
  wrapper — so an agreement commit (the common case, called straight from `tick()`) and a forced
  one (called from `commit_all()`, nested one level deeper) never both log the same line twice.
  Either way `on_final` fires while the right group is still open, so the line always nests
  under whichever call actually produced it.
- **`entry.id` on the tick group** (`whisper-tick-N`) is what lets a click on a transcript seam
  (`Transcript.js`) jump straight to it — `LogView` reads `entry.id` and sets it as the real
  DOM id of that tick's `<details>`, so it's a plain `<a href="#whisper-tick-N">`, no script.

## Watch out

- **"Words agreed" is a word-count of the committed text**, not whisper_streaming's own
  agreement-length number (that's a local, unexported function inside `Whisper.js`) — close
  enough for a debug reading, not exact to the character.
- **A forced commit's group is always labelled "a seam"**, even the one call `stop()` makes on
  its own final flush — not really about `window_s` there, but it's one line, at the very end of
  a run, and not worth a second label for.

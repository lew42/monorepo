# MicStream — opens a microphone, hands out its stream, samples and level

`new MicStream()` opens one microphone (a `device_id`, else `ux/Dictate`'s remembered pick,
else the system default) and gives three things out to anyone who wants them:

- **`mic.stream`** — the live `MediaStream`, for `Recorder`'s `MediaRecorder` or an
  `<audio>` element.
- **The raw samples** — 16kHz mono `Float32Array` chunks off `pcm-worklet.js`, buffered in
  `mic.chunks`. `mic.snapshot()` copies everything since `start()` or the last `cut()`;
  `mic.wav(samples)` turns a snapshot into a 16-bit WAV `Blob`, the shape whisper-server reads.
- **`mic.on_level(fn)`** — a live 0..1 level, smoothed, fired on every audio frame. Returns an
  unsubscribe function. `LevelMeter` and `Transcriber.Whisper` both subscribe to this instead
  of reading the microphone themselves.

## Use

```js
import MicStream from "/framework/audio/MicStream/MicStream.js";

const mic = new MicStream();          // or { device_id, device_label }
const off = mic.on_level(level => …); // 0..1
await mic.start();
mic.stop();
off();
```

`mic.icon_view` / `.row_view` / `.panel_view` — its live state (a mic glyph, connected/clipping
flags, the device label and level; panel adds every other property, `chunk_levels` included).
`quietest_split()` / `cut_at()` are what `Transcriber.Whisper` uses to cut a forced segment at a
quiet instant instead of mid-word — see `../doc/decisions.md`, "Seams".

## Watch out

- **This is a copy of `ux/Dictate/capture.js`, not an import of it.** `Dictate.js` and
  `capture.js` were another minion's fence while this was built (2026-09-29) — see
  `../doc/decisions.md`. If a caller only needs the SAME thing `capture.js` already does, this
  is the audio/ shaped version of it.
- **The buffer is `keep: true` by default** — set `mic.keep = false` for a `LevelMeter`-only
  caller that never wants the samples copied.
- `MicStream.track` / `MicStream.instances()` are wired (`core/track/track.js`) — every open
  `MicStream` on the page is findable, dead ones drop out on their own.

## More

- [Overview](/framework/audio/MicStream/) — the live demo
- [`../readme.md`](../readme.md) — the audio/ library
- [`../doc/decisions.md`](../doc/decisions.md) — what got extracted vs. rebuilt

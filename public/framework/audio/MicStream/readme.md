# MicStream — opens a microphone, hands out its stream, samples, level, device choice and hold/toggle-to-talk

`new MicStream()` opens one microphone (a `device_id`, else `ux/Dictate`'s remembered pick,
else the system default) and gives everything else in `audio/` out to anyone who wants it:

- **`mic.stream`** — the live `MediaStream`, for `Recorder`'s `MediaRecorder` or an
  `<audio>` element.
- **The raw samples** — 16kHz mono `Float32Array` chunks off `pcm-worklet.js`, buffered in
  `mic.chunks`. `mic.snapshot()` copies everything since `start()` or the last `cut()`;
  `mic.wav(samples)` turns a snapshot into a 16-bit WAV `Blob`, the shape whisper-server reads.
- **`mic.on_level(fn)`** — a live 0..1 level, smoothed, fired on every audio frame. Returns an
  unsubscribe function. `Transcriber.Whisper` and `MicStream.Controls`' own level bar both
  subscribe to this instead of reading the microphone themselves.
- **`mic.devices()` / `mic.pick(id, label)`** — list every microphone, choose one. `pick()`
  remembers the choice the same way `ux/Dictate` does, so it moves every `MicStream` on the site.
- **`mic.mode` (`"hold"` | `"toggle"`) + `mic.press()`/`.release()`/`.toggle()`** — hold-to-talk
  or click-to-start/stop, without a separate class watching from outside.

**2026-09-30: this used to be three classes** (`MicPicker`, `LevelMeter`, `PushToTalk`) — merged
in because neither of the latter two ever had any logic of their own (they just called
`start()`/`stop()` on whatever `MicStream` they were handed), and `MicPicker`'s device logic is a
natural `MicStream` setting. The three old classes still work — `../v1/` — see
`../doc/decisions.md`'s last entry.

## Use

```js
import MicStream from "/framework/audio/MicStream/MicStream.js";

const mic = new MicStream();          // or { device_id, device_label, mode: "toggle" }
const off = mic.on_level(level => …); // 0..1
await mic.start();
mic.stop();
off();
```

`new MicStream.Controls({ subject: mic })` draws the device picker, the level bar and a
hold/toggle button together — the one place all three old classes' UI lives now (pass
`show_picker: false` or `show_level: false` to turn a piece off).

`mic.icon_view` / `.row_view` / `.panel_view` — its live STATE (a mic glyph, connected/clipping
flags, the device label and level; panel adds every other property, `chunk_levels` included) —
separate from `MicStream.Controls` above, the same split `Recorder`'s `.row_view` vs.
`Recorder.Controls` already had.
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

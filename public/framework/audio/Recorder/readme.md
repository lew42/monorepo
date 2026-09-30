# Recorder — record, play back, save

`MediaRecorder` is the whole engine — this only remembers the state (`idle` → `recording` →
`recorded`) and turns the finished chunks into a downloadable file.

## Use

```js
import Recorder from "/framework/audio/Recorder/Recorder.js";

const rec = new Recorder();
rec.start(stream);   // any live MediaStream
rec.stop();
rec.save("take-1.webm");
```

## Watch out

- `Recorder.View`'s Record button opens its OWN plain `getUserMedia` mic when nothing wires
  `on_record` — so `Recorder` alone is a working demo. The Sound recorder assembly overrides
  `on_record` to use the shared `MicPicker`/`MicStream` instead.

## More

- [Overview](/framework/audio/Recorder/) — the live demo
- [`../readme.md`](../readme.md) — the audio/ library · [Sound recorder](/framework/audio/sound-recorder/)

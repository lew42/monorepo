# LevelMeter — a live level bar for any MicStream

`watch(mic)` points it at a `MicStream`; `mic.on_level()` drives the bar's `--level` custom
property directly, so a fast-moving meter never triggers layout, only paint.

## Use

```js
import LevelMeter from "/framework/audio/LevelMeter/LevelMeter.js";

const meter = new LevelMeter().watch(mic);   // mic: a MicStream
meter.view;
meter.stop_watching();
```

## More

- [Overview](/framework/audio/LevelMeter/) — the live demo
- [`../readme.md`](../readme.md) — the audio/ library

# PushToTalk — hold to talk

Holds a button or a key open a `MicStream`; releasing it closes the mic. Emits `on_start(stream)`
/ `on_stop()` so a caller (a `Recorder`, a listener panel, a `Transcriber`) never has to know how
the mic got opened.

## Use

```js
import PushToTalk from "/framework/audio/PushToTalk/PushToTalk.js";

const ptt = new PushToTalk({ key: " " });   // spacebar
ptt.on_start = stream => …;
ptt.on_stop = () => …;
await ptt.press(mic);   // mic: a MicStream
ptt.release();
```

`PushToTalk.View` needs a `mic_factory` (`() => new MicStream()`) so it can open a fresh mic
per press without the caller wiring every click by hand.

## More

- [Overview](/framework/audio/PushToTalk/) — the live demo
- [`../readme.md`](../readme.md) — the audio/ library · [Push-to-talk stream](/framework/audio/push-to-talk/)

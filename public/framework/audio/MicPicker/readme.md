# MicPicker — the microphone chooser

Lists every `audioinput` device Chrome can see and remembers the pick with `ux/Dictate`'s own
`remember_device()` (same storage key as `MicStream`'s remembered default) — pick a microphone
here and `MicStream`, `Dictate`, and every other `MicPicker` on the site all move to it.

## Use

```js
import MicPicker from "/framework/audio/MicPicker/MicPicker.js";

const picker = new MicPicker({ on_pick(id, label){ … } });
await picker.devices();   // [{ deviceId, label, kind }, …]
picker.pick(id, label);
```

## Watch out

- Device **labels** are blank until some permission has been granted on the page — before that
  the picker shows "Microphone 1", "Microphone 2" instead of real names.
- `MicPicker.View` picks the first device automatically if nothing is remembered yet, so a fresh
  page always has SOME mic selected rather than none.

## More

- [Overview](/framework/audio/MicPicker/) — the live demo
- [`../readme.md`](../readme.md) — the audio/ library

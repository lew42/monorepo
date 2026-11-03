# Sound recorder — MicPicker + LevelMeter + Recorder

Three independent `audio/` classes, wired by this one page: `MicPicker` chooses the device,
`LevelMeter` watches its level, `Recorder` records, plays back and saves. None of the three
classes knows the other two exist — see [`page.js`](page.js) for the whole wire, about 20 lines.

## More

- [Overview](/framework/audio/sound-recorder/) — the live demo
- [`../readme.md`](../readme.md) — the audio/ library

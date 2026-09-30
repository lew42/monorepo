# Push-to-talk stream — Discord-style, local only

`PushToTalk` opens a `MicStream` while its button (or Space) is held, and hands the raw
`MediaStream` to whoever is listening through `on_start(stream)` / `on_stop()`.

**Local only, on purpose.** The "listener" panel here plays the exact same `MediaStream`
object through an `<audio srcObject>` element — proving the wiring (hold → stream → play)
without a second machine. A real cross-machine version replaces that one line with a WebRTC
`RTCPeerConnection` sending the track to another browser; `PushToTalk` itself would not change —
only what its caller does with the stream it hands out.

## More

- [Overview](/framework/audio/push-to-talk/) — the live demo
- [`../readme.md`](../readme.md) — the audio/ library · [PushToTalk](/framework/audio/PushToTalk/)

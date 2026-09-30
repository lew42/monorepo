# audio/v1 — the six-class version, kept for comparison

This is `audio/` as it was before 2026-09-30: six small classes — **MicPicker**, **LevelMeter**
and **PushToTalk** here, plus **MicStream**, **Recorder** and **Transcriber**, which still live at
the top of `audio/` because they didn't change shape. [MicStream](../MicStream/) now absorbs what
the three classes in this folder used to do on their own — device choice, the level bar, and
hold-to-talk — see [`../readme.md`](../readme.md) for the current, three-tool version and its one
live demo.

Nothing here is broken or unmaintained: `MicPicker`, `LevelMeter` and `PushToTalk` still work
exactly as before, they just call into `MicStream`'s own copy of the same code now instead of
carrying it themselves — so there is still only one implementation, in two places you can use it
from.

## Watch out

- **`MicPicker`, `LevelMeter`, `PushToTalk` were MOVED here from `audio/`, not copied** — their
  files live at `v1/MicPicker/`, `v1/LevelMeter/`, `v1/PushToTalk/` now, and every relative import
  inside them was updated for the new depth. `MicStream` and `Recorder` were NOT moved; every page
  in here that needs one imports it from `../../MicStream/` / `../../Recorder/`.
- `MicPicker.devices()` / `.pick()` now call `MicStream`'s own methods internally
  (`MicStream.prototype.devices.call(this)`) rather than enumerating devices themselves.

## More

- [`../readme.md`](../readme.md) — the current audio/ library and its live demo
- [`../doc/decisions.md`](../doc/decisions.md) — what got extracted vs. rebuilt

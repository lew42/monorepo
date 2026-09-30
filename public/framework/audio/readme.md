# audio — a library of pure audio parts

Six small classes, each a build block for anything with a microphone: **[MicStream](./MicStream/)**
opens the mic and hands out its stream, raw samples and level; **[MicPicker](./MicPicker/)** chooses
which one; **[LevelMeter](./LevelMeter/)** shows how loud it is; **[Recorder](./Recorder/)** records,
plays back and saves a clip; **[PushToTalk](./PushToTalk/)** opens the mic only while held;
**[Transcriber](./Transcriber/)** turns a stream into text, with Whisper or Chrome as the engine.

None of this is AI. Sending text to an LLM to clean it up (the "refinement" step) is a separate,
later job — see [the audio task](/framework/ai/2026-09-29/audio/), ask 2. `ux/Dictate` is the whole assembled system (mic → transcription → refinement → a text box);
these parts are what it — and anything else with a microphone — is built from.

## The three assemblies on this page

The same six parts, recombined three ways, each its own routed child page:

- **[Sound recorder](./sound-recorder/)** — MicPicker + LevelMeter + Recorder.
- **[Push-to-talk stream](./push-to-talk/)** — hold to talk (Discord-style); local only, the
  "listener" hears the live `MediaStream` through an `<audio>` element (no WebRTC — see that
  page's readme for why).
- **[Mic → Whisper → text](./mic-to-text/)** — MicStream + `Transcriber.Whisper`, showing the
  partial guess and the settled text.

## Watch out

- **`Transcriber.Whisper` and `Transcriber.Browser` are attached to `Transcriber` by
  `Transcriber/index.js`, not by `Transcriber.js` itself** — importing `Whisper.js` or
  `Browser.js` FROM `Transcriber.js` would be a real import cycle (`class Whisper extends
  Transcriber` reads `Transcriber` before it exists yet). Import `Transcriber/index.js` to get
  both engines in one shot; import `Transcriber.js` alone for just the base shape.
- **`MicStream` and `MicPicker` share ONE remembered microphone with `ux/Dictate`** —
  `DEVICE_KEY`/`remembered_device`/`remember_device`, imported from `ux/Dictate/Dictate.js`
  rather than redeclared, so a pick made here moves Dictate's mic too and the other way around.
- **`MicStream`'s buffer (`snapshot()`/`cut()`/`loudness()`/`wav()`) is a copy of
  `ux/Dictate/capture.js`**, not an import of it — that file, and `Dictate.js`, were another
  minion's fence while this was built (2026-09-29). `Transcriber.Whisper`'s silence rule (a
  segment under 120ms of real speech is never sent) is the same copy.
- **Every class is a plain model with a `static View`** (the item-ui pattern, `code` skill §9) —
  `thing.view` draws it; `track(Klass)` lets a page list every live instance
  (`Klass.instances()`). None of the six are `View` subclasses themselves, so
  `Transcriber.Whisper` works headless (no DOM) exactly the way a page that only shows text needs.

## More

- [`doc/decisions.md`](doc/decisions.md) — what got extracted vs. rebuilt, and why the three
  assemblies use `<audio>` rather than WebRTC for the push-to-talk "listener".
- Files: one folder per class (`MicStream/`, `MicPicker/`, `LevelMeter/`, `Recorder/`,
  `PushToTalk/`, `Transcriber/`), each with its class file, `page.js`, `readme.md`.

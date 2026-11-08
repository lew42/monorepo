# audio — three building blocks for anything with a microphone

Three small classes, each a build block: **[MicStream](./MicStream/)** opens the microphone and
hands out its live stream, raw samples, level, and now also device choice and
hold/toggle-to-talk (`mode`); **[Recorder](./Recorder/)** records, plays back and saves a clip;
**[Whisper](./Whisper/)** is the whisper-server as an object plus a log per dictation surface.

**[Transcriber](./Transcriber/)** turns a stream into text, with Whisper or Chrome as the engine.

The output half: **[Voice](./Voice/)** is one voice (a persona) that turns a sentence into speech, and
**[Recite](./Recite/)** reads a whole reply aloud with a playhead and pauses when you talk. The local
voice runs on recite-server (Kokoro, on the CPU), which Servex supervises beside whisper-server
(`Servex/ext/recite/readme.md`).
The [live demo at the top of this page](./) shows all three working together — pick a mic, talk,
watch the transcript settle, optionally record.

Watch out: ux/Dictate does not use Transcriber today; it sends audio to whisper-server on its own path (ux/Dictate/doc/architecture.md), so there are two engines where one should be (law 6). Decision pending.

None of this is AI. Sending text to an LLM to clean it up (the "refinement" step) is a separate,
later job — see [the audio task](/framework/ai/sessions/2026/09/29/audio/audio/), ask 2. `ux/Dictate` is the
whole assembled system (mic → transcription → refinement → a text box); these three are what it
— and anything else with a microphone — is built from.

## The web API each one wraps

| Tool | Browser API |
|---|---|
| MicStream | `getUserMedia()` for the stream, an `AudioWorkletNode` (`pcm-worklet.js`) for raw samples, `enumerateDevices()` for the device list |
| Recorder | `MediaRecorder` |
| Transcriber | `fetch()` to a local whisper-server, or the browser's own `SpeechRecognition` (`Transcriber.Browser`) |

## How `ux/Dictate` assembles them

```
   MicStream  ──stream──▶  Recorder   (optional — records the SAME stream)
       │
       └──stream+samples──▶  Transcriber.Whisper  ──text──▶  (refinement, later)
```

One `MicStream` is opened once; `Recorder` and `Transcriber` both just read from it — nothing
opens a second microphone. `ux/Dictate` is not rebuilt on these yet (that is ask 2 of
[the audio-consolidate task](/framework/ai/sessions/2026/09/30/108a1b36-ed02-4728-bf82-20d7d7053d85/audio-consolidate/), handed to a sibling
minion working on `ux/Dictate/` at the same time as this one) — today `MicStream`'s buffer code is
still a COPY of `ux/Dictate/capture.js`, not an import of it (`doc/decisions.md`, "Extracted vs.
rebuilt"). Once Dictate is rebuilt on `MicStream` + `Transcriber`, that copy retires.

## Three become one: what changed 2026-09-30

Six classes are now three. `MicPicker` (device choice), `LevelMeter` (the level bar) and
`PushToTalk` (hold-to-talk) are absorbed into `MicStream` itself — `mic.devices()` / `mic.pick()`,
`mic.level`, and `mic.mode` (`"hold"` | `"toggle"`) + `mic.press()`/`.release()`/`.toggle()`.
`MicStream.Controls` is the one view that draws the picker, the bar and the mode button together.
The old six-class version — same classes, same three demo pages, unchanged — is still clickable at
**[v1](/framework/audio/v1/)** for comparison; see `doc/decisions.md`'s last entry for the full reasoning.

## Watch out

- **`Transcriber.Whisper` and `Transcriber.Browser` are attached to `Transcriber` by
  `Transcriber/index.js`, not by `Transcriber.js` itself** — importing `Whisper.js` or
  `Browser.js` FROM `Transcriber.js` would be a real import cycle (`class Whisper extends
  Transcriber` reads `Transcriber` before it exists yet). Import `Transcriber/index.js` to get
  both engines in one shot; import `Transcriber.js` alone for just the base shape.
- **`MicStream` shares ONE remembered microphone with `ux/Dictate`** —
  `DEVICE_KEY`/`remembered_device`/`remember_device`, imported from `ux/Dictate/Dictate.js`
  rather than redeclared, so a pick made here moves Dictate's mic too and the other way around.
- **`MicStream`'s buffer (`snapshot()`/`cut()`/`loudness()`/`wav()`) is a copy of
  `ux/Dictate/capture.js`**, not an import of it — see "How `ux/Dictate` assembles them" above.
  `Transcriber.Whisper`'s silence rule (a segment under 120ms of real speech is never sent) is the
  same copy.
- **Every class is a plain model with a `static View`** (the item-ui pattern, `code` skill §9) —
  `thing.view` draws it (icon/row/panel state); `track(Klass)` lets a page list every live
  instance (`Klass.instances()`). `MicStream.Controls` / `Recorder.Controls` /
  `Transcriber.Transcript` are the separate INTERACTIVE views (buttons, pickers, the transcript
  text) — a demo wires a state view and a controls view side by side, same pattern both had
  before this task.

## Map

Every file, one line each: [map.md](./map.md).

**How it connects:** the mic-in chain is "How `ux/Dictate` assembles them" above; here is the output half, speech back out:
- `Recite.shared.from_wire(ev)` (`Recite/Recite.js:319`) ← `ux/Dictate/chat.js:439` (the smart seat's reply, streaming) and `:365` (the file-poll/wire fallback) — the one reader every chat view shares
- `Recite.read()` / `.queue()` → `Voice.render(text, url)` (`Voice/Voice.js`) → a WAV from recite-server (Kokoro), or `Voice.speak()` (the browser fallback)
- `Transcriber.Whisper` (`Transcriber/Whisper.js:9`, the timeout wrapper on `fetch()`) reads an already-started `MicStream`'s buffer (`mic.snapshot()` / `mic.cut()`) and sends it to the local whisper-server
- `MicStream.start()` → `navigator.mediaDevices.getUserMedia()` (`MicStream/MicStream.js:78`) is the one mic-open call every class here shares; `ux/Dictate/capture.js:46` keeps its own copy (not an import)

**Design:** [doc/decisions.md](doc/decisions.md) (what got extracted vs. rebuilt, the six-to-three consolidation).

## Search terms

The words that find this module's past work (counts: `sessions N files · M commits`, from `git grep -c -i '<term>' -- public/framework/ai/sessions | wc -l` and `git log --oneline -S '<term>' | wc -l`; raw output in [terms.txt](/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/readme-maps-dictate/terms.txt)):

- `MicStream` (sessions 101 files · 99 commits)
- `whisper-server` (sessions 211 files · 169 commits)
- `Transcriber` (sessions 120 files · 97 commits)
- `Recite` (sessions 267 files · 259 commits) — too common alone; pair it with a verb
- `BargeIn` (sessions 60 files · 74 commits)
- `push-to-talk` (sessions 179 files · 145 commits) — the old class, folded into `MicStream`
- `audio-consolidate` (sessions 152 files · 156 commits) — the task that built the six-to-three merge
- `recite-server` (sessions 22 files · 33 commits)
- `persona` (sessions 111 files · 114 commits)
- `WhisperLog` (sessions 70 files · 86 commits)
- `phantom-phrases` (sessions 6 files · 8 commits)
- `karaoke` (sessions 19 files · 32 commits) — the read-aloud highlight

## More

- [`doc/decisions.md`](doc/decisions.md) — what got extracted vs. rebuilt, the push-to-talk
  `<audio>` choice, and the six-to-three consolidation
- [v1](/framework/audio/v1/) — the old six-class version, kept clickable for comparison
- Files: one folder per class (`MicStream/`, `Recorder/`, `Transcriber/`), each with its class
  file, `page.js`, `readme.md`


## Known issue (2026-10-09)
The owner reports the `Transcriber` page layout "is all broken". Not investigated yet (noted only; the Refine task fenced it). Look at `Transcriber/page.js` at 1400 and 400 wide first.

## Also here (readme audit, 2026-10-13)
- [mic-to-text](./mic-to-text/)
- [sound-recorder](./sound-recorder/)

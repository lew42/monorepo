# Map: audio/

The microphone-and-speech building blocks `ux/Dictate` (and anything else with a mic) is built from. Model: [core/Item/readme.md](/framework/core/Item/readme.md)'s Map, commit `59fcd6650`.

## audio/

| File | What it does |
|---|---|
| [Part.js](./Part.js), [Part.css](./Part.css) | the shared base every class here extends: the item-ui model + `static View` pattern (`code` skill §9) |
| [page.js](./page.js), [audio.css](./audio.css) | this folder's own landing page and its styles |
| [MicStream/](./MicStream/readme.md) | opens the microphone, hands out the live stream, raw samples, level, device choice, hold/toggle-to-talk |
| [Recorder/](./Recorder/readme.md) | records, plays back and saves a clip from an existing stream |
| [Transcriber/](./Transcriber/readme.md) | turns a stream into text, Whisper or the browser's own engine |
| [Whisper/](./Whisper/readme.md) | the whisper-server as an object, plus a log per dictation surface |
| [Voice/](./Voice/readme.md) | one voice (a persona) that turns a sentence into speech |
| [Recite/](./Recite/readme.md) | reads a whole reply aloud with a playhead, pauses when you talk |
| [v1/](./v1/) | the old six-class version (`MicPicker`, `LevelMeter`, `PushToTalk` folded into `MicStream`; `MicStream`/`Recorder`/`Transcriber` unchanged there), kept clickable for comparison |
| [MicPicker/](./MicPicker/), [LevelMeter/](./LevelMeter/), [PushToTalk/](./PushToTalk/) | the three classes `MicStream` absorbed (2026-09-30); kept only inside `v1/` logic, these top-level folders are their pre-merge originals |
| [mic-to-text/](./mic-to-text/), [sound-recorder/](./sound-recorder/), [push-to-talk/](./push-to-talk/) | older, pre-consolidation demo folders (lower-case names); superseded by `MicStream/`, `Recorder/`, `Transcriber/` |
| [tasks/](./tasks/) | this module's own task folders |
| [doc/](#doc) | the design docs (below) |
| [files.jsonl](./files.jsonl), [weight.jsonl](./weight.jsonl) | this folder's file census and page weight |
| [readme.md](./readme.md) | this module's index |

## doc

| File | What it does |
|---|---|
| [decisions.md](./doc/decisions.md) | what got extracted vs. rebuilt, the push-to-talk `<audio>` choice, and the six-to-three consolidation |
| [file/](./doc/file/) | a stray generated folder (`Part.js.md`, `files.jsonl`) — looks like an old doc-tool misfire, not a real doc; left alone, see `orphans.txt` |

## MicStream/

| File | What it does |
|---|---|
| [MicStream.js](./MicStream/MicStream.js), [MicStream.css](./MicStream/MicStream.css) | `class MicStream extends Part`: `getUserMedia()` (`MicStream.js:78`), device list, level, `mode` (hold/toggle), `.Controls` view |
| [pcm-worklet.js](./MicStream/pcm-worklet.js) | the `AudioWorkletProcessor` that hands back raw PCM samples |
| [page.js](./MicStream/page.js) | this class's demo page |
| [doc/micstream-notes.md](./MicStream/doc/micstream-notes.md) | design notes |
| [improvements.jsonl](./MicStream/improvements.jsonl), [files.jsonl](./MicStream/files.jsonl) | skill-improvement notes; file census |
| [readme.md](./MicStream/readme.md) | this class's index |

## Recorder/

| File | What it does |
|---|---|
| [Recorder.js](./Recorder/Recorder.js), [Recorder.css](./Recorder/Recorder.css) | `class Recorder extends Part`: wraps `MediaRecorder` — records, plays back and saves a clip from an existing stream |
| [page.js](./Recorder/page.js) | this class's demo page |
| [files.jsonl](./Recorder/files.jsonl) | file census |
| [readme.md](./Recorder/readme.md) | this class's index |

## Transcriber/

| File | What it does |
|---|---|
| [Transcriber.js](./Transcriber/Transcriber.js) | the base class: shared shape both engines extend |
| [Whisper.js](./Transcriber/Whisper.js) | `class Transcriber.Whisper`: `fetch()` to a local whisper-server, with a timeout wrapper (`:9`) |
| [Browser.js](./Transcriber/Browser.js) | `class Transcriber.Browser`: the browser's own `SpeechRecognition` engine |
| [WhisperSegments.js](./Transcriber/WhisperSegments.js) | the silence/segment rule shared with `Whisper.js` (a segment under 120ms of real speech is never sent) |
| [index.js](./Transcriber/index.js) | the one door that attaches every engine to `Transcriber` and hands it back whole — import this, not `Transcriber.js` alone, to get both engines |
| [system.js](./Transcriber/system.js) | `ReadmeSystem` — checks this module's readme links resolve |
| [page.js](./Transcriber/page.js) | this class's demo page (layout reported broken 2026-10-09, not yet investigated) |
| [doc/streaming.md](./Transcriber/doc/streaming.md) | design notes |
| [files.jsonl](./Transcriber/files.jsonl) | file census |
| [readme.md](./Transcriber/readme.md) | this class's index |

## Whisper/

| File | What it does |
|---|---|
| [Whisper.js](./Whisper/Whisper.js), [Whisper.css](./Whisper/Whisper.css) | `class Whisper extends Part`: the whisper-server as an object — status, ping, `fetch()` calls |
| [WhisperDemo.js](./Whisper/WhisperDemo.js), [WhisperDemo.css](./Whisper/WhisperDemo.css) | the demo view wiring `Whisper` to `ux/Dictate/Dictate.js` |
| [WhisperLog.js](./Whisper/WhisperLog.js), [WhisperLog.css](./Whisper/WhisperLog.css) | the per-surface raw-reply log view |
| [WhisperLogRows.js](./Whisper/WhisperLogRows.js) (+ `WhisperLogRows.test.mjs`) | the pure half of the log: how to read a list of log lines, no DOM |
| [WhisperSession.js](./Whisper/WhisperSession.js) | one logged session's rows |
| [test-whisper-log.mjs](./Whisper/test-whisper-log.mjs) | a core test for the log |
| [page.js](./Whisper/page.js) | this class's demo page |
| [log/](./Whisper/log/) | the raw-reply bucket this class writes to (`ai/whisper/bucket.jsonl`); its own page |
| [doc/demo.md](./Whisper/doc/demo.md), [doc/raw-log.md](./Whisper/doc/raw-log.md), [doc/whisper-log.md](./Whisper/doc/whisper-log.md) | the demo, the raw-log history, the log's own design |
| [doc/demo-proof.mjs](./Whisper/doc/demo-proof.mjs), [doc/raw-log-proof.mjs](./Whisper/doc/raw-log-proof.mjs) | the proofs behind those two docs |
| [doc/proof-2026-10-16.jsonl](./Whisper/doc/proof-2026-10-16.jsonl), [doc/proof-raw-log-2026-10-17.json](./Whisper/doc/proof-raw-log-2026-10-17.json) | the proof runs' own recorded output |
| [improvements.jsonl](./Whisper/improvements.jsonl), [files.jsonl](./Whisper/files.jsonl) | skill-improvement notes; file census |
| [readme.md](./Whisper/readme.md) | this class's index |

## Voice/

| File | What it does |
|---|---|
| [Voice.js](./Voice/Voice.js), [Voice.css](./Voice/Voice.css) | `class Voice extends Part`: one voice (a persona) that turns a sentence into speech, through recite-server |
| [personas.js](./Voice/personas.js) | the plain data list of voice ids and speeds (54 ids; `GET /recite/voices`) |
| [page.js](./Voice/page.js) | this class's demo page |
| [tasks/](./Voice/tasks/) | this module's own task folders |
| [doc/owner-2026-10-16-voice-conversation.md](./Voice/doc/owner-2026-10-16-voice-conversation.md) | a dictated note |
| [failures.jsonl](./Voice/failures.jsonl), [weight.jsonl](./Voice/weight.jsonl), [files.jsonl](./Voice/files.jsonl) | dev-only error log; page weight; file census |
| [readme.md](./Voice/readme.md) | this class's index |

## Recite/

| File | What it does |
|---|---|
| [Recite.js](./Recite/Recite.js), [Recite.css](./Recite/Recite.css) | `class Recite extends Part`: reads text aloud, the reverse of transcription — splits into sentences, renders each with `Voice`, a playhead |
| [BargeIn.js](./Recite/BargeIn.js) | pauses playback when you talk over it; reads `barge-defaults.js`, uses `MicStream` |
| [barge-defaults.js](./Recite/barge-defaults.js) | `BargeIn`'s starting values, as plain data (readable by a settings plugin with no audio classes loaded) |
| [phantom-phrases.js](./Recite/phantom-phrases.js) | the list of known Whisper hallucinations, pulled out of `BargeIn.js` so a plain test can check it |
| [ReciteBar.js](./Recite/ReciteBar.js) | the playback bar control |
| [ReciteBubble.js](./Recite/ReciteBubble.js), [ReciteBubble.css](./Recite/ReciteBubble.css) (+ `ReciteBubble.test.mjs`) | `Recite.Bubble`: the ▶/⏸ and ↺10 replay control every reply bubble carries |
| [ReciteHighlight.js](./Recite/ReciteHighlight.js) | `Recite.Highlight`: the karaoke playhead — the sentence/word being read lights up where it sits on the page |
| [ReciteTap.js](./Recite/ReciteTap.js) | tap-to-play/pause on the text |
| [Recite.test.mjs](./Recite/Recite.test.mjs), [Recite.order.test.mjs](./Recite/Recite.order.test.mjs), [playback-stutter.test.mjs](./Recite/playback-stutter.test.mjs) | core tests |
| [page.js](./Recite/page.js) | this class's demo page |
| [ai/](./Recite/ai/) | this module's own `ai/log.jsonl` |
| [doc/architecture.md](./Recite/doc/architecture.md), [doc/text-prep.md](./Recite/doc/text-prep.md), [doc/voice-models.md](./Recite/doc/voice-models.md) | the architecture, the text-cleanup rules before speech, the voice-model notes |
| [improvements.jsonl](./Recite/improvements.jsonl), [failures.jsonl](./Recite/failures.jsonl), [files.jsonl](./Recite/files.jsonl) | skill-improvement notes; dev-only error log; file census |
| [readme.md](./Recite/readme.md) | this class's index |

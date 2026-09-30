# Transcriber — an audio stream in, a text stream out

Three engines, one shape: `on_partial(text)` (a still-improving guess — ephemeral, never write
this to disk) and `on_final(text)` (one COMMITTED segment — the only text worth logging). Never
dictation and never refinement — see the top-level [`../readme.md`](../readme.md) for where
those live.

## Use

```js
import Transcriber from "/framework/audio/Transcriber/index.js";   // every engine attached

const t = new Transcriber.Whisper();   // rolling local-agreement window (the default)
// or: new Transcriber.WhisperSegments();   // v1, cut-and-append — kept reachable
// or: new Transcriber.Browser();            // Chrome's SpeechRecognition — leaves the machine

t.on_partial = text => …;   // the growing guess — show it, never log it
t.on_final = text => …;      // committed words — safe to log
await t.start(mic);   // mic: a MicStream, already started (the Whisper engines read its buffer)
t.stop();
```

**`Transcriber.Whisper` (2026-09-29, the owner's design):** no segment ever "closes" — every ~1s
it re-transcribes the whole not-yet-committed buffer, and commits only the words that AGREE with
the previous tick's transcript (whisper_streaming's own "local agreement" idea,
[`doc/streaming.md`](doc/streaming.md)). Measured against the old engine with a real monologue:
0 hallucinations / 0 lost words, vs. 2 hallucinations / 1 lost word for cut-and-append —
[`../doc/decisions.md`](/framework/audio/doc/decisions.md), "Rolling window".

## Its live state, and the actual output — two different things

`t.row_view` / `.panel_view` (the item-ui pattern every `audio/` class carries) show STATE:
which engine, whether it's hearing speech right now, how many segments have settled —
`Whisper.View` adds request latency and whether a request is in flight. The real output (the
growing guess, then the settled lines) is `Transcriber.Transcript`, a separate small view, so a
page can show both side by side (see [Mic → Whisper → text](/framework/audio/v1/mic-to-text/)).

## Watch out

- **Import `index.js`, not `Transcriber.js`, to get both engines.** `Transcriber.js` alone is
  just the base class — `Transcriber.Whisper` / `Transcriber.Browser` are attached by
  `Whisper.js` / `Browser.js` themselves, and pulling either of THOSE in from `Transcriber.js`
  would be a genuine import cycle (`class Whisper extends Transcriber` reading `Transcriber`
  before its own module has finished defining it). [`../doc/decisions.md`](/framework/audio/doc/decisions.md)
  has the reasoning.
- **`Transcriber.Whisper` needs an already-started `MicStream`** — it reads `mic.snapshot()` /
  `mic.cut()` / `mic.loudness()`, the same buffer `ux/Dictate/capture.js` built for exactly this.
  `Transcriber.Browser` opens its own audio through the browser API and ignores `mic` beyond the
  call shape.
- **The silence rule and the annotation filter are copied from `ux/Dictate/Dictate.js`**, not
  imported — same 120ms floor, same `[BLANK_AUDIO]`/`*shriek*` regex.
- **A forced (length-cap) cut used to land mid-word** — fixed, measured, and the fix's own new
  failure mode (a hallucinated sentence, once) is written up honestly in
  [`../doc/decisions.md`](/framework/audio/doc/decisions.md), "Seams".
- **Whether a real streaming engine would do better**: researched, not switched —
  [`doc/streaming.md`](doc/streaming.md).

## More

- [Overview](/framework/audio/Transcriber/) — the live demo, Whisper engine, the three sizes of its state
- [`../doc/decisions.md`](/framework/audio/doc/decisions.md) — extraction, the import-cycle
  reasoning, the seams experiment · [`doc/streaming.md`](doc/streaming.md) — streaming vs. resend, researched
- [`../readme.md`](../readme.md) — the audio/ library · [Mic → Whisper → text](/framework/audio/v1/mic-to-text/)

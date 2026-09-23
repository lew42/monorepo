# Silence — why whisper kept saying "Thank you"

Whisper never answers "I heard nothing". Handed a recording with no speech in it, it
invents the most likely sentence instead, and for the `large-v3-turbo` model running here
that sentence is almost always **"Thank you."** You can prove that in one line, with no
browser involved at all:

```
cd %LOCALAPPDATA%\lew42\whisper

curl -X POST 127.0.0.1:8178/inference -F "file=@silence.wav"
→ {"text":" Thank you.\n"}

curl -X POST 127.0.0.1:8178/inference -F "file=@jfk.wav"
→ {"text":" And so, my fellow Americans, ask not …"}
```

So the server was never the problem. Neither was the microphone. What was wrong is that
`Dictate` was sending it the quiet parts.

## Where the silence came from

Two places, and the owner saw both.

**The tail.** A 700ms pause closes a segment (`pause_ms`), the sentence is committed, and a
**new** segment immediately starts recording — on the silence between the owner's last word
and their reach for the mic button. Pressing the button ran `close_segment()` on that
silence, whisper answered "Thank you.", and it was typed into the box and logged as a prompt.

**The head.** While the owner sits quiet before speaking, `partial_tick()` re-sends the
growing recording every 1.5s (`resend_ms`). Each of those came back "Thank you." and painted
it grey in the caption — which is why the phrase appeared before a word had been said.

## The number that separates the two cases

The obvious test — is this recording loud on average? — does not work. A quiet room with a
single click in it measured **0.043 RMS**, higher than plenty of real speech, because one
pop carries the whole file's energy.

What does work is counting how much of the recording is loud, rather than how loud it is:
`Capture.loudness()` walks the samples in **20ms frames** and returns `loud_ms`, the number
of milliseconds whose frame RMS is above `speech_floor` (0.02). Measured on the real WAVs
the browser actually posted (2026-09-22, [`ai/2026-09-22/dictate-silence/`](/framework/ai/2026-09-22/dictate-silence/)):

| recording | `loud_ms` |
| --- | --- |
| quiet room, all seven segments | 0–20 ms |
| the weakest real 1.58s sentence | 220 ms |
| a full 9s sentence | 4,840 ms |

There is nothing in the gap, so `min_speech_ms` sits at **120**. `Dictate.worth_sending()`
refuses to POST anything under it, and both the tail and the head stop being sent at all.

## Noises that are not speech

Whisper also labels sounds it knows are not words — `*shriek*`, `[BLANK_AUDIO]`,
`(door closes)`, `♪`. A real fan noise in the owner's room came back as `*shriek*` while
this was being proved, passed the loudness gate honestly, and was typed into the box.
`Dictate.annotation()` drops those by their **shape** — wrapped in `*`, `[`, `(` or `♪`, or
punctuation only — rather than by a list of phrases, which would have to grow forever.

## What the sound path was actually doing (all fine)

Worth writing down, because the obvious suspects were all checked and all innocent:

- Chrome **honours** `new AudioContext({ sampleRate: 16000 })` on this machine, even though
  the microphone itself runs at 48000 — the browser does the resampling, exactly as
  `capture.js` assumes. `Capture.rate()` now reads the rate back anyway and writes *that*
  into the WAV header, because a browser is allowed to refuse and a header claiming 16000
  over 48000Hz samples plays back three times too slow.
- The `AudioWorklet` runs even though `capture.js` never connects it to a destination:
  314 chunks of 128 samples in 2.5s = 2.512s of audio at 16kHz, none of them empty.
- Every posted WAV is a correct 16000Hz mono 16-bit RIFF whose header byte count agrees
  exactly with the file's real length.

## Capturing the bytes yourself

In the console of the tab you are dictating in:

```js
window.$DICTATE_DUMP = true;                 // or "framework/ai/…/dumps.jsonl"
```

Every WAV `Dictate` posts is then also written, base64, one line per send, into `dump_file`
(`framework/ai/dictate-dumps.jsonl` by default). Pull them apart on disk with:

```
cd public/framework/ai/2026-09-22/dictate-silence
node measure.mjs ../../dictate-dumps.jsonl
```

which prints each one's sample rate, duration, peak, RMS, and whether the header's byte count
agrees with the file's real length. ⚠ That script walks the RIFF chunks rather than assuming
a 44-byte header — `jfk.wav`'s own `fmt ` chunk is 18 bytes, which puts its samples at offset
46, and a test clip built on the 44 assumption played back as pure silence and cost this task
an hour chasing a bug that was in the test.

Press-and-see version of all of this, with a download link for the exact WAV your browser
sent: [`ai/2026-09-22/dictate-silence/`](/framework/ai/2026-09-22/dictate-silence/).

## Which microphone, and the live test

The bench also answers the other half of "is my microphone working": it lists every
`audioinput` device, opens the one you choose, and runs a **live level meter** on it while
recording nothing at all. If the bars do not move, that device is not hearing you — try the
next one. That is a diagnosis the owner can do alone, with no agent and no console.

The pick is remembered in this browser, and every `Dictate` on the site reads it, so choosing
once moves the board's own mic too. `Dictate` takes `device_id` (and `device_label`) directly
when a caller wants a specific one; with neither, `remembered_device()` decides.

⚠ **A `deviceId` is not a stable name for a microphone.** It is salted per origin and does not
survive the browser clearing site data — and in a fresh automation profile it changes on every
single page load, which is how this was found: the remembered pick silently reverted to the
default on reload while every other test passed. So the NAME is stored beside the id.
`Capture.start()` tries the id with `exact:` first, and on `OverconstrainedError` looks the
same name up again with `by_label()` before falling back to the system default. Two flags say
which happened — `recovered` (found again under a new id) and `fell_back` (really gone) — so
the picker can tell the owner the truth rather than guess.

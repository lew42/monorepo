# Pause cues — which signals we already have

The question: what can tell the fast assistant **when the owner pauses, and for how long**?
Everything below was measured on this machine on 2026-09-29, or read in the code named.
The built answer is [`ux/Dictate/floor.js`](/framework/ux/Dictate/floor.js) and its contract,
[`ext/Chat/doc/floor.md`](/framework/ext/Chat/doc/floor.md).

## The table

| Signal | Where from | Resolution | Useful for pauses? | Credence |
|---|---|---|---|---|
| Microphone level (RMS of each audio chunk) | `ux/Dictate/pcm-worklet.js` → `capture.js` → `Dictate.on_level()` | one chunk every **8 ms** (128 samples at 16 kHz) | **Yes: this is what the cues use.** Real time, and free | established: read in the code |
| "Loud" test | `Dictate.on_level()`: smoothed level (`0.6·old + 0.4·new`) above `silence_at = 0.01` | per chunk | **Yes.** The same test Dictate already uses to cut a segment after 700 ms of quiet | established: read in the code; the 0.01 is a guess (`ux/Dictate/doc/decisions.md`) |
| Loud milliseconds in a segment | `Capture.loudness()`: 20 ms frames above `speech_floor = 0.02` | 20 ms, after the fact | Only after the segment has closed; it decides "is there speech at all" | established: `ux/Dictate/doc/silence.md` |
| Whisper `json` answer | `POST :8178/inference`, `response_format=json` (what Dictate sends) | text only | **No.** It has no timings | established: measured |
| Whisper `verbose_json` answer | same, `response_format=verbose_json` | per segment `start`/`end`, `no_speech_prob`, `avg_logprob`; per **word** `start`/`end`/`probability` | Pauses between words could be read from word times, but only after the audio has been sent: seconds late, not real time | established: measured on `ai/recordings/jfk.wav` |
| Cost of `verbose_json` | same | — | about **+45 ms** per request (0.11 s → 0.156 s, three runs each, on a 7.8 s clip) | established: measured, one clip |
| `audio/MicStream` level | `MicStream.on_level()` + `chunk_levels[]` | same 8 ms chunks, the same smoothing | Yes, but AI 2's composer doesn't use MicStream yet (it runs on `Dictate`) | established: read in the code |
| Browser engine (`SpeechRecognition`) | Chrome | a result event now and then, no level | Weak: a result is the only sign of speech it gives | established: `Dictate.js` header |

## What was built from it

The level meter is the only real-time signal, so `floor.js` reads it. A quiet stretch of
**300 ms or more**, after the first word, is a pause: `{start, end, ms}`, counted from when
the mic turned on. Every posted entry gets the pauses since the previous entry, and its
speaking time.

`no_speech_prob` was left out on purpose. It needs `verbose_json` (+45 ms on every Whisper
answer, the delay the owner is fighting), and Dictate's silence gate (`worth_sending()`)
already drops segments with no speech before they are sent. To add it later: send
`verbose_json` only from `close_segment()` (the final answer, never the guesses), and put
the highest segment `no_speech_prob` on `entry.cues`. Credence that it would help:
**speculation**, since nothing has shown a hallucinated segment getting past the gate since
2026-09-22.

## Smaller pieces, sooner? (deliverable 4)

Measured: the clean-up call (`/api/tidy`, level clean, claude-sonnet-5) takes **~2.1 s for
one sentence** (2086, 2089, 2480 ms) and **~2.75 s for five** (2751, 2950, 2494 ms). Almost
all of it is a fixed cost per call. Dictate already cleans each Whisper segment as soon as a
0.7 s pause closes it, so clean text appears about 0.7 + 0.1 + 2.1 ≈ **3 s** after the words
end. Cutting smaller pieces would pay the 2.1 s more often without showing anything sooner.
The real lever is that fixed cost (a faster model, or a warm session, in
`Servex/agents/tidy.js`). Credence: **contested**, because only three calls per size were
measured, all on one evening.

**Wiring `Transcriber.Whisper` (local agreement) into ComposerMic** was not done. It would
replace Dictate's cut-and-resend engine under ComposerMic: `ext/Chat/Mic.js` would have to
build on `audio/Transcriber` instead of extending `Dictate`, and `floor.js` would need a
second feed, from `MicStream.on_level()`. That touches `ext/Chat`, which another task
(chat-hitl) is editing now, so it's a separate task.

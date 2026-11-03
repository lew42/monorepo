# Would a real streaming server beat today's HTTP resend?

**Question (task-mastermind-audio, relaying the owner, 2026-09-29):** today
`Transcriber.Whisper` fakes "live" by re-POSTing the growing segment to whisper-server's plain
`/inference` route every ~0.9s. Would swapping that for a real streaming engine — whisper.cpp's
own `stream` mode, or a websocket server running a "local agreement" policy like
`whisper_streaming` — do better on latency and on the word-splitting seam bug
([`../../doc/decisions.md`](/framework/audio/doc/decisions.md), "Seams")?

**Update (2026-09-29, same day): the owner decided.** Rather than adopt a separate streaming
server, `Transcriber.Whisper` itself was rewritten as a rolling LOCAL-AGREEMENT window —
`whisper_streaming`'s own core idea (below), reimplemented in-process against the existing
`whisper-server` HTTP endpoint rather than by adopting its server. Measured against the old
cut-and-append engine (now `Transcriber.WhisperSegments`) with a real 49s monologue: 0
hallucinations / 0 lost words, versus 2 hallucinations / 1 lost word for the old engine — see
[`../../doc/decisions.md`](/framework/audio/doc/decisions.md), "Rolling window". The research
below is what that decision was built on.

## What exists

- **whisper.cpp's own `stream` example** samples the microphone every `--step` ms (500ms by
  default) and re-runs Whisper on a sliding window; a VAD mode (`--step 0`) waits for a real
  pause before transcribing the last `--length` ms instead of polling on a fixed clock — closer
  to what `Transcriber.Whisper` already does (a pause closes a segment), except the model runs
  in-process rather than over HTTP. [ggml-org/whisper.cpp stream example](https://github.com/ggml-org/whisper.cpp/tree/master/examples/stream)
- **`whisper_streaming` (UFAL)** — a **local-agreement policy**: it re-runs Whisper on a growing
  buffer and only COMMITS a word once several consecutive runs agree on it, which is a principled
  fix for exactly the seam problem this task measured (a word near the edge of the current window
  is held back, not guessed and locked in, until it stops changing). Published latency: about
  **3.3 seconds** on long-form speech — much higher than this module's ~0.9s partial cadence, the
  cost of waiting for agreement. [Turning Whisper into a Real-Time Transcription System (ACL
  Anthology PDF)](https://aclanthology.org/2023.ijcnlp-demo.3.pdf), [ufal/SimulStreaming on
  GitHub](https://github.com/ufal/SimulStreaming)
- **WhisperLive** — a websocket server built around `faster-whisper`, purpose-made for live
  audio: persistent connections, partial + committed segments, built-in VAD to skip silence.
  Reported to reach "near-real-time, word by word" latency versus a plain HTTP request/response
  loop, at the cost of running a whole separate server process (not whisper.cpp, and not the
  `/whisper/inference` proxy this task already has). [Scaling Real-Time Transcription: A Guide to
  WhisperLive](https://lukeosborne.au/2026/07/scaling-real-time-transcription-a-guide-to-whisperlive/)

## Weighed against what this module actually has

- **Seams**: `whisper_streaming`'s local-agreement policy is the closest thing to a real fix for
  word-splitting — it refuses to commit a word until it's stable, rather than committing whatever
  a single request said and hoping the cut landed cleanly. The quietest-point cut this task
  shipped ([`../../doc/decisions.md`](/framework/audio/doc/decisions.md), "Seams") is a cheaper
  approximation of the same goal (find a moment least likely to be mid-word) without the ~3.3s
  latency cost or a new server process.
- **Latency**: the honest reason not to switch. This module's partial guess already updates every
  ~0.9s against local whisper-server on an RTX 4070 SUPER (`ux/Dictate/Dictate.js`'s own measured
  numbers — well under a second per request). `whisper_streaming`'s 3.3s figure is for a
  different, heavier guarantee (a COMMITTED, stable word) — not obviously better for this site's
  actual use (a live caption while the owner keeps talking, not a final transcript).
- **Operational cost**: whisper.cpp's `stream` example and WhisperLive are both separate
  processes/servers from `whisper-server` (`Server/plugins/Whisper.js` already manages exactly
  one child process, spawned and killed with the dev server). Adopting either means a second
  process to supervise, restart, and proxy — real `Server/` work, not an `audio/` change.

## Recommendation (superseded by the decision above — kept for the reasoning)

This section is what the doc said BEFORE the owner's follow-up decided it: don't adopt a
separate streaming server, because the cheap seam fixes measured that day got most of the
benefit without a second process to supervise. That held for "adopt a whole other server" — it
did not anticipate reimplementing local agreement's core IDEA (commit only what two consecutive
runs agree on) directly inside `Transcriber.Whisper`, against the `whisper-server` endpoint this
task already has. That is what shipped. A real streaming SERVER (`whisper_streaming` itself, or
WhisperLive) is still not adopted — the operational cost (a second process, `Server/` work to
supervise and proxy it) is the same argument as before, and the in-process approximation measured
well enough not to need it yet.

## Sources

- [ggml-org/whisper.cpp — `examples/stream`](https://github.com/ggml-org/whisper.cpp/tree/master/examples/stream)
- [Turning Whisper into a Real-Time Transcription System (ACL Anthology, the `whisper_streaming` paper)](https://aclanthology.org/2023.ijcnlp-demo.3.pdf)
- [ufal/SimulStreaming on GitHub](https://github.com/ufal/SimulStreaming)
- [Scaling Real-Time Transcription: A Guide to WhisperLive](https://lukeosborne.au/2026/07/scaling-real-time-transcription-a-guide-to-whisperlive/)

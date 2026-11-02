# Whisper upload: why raw text got slow on the phone, and the fix (2026-11-01)

On a slow uplink the upload is the delay, not Whisper. Every guess re-sends the whole growing segment (6 s of audio is about 190 KB as 16-bit WAV), so the page now sends **half the bytes**. It also **drops a guess still in flight** when the segment ends, so the final no longer waits behind it.

## What was measured

Scripts, rerunnable on the real logs: [measure.mjs](/framework/ai/sessions/2026/10/20/session-e00f55c9/whisper-path/measure.mjs) (each hop, per 10 minutes) and the per-run fit in the [task log](/framework/ai/sessions/2026/10/20/session-e00f55c9/whisper-path/).

| | before 18:12 | from 18:12 |
|---|---|---|
| Whisper round trip from the phone, median | 0.28–0.34 s | 2.2–2.6 s |
| Upload cost per 100 KB (fit of `ms` against `bytes`, per page run) | 40–110 ms | 860–970 ms |
| Fixed part (fit intercept) | ~170 ms | ~300 ms |
| whisper-server, the same clip, called directly | 0.12 s | 0.12 s |

- **The time is spent before the request reaches whisper-server.** Pairing each page request with whisper-server's own "processing" line (same sample count) puts the extra 1.2–1.5 s between "sent" and "received".
- **The cause is the link, not the code.** Request counts were unchanged, and Kokoro (Recite) running at the same time adds nothing (measured).

## The fix

| Change | Where | Effect |
|---|---|---|
| WAV as 8-bit mu-law (WAVE format 7), not 16-bit PCM | `Capture.wav()`, [capture.js](../capture.js); `Capture.prototype.encoding = "pcm16"` switches back | 16 KB a second of audio, not 32; same text on three clips, including a quiet, hissy copy |
| A guess in flight is aborted when the segment closes | `Dictate.close_segment()` / `transcribe()`, [Dictate.js](../Dictate.js) | a final behind a 3 s guess answers in 0.33 s, not 3.15 s |

Proof: `node public/framework/ai/sessions/2026/10/20/session-e00f55c9/whisper-path/check-fix.mjs <base url>` (PASS on the branch, FAIL on the old code).

## Alternatives, and when they would win

- **4-bit IMA ADPCM** (a quarter of the bytes): tested, and it garbled quiet speech ("Festing, festing"). Not used.
- **Opus** (about a tenth of the bytes): needs whisper-server's `--convert` (ffmpeg on the PC) and an Ogg writer in the page. Worth doing if the phone is often on mobile data.
- **Send only the new audio for guesses**: the bytes no longer grow with the segment, but the guess text then has to be stitched together. A bigger change.

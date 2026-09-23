# dictate-silence — whisper hears "Thank you" because the browser sends it silence; find where the sound is lost

Minion: Opus, effort high. Session id `dd3a11e7-7d24-4ef5-ae83-dea94fa63f0a`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then
`public/framework/ux/Dictate/readme.md`, `doc/`, `Dictate.js`, `capture.js`, `pcm-worklet.js`,
and `ai/2026-09-19/whisper-local/`, `ai/2026-09-20/dictate-fix/`, `ai/2026-09-22/whisper-servex/`.
Load `code`. Private port **8095**. The owner's real whisper-server on **8178** may be READ
(POST /inference) but never restarted; a private one for experiments goes on **8179**.

## The owner's words (2026-09-22 17:40, verbatim)

> How do I test the whisper transcription? Every time I try and use it, it just responds with
> thank you as if that's what I'm saying. So there's something that's not being streamed
> properly, transcribed properly. or reported properly. So how do we dig into this and, and get
> you know, how do I get my hands on the raw Whisper API and kind of test how it works?

## What the mastermind proved in one minute (17:42)

`curl -X POST http://127.0.0.1:8178/inference -F "file=@%LOCALAPPDATA%/lew42/whisper/jfk.wav"`
→ the JFK sentence, correct. The same with `silence.wav` → `" Thank you.\n"`. **"Thank you" is
whisper's hallucination for silence.** The server is fine; the WAV the browser sends is silent,
near-silent, or malformed. `capture.js` opens an `AudioContext` at 16000 Hz, feeds an
`AudioWorklet` (`pcm-worklet.js`), and `wav(samples)` writes Int16 LE; `Dictate.js:334` posts it
as `segment.wav` to `/inference`; `close_segment()` snapshots the capture. Somewhere between
the microphone and that POST, the sound is lost — or the segment closes before any speech.

## Deliverables

1. **Capture the real bytes.** Add a debug seam to `Dictate` (an option or `window.$DICTATE_DUMP`)
   that, for every segment posted, also POSTs the same WAV to the dev server's existing
   generic append/upload route or writes it via `rpc` into `ai/2026-09-22/dictate-silence/dumps/`
   with a timestamped name — then measure each dump: duration, sample rate from the header,
   peak and RMS amplitude (a tiny node script, `measure.mjs`, in your task dir). Two numbers
   that must agree: the sample count in the header and the byte length / 2.
2. **Reproduce headless with a real voice.** Playwright can fake the mic:
   `--use-fake-device-for-media-stream --use-file-for-fake-audio-capture=<wav>` (Chromium
   flags; the wav must be 16-bit PCM — `jfk.wav` from the whisper folder is). Load the
   whisper-servex report page or a Dictate demo on 8095, press the mic, let the fake mic play
   the JFK clip, and read what Dictate shows and what it posted (the dump). If the dump is
   silent while the fake mic is loud, the bug is in `capture.js`/the worklet (a disconnected
   node? the worklet's `process()` returning before copying? an `AudioContext` that never
   `resume()`d after the user gesture? channel count zero?). If the dump is loud and whisper
   still says "Thank you", the bug is in the WAV header or the segmenting (a segment closed on
   `silence_at` before speech; a 16 kHz context on a 48 kHz device without Chrome resampling —
   Windows Chrome refuses `sampleRate: 16000` on some devices and silently gives 48000).
   Log every measurement.
3. **Fix the cause, prove the fix** the same headless way: the JFK clip through the real
   Dictate on 8095 yields the JFK sentence on screen and in the dump measurements (RMS > 0.01,
   duration ≈ the clip), and a `prompt` line reaches `/log/prompts` with that text. Then say
   plainly whether the owner's own mic is likely to differ (device sample rate, permission
   state, default device) and give them one check to run in their tab's console
   (`navigator.mediaDevices.enumerateDevices()` + the context's real `sampleRate`).
4. **The test page for the owner — `ai/2026-09-22/dictate-silence/page.js`:** one screen.
   Top: a big mic button that records 3 seconds, shows a live level meter (peak/RMS from the
   same capture path), then shows the WAV's numbers (duration, rate, RMS), the raw JSON
   whisper-server returned, and a "download this WAV" link. Below it: the curl line for the raw
   API, the JFK/silence facts above, and the diagnosis. This is the "how do I get my hands on
   the raw Whisper API" answer — show, don't tell. Link it from `ai/2026-09-22/page.js`
   `children:` and from `ux/Dictate/readme.md` ("Watch out" line).

## Fence

`public/framework/ux/Dictate/**` (Dictate.js, capture.js, pcm-worklet.js, readme.md, doc/),
your task dir, `ai/2026-09-22/page.js` `children:`. Reload hold for the batch (Dictate is
loaded on the board the owner is using). Append-only to `.jsonl`. Not `Server/plugins/Whisper.js`
unless the cause is there (then hold + boot test on 8095 first). Never the owner's 8178 process.

## Length

Landing report: eight sentences — the cause in the first, the measurements, the fix, the
owner's one check.

## Owner addendum (18:08, verbatim) — the bench, after they used it

> I just recorded something with the record three seconds. Let's change that from record three
> seconds to just continuous recording until I stop recording. We need to check my microphone,
> because it clearly is not working properly. Can we set up a little UI to switch microphones?
> And maybe do like a live test?

5. **Record until stop.** One button: press to start, press again to stop; the numbers, the
   WAV and whisper's answer come after stop; a live level meter (peak/RMS bars) runs the whole
   time so the owner sees whether the mic hears anything BEFORE stopping.
6. **A microphone picker.** `navigator.mediaDevices.enumerateDevices()` → a `<select>` of
   `audioinput` devices (labels appear once permission is granted; say so in one line); the
   choice is passed as `deviceId` to `getUserMedia` and remembered per browser; the picker
   shows the chosen device's real `sampleRate` (from the track settings / the context) beside
   it. `ux/Dictate` itself takes the same `deviceId` option so the board's mic uses the pick.
7. **Live test:** with the picker open, the meter runs on the selected device without
   recording; switching devices restarts the meter on the new one. That is the diagnosis the
   owner can do alone: which device moves the bars.

## Owner addendum (18:16, verbatim) — on /framework/ux/Dictate/

> it says something about like check the level meters or whatever. There are no meters. But
> while I'm transcribing or while the mic is active, it would be nice if there was a little —
> it doesn't have to be big — on the microphone, it should look like it's on, and the level
> should be bouncing around so that it's clear that there's sound coming through or not.

8. **The mic button itself shows the level.** In `ux/Dictate`'s own button (the one on every
   page that mounts it — the board's composer, the UX page, the bench): while the mic is
   active the button reads as ON (a ring or fill in the accent) and a tiny level indicator on
   or beside it bounces with the RMS from the same capture path — a few pixels, no layout
   shift. The "check the level meters" text on the UX page goes; the meter IS the message.

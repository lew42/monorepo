# Voice pipeline: mic → Whisper → raw text, one class per stage, every step logged with time

## The owner, 2026-10-04 (verbatim excerpts)
> if we can isolate the actual web APIs and make them more apparent on the pages, like teach how the web API actually works via the class documentation. Like this class uses this web API and this web API and it passes this from here to there

> phase one is accessing the microphone. Maybe we need a microphone class to represent each available microphone and then have the ability to switch them ... how many microphones are available? Which ones do we have ... volume ... Can we use them? And then pass that audio to Whisper.

> I'm not sure how the Whisper API works ... it seems to like change what it said and I'm not sure how those chunks are encoded ... I want to see it on screen as it happens so I can just feel how it happens. And secondly, it should all be in the log so that whether I watched it happen or whether I'm replaying it, I can get a feel for the timing of everything

## Exists already (law 6: build on these, don't add a third mic system)
- `/framework/audio/`: `MicStream` (mic, level, device choice), `Transcriber` (Whisper or Chrome), `Recorder`, `MicPicker`, `LevelMeter`.
- `ux/Dictate/capture.js` (`Capture`, Dictate's own mic) and Dictate's own Whisper calls (`POST /whisper/inference` with the whole segment as WAV every ~1.5 s).
- `ux/Dictate/playground/` (`Resend`, `Chunk`, `Analysis`, `Session`): a replay of Whisper resends.

## Want
1. **One class per stage, each naming the web API it wraps** at the top of its doc: `Microphone` (one per input device: `navigator.mediaDevices.enumerateDevices()`, `getUserMedia`, level via `AnalyserNode`) and a picker; `Whisper` (the transport: `AudioWorklet` samples → WAV → `fetch` multipart to `/whisper/inference`; why each resend can rewrite earlier words: it re-transcribes the whole growing segment). Reuse/rename `audio/MicStream` + `audio/Transcriber`; Dictate's `capture.js` goes away in their favour.
2. **A pipeline view** on the audio page: microphones (with live level), the Whisper stage (each resend as it lands, with ms), and the raw text as it settles, all live, minimal latency.
3. **Every resend is logged** (session file or its own log): `{at, segment_ms, sent_ms, reply_ms, text}`, so the playground can replay a real session with true timing.
4. **Honest status words** (owner: "the socket connecting ... that was pretty misleading"): the site socket is not the audio path, so it is labelled "chat link", not shown as a transcription stage; each error names the stage, the browser's error name (`AbortError`, `NotAllowedError`…), what it means, and the one thing to try.
5. **A compare screen:** the same mic feeding Whisper and Chrome's built-in recognition side by side, live, each line with its time, so the two can be compared on the owner's voice.
6. Dictate's engine (one per tab, task dictate-one-engine) uses these classes.
5. Worktree → check_page → merge.mjs.

QUEUED: start after dictate-one-engine lands. Budget: $6 (a guide). Sonnet, ONE agent.

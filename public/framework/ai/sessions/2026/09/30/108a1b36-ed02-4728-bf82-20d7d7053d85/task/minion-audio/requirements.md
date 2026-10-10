# Minion: audio/ down to three tools, and one live demo

Load the `minion`, `code` and `page` skills first. The owner's words and the full ask: [../requirements.md](../requirements.md) (read it all). Card dir: `public/framework/ai/2026/09/29/audio-a-library-of-audio-parts-transcrip/`.

**Work in the worktree only:** `C:\Code\lew42\worktrees\audio-consolidate` (branch `worktree/audio-consolidate`, its server at http://localhost:53292/). Commit there by exact path. Never touch the main tree `C:\Code\lew42\monorepo` except your own task.jsonl.

## Fence (phase 1)
`public/framework/audio/**` only. NOT `ux/Dictate/` or `ext/drawer/` — another minion is fixing those right now; Dictate is phase 2, you will be woken for it.

## Deliverables (phase 1)
1. **MicStream absorbs MicPicker, LevelMeter and PushToTalk.** Device choice becomes a MicStream setting; level becomes a value MicStream's View shows (the meter bar); push-to-talk becomes a `mode` (`hold` | `toggle`). One class, parts as static subclasses (the `code` skill). Find every caller of the three old classes (`grep -r` across `public/`) and move it. The old classes become thin aliases re-exporting from MicStream, or are removed once nothing imports them.
2. **Keep v1 reachable.** The current /framework/audio/ index and the old part pages stay clickable under `/framework/audio/v1/` (declared in `children:`), so the owner can compare.
3. **ONE live demo at the top of /framework/audio/**: pick a mic, see the level move, hold-to-talk or toggle, the transcript appears (partial grey → settled), optionally record and play back. Every part visibly doing its job, each part's live state View beside it (MicStream, Recorder, Transcriber). Level 1 = the demo, then the three tools as icon tiles, one click to each. Transcriber: use the existing engines (Whisper | Chrome); don't change their internals beyond what MicStream needs.
4. **Readme**: the three tools, the web API each wraps (getUserMedia + AudioWorklet/AnalyserNode, MediaRecorder, Whisper server / SpeechRecognition), and a small diagram of how Dictate will assemble them (MicStream → Transcriber, Recorder optional). Update each tool's readme and `doc/`.

## Proof
- Headless Playwright with a fake media stream (`--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`) against http://localhost:53292/framework/audio/: the level value moves, hold mode starts/stops, the Recorder produces a blob. Scripts go in your session scratchpad, named `audio-*.mjs`.
- Zero console errors on /framework/audio/, /framework/audio/v1/, and every tool page.
- Screenshots at 400 and 1920 of /framework/audio/, into this dir (`shot-400.png`, `shot-1920.png`). Open them and judge them.
- Every process you spawn: `windowsHide: true`. Stop anything you start.

## Budget
Sonnet, about $3. Log steps and decisions in your task.jsonl as you go. When phase 1 is committed and proven, end your turn with a 5-line summary (what moved, callers changed, proof paths) and wait — do not merge; I merge.


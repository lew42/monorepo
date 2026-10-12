# Minion A: `framework/audio/`, a library of pure audio parts

Load the `minion` skill first, then `code`, `page`, `new-page`, `css` before CSS.

**Read first, in full:** the owner's words, `public/framework/ai/2026-09-29/audio/owner-words.md`, and the task brief beside it, `../requirements.md` (asks 1, 2 (transcription), 3). Those words are the acceptance test.

## Where you work

- Worktree `C:/Code/lew42/worktrees/qf-6` (branch `worktree/qf-6`), its server `http://127.0.0.1:54527/`. Write code ONLY there; commit there by exact path. Don't merge; the task mastermind merges.
- Your log: `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\audio\a-parts\task.jsonl` in the MAIN tree (Servex opened it). Append with `node C:\Code\lew42\monorepo\.claude\hooks\append.mjs <that file> <lines.json>`. Screenshots go in `...\audio\a-parts\shots\` in the main tree.

## Your fence (write nothing else)

- `public/framework/audio/**` (new)
- `public/framework/page.js`: add `audio` to `children:` only (after `ux`).

Read-only for you: `ux/Dictate/` (Dictate.js, capture.js, pcm-worklet.js: the working mic, level and Whisper code you extract from), `Server/plugins/Whisper.js` (the page-origin proxy: `POST /whisper/inference`), `core/track/track.js`, `ux/Content/Object/DefaultView.js`. Another minion is editing `ux/Dictate/Dictate.js` and the playground right now; don't touch them.

## Deliverables

Names are decided (task.jsonl decision): one folder per class, each with its class file, `page.js` (a live demo, shown first), `readme.md`, and `doc/` if there is detail.

1. **`audio/`**: `readme.md` and `page.js`. Level 1 is a wall of the parts as linked icon tiles (`ux/Content/Concepts`), then the three assemblies below. One screen.
2. **`MicStream`**: opens a microphone (a `device_id`, else the remembered one, `DEVICE_KEY` from Dictate) and hands out the live `MediaStream`, raw samples (the pcm worklet) and a level. Other parts subscribe to it. Extract, don't reinvent: the working code is `ux/Dictate/capture.js` + `pcm-worklet.js`.
3. **`MicPicker`**: the microphone chooser (lists devices, remembers the pick with Dictate's `remember_device`).
4. **`LevelMeter`**: a live level bar for any MicStream.
5. **`Recorder`**: record, play back, save (download) a clip. MediaRecorder is fine.
6. **`PushToTalk`**: hold a button or a key to open the stream; release to close it. Emits start/stop and the audio.
7. **`Transcriber`**: an audio stream in, a text stream out (events: a partial guess that keeps improving, then a final segment). Engines are swappable classes: `Transcriber.Whisper` (the page-origin `/whisper/inference` proxy; resend-while-talking and skip-if-in-flight as Dictate does it) and `Transcriber.Browser` (Chrome's `SpeechRecognition`). Keep Dictate's silence rule (no segment with under 120 ms of speech; drop `[BLANK_AUDIO]`-style labels).
8. **Each class has its default view** (the item-ui pattern): `static View = class extends View {…}`, reached as `thing.view`; opt into `track(Klass)` from `core/track/track.js` so its page can show live instances.
9. **Three assemblies built from the same parts**, as demos on the audio/ page, each its own routed child page: (a) **Sound recorder**: MicPicker + LevelMeter + Recorder. (b) **Push-to-talk stream**: Discord-style, local only: hold to talk, and a "listener" panel hears it live (a WebRTC loopback or a MediaStream into an `<audio>` element; say which in the readme). (c) **Mic → Whisper → text**: MicStream + Transcriber.Whisper, showing the partial guess and the finals. Each demo shows its short code beside it (`demo()` from ext/demo).

## Done means

- Every page loads with zero console errors and zero failed requests on `http://127.0.0.1:54527/framework/audio/` and each child. A headless browser has no mic: use Chromium's `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` to prove the meter moves and the recorder saves.
- Screenshots of `/framework/audio/` at 1920 and 400, and of each assembly at 1920.
- Every process spawn sets `windowsHide: true`. Stop every server you start.
- Log milestones in your task.jsonl; land it with an `outcome` checklist of deliverables 1–9, each with its proof. Then end your turn; the task mastermind may send you a phase 2 (rebuilding Dictate on these parts).

Budget: about $5. Sonnet. If a piece fights you, log it and move on rather than burn the budget.

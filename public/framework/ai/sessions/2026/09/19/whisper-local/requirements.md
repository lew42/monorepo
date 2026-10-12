# whisper-local — whisper.cpp running on this machine, and a `ux/Dictate` component that uses it

Load the `minion` skill first. Then this brief. Model: Sonnet.

**Three laws.** Less is more (one install, one component, one wire). Clear beats brief by far. Prioritize (words on the screen from the owner's voice first; polish after).

## The owner's words (2026-09-19)

> the whole dictation thing is not working properly. The microphone, it requested the permission, I granted it. I click the microphone and it appears to start recording — there's a little record icon on the browser tab — but nothing's transcribed on my screen. […] I was just talking to Claude chat about getting Whisper set up locally. Let's go ahead and try and do that. That doesn't need to be in the repo — the language model file definitely shouldn't. Large V3 Turbo was a 1.6 gigabyte download and was the one it was recommending. Get whisper.cpp to work locally, and then wire that up to the dictation UI. But let's make that UI — that one should probably be UX, right? Make sure that's properly encapsulated as a component in our UX.

The owner has asked for this download explicitly, so the standing pause on external browsing does not block it: fetch the whisper.cpp release and the one model, nothing else.

### Addition, sent mid-task (2026-09-19)

> the thing they miss most is seeing words WHILE they talk ("it's not transcribing in real time"). So make live partial text a first-class goal of ux/Dictate on the whisper engine: while a segment is still being spoken, re-send the growing buffer of the current segment every ~1.5 s and show that text greyed after the settled text; when the segment closes (pause or ~15 s), replace the grey with the final text. The RTX 4070 SUPER should transcribe 10 s of audio in well under a second with large-v3-turbo, so this is affordable — measure it and log the number; if a re-send is still in flight, skip that tick rather than queueing. Everything else in the brief stands.

### Second addition, sent mid-task (2026-09-19)

> One more design input from the owner for ux/Dictate, from trying another product's dictation just now: it showed words live (good), but a pause did not send anything, they had to press the button a second time, and they could not find the keyboard shortcut ("that's kind of weird"). So in ux/Dictate: (1) a keyboard shortcut toggles dictation, and the button's tooltip and the small engine line SAY it (pick one that is free in Chrome on Windows — not Ctrl+D, that is bookmark; check it does not collide with the site's own keys); (2) what ends a dictation is explicit and visible: the button (and the shortcut) stop it, and an opt-in `send_on_pause` option (off by default, a small checkbox beside the mic where a caller enables it) submits after a longer silence, about 2.5 s, with a visible countdown the owner can cancel by speaking again. Write both in doc/decisions.md with the alternative.

## 1. Install — outside the repo

- This machine: Windows 11, i7-14700K, 32 GB, **NVIDIA RTX 4070 SUPER** (`nvidia-smi` is on the PATH). No `cmake`, no `ffmpeg` — so use a **prebuilt** whisper.cpp release from `github.com/ggml-org/whisper.cpp/releases` (the cuBLAS x64 zip that matches the driver's CUDA version; fall back to the plain x64 zip if the CUDA build will not start, and say so). Use `gh release download` or `curl -L`.
- Home: `%LOCALAPPDATA%\lew42\whisper\` — `bin\` (the release, with `whisper-server.exe` and `whisper-cli.exe`), `models\ggml-large-v3-turbo.bin` (from `huggingface.co/ggerganov/whisper.cpp`, about 1.6 GB; check the size after download). **Nothing of it inside the repo.**
- Prove the install alone first: transcribe a WAV with `whisper-cli` (the release ships `samples\jfk.wav`, or record one) and log the wall time and whether the GPU was used. Then run `whisper-server.exe -m …large-v3-turbo.bin --host 127.0.0.1 --port 8178` in the background and POST the same WAV to `/inference` with `curl`. Log the seconds for an 11-second clip. If it is slower than about half real time, also fetch `ggml-small.en.bin` and log both numbers.
- Check whether `whisper-server` answers with `Access-Control-Allow-Origin` (a browser on `http://localhost` will POST to `http://127.0.0.1:8178`). If it does, the browser talks to it directly and **no dev-server change is needed today**. If it does not, stop and say so in your log — the dev-server side belongs to a sibling (`server-self` holds `Server/**` right now).
- `whisper-server` wants 16 kHz mono WAV (it can only convert other formats with ffmpeg, which is not here). So the browser makes the WAV: capture PCM with an `AudioWorklet` (or `MediaStreamAudioSourceNode` + a worklet), resample to 16 kHz, write a 44-byte WAV header. About forty lines; no library.

## 2. `ux/Dictate` — the component

A new module `public/framework/ux/Dictate/` (`Dictate.js`, `Dictate.css` if it needs one, `readme.md`, `page.js` that SHOWS it working, `doc/decisions.md`), declared in `public/framework/ux/page.js`'s children. Read `public/framework/ux/readme.md` and one sibling (`ux/Filter`) for the tier's shape, and `ext/Ask/mic.js` + `ext/Ask/reply.js` (`reply`, `dictate`) for what exists.

- One class, `Dictate`, that dictates into a textarea (or calls back with text): a mic button, a **visible state** at every moment — idle, listening (a level meter or a pulsing dot driven by the real input level, so the owner can SEE it hears them), transcribing, and an **error said in plain words** (no engine reachable, permission denied, no speech heard). Today's failure was silent; silence is the bug.
- Engines, tried in order: **whisper** (when `http://127.0.0.1:8178` answers a health probe), then the browser's `SpeechRecognition`. The engine in use is named in small text beside the button. `ext/Ask/mic.js`'s header comment says the browser's recognition keeps audio on the machine — that is wrong for Chrome (it sends audio to Google); correct the comment.
- Whisper is not streaming, so make it feel live: cut the recording at a pause (input level under a threshold for ~700 ms) or at ~15 s, send that segment, append the text when it returns, keep listening meanwhile. Segments return in order. Pressing the button again stops and flushes the last segment.
- Find out why the browser path showed nothing for the owner and say what you found (likely candidates: an `onerror` of `network` or `not-allowed` swallowed, interim results never drawn, the session ending after silence). Surface every `onerror`.
- Then move the callers onto it: the reply mic and the dictate box in `ext/Ask/reply.js`, and the big dictate box on the run page's Asks tab (it comes from `ext/Ask/reply.js`'s `dictate`, called at `ext/AITask/asks.js:126` — do not edit `ext/AITask/**`, a sibling is compacting that page; the call site should not need to change).
- Production is static and has no whisper: there the component falls back to the browser engine, and draws no button when neither exists.

## 3. Prove

- Private server `PORT=8134 node server.js` (background; kill by its real Windows PID at landing). Headless Chromium with a fake microphone: `chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=<abs path to a wav>"] })` and `context.grantPermissions(["microphone"])`. On `/framework/ux/Dictate/`: press the mic, wait, and show the JFK sentence (or your recording) **in the textarea**. Log the latency from end-of-speech to text.
- With `whisper-server` stopped: the component says which engine it fell back to, or says plainly that none is reachable.
- Shots of the component in each state at 1280 and 400 in your task dir.

## 4. Who starts whisper-server? — a decision, written down

Leave `whisper-server` running when you land (say its PID in the landing) so the owner can try it at once. Write a `decision` line with the paths: (a) the dev server starts it on demand from a small `Server/plugins/Whisper.js` when the install is found — the mastermind leans here, as a follow-up once `server-self` lands; (b) a `whisper.cmd` the owner runs; (c) a Windows scheduled task at login. Build none of them today; add a two-line "start it by hand" command to `ux/Dictate/readme.md`.

## Rules

- `new-task` before the first edit (your dir: `ai/2026-09-19/whisper-local/`); `code`, `new-page`, `documentation`, `ui-test`; `finish-task`; `skill-improvement` if a skill misled you.
- **Fence:** `public/framework/ux/Dictate/**` (new), `public/framework/ux/page.js` (the children line only), `public/framework/ext/Ask/mic.js`, `public/framework/ext/Ask/reply.js`, `public/framework/ext/Ask/doc/**`, `public/framework/styles/css-scopes.txt` (register your prefix), your task dir, and `%LOCALAPPDATA%\lew42\whisper\`. Not `Server/**`, not `ext/AITask/**`, not `core/**`.
- **Never kill or restart the owner's dev server (port 80) or the mastermind's (8123), never drive the owner's tabs.** Never `git stash`, never `find /`; an `rg` pattern starting with `/` returns nothing here. A bash heredoc containing an apostrophe fails in this harness — write files with the Write tool. Do not write the owner's name anywhere.
- Playwright: `import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs"`. Scratch in the session scratchpad.
- Landing `outcome`: one screen — does the owner's voice become text (yes/no), the latency, the engine order, where the install lives and how to start it, the decision, what was left and why.

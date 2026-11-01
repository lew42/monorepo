# Plan: read the AI's replies aloud (Recite)

The brief is [requirements.md](requirements.md). Code is built in the worktree `C:/Code/lew42/worktrees/voice-recite` on branch `task/voice-recite`.

## 1. The numbers (measured 2026-11-01)

- **The GPU:** RTX 4070 SUPER, 12 GB (12 282 MiB).
- **Whisper today:** `ggml-large-v3-turbo.bin` (1.6 GB file) with the silero VAD, started by Servex (`Servex/Servex.js` `whisper()`), port 8178. It holds **2 033 MiB** of VRAM (Windows counter `GPU Process Memory\Dedicated Usage`; `nvidia-smi` cannot see per-process memory under WDDM).
- **The whole card in use:** 3 657 MiB (desktop, Chrome, Figma and Whisper), so about **8.6 GB is free**.
- **Watch out:** `llama-server` (`Servex/ext/local/llama.js`) loads a 4–7 GB model on demand. That plus Whisper still fits; a big TTS model on top would not.

## 2. The model: Kokoro-82M (chosen)

| Model | Quality | VRAM | Speed here | Voices | How it runs |
|---|---|---|---|---|---|
| **Kokoro-82M** (kokoro-onnx) | very good, natural | **0** (runs on the CPU) | **6x faster than real time**: 11 s of speech in 1.7 s; first sentence in ~0.7 s | 54 built-in voice files in one `voices-v1.0.bin` (American, British, and seven other languages) | a small Python HTTP server, `pip install kokoro-onnx` in its own venv |
| Piper | good, a bit robotic | 0 | faster still | one `.onnx` + `.json` file per voice | a standalone exe |
| Chatterbox / XTTS-v2 | best, clones a voice from a 10 s clip | 3–4 GB | about real time on this GPU | any reference `.wav` | Python + PyTorch (a 2.5 GB install) |

**Why Kokoro:** it sounds natural, it is fast enough on the CPU that it needs **no VRAM at all**, so Whisper and the local LLMs keep the whole GPU, and its install is two files plus one pip package. **The alternative** for later is Chatterbox, if the owner wants a cloned voice; the server's `/speak` route would stay the same.

**Proof it works:** a Kokoro sentence sent to Whisper came back word for word ("Recite reads the AI's replies aloud, sentence by sentence…").

**How voices work:** each voice is a style vector (a small array) inside `voices-v1.0.bin`; the id's first letter is the language (`af_heart` = American female "Heart", `bm_george` = British male "George"). A persona is a voice id plus a speed.

## 3. Can Whisper tell speech from noise?

Yes. whisper-server runs with `--vad` (silero), and a clip with no speech comes back as `""` (tested with `silence.wav`). So barge-in works in two steps:
1. **Fast:** the mic level crosses a threshold for ~200 ms, and reading pauses at once.
2. **Check:** that clip goes to Whisper. Empty text means it was noise (wind, a truck), so reading resumes by itself. Words mean the owner is talking, so it stays paused until the owner presses Resume.

## 4. The classes (names and homes)

- **`audio/Voice/Voice.js`, extended** (the class exists: browser `speechSynthesis`). One `Voice` per persona: `name`, `id` (Kokoro voice id), `speed`, and a new `render(text)` that returns the audio of one sentence from recite-server. The browser engine stays as the fallback when the server is down.
- **`audio/Recite/Recite.js`, new:** the overall control. It splits a reply into sentences, renders two ahead, and plays them through one `AudioContext` as one timeline, so it can pause, resume, go back 10 s, and restart. It checks the server and reconnects.
- **`Recite.Bar`:** the one small control line: play/pause, back 10 s, restart, a thin progress line, the voice, and a mic button for barge-in.
- **`Recite.BargeIn`** (a part of Recite): listens on `audio/MicStream` while reading, with an adjustable threshold, and does the two-step check above. The mic button turns it off, and then playback is manual only.

## 5. The server

- **`Servex/ext/recite/recite_server.py`:** Kokoro behind `GET /health`, `GET /voices`, `POST /speak` (returns a WAV), on port 8177.
- **`Servex/ext/recite/recite.js`:** `Process.Recite`, supervised and detached like whisper-server. It takes effect on the next Servex restart (never during a voice call). Until then it can be started by hand.
- **`Server/plugins/Recite.js`:** the dev server's same-origin proxy `/recite/*`, a copy of the `/whisper/*` route, so a phone on the LAN or the tunnel from `../remote-site-tunnel/` reaches it.
- **The model files** live in `%LOCALAPPDATA%/lew42/recite/` (venv + models), beside `lew42/whisper/`.

## 6. Where it plugs into chat

Filled in from the class map (below) once it is read.

## 7. Steps

1. plan.md (this file), committed.
2. recite-server + `Process.Recite` + the `/recite` proxy.
3. `Voice` extended, `Recite` + `Recite.Bar` + `Recite.BargeIn`.
4. A demo page at `/framework/audio/Recite/`.
5. One chat view on the phone reads its replies aloud.
6. Readmes, class docs, a core test, `node Server/review.mjs`.
7. Hand-off: the merge command and what to try on the walk.

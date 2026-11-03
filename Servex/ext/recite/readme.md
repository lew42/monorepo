# recite — recite-server, text to speech, supervised by Servex

recite-server turns a sentence into speech, the reverse of whisper-server. It is a small Python HTTP server around Kokoro-82M, and it runs on the CPU, so it uses no VRAM. The browser's `Recite` ([public/framework/audio/Recite/](../../../public/framework/audio/Recite/readme.md)) calls it one sentence at a time.

## Files

- [recite_server.py](recite_server.py): the server. Routes: `GET /health`, `GET /voices`, `POST /speak` (JSON `{text, voice, speed}` in, a 16-bit mono WAV out, with `X-Recite-Seconds` and `X-Recite-Took` headers). Errors are JSON `{error}`, one plain line.
- [recite.js](recite.js): `Process.Recite`, the supervised process, and `recite_runner()`. `Servex.recite()` in [../../Servex.js](../../Servex.js) starts it at boot, detached, so a Servex restart keeps it running.
- [recite.test.mjs](recite.test.mjs): starts a real server on port 8176, speaks, refuses an unknown voice, stops (about 4 s).

## The install (outside the repo, beside Whisper's)

```
%LOCALAPPDATA%/lew42/recite/
  venv/                       py -3.13 -m venv venv; venv/Scripts/python -m pip install kokoro-onnx soundfile
  models/kokoro-v1.0.onnx     310 MB, github.com/thewh1teagle/kokoro-onnx releases (model-files-v1.0)
  models/voices-v1.0.bin      28 MB, 54 voices
```

Without it, Servex logs one "not installed" line and the browser's voice reads instead.

## Use

- **Port:** 8177 (`RECITE_PORT`). The site reaches it at `/recite/*` through the dev server ([Server/plugins/Recite.js](../../../Server/plugins/Recite.js)).
- **Run by hand:** `<venv>/Scripts/python.exe recite_server.py --port 8177`.
- **Skip it:** `NO_RECITE=1`.
- **Logs:** Servex's `recite` log, like `whisper`.

## Watch out

- **Voices:** a voice id's first letter is its language (`af_heart` American, `bm_george` British, `jf_alpha` Japanese). The server picks the language from it.
- **One request is one chunk,** up to 2 000 characters. `Recite` splits by sentence.
- **Speed measured 2026-11-01:** 11 s of speech in 1.7 s on the CPU; the model loads in about 1 s.

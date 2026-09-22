# Dictate — a mic button that always shows what is happening

State = which engine is listening and what it has heard so far, remembered between
renders — the graduation rule `Filter` and `Tags` already followed, applied to a
microphone. Built 2026-09-19 to replace `ext/Ask/mic.js`'s button, whose failures were
silent: the owner pressed 🎤, the browser's own recording light came on, and nothing
ever appeared — no error, no clue why.

## Use

```js
import Dictate, { dictate } from "/framework/ux/Dictate/Dictate.js";

new Dictate({ $input: () => this.$box, on_error: e => this.say(e) });
// or the drop-in shape ext/Ask/mic.js's mic() used:
dictate(() => this.$box, { on_start: () => this.open() });

// no box at all — just the finished words, one segment/result at a time:
new Dictate({ on_text: text => … });
```

`$input` may be a function (the box may not exist yet when the button is built — a
control usually draws its buttons above its box) or the box itself. Whatever was
already typed stays put; dictation lands after it.

## Watch out

- **Whisper is not streaming.** A segment is re-sent to `whisper-server` about every
  1.5s while the owner keeps talking, so the words on screen are always a *guess that
  keeps improving*, shown grey, until a ~700ms pause (or 15s) settles it into plain
  text. If a resend is still in flight when the next tick is due, that tick is
  **skipped**, never queued — [`doc/decisions.md`](/framework/ux/Dictate/doc/decisions/).
- **The engine is re-checked on every press**, not once at load — so starting
  `whisper-server` mid-session is picked up the next time 🎤 is pressed, with no reload.
- **No button at all** when neither engine is reachable — off `localhost`, or on a
  machine with no whisper install and a browser with no `SpeechRecognition` (Firefox,
  iOS Safari). A muted line says why instead.
- **This needs `whisper-server` running** at `http://127.0.0.1:8178` for the local
  engine — it is not part of this repo, but `node server.js` starts it for you now
  (2026-09-19). See below only if that has not happened.

## whisper-server starts itself

`node server.js` starts `whisper-server` on its own the moment it boots — nothing to
run by hand. It finds the install, leaves an already-running copy alone, and stops the
one it started when the dev server stops. See
[`Server/plugins/Whisper.js`](/Server/plugins/Whisper.js) and
[`doc/decisions.md`](/framework/ux/Dictate/doc/decisions/) ("Who starts whisper-server?").

### Fallback: start it by hand

Only needed with `NO_WHISPER=1` (turns the auto-start off), or when running
`whisper-server` outside the dev server entirely:

```
%LOCALAPPDATA%\lew42\whisper\bin\whisper-server.exe -m %LOCALAPPDATA%\lew42\whisper\models\ggml-large-v3-turbo.bin --host 127.0.0.1 --port 8178
```

Leave that window open; the component finds it on the next 🎤 press.

## More

- [Overview](/framework/ux/Dictate/) — press 🎤 and watch it work · [words](/framework/ux/Dictate/words/) —
  the same box under `ui-contrast ui-compact`
- [`doc/decisions.md`](/framework/ux/Dictate/doc/decisions/) — the install, the CORS finding, the
  segment/resend mechanics, the RMS numbers, who starts `whisper-server`
- [`ext/Ask/reply.js`](/framework/ext/Ask/) — the reply mic and the dictate box, now built on this
- Files: `Dictate.js` (the class), `capture.js` (mic → 16kHz WAV, no library), `pcm-worklet.js`
  (the `AudioWorklet` that reads raw samples), `Dictate.css` (the level meter, the pulse)

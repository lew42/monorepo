# Voice — one voice that turns text into speech

A `Voice` is one voice, a persona: a name, a recite-server voice id and a speed. It is the output half of the mic pair: `Transcriber` turns speech into text, `Voice` turns text back into speech. It has two engines:

- **Local:** `render(text, url)` returns one sentence as a WAV from recite-server (Kokoro, on the CPU). [Recite](../Recite/) uses this to read whole replies with a playhead.
- **Browser:** `speak(text)` uses `window.speechSynthesis`, the browser's own voice. Nothing to install; it is Recite's fallback when the server is down.

## Use

```js
import Voice from "/framework/audio/Voice/Voice.js";

const george = Voice.persona("George");                    // one of Voice.PERSONAS
const { blob, seconds } = await george.render("Hello.", "http://127.0.0.1:8177");

const voice = new Voice();
voice.speak("Hello there.");   // the browser's voice: state "speaking", then "idle"
```

## Watch out

- **The browser's voice list can start empty.** Wait for `on_voices_ready()`.
- **To read a whole reply, use Recite,** not `render()` in a loop: Recite splits, renders ahead, and keeps the playhead.
- **Personas** are in `Voice.PERSONAS` (seven of Kokoro's 54 voices; `GET /recite/voices` lists them all).

## More

- [Overview](/framework/audio/Voice/): the browser-voice demo
- [Recite](../Recite/readme.md): reads replies aloud, the local engine's main user
- `Servex/ext/recite/readme.md`: recite-server
- [doc/owner-2026-10-16-voice-conversation.md](doc/owner-2026-10-16-voice-conversation.md): the owner's notes on a full voice loop

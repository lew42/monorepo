# Recite — reads the AI's replies aloud

Recite is text to speech, the reverse of transcription. It reads a reply out loud with a local voice, so you can use the site on a walk without looking at the screen. It has a playhead (pause, back 10 s, restart), and it pauses when you start talking. [The live demo](/framework/audio/Recite/).

## Use

```js
import Recite from "/framework/audio/Recite/Recite.js";

const recite = Recite.shared;        // one per page, so two chat views never read over each other
recite.read("A reply to read.");     // or recite.queue(text): after what is playing
recite.pause(); recite.back(10); recite.restart();
recite.bar;                          // the one-line control
```

In the chat it is already wired: the phone sheet (✦) shows the bar above the mic, and every reply from the smart assistant is read as it streams.

## Architecture

- **`Recite`** ([Recite.js](Recite.js)) is the manager. It splits text into sentences, has its `Voice` render each one, and plays them on one timeline through one `<audio>` element. It checks the server and falls back to the browser's voice when it is down. It also follows a chat session's live wire (`from_wire(ev)`).
- **`Voice`** ([../Voice/Voice.js](../Voice/Voice.js)) is one voice, a persona: a recite-server voice id and a speed. `render(text)` returns one sentence as a WAV; `speak(text)` is the browser's own voice. `Voice.PERSONAS` lists seven.
- **`Recite.BargeIn`** ([BargeIn.js](BargeIn.js)) listens while Recite reads. A sound above the threshold pauses at once; then Whisper checks it. No words means noise, and reading resumes; your words keep it paused. With the chat's mic on, it listens to that mic instead of opening a second one.
- **`Recite.Bar`** ([ReciteBar.js](ReciteBar.js)) is the control line: read new replies (on/off), play/pause, back 10 s, restart, the progress line, the voice, and the ear (barge-in on/off) with its threshold.

Decisions and why: [doc/architecture.md](doc/architecture.md).

## How it is wired

- **The server:** recite-server, Kokoro-82M on the CPU, port 8177. Servex starts and watches it (`Servex/ext/recite/readme.md`).
- **The URL:** `http://127.0.0.1:8177` on this machine; `<origin>/recite` anywhere else, through the dev server's proxy ([Server/plugins/Recite.js](../../../../Server/plugins/Recite.js)).
- **The chat:** [ux/Dictate/chat.js](../../ux/Dictate/chat.js) passes every event on the session's live wire to `Recite.shared.from_wire(ev)`, and gives barge-in the chat's mic (`barge.use_mic`). [ux/Dictate/DictationBar.js](../../ux/Dictate/DictationBar.js) puts the bar above the mic.
- **Saved settings:** localStorage keys `lew42.recite.voice`, `.auto`, `.barge`, `.threshold`, per browser.

## Watch out

- **A phone plays sound only after a tap on the page.** Any tap counts (the mic, a button). Until then the bar says to tap play.
- **Back 10 s needs recite-server.** With the browser's voice it steps by sentence.
- **Speakers leak into the mic.** Echo cancelling removes most of it, and words that match the sentence being read are ignored. Headphones are best.
- **The Claude-app voice agent is separate.** It speaks with the app's own voice and writes `/live/`, not the chat session, so Recite never reads it twice (`Servex/ext/remote/doc/cloud-voice-agent.md`). From the phone, `/recite/*` goes through the site gateway exactly like `/whisper/*`.
- **Reading starts only for new replies** (lines under 2 minutes old), never for history on a reload.

## Files

- [Recite.js](Recite.js), [BargeIn.js](BargeIn.js), [ReciteBar.js](ReciteBar.js), [Recite.css](Recite.css), [page.js](page.js) (the demo)
- [Recite.test.mjs](Recite.test.mjs): runs on [the test page](/framework/core/Test/view/?file=audio/Recite/Recite.test.mjs) (it needs the DOM; in node it skips). The server's test is `Servex/ext/recite/recite.test.mjs`.
- [doc/architecture.md](doc/architecture.md)

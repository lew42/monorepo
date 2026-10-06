# Voice — text to speech

`window.speechSynthesis` is the whole engine — the browser's own built-in text-to-speech, the
output half of the mic pair (`Transcriber` turns speech INTO text; `Voice` turns text BACK into
speech). Nothing to install, nothing to run.

## Use

```js
import Voice from "/framework/audio/Voice/Voice.js";

const voice = new Voice();
voice.speak("Hello there.");   // → voice.state === "speaking", then "idle" when done
voice.rate = 1.3;               // takes effect on the NEXT speak()
voice.pick(voice.voices()[2]);  // choose a voice by its SpeechSynthesisVoice object
```

## Watch out

- The browser's voice list (`voice.voices()`) can come back empty right after the page loads —
  wait for `on_voices_ready()`, don't read it once and give up.
- There's no local engine (the way `Transcriber.Whisper` wraps whisper-server) — checked, nothing
  like that is installed on this machine today. `doc/decisions.md`'s `d-voice-engine` has the
  reasoning and what a local one would need.

## More

- [Overview](/framework/audio/Voice/) — the live demo
- [`../readme.md`](../readme.md) — the audio/ library
- [`../doc/decisions.md`](../doc/decisions.md) — `d-voice-engine`: why browser, not local, for now

# Recite — reads the AI's replies aloud

Recite is text to speech, the reverse of transcription. It reads a reply out loud with a local voice, so you can use the site on a walk without looking at the screen. It has a playhead (pause, back 10 s, restart), and it pauses when you start talking — then picks back up once you go quiet, from the start of the sentence it cut off; a new question instead drops the rest, since a new answer is coming. A reply that arrives while another is already playing queues behind it, and a reply never starts over your own voice. [The live demo](/framework/audio/Recite/).

## Use

```js
import Recite from "/framework/audio/Recite/Recite.js";

const recite = Recite.shared;        // one per page, so two chat views never read over each other
recite.read("A reply to read.");     // or recite.queue(text): after what is playing
recite.pause(); recite.back(10); recite.restart();
recite.bar;                          // the one-line control; while state is `heard` or `paused`, its Play button is the resume control
```

**Turn-taking settings:** `recite.turn_wait_ms` (default 1500) is how much quiet is needed before a freshly queued reply starts over the owner; `recite.barge.quiet_ms` (default 1500) is how much quiet is needed after a barge-in before the cut reply resumes.

In the chat it is already wired: the phone sheet (✦) shows the bar above the mic, and every reply from the smart assistant is read as it streams.

## Architecture

- **`Recite`** ([Recite.js](Recite.js)) is the manager. It splits text into sentences, has its `Voice` render each one, and plays them on one timeline through one `<audio>` element. It checks the server and falls back to the browser's voice when it is down. It also follows a chat session's live wire (`from_wire(ev)`).
- **`Voice`** ([../Voice/Voice.js](../Voice/Voice.js)) is one voice, a persona: a recite-server voice id and a speed. `render(text)` returns one sentence as a WAV; `speak(text)` is the browser's own voice. `Voice.PERSONAS` lists seven.
- **`Recite.BargeIn`** ([BargeIn.js](BargeIn.js)) listens while Recite reads. A sound above the threshold pauses at once; then Whisper checks it. No words means noise, and reading resumes; your words keep it paused. With the chat's mic on, it listens to that mic instead of opening a second one.
- **`Recite.Bar`** ([ReciteBar.js](ReciteBar.js)) is the control line: read new replies (on/off), play/pause, back 10 s, restart, the progress line, the voice, and the ear (barge-in on/off) with its threshold. Under it, while reading, the karaoke line: the sentence being read, its current word lit.
- **`Recite.Highlight`** ([ReciteHighlight.js](ReciteHighlight.js)) is the karaoke playhead in the chat itself: it finds the sentence being read in the bubbles (V1, V2, V3, or anything marked `data-recite-root`) and lights the sentence and the current word with the CSS Highlight API, changing no DOM. Kokoro gives no word timings, so the word is placed by its share of the sentence's seconds.

Decisions and why: [doc/architecture.md](doc/architecture.md).

## How it is wired

- **The server:** recite-server, Kokoro-82M on the CPU, port 8177. Servex starts and watches it (`Servex/ext/recite/readme.md`).
- **The URL:** `http://127.0.0.1:8177` on this machine; `<origin>/recite` anywhere else, through the dev server's proxy ([Server/plugins/Recite.js](../../../../Server/plugins/Recite.js)).
- **The chat:** [ux/Dictate/chat.js](../../ux/Dictate/chat.js) passes every event on the session's live wire to `Recite.shared.from_wire(ev)`, and gives barge-in the chat's mic (`barge.use_mic`). [ux/Dictate/DictationBar.js](../../ux/Dictate/DictationBar.js) puts the bar above the mic.
- **Saved settings:** localStorage keys `lew42.recite.voice`, `.auto`, `.barge`, `.threshold`, per browser. `lew42.recite.played` holds the last 200 message ids read in full, so a reload a moment later never reads one twice (item 20, 2026-11-01); keyed by the reply's own id where one exists (a Prompt `replies.add` line), or its `{chat}` line's `at` timestamp otherwise.

## Open, by the agreed build order

Only resume + queueing + turn-taking (this page's piece (a)) has landed so far. Still to come, in this order:

1. **No flood + prioritise** (if not folded into a small change already): one quiet window of 2–3 s (not 1.5 s) before a queued reply releases; the one reply that directly answers the owner's latest line plays first; an agent update collapses into one spoken line ("I have an update on X, tap to hear it") instead of being read in full.
2. **Echo suppression** — the read-aloud voice leaking into the mic: `echoCancellation`/`noiseSuppression` in `getUserMedia`, ignoring heard words that match the sentence being read, and a higher mic threshold while playing and ~1.5 s after (so coughs and leakage don't fire a barge-in).
3. **Highlight dropout** — the karaoke highlight skipping whole sentences — plus subtle lit words: the bubble text stays muted until read, then each word lights up and stays lit as it is said (the visible "read" marker; the played flag above stays data-only).
4. **(b) Tap to pause** — tapping a bubble plays/pauses it, ignoring taps on links, mention chips and buttons.
5. **Resumable bubbles** — tapping an old bubble replays it from its last spoken word, regenerating the audio each time by default (a `replay_audio: "regenerate" | "keep"` setting).
6. **Bubble toolbar + voice chevron** — a per-bubble voice toolbar (play/pause, back 10 s; small targets are fine) in place of the tiny bottom-left button, and a dropdown chevron on the voice name in `ReciteBar` (today's heart icon reads as a "like" button).
7. **(c) Karaoke follow** — without phrase-level streaming.

The owner's own order and why: [requirements.md, "Order now"](/framework/ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/read-aloud-next/requirements.md).

## Watch out

- **A phone plays sound only after a tap on the page.** A reply arrives from the network, not from a tap, so Recite unlocks its one `<audio>` on the first tap anywhere (the mic, a button: `unlock_on_tap()` plays a silent tenth of a second). A reply the browser refused before that tap starts on it; until then the bar says to tap play.
- **Back 10 s needs recite-server.** With the browser's voice it steps by sentence.
- **Speakers leak into the mic.** Not built yet (the owner has heard the leak): the plan is echo cancelling in `getUserMedia`, plus ignoring words that match the sentence being read. Headphones are best until then.
- **The Claude-app voice agent is separate.** It speaks with the app's own voice and writes `/live/`, not the chat session, so Recite never reads it twice (`Servex/ext/remote/doc/cloud-voice-agent.md`). From the phone, `/recite/*` goes through the site gateway exactly like `/whisper/*`.
- **Reading starts only for new replies** (lines under 2 minutes old), never for history on a reload.
- **Open item: `chunks` never shrinks until a full `stop()`.** Each queued reply's rendered audio (a blob URL) stays in memory for the whole session; a very long session with no interruption and no session switch holds every reply's audio at once. Deferred (review note 9, 2026-11-01): a page reload bounds it in practice, so no eviction was added. [doc/architecture.md](doc/architecture.md) has the detail.

## Why it was silent

Every read-aloud step writes one `recite` line to [the Whisper log](/framework/audio/Whisper/log/) (`trace()`): reply heard, not read because 🗣 is off, speak asked / spoke / failed, play refused, unlocked by a tap. Open the log to see where a silent phone stopped. The same steps also land in the voice session's own file as `log` lines (`Recite.on_trace`, wired by the ✦ Sheet to `ext/Chat/v2/report.js` `diag()`).

**Who starts it:** the ✦ Sheet (`ext/drawer/Sheet.js` `read_aloud()`), on every page: it makes `Recite.shared` and follows the current voice session's live wire, so replies are read whichever chat view (V1, V2, V3) is showing.

## Files

- [Recite.js](Recite.js), [BargeIn.js](BargeIn.js), [ReciteBar.js](ReciteBar.js), [ReciteHighlight.js](ReciteHighlight.js), [Recite.css](Recite.css), [page.js](page.js) (the demo)
- [Recite.test.mjs](Recite.test.mjs): runs on [the test page](/framework/core/Test/view/?file=audio/Recite/Recite.test.mjs) (it needs the DOM; in node it skips). The server's test is `Servex/ext/recite/recite.test.mjs`.
- [doc/architecture.md](doc/architecture.md), [doc/voice-models.md](doc/voice-models.md) (what Kokoro costs here, and which voices sound better)

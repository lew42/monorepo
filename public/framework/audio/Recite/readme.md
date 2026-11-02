# Recite — reads the AI's replies aloud

Recite is text to speech, the reverse of transcription. It reads a reply out loud with a local voice, so you can use the site on a walk without looking at the screen. It has a playhead (pause, back 10 s, restart), and it pauses when you start talking — then picks back up once you go quiet, from the start of the sentence it cut off; a new question instead drops the rest, since a new answer is coming. A reply that arrives while another is already playing queues behind it, and a reply never starts over your own voice. Tapping a chat bubble is the same play/pause gesture as the bar. [The live demo](/framework/audio/Recite/).

## Use

```js
import Recite from "/framework/audio/Recite/Recite.js";

const recite = Recite.shared;        // one per page, so two chat views never read over each other
recite.read("A reply to read.");     // or recite.queue(text): after what is playing
recite.pause(); recite.back(10); recite.restart();
recite.bar;                          // the one-line control; while state is `heard` or `paused`, its Play button is the resume control
```

Tapping any chat bubble (the same gesture, not a second control) plays or pauses whatever Recite is doing right now — a tap on a link, a mention chip or a button inside it does its own thing instead.

**Turn-taking settings:** `recite.turn_wait_ms` (default 2500: 2–3 s, no flood) is how much quiet is needed before a freshly queued reply starts over the owner; `recite.barge.quiet_ms` (default 2500) is how much quiet is needed after a barge-in before the cut reply resumes — a separate field with the same default, not merged into one setting, since several tests set it directly for speed.

**No flood:** a reply from any assistant but the smart one is an agent update — never read in full, it collapses to "I have an update on {agent}, tap to hear it." If the owner's own line is still awaiting the direct answer, the update waits and the direct answer plays ahead of it; that guarantee only covers updates held for that reason — one already queued earlier (or a second direct reply) keeps its place in line, same as any other reply. The tap half of the spoken line isn't true yet: tapping a bubble pauses or resumes whatever Recite is doing now, never replays that one update — [Resumable bubbles](#open-by-the-agreed-build-order) is the piece that will.

**Echo settings:** `recite.echo_guard_ms` (default 1500) is how long after playback stops the echo guard below still applies; `recite.barge.echo_threshold_mult` (default 1.6) raises the barge-in loudness floor during that guard, so the voice itself and a cough right after it don't hold a reply or fire the fast trigger; `recite.barge.near_silent` (default 0.045) is the own-mic peak level below which a Whisper final is treated as hallucinated, not real speech.

**The thinking cue:** `recite.thinking_cue` (default `true`) plays a short, subtle generated tone once the owner's line lands and a reply has not started yet, again `recite.cue_repeat_ms` (default 2000 ms) later if it still has not — then it stays quiet. Set `thinking_cue = false` to turn it off.

In the chat it is already wired: the phone sheet (✦) shows the bar above the mic, and every reply from the smart assistant is read as it streams.

## Architecture

- **`Recite`** ([Recite.js](Recite.js)) is the manager. It splits text into sentences, has its `Voice` render each one, and plays them on one timeline through one `<audio>` element. It checks the server and falls back to the browser's voice when it is down. It also follows a chat session's live wire (`from_wire(ev)`).
- **`Voice`** ([../Voice/Voice.js](../Voice/Voice.js)) is one voice, a persona: a recite-server voice id and a speed. `render(text)` returns one sentence as a WAV; `speak(text)` is the browser's own voice. `Voice.PERSONAS` lists seven.
- **`Recite.BargeIn`** ([BargeIn.js](BargeIn.js)) listens while Recite reads. A sound above the threshold pauses at once; then Whisper checks it. No words means noise, and reading resumes; your words keep it paused. With the chat's mic on, it listens to that mic instead of opening a second one.
- **`Recite.Bar`** ([ReciteBar.js](ReciteBar.js)) is the control line: read new replies (on/off), play/pause, back 10 s, restart, the progress line, the voice, and the ear (barge-in on/off) with its threshold. Under it, while reading, the karaoke line: the sentence being read, its current word lit.
- **`Recite.Highlight`** ([ReciteHighlight.js](ReciteHighlight.js)) is the karaoke playhead in the chat itself: it finds the sentence being read in the bubbles (V1, V2, V3, or anything marked `data-recite-root`) and lights the sentence and the current word with the CSS Highlight API, changing no DOM. Kokoro gives no word timings, so the word is placed by its share of the sentence's seconds.
- **`Recite.Tap`** ([ReciteTap.js](ReciteTap.js)) is tap to pause: one document click listener toggles play/pause the moment a tap lands inside a chat bubble (the same `ReciteHighlight.ROOTS` selector), skipping a link, a mention chip, a button or the bar's own copy.

Decisions and why: [doc/architecture.md](doc/architecture.md).

## How it is wired

- **The server:** recite-server, Kokoro-82M on the CPU, port 8177. Servex starts and watches it (`Servex/ext/recite/readme.md`).
- **The URL:** `http://127.0.0.1:8177` on this machine; `<origin>/recite` anywhere else, through the dev server's proxy ([Server/plugins/Recite.js](../../../../Server/plugins/Recite.js)).
- **The chat:** [ux/Dictate/chat.js](../../ux/Dictate/chat.js) passes every event on the session's live wire to `Recite.shared.from_wire(ev)`, and gives barge-in the chat's mic (`barge.use_mic`). [ux/Dictate/DictationBar.js](../../ux/Dictate/DictationBar.js) puts the bar above the mic.
- **Saved settings:** localStorage keys `lew42.recite.voice`, `.auto`, `.barge`, `.threshold`, per browser. `lew42.recite.played` holds the last 200 message ids read in full, so a reload a moment later never reads one twice (item 20, 2026-11-01); keyed by the reply's own id where one exists (a Prompt `replies.add` line), or its `{chat}` line's `at` timestamp otherwise.

## Open, by the agreed build order

Resume + queueing + turn-taking (piece (a)), echo suppression, the thinking cue, the highlight dropout fix (+ lit words), no-flood + prioritise, and tap to pause (piece (b)) have landed. Still to come, in this order:

1. **Resumable bubbles** — tapping an old bubble replays it from its last spoken word, regenerating the audio each time by default (a `replay_audio: "regenerate" | "keep"` setting). This is also the piece that makes an agent update's own spoken line ("tap to hear it") true: today tapping only pauses or resumes whatever Recite is already doing, never replays that specific update.
2. **Bubble toolbar + voice chevron** — a per-bubble voice toolbar (play/pause, back 10 s; small targets are fine) in place of the tiny bottom-left button, a dropdown chevron on the voice name in `ReciteBar` (today's heart icon reads as a "like" button), and the `read_aloud_hidden: "keep" | "pause"` setting (default `keep`; `pause` stops playback on `visibilitychange` to hidden and resumes when the page is visible again).
3. **(c) Karaoke follow** — without phrase-level streaming.
4. **Gate Dictate's send path on the echo/phantom guards** — proposed to `mastermind-ink-check` ([doc/architecture.md](doc/architecture.md), the echo decision's open item), not scheduled yet.

Not built, and not on this list: the polite interjection ("excuse me", then wait) — a ⬜ in `ux/Dictate/doc/turn-taking.md`, "Voice dynamics" (no page there to link; the file is in the repo).

The owner's own order and why: `ai/sessions/2026/10/20/session-e00f55c9/dictation-v3/read-aloud-next/requirements.md`, "Order now" (a task folder, not a routed page — no live link).

## Watch out

- **A phone plays sound only after a tap on the page.** A reply arrives from the network, not from a tap, so Recite unlocks its one `<audio>` on the first tap anywhere (the mic, a button: `unlock_on_tap()` plays a silent tenth of a second). A reply the browser refused before that tap starts on it; until then the bar says to tap play.
- **Back 10 s needs recite-server.** With the browser's voice it steps by sentence.
- **Speakers leak into the mic — guarded, not eliminated.** `getUserMedia`'s own echo cancelling, a fuzzy word match against the sentence being read, and a raised mic threshold all run while `recite.echo_active()` (doc/architecture.md has the detail); a phone's speaker leak is still the hardest case for the browser's own `echoCancellation`, so headphones remain the most reliable option.
- **The Claude-app voice agent is separate.** It speaks with the app's own voice and writes `/live/`, not the chat session, so Recite never reads it twice (`Servex/ext/remote/doc/cloud-voice-agent.md`). From the phone, `/recite/*` goes through the site gateway exactly like `/whisper/*`.
- **Reading starts only for new replies** (lines under 2 minutes old), never for history on a reload.
- **With the ear (barge-in) off, a reply never waits for you.** `speaking()` requires `barge.on`; turning the ear off is the opt-out from turn-taking, so a freshly queued reply starts right away even if you are still mid-sentence. Intended, not a bug.
- **Open item: `chunks` never shrinks until a full `stop()`.** Each queued reply's rendered audio (a blob URL) stays in memory for the whole session; a very long session with no interruption and no session switch holds every reply's audio at once. Deferred: a page reload bounds it in practice, so no eviction was added. [doc/architecture.md](doc/architecture.md) has the detail.

## Why it was silent

Every read-aloud step writes one `recite` line to [the Whisper log](/framework/audio/Whisper/log/) (`trace()`): reply heard, not read because 🗣 is off, speak asked / spoke / failed, play refused, unlocked by a tap. Open the log to see where a silent phone stopped. The same steps also land in the voice session's own file as `log` lines (`Recite.on_trace`, wired by the ✦ Sheet to `ext/Chat/v2/report.js` `diag()`).

**Who starts it:** the ✦ Sheet (`ext/drawer/Sheet.js` `read_aloud()`), on every page: it makes `Recite.shared` and follows the current voice session's live wire, so replies are read whichever chat view (V1, V2, V3) is showing.

## Files

- [Recite.js](Recite.js), [BargeIn.js](BargeIn.js), [ReciteBar.js](ReciteBar.js), [ReciteHighlight.js](ReciteHighlight.js), [ReciteTap.js](ReciteTap.js), [Recite.css](Recite.css), [page.js](page.js) (the demo)
- [Recite.test.mjs](Recite.test.mjs): runs on [the test page](/framework/core/Test/view/?file=audio/Recite/Recite.test.mjs) (it needs the DOM; in node it skips). The server's test is `Servex/ext/recite/recite.test.mjs`.
- [doc/architecture.md](doc/architecture.md), [doc/voice-models.md](doc/voice-models.md) (what Kokoro costs here, and which voices sound better)

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

Tapping a reply bubble's text (or its ▶/⏸) plays or pauses that bubble — from the word it last stopped at, else its start; ↺10 steps back about 10 s. A tap anywhere else in the chat toggles whatever Recite is reading now. A tap on a link, a mention chip or a button does its own thing instead.

**Turn-taking settings:** `recite.turn_wait_ms` (default 2500: 2–3 s, no flood) is how much quiet is needed before a freshly queued reply starts over the owner; `recite.barge.quiet_ms` (default 2500) is how much quiet is needed after a barge-in before the cut reply resumes — a separate field with the same default, not merged into one setting, since several tests set it directly for speed.

**No flood:** a reply from a tracked agent role (`mastermind-`/`minion-`/`reviewer-`/`clarity-` — not the smart one, and not `fast`/`revise`/`card`, which keep being ignored as before) is an agent update — never read in full, it collapses to "I have an update on {agent}, it is in the chat." If the owner's own line is still awaiting the direct answer, the update waits and the direct answer plays ahead of it; that guarantee only covers updates held for that reason — one already queued earlier (or a second direct reply) keeps its place in line, same as any other reply. Tapping a bubble (or its ▶) plays that reply again — an agent update's bubble included — so "it is in the chat" can be followed by a tap ([Recite.Bubble](#architecture)).

**Echo settings:** `recite.echo_guard_ms` (default 1500) is how long after playback stops the echo guard below still applies; `recite.barge.echo_threshold_mult` (default 1.6) raises the barge-in loudness floor during that guard, so the voice itself and a cough right after it don't hold a reply or fire the fast trigger; `recite.barge.near_silent` (default 0.045) is the own-mic peak level below which a Whisper final is treated as hallucinated, not real speech.

**The thinking cue:** a short, subtle generated tone that replaces a long silence. It plays only when the voice agent fires it, by writing the session line `{"thinking":{"by":"smart"}}` (`item({path: <session>, delta: {thinking: {by: "smart"}}})`); `Recite.start_thinking()` then plays it and repeats every `recite.cue_repeat_ms` (default 2000 ms) until the reply starts (or 60 s pass with none). A plain owner line plays nothing. `recite.thinking_cue = false` turns it off.

In the chat it is already wired: the phone sheet (✦) shows the bar above the mic, and every reply from the smart assistant is read as it streams.

## Architecture

- **`Recite`** ([Recite.js](Recite.js)) is the manager. It splits text into sentences, has its `Voice` render each one, and plays them on one timeline through one `<audio>` element. It checks the server and falls back to the browser's voice when it is down. It also follows a chat session's live wire (`from_wire(ev)`).
- **`Voice`** ([../Voice/Voice.js](../Voice/Voice.js)) is one voice, a persona: a recite-server voice id and a speed. `render(text)` returns one sentence as a WAV; `speak(text)` is the browser's own voice. `Voice.PERSONAS` lists seven.
- **`Recite.BargeIn`** ([BargeIn.js](BargeIn.js)) listens while Recite reads, in one of two modes (`barge.mode`, the button beside the ear in the bar: the graphic_eq icon is `volume`, the abc icon is `words`, saved as `lew42.recite.barge_mode`). `volume` (default): a sound above the threshold pauses at once; then Whisper checks it. `words`: a loud sound only starts the Whisper check and reading keeps going; it pauses only when Whisper returns real words (not noise, not a phantom phrase, not Recite's own voice). In both, no words means noise and reading resumes; your words keep it paused. It is shaped as a plugin: `static id = "barge"`, `label`, `defaults = {on, mode}`, instance `start()` / `stop()` (`stop()` removes the mic hook, timers and listeners and leaves Recite as if the feature were off). With the chat's mic on, it listens to that mic instead of opening a second one.
- **`Recite.Bar`** ([ReciteBar.js](ReciteBar.js)) is the control line: read new replies (on/off), play/pause, back 10 s, restart, the progress line, the voice, the ear (barge-in on/off), the interrupt-mode button (loud / real words) and the threshold. Under it, while reading, the karaoke line: the sentence being read, its current word lit.
- **`Recite.Highlight`** ([ReciteHighlight.js](ReciteHighlight.js)) is the karaoke playhead in the chat itself: it finds the sentence being read in the bubbles (V1, V2, V3, or anything marked `data-recite-root`) and lights the sentence and the current word with the CSS Highlight API, changing no DOM. Kokoro gives no word timings, so the word is placed by its share of the sentence's seconds. **A reply queued for a message (`final(text, id)`) is lit in ITS bubble only** (2026-11-02): its chunks carry `msg`, and `find(words, msg)` looks in the element marked `data-id` (V2/V3 replies) or `data-re` (V1 pieces) with that id, so an older bubble that opens with the same words is never lit for it. A reply streamed before its message exists, or a surface with no such id, falls back to searching by words, newest first (test: `Recite.test.mjs`, "two bubbles with the same opening words").
- **`Recite.Tap`** ([ReciteTap.js](ReciteTap.js)) is the tap: one document click listener. A tap inside a reply bubble that carries `Recite.Bubble` plays or pauses that bubble (`tap_bubble`); a tap elsewhere in the chat (the same `ReciteHighlight.ROOTS` selector) toggles whatever is being read. A link, a mention chip, a button or the bar's own copy is skipped.

- **`Recite.Bubble`** ([ReciteBubble.js](ReciteBubble.js), [ReciteBubble.css](ReciteBubble.css)) is the one small control on an assistant reply bubble, mounted by each chat view and shown only on the bubble you tapped or that is playing (an idle bubble shows none; ↺10 appears once it has played): **▶/⏸** plays or pauses that bubble, **↺10** steps back about 10 s inside it. `Recite.Bubble.mount(bubble_el, { text: () => reply_text })` is the whole API; Chat V3 mounts it in `ChatV3.reply()` (V2 inherits it), Chat V1 in `ux/Dictate/Widget.js` (`replay_ctl`). A tap on the bubble's text does the same as ▶/⏸ (`Recite.Tap`; a link, a mention chip or a button keeps its own tap). The control loads `Recite.js` on the first tap, so a chat page that never taps starts no Recite.
  - **Which bubble is which:** `Recite.bubble_key(text)` — the first ten spoken words, lowercase, no marks — so a reply's markdown source (V3) and the text drawn on the page (V1) give the same key. Chunks carry it.
  - **Where it stopped:** each bubble's last place is `{i, t}` (sentence in the bubble, seconds into it), kept by `Recite.set_place` in memory and in the browser (`localStorage` `lew42.recite.places`, the newest 200, written about once a second and always on pause or stop). A bubble heard to its end forgets its place and starts from the top next time.
  - **Replay:** `Recite.replay(text, el, back)` stops whatever is playing, then queues that bubble's sentences and starts at its place (else the start), rendering through Kokoro again — audio is never kept. Sentences before the place stay unrendered; the highlight counts them as read. `tap_bubble` pauses or resumes the bubble being read and otherwise replays; `back_bubble` is ↺10 (`Recite.step_back`; a sentence not rendered yet counts at 15 characters a second). The queue rules for new replies are unchanged. Known limits: replaying a bubble is the same as the owner stopping the reader, so replies still waiting in the queue are dropped (a drop is not marked played; they are read from the chat by tapping them); and a Chat V1 bubble that merged several assistant replies is named by its first reply, so while a later one in that bubble plays its ▶ shows ▶ and a tap replays the whole bubble.
  - **Test:** [ReciteBubble.test.mjs](ReciteBubble.test.mjs) (headless Playwright, V1, V2 and V3, `FENCE_SERVEX=1`; recite-server stubbed) taps a finished bubble, sees "speak asked" for its first sentence, pauses, and plays it again from the place; the unit tests for the key, `step_back`, places and `replay` are in [Recite.test.mjs](Recite.test.mjs).

Decisions and why: [doc/architecture.md](doc/architecture.md).

## How it is wired

- **The server:** recite-server, Kokoro-82M on the CPU, port 8177. Servex starts and watches it (`Servex/ext/recite/readme.md`).
- **The URL:** `http://127.0.0.1:8177` on this machine; `<origin>/recite` anywhere else, through the dev server's proxy ([Server/plugins/Recite.js](../../../../Server/plugins/Recite.js)).
- **The chat:** [ux/Dictate/chat.js](../../ux/Dictate/chat.js) passes every event on the session's live wire to `Recite.shared.from_wire(ev)`, and gives barge-in the chat's mic (`barge.use_mic`). [ux/Dictate/DictationBar.js](../../ux/Dictate/DictationBar.js) puts the bar above the mic.
- **Saved settings:** localStorage keys `lew42.recite.voice`, `.auto`, `.barge`, `.threshold`, per browser. `lew42.recite.played` holds the last 200 message ids read in full, so a reload a moment later never reads one twice (item 20, 2026-11-01); keyed by the reply's own id where one exists (a Prompt `replies.add` line), or its `{chat}` line's `at` timestamp otherwise.

## Open, by the agreed build order

Resume + queueing + turn-taking (piece (a)), echo suppression, the thinking cue, the highlight dropout fix (+ lit words), no-flood + prioritise, tap to pause (piece (b)) and resumable bubbles with their ▶/⏸ and ↺10 (`Recite.Bubble`, above) have landed. Still to come, in this order:

1. **Voice chevron** — a dropdown chevron on the voice name in `ReciteBar` (today's heart icon reads as a "like" button), and the `read_aloud_hidden: "keep" | "pause"` setting (default `keep`; `pause` stops playback on `visibilitychange` to hidden and resumes when the page is visible again).
2. **(c) Karaoke follow** — without phrase-level streaming.
3. ~~Gate Dictate's send path on the echo/phantom guards~~ — done: [ux/Dictate/doc/phantom-gate.md](/framework/ux/Dictate/doc/phantom-gate.md).

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

- **A finished reply is not read twice.** The stream reads a reply sentence by sentence; when the settled line arrives later with slightly different or longer text, `final()` queues only the part the stream did not read (`unread_tail`), never the whole reply again. Before that fix (dictation-v3, 2026-11-01) the reply started over a few seconds in; the cause and the phone log lines are in the [playback-stutter findings](/framework/ai/sessions/2026/10/20/session-e00f55c9/playback-stutter/findings.md). Test: [playback-stutter.test.mjs](playback-stutter.test.mjs) (`FENCE_SERVEX=1 node playback-stutter.test.mjs <site url>`).

## Why it was silent

Every read-aloud step writes one `recite` line to [the Whisper log](/framework/audio/Whisper/log/) (`trace()`): reply heard, not read because 🗣 is off, speak asked / spoke / failed, play refused, unlocked by a tap. Open the log to see where a silent phone stopped. The same steps also land in the voice session's own file as `log` lines (`Recite.on_trace`, wired by the ✦ Sheet to `ext/Chat/v2/report.js` `diag()`).

**Who starts it:** the ✦ Sheet (`ext/drawer/Sheet.js` `read_aloud()`), on every page: it makes `Recite.shared` and follows the current voice session's live wire, so replies are read whichever chat view (V1, V2, V3) is showing.

## Files

- [Recite.js](Recite.js), [BargeIn.js](BargeIn.js), [phantom-phrases.js](phantom-phrases.js) (the one phrase list and `noise()` that `BargeIn` and the node test share), [ReciteBar.js](ReciteBar.js), [ReciteHighlight.js](ReciteHighlight.js), [ReciteTap.js](ReciteTap.js), [ReciteBubble.js](ReciteBubble.js), [ReciteBubble.css](ReciteBubble.css), [Recite.css](Recite.css), [page.js](page.js) (the demo), [playback-stutter.test.mjs](playback-stutter.test.mjs) (headless: no repeated start, the words interrupt)
- [ReciteBubble.test.mjs](ReciteBubble.test.mjs): the headless test of the bubble control in Chat V1, V2 and V3 (`FENCE_SERVEX=1 node ReciteBubble.test.mjs <site-url>`; also on the browser-scripts list).
- [Recite.test.mjs](Recite.test.mjs): runs on [the test page](/framework/core/Test/view/?file=audio/Recite/Recite.test.mjs) (it needs the DOM; in node it skips). The server's test is `Servex/ext/recite/recite.test.mjs`.
- [doc/architecture.md](doc/architecture.md), [doc/voice-models.md](doc/voice-models.md) (what Kokoro costs here, and which voices sound better)

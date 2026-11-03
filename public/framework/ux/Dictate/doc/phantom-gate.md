# Phantom gate — a Whisper hallucination never reaches the chat

A stock Whisper hallucination ("Thank you.", "you"…) used to still post to the session: `audio/Recite/BargeIn`'s
`owner_spoke()` could stop it from pausing a reply, but by then the line had already gone out over `Session.say()`
([`audio/Recite/doc/architecture.md`](/framework/audio/Recite/doc/architecture.md), was its "open item").

## What drops

`ux/Dictate/chat.js`'s `deliver()` — the one choke point every sentence (typed, whisper, pause-send, sentence-send)
passes through before `Session.say()` — calls `should_drop_phantom()` first. A line drops when:

- `BargeIn.noise(text)` is true (the phrase is on the blocklist) **and** either Recite is speaking right now or just
  stopped (`echo_active()`), or the clip was short (under 2 s), or its weakest word's probability was low (under 0.3).
- or `BargeIn.echo(text)` matches the sentence Recite is reading, while Recite is active.

A **typed** line is never checked — only a spoken one can be a mis-heard Whisper reply. A real "Thank you very much
for that." is never dropped: it isn't on the blocklist at all, so `noise()` is already false.

## Where it lives

- `ux/Dictate/phantom-gate.js` — the pure function (`should_drop_phantom`) and `whisper_info()` (reads the duration
  and the lowest per-word probability out of one `on_whisper` line). Takes `BargeIn.noise`/`Recite.shared` as
  arguments rather than importing `BargeIn.js` itself, so this file stays loadable by plain `node` with no browser
  (`BargeIn.js` pulls in `Part`/`MicStream`/`Whisper`, all browser-only).
- `ux/Dictate/test/phantom-gate.mjs` — `node ux/Dictate/test/phantom-gate.mjs`, fixtures from the real evidence
  (`ai/whisper/bucket.jsonl` seq175, seq995).
- `ux/Dictate/chat.js` — wires it in: a `panel.dictate.on_whisper` listener keeps the last FINAL Whisper reply's
  duration/word-probability; `deliver()` checks the gate with that info before anything else.

## A drop is logged, never silent

Every drop appends one `{src:"composer", kind:"dropped"}` line to `ai/whisper/bucket.jsonl` (`WhisperLog.event`),
with the text, the reason (`"short-clip"`, `"low-word-prob"`, `"echo-while-noise"`, `"echo-match"`) and the info used
— so a wrong drop (a real "thank you" that never landed) is visible, not a silent mystery.

## Known gap

Nothing ties a specific sentence to the Whisper final it came from (`ComposerMic`'s own send pipeline carries no
such id) — the gate reads whichever final arrived most recently. Safe in practice, since it only ever changes the
outcome for a line that is *already* on the stock-phrase blocklist.

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

**`mode: "open"`** — the live open mic (`talk`, AI 2's composer): the mic stays on
indefinitely, `on_text` fires once per finished sentence with nothing ever written into
`$input`, and "stop after a pause" is hidden since nothing should stop it. See "Open mic"
in [`doc/decisions.md`](/framework/ux/Dictate/doc/decisions/).

## Revise — clean up the words after they're heard

```js
new Dictate({
	revise: "edit",                              // "clean" | "edit" | "summary" | false (default)
	on_text: text => …,                           // the RAW text — unchanged, fires first, always
	on_revised: (text, { raw, level }) => …,       // the revised text, a moment later, only if it worked
});
```

`revise` is `false` by default, so nothing changes for a caller that doesn't ask — the raw
text is ALWAYS kept, `on_text` fires exactly as it always did, and revising never blocks or
slows it down. When `revise` names a level, [`ux/Revise`](/framework/ux/Revise/) runs in the
background and, once Servex answers: logs the revision as its OWN line (`{type:"revision",
of, level, text}`, `of` pointing back at the raw line's own id — never merged into it, never
written for a guess or an in-between chunk, only the finished text), and, if the caller set
one, calls `on_revised(text, {raw, level})` too. A Servex that isn't up (or any other
failure) logs nothing and never calls `on_revised` for that chunk — nothing throws, nothing
is typed into a box on your behalf. Two real callers: `ext/drawer/rail.js`'s mobile
assistant (`revise: "edit"`, a second card once the tightened version is ready) and
`ai2/compose.js` (`revise: "edit"`, forwarded by `ext/Chat/Composer.js` into `ComposerMic` —
its box still shows only the raw words; the revision is a log line, not a box rewrite).
See it work, chunk by chunk, at the [playground](/framework/ux/Dictate/playground/).

## Voice → log

Every finished utterance also becomes a log entry, not just words on screen —
`{at, type: "prompt", by: "owner", text, via: "whisper"}` posted to Servex
(`http://127.0.0.1:8090/log/prompts`), falling back to the dev server's own append route
when Servex isn't up yet. See "Voice → log" in
[`doc/decisions.md`](/framework/ux/Dictate/doc/decisions/).

## Watch out

- **The caption is never cleared before the real text is ready to replace it.** An earlier
  build cleared the grey guess the INSTANT a segment closed, then repainted the caption
  again once Whisper's answer came back — two real frames, with the caption visibly
  shorter in between for however long Whisper took (smooth when it was fast, "erased and
  redrawn in two steps" when it wasn't — the owner, 2026-09-29). `close_segment()` now
  only clears the guess in the SAME `draw_caption()` call that shows the real text, or
  gives up on the segment — never a visible gap. Measured with a `ResizeObserver`:
  `ai/2026-09-29/audio/b-refine/task.jsonl`.
- **Silence is never sent.** Whisper answers a recording with no speech in it by inventing
  a sentence — "Thank you." — so a segment carrying less than `min_speech_ms` (120ms) of
  actual speech is not transcribed at all, and whisper's non-speech labels (`*shriek*`,
  `[BLANK_AUDIO]`) are dropped rather than typed into the box. The measurements, and how to
  capture the exact bytes your browser sent:
  [`doc/silence.md`](/framework/ux/Dictate/doc/silence/).
- **Which microphone.** `new Dictate({ device_id })` opens a specific one; with no
  `device_id` it uses whatever the owner picked on the
  [test bench](/framework/ai/2026-09-22/dictate-silence/), remembered in this browser under
  `DEVICE_KEY` (exported here, written by `remember_device()`). A remembered device that has
  been unplugged falls back to the system default rather than failing.
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

## Variants — the same mic, a different look

**A variant is a `Dictate` subclass that overrides one or two methods** — `build_output()`
(what holds the transcript) and/or `draw_caption()` (how a settled sentence and the live guess
are drawn). Everything else — the engines, every error message, the start sound's real timing —
is inherited untouched. Today's box is `v1`, kept on its own url forever so a newer variant can
never quietly delete it. [The wall of them](/framework/ux/Dictate/variants/):

- **v1** — today's box, unchanged.
- **Cards** — the mobile "prompt cards" flow: each finished sentence becomes its own card.
- **Compact** — one short line for a toolbar, never a growing block.
- **[Parts](/framework/ux/Dictate/variants/parts/)** — the whisper half rebuilt on
  [`audio/`](/framework/audio/)'s `MicStream` + rolling-window `Transcriber.Whisper` instead of
  this module's own `capture.js` + cut-and-append segments (same caption, same log, same
  `revise:`) — measured fewer hallucinated/lost words at a segment's edge. Not the default yet;
  try it, then switch.

## More

- **Starting a new round? Read [`doc/handover.md`](/framework/ux/Dictate/doc/handover/) first** — where the pieces live (`ext/Chat/Mic.js`
  is Dictate's too), every setting, the rules learned the hard way, how to test, what is open
- **Mic feedback and https on the LAN:** [`doc/https-lan.md`](/framework/ux/Dictate/doc/https-lan/) —
  why the start sound could play with no error on a phone over plain http, and the cleanest way
  to get https on the LAN so a phone's mic works at all
- **What's in flight for dictation** — the Overview's own strip, drawn by [`page_work`](/framework/core/Page/ai/) (`core/Page/ai/work.js`), keyword-matched against Servex's open cards and agents
- [Overview](/framework/ux/Dictate/) — press 🎤 and watch it work · [words](/framework/ux/Dictate/words/) —
  the same box under `ui-contrast ui-compact` · [variants](/framework/ux/Dictate/variants/) —
  the same mic, three different looks
- [`doc/decisions.md`](/framework/ux/Dictate/doc/decisions/) — the install, the CORS finding, the
  segment/resend mechanics, the RMS numbers, who starts `whisper-server`
- [`doc/silence.md`](/framework/ux/Dictate/doc/silence/) — why whisper said "Thank you", the
  20ms-frame measurement that stopped it, and the `$DICTATE_DUMP` seam
- [Test bench](/framework/ai/2026-09-22/dictate-silence/) — record 3 seconds and see the real
  numbers, whisper's raw answer, and the WAV itself
- [`ext/Ask/reply.js`](/framework/ext/Ask/) — the reply mic and the dictate box, now built on this
- Files: `Dictate.js` (the class), `capture.js` (mic → 16kHz WAV, no library), `pcm-worklet.js`
  (the `AudioWorklet` that reads raw samples), `Dictate.css` (the level meter, the pulse)

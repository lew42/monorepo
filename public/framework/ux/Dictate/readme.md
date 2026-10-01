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

## Widget — one compact widget, the same everywhere

**The ✦ sheet's own look — a mic, the still-moving live line, one chat bubble per settled
sentence — is now a class**, [`Widget.js`](Widget.js), instead of markup copied into every
place that wants it:

```js
import Widget from "/framework/ux/Dictate/Widget.js";

new Widget();                                    // just the mic + bubbles
new Widget({ level: true, source: true });        // + a level meter, + a mic picker
new Widget({ debug: true });                      // + the "Debug ▾" bar
new Widget({ revision: "edit" });                  // ux/Revise tidies each sentence too
```

**The composer is a column, not a row** (one-dictation, 2026-10-01 — the owner: the typed
box "needs to be like full width… the send button could be below it"): the typed buffer sits
on top, full width, growing taller line by line with no fixed height and no empty void below
a short line; the mic, Send and any extras (meter, mic picker, Sample) sit in their own row
underneath it. The live, still-moving guess (the grey caption) is never `position: absolute`
any more — it takes its own space below the mic button and the whole card grows to fit it,
instead of painting over whatever came next (the bug the owner found: "it's just rendering
like over the top of something else").

Four plain properties, every one `false`/off by default:

- **`level`** — a level meter beside the mic (the same smoothed number `Dictate`'s own
  tiny bar already reads, via `on_meter`).
- **`source`** — a `<select>` of audio input devices, remembered the same way every
  `Dictate` on the site remembers one.
- **`debug`** — a small "Debug ▾" toggle, collapsed by default. Opening it mounts the
  [playground](/framework/ux/Dictate/playground/)'s own widget (`pg.widget()`) right
  there — the SAME raw/clean/Chunks/Corrections/Live/Side-by-side tabs, reused whole,
  never rebuilt a second time. `pg` is one shared singleton pipeline, so a sentence said
  into `Widget`'s own mic also shows up in the debug panel's own session.
- **`revision`** — `"clean" | "edit" | "summary" | false`, forwarded straight to
  `Dictate`'s own `revise` option (above): a tidied version of each sentence becomes a
  second bubble, a moment later.
- **`answer(choice)`** and **`marks: true`** — the Chat HITL seam `ChatPanel` had: a
  `say({type: "ask", heading, choices, at})` call draws a choice-button question and
  `answer(choice)` fires on a tap; `marks: true` asks `ux/Understand` after each of your
  own lines and shows a small ✓/`?` beside it. Restored round 4 (`ai/2026-09-30/audio-
  consolidate/minion-wire/`) after the widget swap below had dropped them.

**On the [Dictate Overview](/framework/ux/Dictate/) today**, configured `{ level: true,
source: true, debug: true }`, right under the title, no paragraph above it — the owner's
own phone complaint this answers: "the button is so far down the page… the actual
transcription is below another paragraph or two." The OLD Overview (the five-tab
playground leading, same as it always did) is kept one click away at
[v1](/framework/ux/Dictate/v1/) — never destroy a viable version.

**This page IS the workbench** (one-dictation, 2026-10-01 — the owner: "the Dictate page
is the workbench… this whole thing is based on these AI sessions"). The Overview's demo is
not just a display any more — it is a real [`chat()`](#chatjs--one-mount-one-conversation-every-surface)
mount, so saying something there is actually answered, same as every other surface, and a fix
proved right there reaches all of them. Its own conversation is real but never remembered
(`keep: false` — see below); its own "New session" button is the one every surface shares.

## chat.js — one mount, one conversation, every surface

`chat(el, {path, card, placeholder, keep, level, source, debug})` draws the one chat box
every surface uses — the ✦ sheet, the ☰ AI tab, a card's own sidebar, the dev bar, and now
the Dictate page's own demo. `keep: true` (the default) joins the ONE global conversation
per browser tab, kept across every page; `keep: false` gives this one mount its OWN
conversation, remembered only as long as the mount itself exists — leave the page and come
back to a brand-new, empty one. `new_session_button(mount)` is the one "New session" button
every surface now shares, instead of each building its own. The call, `keep`'s exact rules,
why a reopened chat never loses old messages, and every older version still kept reachable
(`aiV2`, `askV1`, `chat_v1`, `foot()`): [`doc/chat.md`](/framework/ux/Dictate/doc/chat/).

## Surfaces — the same chat, live on every place it is mounted

[`surfaces/`](/framework/ux/Dictate/surfaces/) shows all five places `chat.js` is mounted,
side by side, each with a screenshot and the one line of code that built it. The full
site-wide audit — every `new Widget(`/`new Dictate(`/`dictate(`/`chat(` call found, which
ones are live, and why the rest are old versions kept reachable on purpose — is
[`ai/2026-09-30/one-dictation/minion-workbench/audit.md`](/framework/ai/2026-09-30/one-dictation/minion-workbench/audit.md).

## Revise — clean up the words after they're heard

```js
new Dictate({
	revise: "edit",                                    // "clean" | "edit" | "summary" | false (default)
	on_text: text => …,                                 // the RAW text — unchanged, fires first, always
	on_revised: (text, { raw, level, chunk_id }) => …,   // the revised text, a moment later, only if it worked
	on_revise_failed: ({ raw, level, chunk_id, why }) => …,   // instead of on_revised, if it didn't
});
```

`revise` is `false` by default, so nothing changes for a caller that doesn't ask — the raw
text is ALWAYS kept, `on_text` fires exactly as it always did, and revising never blocks or
slows it down. When `revise` names a level, [`ux/Revise`](/framework/ux/Revise/) runs in the
background with a little `before` context (the tail of everything already revised this
dictation) and, once Servex answers OK: logs the revision as its OWN line (`log_revision()`,
pointing back at the raw line's own id — never merged into it, never written for a guess or
an in-between chunk, only the finished text), and, if the caller set one, calls
`on_revised(text, {raw, level, chunk_id})` too. A failure (Servex down, or any other problem)
calls the SEPARATE `on_revise_failed({raw, level, chunk_id, why})` instead — `on_revised`
never fires with a falsy `text`, so an existing caller that only ever handled success can
never be handed `null` to draw a blank card for. Two real callers: `ext/drawer/rail.js`'s mobile assistant
(`revise: "edit"`, a second card once the tightened version is ready) and `ai2/compose.js`
(`revise: "clean"`, the **clean transcription mode**, forwarded by `ext/Chat/Composer.js`
into `ComposerMic` — see `ext/Chat/readme.md` for how its box now shows the clean text
in place, the raw dig-back toggle, and the kill switch; that same doc explains how the ~5s
wait before falling back to raw is `await_clean()` resolving early on `on_revise_failed`, not
a separate timeout). See it work, chunk by chunk, at the
[playground](/framework/ux/Dictate/playground/) (its own **Clean** tab is the default view).

## Voice → log

Every finished utterance also becomes a log entry, not just words on screen —
`{at, type: "prompt", by: "owner", text, via: "whisper"}` posted to Servex
(`http://127.0.0.1:8090/log/prompts`), falling back to the dev server's own append route
when Servex isn't up yet. Every posted entry also carries `floor` (and, after a dictation,
`cues`) — see the "floor" section below. One open question: it's not yet confirmed whether the
historical viewer (`ai/v/3/prompts.js`) reads the dev-server fallback file too, or only Servex's
own log — see `Server/doc/refine.md`'s "Ask 1" section. See "Voice → log" in
[`doc/decisions.md`](/framework/ux/Dictate/doc/decisions/).

## The floor: is the owner still talking?

Every entry `post_prompt()` sends carries `floor` (`"speaking"` or `"done"`) and, after a
dictation, `cues` (its pauses and speaking time), so an assistant can hold its reply while the
owner is mid-thought. [`floor.js`](floor.js) reads this component's own level meter; mic on
and off also post a `{type: "floor"}` line. `floor.on_quiet(fn)` fires once each time the owner
goes quiet for 2.5 s: a voice session's assistants answer on it. The contract for readers:
[`ext/Chat/doc/floor.md`](/framework/ext/Chat/).

## Watch out

- **Reopening the chat used to show an empty box.** A card switch, a tab reopen or a
  reload left the chat sitting empty until the owner said something new, even though
  the conversation was saved — fixed by re-reading the whole file from line 0 on
  every mount: [`doc/chat.md`](/framework/ux/Dictate/doc/chat/).
- **A chat mounted by a url, not a click, could get the wrong font.** Fixed in
  `ext/drawer/drawer.js`, not here: [`doc/chat.md`](/framework/ux/Dictate/doc/chat/).
- **The mic is given back the moment the page is hidden.** Switching apps on a phone used to leave
  dictation holding the microphone, so the next app's own dictation failed. Now every live `Dictate`
  stops and releases its tracks and audio context on `visibilitychange` (hidden) or `pagehide`, and
  restarts by itself, saying "resumed", when the page is shown again. A `Dictate` taken off the page
  while live stops itself too (`Dictate.js`, `LIVE`; mic-hijack, 2026-09-30). Dictating while another
  app is in front would need a PWA with a background process, or a native app.

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
- [Overview](/framework/ux/Dictate/) — the widget first, press 🎤 and watch it work ·
  [v1](/framework/ux/Dictate/v1/) — the old Overview, kept reachable · [words](/framework/ux/Dictate/words/) —
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
  (the `AudioWorklet` that reads raw samples), `Dictate.css` (the level meter, the pulse),
  `Widget.js` + `Widget.css` (the one compact widget — mic, live line, bubbles — see "Widget"
  above), `chat.js` (the one mount + the global session controller — see "chat.js" above),
  `v1/page.js` (the old Overview, frozen)

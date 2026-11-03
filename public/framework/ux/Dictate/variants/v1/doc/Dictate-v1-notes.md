# v1/Dictate.js — frozen snapshot notes

This file is the exact `ux/Dictate/Dictate.js` from before the 2026-09-29 mobile-nav task (commit 21eee692), copied here as its own module so "v1" stays reachable forever, unaffected by anything a later task does to the live `Dictate.js`. Only two lines were changed from the original: the two relative imports now point at the LIVE, absolute `/framework/...` files they always meant (`View.js`, `capture.js` — unchanged since this snapshot, so reusing them is exact, not an approximation), because a file living at a different depth needs a different relative path to the same thing. Everything else — every method, every constant — is byte-for-byte the code that shipped before this task, plus one new method at the bottom (`sample()`) added only so this page can show itself without a microphone; it changes nothing about how a real dictation behaves. Never edit this file to fix or improve anything in the LIVE `Dictate` — that work happens in `ux/Dictate/Dictate.js`, and never reaches this snapshot.

## API and design details (removed from code comments)

A 🎤 that dictates into one textarea (or hands text to a callback), with a state you can always see and an error said in plain words — the two things the old `ext/Ask/mic.js` control did not have.

```js
import Dictate, { dictate } from "/framework/ux/Dictate/Dictate.js";
dictate(() => this.$input, { on_start: () => this.open() });
// or: new Dictate({ on_text: text => … })   // no box — just the words
```

### Callbacks

`on_guess(text)` — optional, does nothing when unset: the still-moving grey guess, fired every partial resend (whisper) or interim result (the browser engine), text `""` the instant a segment closes. `on_text(chunk)` (above) is still the settled-chunk hook — `on_guess` only adds the in-between guess a caller building its own transcript view (`ux/Dictate/playground/`) needs.

`on_meter(level)` — optional, does nothing when unset: the SAME smoothed 0..1 number `on_level()` already writes to `--ux-dictate-level` (this button's own tiny bar), handed to a caller that wants a bigger meter of its own (`ux/Dictate/playground/`'s audio source panel) — one number, two bars, never two smoothing calculations to keep in sync. whisper only; the browser engine has no raw stream to read a level from (see `doc/decisions.md`).

### Engines

Whisper.cpp running locally on this machine (`http://127.0.0.1:8178`, checked with a fast health request) — private, and on an RTX 4070 SUPER an 11-second clip transcribes in about a tenth of a second — then the browser's own `SpeechRecognition`. The one in use is named in small text beside the button; if neither is reachable, no button is drawn at all — see `readme.md`.

### Whisper is not streaming

So this fakes "live": while the owner keeps talking, the growing recording is re-sent to whisper about every 1.5s and shown GREYED after the settled (already-finished) text — the owner sees words appear as they talk, which was the whole complaint that opened this task. A pause of ~700ms (or 15s, whichever comes first) closes that segment: the grey text is replaced by the real answer, it is written into the target box, and a new segment starts while the microphone keeps running. If a re-send is still in flight when the next tick comes due, that tick is SKIPPED, never queued — see `doc/decisions.md`.

### mode: "open"

The live open mic (`talk`, AI 2's composer): the mic stays on indefinitely, each finished sentence is its own settled line in the caption (never a truncated blob), and nothing is ever written into or submitted from the target box — the box stays exactly as the owner left it. See `doc/decisions.md`.

### Ending is always explicit

The button, or the `Ctrl+Shift+M` shortcut (both say so: the button's tooltip, and the small text beside it once an engine is chosen). Nothing ends a dictation on its own UNLESS the owner turns on the "stop after a pause" checkbox beside the mic — off by default — in which case a *longer* silence (2.5s, separate from the 700ms that only closes one segment) shows a visible countdown and stops for real when it runs out; talking again cancels it. `doc/decisions.md` has the alternative this replaced.

## Device management

**Which microphone**, remembered in this browser. The test bench at `ai/sessions/2026/09/22/dd3a11e7-7d24-4ef5-ae83-dea94fa63f0a/dictate-silence/` writes the owner's pick here, and every `Dictate` on the site reads it — so choosing a microphone once, in one place, moves the board's own mic too, with nothing to wire. A caller that needs a specific device passes `device_id` and that wins over the remembered one.

Remember (or, with no id, forget) the owner's microphone. Never throws — `localStorage` is unreadable in some privacy modes, and a dictation must not fail because a preference could not be saved.

⚠ The NAME is stored beside the id on purpose. A `deviceId` is salted per origin and is not forever: it changes when the browser clears site data, and in a fresh automation profile it changes on every page load (measured — test bench above, where the remembered pick silently reverted to the default). The id is tried first and is exact; the name is how the pick is recovered when that id no longer names anything.

The remembered `{ id, label }`, or null. Tolerates the bare id string an earlier build of this wrote, so nobody's pick is lost to the format change.

## Utilities

`fetch_timeout(url, opts, ms)` — `fetch`, but it gives up after `ms` instead of hanging silently forever — the exact failure mode that made the old dictation look "stuck".

`post_prompt(entry, url)` — POST one entry to Servex's single-writer prompt log; `true` once it took, `false` on any failure — never throws, so a caller can fall back with no try/catch of its own. Shared by `Dictate`'s own `log_prompt()` (below) and `v/3/compose.js`'s typed `send()` — one shape for "did Servex take this prompt", not two.

## Rendering and state

### Level meter

A rough, un-calibrated loudness -> `--ux-dictate-level` (0..1), read by Dictate.css to drive the button's real level meter, and also the pause-cut clock below. `silence_at` is a starting guess, not a measured threshold — see `doc/decisions.md`.

### Button icon

The icon is a child, not the button's own text, so a separate LEVEL BAR can sit beside it and inherit `--ux-dictate-level` (set every audio frame in on_level()) without the button itself moving — the owner's own complaint was the button flickering with sound; now only this bar does.

### Hotkey

`Ctrl+Shift+M` (or `Cmd+Shift+M`) toggles THIS instance — checked against the site's other global keys before picking it: `/` and `Ctrl+K` open the omnibox, `Ctrl+\` toggles the dev bar, none of them "M". Scoped so several mic buttons on one page (every ask card has one) don't fight: it always works on the instance that is already listening, and otherwise only on the one the owner's focus is actually in or on. Self-removes once this element leaves the page — there is no framework-wide "unmount" hook to hang a `removeEventListener` on instead (see `doc/decisions.md`).

### Clock

One shared clock for both engines: whisper's own segment/resend timing (heartbeat(), whisper-only) AND the "stop after a pause" countdown (either engine, only when the owner has turned it on).

### Silence handling

Never silence about silence: a dictation that heard nothing loud enough to send now SAYS so, instead of just ending with an empty box.

## Device selection

The microphone this instance should open: the one the caller named, else the one the owner picked on the test bench, else the system default.

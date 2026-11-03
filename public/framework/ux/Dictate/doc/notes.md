# Dictate.js - notes moved out of the code

Pruned from `Dictate.js` on 2026-10-12 (comment prune). Each heading is what a one-line pointer in the code links to; the text is the original comment, lightly stripped of comment markers. Related: `decisions.md`, `silence.md`, `https-lan.md`.

## Browser engine

The browser's own engine: free, needs no install, but the audio leaves the
machine — Chrome sends it to Google to recognise it (Firefox and iOS Safari
have neither the API nor a polyfill, so `Recognition` is undefined there and
this engine is simply unavailable). whisper (below) is tried FIRST because it
never leaves the machine and, on this GPU, answers in well under a second.

## Release the mic when the page is hidden

GIVE THE MIC BACK WHEN THE PAGE IS HIDDEN (mic-hijack, 2026-09-30). On a phone,
switching apps left a live dictation holding the microphone for seconds and
then "bugged out", so the next app's own dictation did not work. Every Dictate
whose mic is on (connecting or listening) is in LIVE. When the page is hidden
(visibilitychange, or pagehide on a real navigation away), each one stops
(the words said so far still finish) and its tracks and AudioContext are
released AT ONCE, not after the last segment is sent. When the page shows
again, each one that was live restarts itself and says "resumed". Cross-app
dictation would need a PWA with a background process, or a native app.

## Small notes in resume_on_show

Still sending the last words (whisper): try again once that finishes.

## Which microphone

*Which microphone**, remembered in this browser. The test bench at
 `ai/sessions/2026/09/22/dd3a11e7-7d24-4ef5-ae83-dea94fa63f0a/dictate-silence/` writes the owner's pick here, and every
 `Dictate` on the site reads it — so choosing a microphone once, in one place,
 moves the board's own mic too, with nothing to wire. A caller that needs a
 specific device passes `device_id` and that wins over the remembered one.

## Whisper seen

*Did whisper ever answer on this browser?** Remembered so a LATER failure to
 reach it reads as "whisper just went quiet", not "this machine has no whisper" —
 the two need different endings. A machine that has never once seen whisper (no
 install, Firefox, iOS Safari) keeps today's behaviour: the browser's own
 recognizer, picked quietly, no error shown. A machine where whisper HAS worked
 before gets a clear line instead, and the browser's recognizer is never engaged
 automatically — the owner's own freeze, 2026-10-04: "Chrome's recognition is
 never used automatically." See `detect_engine()`.

## Device name stored beside the id

Remember (or, with no id, forget) the owner's microphone. Never throws —
 `localStorage` is unreadable in some privacy modes, and a dictation must not
 fail because a preference could not be saved.

 ⚠ The NAME is stored beside the id on purpose. A `deviceId` is salted per
 origin and is not forever: it changes when the browser clears site data, and
 in a fresh automation profile it changes on every page load (measured —
 `ai/sessions/2026/09/22/dd3a11e7-7d24-4ef5-ae83-dea94fa63f0a/dictate-silence/`, where the remembered pick silently reverted
 to the default). The id is tried first and is exact; the name is how the pick
 is recovered when that id no longer names anything.

## Small notes in remembered_device

The remembered `{ id, label }`, or null. Tolerates the bare id string an
 earlier build of this wrote, so nobody's pick is lost to the format change.

## Small notes in fetch_timeout

`fetch`, but it gives up after `ms` instead of hanging silently forever —
 the exact failure mode that made the old dictation look "stuck".

## One health check per tab

ONE health check per tab, not one per `Dictate` on the page (dictate-one-engine,
 2026-10-04 — the owner's phone: six mic buttons on one page load each ran their
 own whisper health check and printed their own `[dictate]` trail, so a headless
 load logged "socket: connected" / "whisper: checking…" / "whisper: answering" six
 times). The FIRST `Dictate` built while a page is loading runs the real check (and
 logs it, through its own `detect_engine()`); any other one built while that is
 still in flight just waits for the SAME answer and copies it onto its own status
 line, quietly — one truth, however many mic buttons are on the page. Cleared the
 moment it resolves, so the next page load (or a reload) runs its own fresh check,
 exactly once, same as today.

## post_prompt

POST one entry to Servex's single-writer prompt log; `true` once it took,
 `false` on any failure — never throws, so a caller can fall back with no
 try/catch of its own. Shared by `Dictate`'s own `log_prompt()` (below) and
 `v/3/compose.js`'s typed `send()` — one shape for "did Servex take this
 prompt", not two.

 Every entry also gets `floor` ("speaking" | "done") and, after a dictation,
 `cues` (its pauses and speaking time) stamped on here — `floor.js`, and the
 contract for readers in `ext/Chat/doc/floor.md`.

## The Dictate class

A 🎤 that dictates into one textarea (or hands text to a callback), with a
state you can always see and an error said in plain words — the two things
the old `ext/Ask/mic.js` control did not have.

    import Dictate, { dictate } from "/framework/ux/Dictate/Dictate.js";
    dictate(() => this.$input, { on_start: () => this.open() });
    // or: new Dictate({ on_text: text => … })   // no box — just the words

**`on_guess(text)`** — optional, does nothing when unset: the still-moving grey
guess, fired every partial resend (whisper) or interim result (the browser
engine), text `""` the instant a segment closes. `on_text(chunk)` (above) is
still the settled-chunk hook — `on_guess` only adds the in-between guess a
caller building its own transcript view (`ux/Dictate/playground/`) needs.

**`on_meter(level)`** — optional, does nothing when unset: the SAME smoothed
0..1 number `on_level()` already writes to `--ux-dictate-level` (this button's
own tiny bar), handed to a caller that wants a bigger meter of its own
(`ux/Dictate/playground/`'s audio source panel) — one number, two bars, never
two smoothing calculations to keep in sync. whisper only; the browser engine
has no raw stream to read a level from (`doc/decisions.md`).

**Engines, tried in order:** whisper.cpp running locally on this machine
(`http://127.0.0.1:8178`, checked with a fast health request) — private, and
on an RTX 4070 SUPER an 11-second clip transcribes in about a tenth of a
second — then the browser's own `SpeechRecognition`. The one in use is named
in small text beside the button; if neither is reachable, no button is drawn
at all — see `readme.md`.

**Whisper is not streaming**, so this fakes "live": while the owner keeps
talking, the growing recording is re-sent to whisper about every 1.5s and
shown GREYED after the settled (already-finished) text — the owner sees
words appear as they talk, which was the whole complaint that opened this
task. A pause of ~700ms (or 15s, whichever comes first) closes that segment:
the grey text is replaced by the real answer, it is written into the target
box, and a new segment starts while the microphone keeps running. If a
re-send is still in flight when the next tick comes due, that tick is
SKIPPED, never queued — `doc/decisions.md`.

**`mode: "open"`** — the live open mic (`talk`, AI 2's composer): the mic stays on
indefinitely, each finished sentence is its own settled line in the caption (never a
truncated blob), and nothing is ever written into or submitted from the target box —
the box stays exactly as the owner left it. `doc/decisions.md`.

**Ending is always explicit** — the button, or the `Ctrl+Shift+M` shortcut
(both say so: the button's tooltip, and the small text beside it once an
engine is chosen). Nothing ends a dictation on its own UNLESS the owner
turns on the "stop after a pause" checkbox beside the mic — off by default —
in which case a *longer* silence (2.5s, separate from the 700ms that only
closes one segment) shows a visible countdown and stops for real when it
runs out; talking again cancels it. `doc/decisions.md` has the alternative
this replaced.

## Small notes in render

The icon is a child, not the button's own text, so a separate LEVEL BAR
can sit beside it and inherit `--ux-dictate-level` (set every audio
frame in on_level()) without the button itself moving — the owner's own
complaint was the button flickering with sound; now only this bar does.

## Always-visible stages

ALWAYS-VISIBLE STAGES (the owner, 2026-10-04, after a reload left the mic
stuck at "connecting…" with no clue which part was stuck): mic / socket /
whisper, one small muted line, so the next time this happens the reader —
or a headless check reading this same text — can see exactly where it stopped
instead of guessing. `log_step()` below is the one place that updates it.

## Hotkey

`Ctrl+Shift+M` (or `Cmd+Shift+M`) toggles THIS instance — checked against
the site's other global keys before picking it: `/` and `Ctrl+K` open the
omnibox, `Ctrl+\` toggles the dev bar, none of them "M". Scoped so several
mic buttons on one page (every ask card has one) don't fight: it always
works on the instance that is already listening, and otherwise only on
the one the owner's focus is actually in or on. Self-removes once this
element leaves the page — there is no framework-wide "unmount" hook to
hang a `removeEventListener` on instead (`doc/decisions.md`).

## input name clash

The box may not exist yet when the button is built (a control draws its
buttons above its box) — same trick as the old `mic.js`. ⚠ Same NAME as
the `input` element factory imported at the top of this file on purpose —
`this.input()` (this method) and the bare `input()` (the factory, used
once above to build the checkbox) never collide, because a method is
always reached through `this.`, but they are two different things.

## Small notes in init

Runs once, at build time — decides whether there is anything to draw the
button FOR. No DOM is created after this `await`; only the button already
built above is shown, hidden, or labelled (`code` skill §1).

## Timed stage log

One stage changed — console-logged with a `[dictate]` prefix (the owner, 2026-10-04:
 "log each step... so a headless load can read the order of events") and folded into
 the always-visible `$diag` line. `stage` is `"mic" | "socket" | "whisper"`.

 TIMED, LIVE (2026-10-05 — the owner: "'connecting…' stays too long, even once it
 actually connected"). Every call is stamped with how long it has been since THIS
 press (`connect_started_at`, set at the top of `start()`) — `requesting… (420ms)`,
 `ready (512ms)` — and kept on `this.stage_log` (last 12, newest last) for the status
 tray below. While the button still reads "connecting…", the BIG status line is
 swapped to show this same timed text the instant it changes, instead of sitting on
 the one static word for however long the engine check and the permission prompt
 together take — see `set_state()`'s own "connecting" branch.

## Small notes in timed_text

The ONE place that turns a stamped stage into its on-screen words — `log_step()`'s
 own "connecting" branch and `set_state()`'s both read this, so the two can never
 drift into two slightly different ms formats. `null` if that stage has nothing yet.

## Small notes in draw_diag

Plain words (the owner, 2026-10-09). The dev-reload socket is not part of dictation, so it is
kept in `steps.socket` for the console trail but no longer printed here.

## Small notes in socket_status

"connected" / "retrying" — read straight off the dev socket singleton (the one the
owner named: "a reconnect race"). A production build (no dev socket) reads "—": this
stage is diagnostic, never something dictation itself depends on.

## detect_engine timeout and retry

Re-checked on every press, not just once — the owner may start
whisper-server, or it may have been stopped, between two presses of the
same button.
⚠ 2.5 s, not 0.8 s (2026-10-01). A phone's first request after a quiet spell can take
longer than 800 ms just to wake its Wi-Fi radio. Whisper then looked "unreachable", the
phone fell back to its own recognizer, and that recognizer repeats and beeps (see
`heard_browser()`). The cost of the longer wait is only paid when whisper really is down.
⚠ ONE RETRY, SHORT GAP (2026-10-04 — the owner, on a reload: "worked, then reload stuck
at connecting, then abort, then Chrome's recognizer"). A page reload fires this health
check again at once; if the PREVIOUS page's mic/socket were still a few hundred ms into
tearing down, the very first request after a reload can time out for reasons that have
nothing to do with whisper actually being down. One retry after a short pause (400 ms)
tells the two apart without materially slowing the common case (whisper answers in well
under a second once it is warm).

## Small notes in detect_engine

WHISPER WORKED BEFORE ON THIS BROWSER: never slide into the browser's own
recognizer by itself — that silent swap is the exact "beeping" bug. Say so
instead and stop; `start()` turns this into the clear line on screen.

## Small notes in name_engine

Whisper is the normal case, so it says nothing (the owner, 2026-09-29: the
label "just takes up space"). Only the fallback names itself, because it
transcribes worse and the reader should know why.

## Keyboard hint

"Ctrl+Shift+M stops" only means anything on a machine with a physical keyboard.
`(pointer: coarse)` is true on a phone or tablet (the primary pointer is a finger),
false on a desktop or laptop with a mouse/trackpad — the standard, no-dependency
way to ask "is this mainly a touch device" (found from a mobile screenshot showing
the hint on a phone's own bottom sheet: `ai/sessions/2026/09/29/mobile-nav/mobile-nav/`).

## Insecure context

An INSTANT, one-line check, before anything else is even tried. A browser only
 hands out a real microphone on a secure context — https, or the special-cased
 `localhost` / `127.0.0.1` / `*.localhost` — and off that, `navigator.mediaDevices`
 is simply `undefined`. But the Web Speech API's own CONSTRUCTOR still exists on an
 insecure page and quietly does nothing useful, so without this check the code would
 sail past `detect_engine()`, pick `"browser"`, and `start()` would return having
 asked Chrome to listen — with no error ever arriving. Proved headless, on a page
 loaded over this machine's own LAN address: `isSecureContext` was `false`,
 `navigator.mediaDevices` was `undefined`, and the state stayed `"listening"` for
 1.5s with no error — while the START SOUND had already played
 (`ai/sessions/2026/09/29/mobile-nav/mobile-nav/`, `doc/https-lan.md`).

## One microphone at a time

ONE MICROPHONE AT A TIME, whichever surface is pressed (dictate-one-engine,
2026-10-04 — base-class lock, so a card's mic, the push-to-talk mount and a
bare demo box never hold the real microphone at once and double-post the
same words). `LIVE` (above) already tracks every `Dictate` on the page with
its mic open, of any kind — stop each of THOSE before taking it over.
`ext/Chat/Mic.js`'s own `ComposerMic.start()` still does the same thing for
itself too, between ComposerMics only; this covers every other engine class.

## Small notes in start

Timed status (2026-10-05): every `log_step()` between now and the first real
"listening" gets its own elapsed-ms stamp — see `log_step()`'s own doc comment.

## Duplicate-bubble race

THE DUPLICATE-BUBBLE RACE (2026-10-05 — the owner's phone: one spoken sentence became
TWO chat lines, the full sentence first, then a shorter, older guess landing ~4s
later). Whisper requests can answer OUT OF ORDER — a request sent for a shorter,
earlier slice of the segment can take longer than one sent after it, and resolve
AFTER a newer, fuller answer already committed. Every request gets a ticket here
(`req_seq`, strictly increasing); an answer is only ever applied — shown as the
live guess, or committed as a real chat line — if its ticket is the newest one
applied so far (`applied_seq`). An older ticket's answer, however correct it once
was, is dropped the moment a newer one has already landed. See `partial_tick()` and
`close_segment()` below, the only two places a transcribe answer is used.

## Shared engine check in start

Shared, not `this.detect_engine()` raw (dictate-one-engine, 2026-10-04): a
sheet whose mic starts the INSTANT it opens (`rail.js`'s own "the mic starts
listening the instant the sheet opens") calls this within the same tick as
`init()`'s own construction-time check above — without sharing, that is a
second real health check and a second "[dictate]" trail for the one engine
that just opened. Still "re-checked on every press": a LATER press, once the
shared check has resolved and cleared itself, runs its own fresh one.

## Small notes in start whisper-down

NEVER the browser's own recognizer here — that silent swap is the bug this
freeze exists to kill. One clear line, nothing started, no beep.

## Connecting vs listening

"connecting", not "listening" — the mic may still need a permission prompt
answered or a device opened. `set_state("listening")` below only runs once the
mic is REALLY on: after whisper's own `capture.start()` resolves, or (for the
browser engine) from `rec.onstart`, never merely because we asked for it. A
caller's "start sound" (`ext/Chat/Mic.js`'s `on_listening()`) is wired to that
same real transition, not to this call returning.

## Small notes in start clock

One shared clock for both engines: whisper's own segment/resend timing
(heartbeat(), whisper-only) AND the "stop after a pause" countdown
(either engine, only when the owner has turned it on).

## Connect watchdog

Nothing genuinely started within a few seconds — a permission dialog nobody
answered, or (should the up-front secure-context check above ever miss a case)
a browser that fails this quietly. Never leaves the owner without a reason.

## Small notes in start browser

The browser engine sets "listening" itself, from `rec.onstart` (below) — its
own `.start()` call returns long before recognition is actually live.

## Reload race

⚠ THE RELOAD RACE (round 2, 2026-10-04 — the owner: "when I reload that page… it says
 connecting for about four to five seconds, and then says microphone abort error").
 The PREVIOUS page's microphone is released by the browser the instant that page's JS
 context is torn down — but the OS-level hand-off of the physical device is not
 guaranteed to finish in that same instant. Asking `getUserMedia()` for a device that
 is still a few hundred ms into being let go answers, after several seconds of trying,
 with a slow `AbortError` — exactly the "connecting… then abort" shape, and a DIFFERENT
 bug from the one `detect_engine()`'s own one-retry already fixed (that one was about
 reaching *whisper-server*, never about the *microphone* itself). One retry, after a
 short pause, tells this one-time race apart from a real refusal (no mic, denied
 permission, in use by another app) without slowing the common case — most dictations
 are not right after a reload, and this path is never even tried for those.

## Small notes in stop

Cancel an attempt still in flight (a permission prompt the owner gave up
on) instead of only ever handling "listening" — the button must still work
as a stop button in the gap the owner's own bug lived in.

## Small notes in stop whisper

close_segment() may itself have set_error()'d (whisper stopped answering
mid-session) — never stamp that back to "idle" as if nothing happened.

## Small notes in stop silence

Never silence about silence: a dictation that heard nothing loud
enough to send now SAYS so, instead of just ending with an empty box.

## Small notes in explain

Never just echo a raw browser message with no next step — the owner's own
complaint was exactly that: an error nobody could act on. Every OTHER case
above says what to check; this last resort still says what to try.

## set_state

`"connecting"` is new: set the instant `start()` decides to try, before the mic
is really open — asked-for, not yet on. Only a genuine transition INTO
`"listening"` (never a same-state restatement, which Chrome's own silent
mid-session restarts would otherwise cause) fires `on_listening()` — the hook
`ext/Chat/Mic.js` plays the start sound from.

## Small notes in set_state

"connecting" shows the live, timed stage text (`log_step()`'s own doc comment) —
never the one static word for however long the engine check and the permission
prompt together take (the owner, 2026-10-05: "'connecting…' stays too long").

## Small notes in device

The microphone this instance should open: the one the caller named, else
 the one the owner picked on the test bench, else the system default.

## on_level

A rough, un-calibrated loudness -> `--ux-dictate-level` (0..1), read by
Dictate.css to drive the button's real level meter, and also the pause-cut
clock below. `silence_at` is a starting guess, not a measured threshold —
`doc/decisions.md`.

## First sample timed

FIRST SAMPLE, timed (2026-10-05) — the second of the three checkpoints the owner
asked for (mic open, first samples, first Whisper answer): this is the first time
`AudioWorklet` has actually handed back a real frame, proof the mic isn't just
"open" but genuinely feeding audio.

## heartbeat

One clock tick (5/sec), shared by both engines. For whisper: a pause
closes the segment, so does hitting the length cap, and otherwise a
resend fires roughly every `resend_ms` (only one of the three per tick).
For either engine: the opt-in "stop after a pause" countdown.

## Small notes in heartbeat

Taken off the page while its mic was on (a navigation that removed it,
a panel rebuilt): stop and release, so no path leaves a track running.

## Stop after a pause

Opt-in, off by default (the owner's own comparison to another product:
ending a dictation must be a choice the owner can SEE coming and cancel,
never a silent auto-submit). Counts quiet time since `last_loud_at` —
whisper updates that in `on_level()`, the browser engine in
`heard_browser()` — completely separately from whisper's own 700ms
segment-cut, which never ends the whole dictation by itself.

## Skip partial when quiet

⚠ QUIET ALREADY? DO NOT START A GUESS. The pause that closes this segment is about to fire, and
whisper-server answers ONE request at a time — so the final would sit behind this guess
(measured 68 ms of a 167 ms wait, about half of all segment ends).

## Stale partial guard

The segment may have closed WHILE this was in flight — a stale partial must never
paint over a segment that has already gone final. `seq <= this.applied_seq` is the
OTHER half of the same guard (duplicate-bubble race, 2026-10-05): a request can
answer out of order, so even within the SAME segment a slower, older request must
never overwrite what a faster, newer one already applied.

## Never clear the guess early

⚠ THE GUESS IS NEVER CLEARED BEFORE THE FINAL TEXT IS READY TO REPLACE IT.
 An earlier version cleared `partial_text` and redrew the caption THE INSTANT
 a segment closed, then redrew AGAIN once `transcribe()`'s await returned —
 two real, separately-painted frames, with the caption visibly SHORTER in
 between (the grey guess gone, the settled text not landed yet) for however
 long Whisper took to answer. That is the flicker the owner saw: "smooth"
 when Whisper was fast enough nobody noticed the gap, "erased and redrawn in
 two steps" when it wasn't (`ai/sessions/2026/09/29/audio/audio/b-refine/`, measured with a
 `ResizeObserver` — `doc/decisions.md`). Now the guess is only ever cleared
 in the SAME `draw_caption()` call that either shows the real text (`commit()`)
 or gives up on this segment (nothing worth sending, or Whisper errored) —
 one paint, never a visible dip.

## Small notes in close_segment

Let a partial resend for the OLD segment finish first — whisper-server
answers one request at a time, and its answer is about to be thrown
away anyway (the epoch check above already ignores it).

## Stale request failing

A stale request failing is not a real failure — a newer segment or resend
already landed while this one was still on the wire, so what it would have
said no longer matters; ending the whole dictation over it would be its own
new bug (duplicate-bubble guard, 2026-10-05).

## Whisper unreachable mid-session

This is the "Whisper server unreachable" case, surfaced where it was only
ever a console.error before — the owner's own words: "we don't want users
to just have it not work and not know why". Ends the dictation rather than
silently dropping every segment from here on.

## Duplicate-bubble guard

THE DUPLICATE-BUBBLE GUARD (2026-10-05): never commit an answer for a segment that
has since closed again (`epoch !== this.segment_epoch` — a second close raced this
one), or one that is simply OLDER than an answer already committed or shown
(`seq <= this.applied_seq` — whisper answered out of order). Either way, the
content behind this answer is already covered by something newer; posting it now
would only resurrect a stale, shorter guess as a second, bogus chat line — exactly
the bug the owner caught on the phone (the full sentence, then an older partial of
it landing ~4s later as if it were new).

## Small notes in close_segment commit

`commit()` itself clears `partial_text` and redraws WITH the new settled
line already in place — see its own comment. No separate clear here.

## Small notes in clear_guess

The still-moving guess is gone with nothing to replace it (a silent segment,
 or Whisper failed) — the one place `close_segment()` clears it on its own.

## Is there any speech in here

*Is there any speech in here at all?** Whisper never answers "nothing" —
 handed silence it invents a plausible sentence, and for this model that
 sentence is almost always "Thank you." So the recording of the quiet gap
 between the owner's last word and their press of the button used to be
 transcribed, committed, typed into the box and logged as a prompt. That
 was the whole "it just says Thank you" bug (`ai/sessions/2026/09/22/dd3a11e7-7d24-4ef5-ae83-dea94fa63f0a/dictate-silence/`).

 The test is `Capture.loudness()`'s `loud_ms` — how many milliseconds of the
 segment are above a speaking floor, not how loud the segment is on average.
 Measured on the real dumps: silent segments 0ms, the weakest real sentence
 220ms, so `min_speech_ms` at 120 sits in a gap with nothing in it.

## Small notes in transcribe errors

Named here, not left for the caller to guess: WHICH url this device tried, and
WHY it failed — a timeout (the 20s cap below), a plain network error (nothing
there to answer), or an HTTP status (something answered, but not with success).

## First whisper answer timed

FIRST WHISPER ANSWER, timed (2026-10-05) — the third checkpoint: proof the whole
pipeline (mic → samples → whisper-server → a real reply) works, not just that the
mic opened.

## Newlines in whisper text

⚠ Whisper puts "\n" between ITS OWN segments, mid-speech ("Testing, testing.\n My name is…") —
left in, every one became a paragraph break in the box. Real breaks come from real pauses only.

## Small notes in transcribe

The WhisperLog hook: exactly what whisper-server answered (`raw`) and what we kept (`text`).

## Debug dump

*The debug seam.** Off unless you turn it on, in the console of the tab
 you are dictating in:

     window.$DICTATE_DUMP = true;   // or a path: "framework/ai/…/dumps.jsonl"

 Every WAV this posts to whisper is then ALSO written, base64, one line per
 send, into `dump_file` — so the exact bytes the browser sent can be pulled
 apart on disk afterwards: `node public/framework/ai/sessions/2026/09/22/dd3a11e7-7d24-4ef5-ae83-dea94fa63f0a/dictate-silence/measure.mjs <that file>`
 prints each one's sample rate, duration, peak, RMS and whether the header's
 byte count agrees with the file's real length. Never awaited and never
 throws into the caller — a debug write failing must not disturb a real
 dictation.

## Browser engine silent failure

Chrome sometimes finishes a whole session hearing NOTHING and erroring
NOTHING — `onstart` fires, `onend` fires, and no `onresult` ever comes.
That silence was the bug the owner reported; this says so instead.

## rec.onstart

The ONLY place the browser engine is really live — `rec.start()` below returns
long before this fires. This is what `set_state("listening")` (and therefore
the start SOUND, via `on_listening()`) now waits for, instead of firing the
instant `.start()` was merely called.

## aborted and no-speech

⚠ "aborted" AND "no-speech" ARE NOT A STOPPED MIC (2026-10-01, the owner's "abort error"
on the phone). Android ends its recognizer after every pause and often reports "aborted"
as it does; Chrome reports "no-speech" after a quiet spell. Both are followed by `onend`,
which restarts it below (or, after a press, sets it idle). Treating them as errors stopped the mic mid-dictation and pushed
an error line into the layout. Only a press (`this.stopping`) ends it.

## Small notes in rec.onend

Chrome stops on its own after a few seconds of silence even with
`continuous` — restart unless a real press asked to stop (`this.stopping`).

## Android repeats the phrase

⚠ CHROME ON ANDROID REPEATS THE WHOLE PHRASE IN EVERY RESULT (2026-10-01, the owner's
"so so tell so tell me so tell me why…"). Desktop Chrome gives each finished piece once:
"hello there", then "how are you". Android gives "so", then "so tell", then "so tell me",
each marked final, so committing each one wrote the sentence over and over. A result that
starts with the last one (or repeats it) only adds the words after it. `peek` reads
without remembering, for the grey guess. Reset when the recognizer restarts (`onstart`).

## commit

One finished piece of text — a whisper segment, or a browser `isFinal`
 result — settles into the caption and lands in the real target. `reason` says
 WHY this segment closed — `"pause"` (silence), `"forced"` (the 15s cap), or
 `"manual"` (the owner pressed stop) — the browser engine never has one to give
 (its own `isFinal` flag decides on its own), so callers there see `undefined`.
 Additive only: every caller before this task reads one argument and ignores
 the rest, so nothing that only wanted `on_text(text)` changes.

## Small notes in commit discard

Discarding (nothing heard, or a whisper annotation like `[BLANK_AUDIO]`) still
clears the guess — the one thing `close_segment()` no longer does up front,
so a discarded segment must not leave a stale grey guess frozen on screen.

## Chunk ids

One id per settled chunk, made HERE (never by the server) — it is what lets a
later revision line point back at exactly this one, before either has been
logged (owner's ask 2026-09-29: "the revision logs its output as its own
line pointing back to the raw line it came from"). `chunk_at` is made the
same way, at the same moment, so a revision's `re` (the universal chat
line's field for "which line this answers") has something to point at —
the raw `{type:"prompt"}` line itself still carries no `at` of its own
(Servex stamps that on arrival; see `log_prompt`'s own note on why).

## next_chunk_id

A plain, locally-made id — not cryptographic, just unique enough to tell two
chunks apart in one log. `crypto.randomUUID` where it exists (every browser
this needs to run in); a timestamp+random fallback otherwise.

## log_prompt

Every finished utterance becomes one log entry, not just words on screen.
Tried first: Servex's own single-writer log (`POST /log/<name>`, being
built by the sibling `servex-port` task) — once it is up, this is the
only writer of prompt history and every dictation across the whole site
reaches it the same way. Until then, or whenever Servex is down, this
falls back to the dev server's own existing generic append route
(`Server/plugins/SocketServer/Append.js`, `rpc:append`) so a dictation
during today's setup still lands somewhere real instead of vanishing
once it scrolls off screen. Never throws into the caller — a log write
failing must not break the dictation the owner is mid-sentence in.

⚠ Neither path can reach anywhere from a LAN client that is not itself
`localhost`/`127.0.0.1`: `log_url` is `127.0.0.1:8090`, which on a phone
means the PHONE, and `Socket` — the dev-server fallback — refuses to even
open a connection off `localhost` by design (`dev/Socket/Socket.js`, "LOCALHOST
ONLY — production is static hosting with nothing to connect to"). Both
failures are already silent-safe (this `catch` only warns), so a dictation
from the phone still shows its words live; they are just never logged.
Left as-is on purpose — see "Voice → log from the LAN" in `doc/https-lan.md`.

## log_prompt no at

No `at` sent to Servex on purpose — `Log.append()` stamps its own local-offset
clock only when the entry arrives without one; a client-side `new Date()` used
to override it with a UTC string, so the same log mixed two clocks. The dev-server
fallback below has no clock of its own, so that path still stamps one itself.
`id` (this chunk's own `next_chunk_id()`) is what a later revision line's `of`
points back at — never required by anything that reads this log today.

## log_revision

The REVISED text becomes its OWN log line — the universal chat line every
 surface (voice, typed, an agent's own reply) shares (`ai/sessions/2026/09/30/voice-sessions/voice-sessions/design.md`,
 "The universal chat line"), not the old `{type:"revision"}` shape nothing ever
 drew. `re` is the raw chunk's own `at` (`commit()`'s `chunk_at`, made at the
 same moment as the raw line itself) — how a reader (or `ext/Chat`) finds the
 raw line this answers; `level` says which pass ran. Never merged into the raw
 line, and never written until the revision is actually ready (no half-done
 text logged). Same Servex-then-dev-server fallback as `log_prompt`, for the
 same reason: a log write failing must never break the dictation itself.

## Annotations

Whisper does not only return words. A noise that is loud but is not speech
 comes back as an ANNOTATION — `*shriek*`, `(door closes)`, `[BLANK_AUDIO]`,
 `♪` — which is whisper being honest, not a mistake, and which must still
 never be typed into the owner's box or logged as something they said. This
 is a rule about the SHAPE of the answer, not a list of phrases to ban: a
 list would have to grow forever, this does not (a real fan noise came back
 as `*shriek*` while proving this task's fix, 2026-09-22).

## push_to_target

Only the finished text ever reaches the caller — the grey, still-moving
 partial stays in this component's own caption, never the target box.
 This APPENDS to whatever is already in the box (never rewrites it), so
 an edit the owner makes mid-dictation, in a pause, is never clobbered —
 unlike the old `mic.js`, which rewrote the whole value every time.

## Small notes in push_to_target

Open mode: the box is for typing, never for the mic — a committed sentence
only ever reaches `on_text` (the caption stream), the box stays untouched.

## Revise

*`revise`** — `"clean" | "edit" | "summary" | false` (default `false`, so
 every caller that never asked for this keeps working with zero change).
 The RAW text has already reached `on_text` above, unchanged, before this even
 starts — a caller that only wants what it always got can ignore `on_revised`
 completely. When `revise` names a level, this runs `ux/Revise` in the
 background (never blocking the box, which already has the raw words) and,
 once it answers OK: logs the REVISED text as its own line (`log_revision()`,
 pointing back at the raw line's own id — never merged into it), and, if the
 caller set one, calls `on_revised(text, {raw, level, chunk_id})` too — the
 revised text, the original raw chunk it came from (so the raw text is always
 kept alongside the revised one, never replaced), and which level ran.
 `on_revised` NEVER fires with a falsy `text` — a Servex that isn't up yet, or
 any other failure, calls the SEPARATE `on_revise_failed({raw, level, chunk_id,
 why})` instead, so an existing caller that only ever handled success (like
 `ext/drawer/rail.js`'s `on_revised: text => this.card(text)`) can never be
 handed `null` to draw a card for. Only the FINISHED revision is ever logged —
 no guess, no in-between chunk, no per-tick timing (those stay in memory only,
 e.g. the playground's Chunks view — `ai/sessions/2026/09/29/audio/audio/b-refine/`).
`before` (ai/sessions/2026/09/29/audio/audio/next-clean-transcription/a-clean-mode, deliverable 1)
is the tail of everything already revised in THIS dictation — a little context so
the fast assistant can see the sentence it is joining, same idea as the playground's
own `BEFORE_CHARS`. `revised_so_far` only grows here; nothing else touches it.

## Variant seam

*The variant seam.** `build_output()` builds whatever holds the transcript
 (here, one muted line — `this.$caption`); `draw_caption()` repaints it every
 time a segment settles or the live guess changes. A variant with a genuinely
 different user experience — a wall of "prompt item" cards instead of one
 running line, a single-line compact strip for a toolbar — overrides ONLY
 these two methods; the whole state machine above (engines, errors, the start
 sound's real timing) is untouched and every variant inherits it for free. See
 `ux/Dictate/variants/` for the built ones, and `doc/variants.md` for how to
 write another.

## draw_caption

Settled text in the page's own ink, the still-moving guess grey after it —
capped so a long dictation does not grow the caption without bound. Open
mode never runs for long unwatched (a mic left on indefinitely), so instead
of one truncated blob it keeps every sentence as its own line, appended,
never moved — the "settled line, never moved" the caption stream promises.

## sample

*Demo only — no mic, no whisper, nothing logged.** Feeds sentences straight
 into the settled transcript exactly as `commit()` would (same `settled_lines`,
 same `draw_caption()`, same target box), so a variant page can show what makes
 it different the instant it loads, without anyone talking into a real
 microphone first. Skips `log_prompt()` on purpose — sample text is not
 something the owner said, and must never land in the real prompt log. The
 owner's own rule this exists for: "I want to see" (`ai/sessions/2026/09/29/mobile-nav/mobile-nav/review.md`).

## Whisper url

Where to reach `whisper-server`. On this machine (`localhost`/`127.0.0.1`/`*.localhost`)
 that is the direct port, unchanged. From anywhere else — a phone on the LAN — `127.0.0.1`
 would mean the PHONE, so the page's own origin is used instead, and
 `Server/plugins/Whisper.js`'s `/whisper/inference` + `/whisper/` proxy that same-origin
 request on to the real `127.0.0.1:8178` on the machine actually running whisper-server.
 This does NOT open the microphone on an insecure LAN page — that is a separate, harder
 browser rule `insecure_context_message()` catches — it only means that once the mic
 IS open (secure context reached some other way), reaching whisper does not require
 hard-coding a loopback address that means a different machine on every device.

## dictate helper

`dictate(() => this.$input, opts)` — the drop-in shape `ext/Ask/mic.js`'s
 `mic()` used, for callers that just want the button.

## The `sent` line (2026-10-25)

Servex writes `{"sent":{"to":"fast"|"smart","at":<iso>,"re":[<owner chat line at>…],"delay_ms":<n>}}` into the session log when it hands an owner line to the fast or the smart assistant (`mark_sent`). `to` says which assistant, `re` lists the owner lines it carried (their `chat.at`), `delay_ms` is how long after the line was said. The bubble chat (V1) draws it as two moving cursors glued into its OWN live piece's text — ✓ after the newest fast chunk, 🧠 after the newest finished sentence, left out while none has finished yet — moved onto whichever tracked piece is newest in the bubble, never one pair per piece (`Chat.js`'s `place_live_cursors()`; `chat.js` passes the `{sent}` line to `Thread.sent` → `apply_sent` → `patch_piece`). Chat v2 draws the same two marks after the newest Prompt only (never per message): a ✓ (gray → green on `sent.fast`) and a 🧠 (gray → the smart-reply colour once `sent.smart` and `working` is clear) — `ChatV2.place_cursors()`. Both views share ONE maker and ONE class set now: `ext/Chat/cursors.js` (`cursor_el()`/`smart_cursor_el()`), `cursors.css` (`.chat-cursor`/`.chat-smart-cursor`). Proof: `test/chat-sent.mjs`.

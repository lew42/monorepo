# Dictate — decisions

Landed 2026-09-19. Task log: [`ai/2026-09-19/whisper-local/`](/framework/ai/2026-09-19/whisper-local/).
Owner's words opened this task: "the whole dictation thing is not working properly …
click the microphone and it appears to start recording … but nothing's transcribed on
my screen." Then, mid-task: "the thing they miss most is seeing words WHILE they
talk." Both are answered below.

## The install — what, where, and the one number that mattered

`whisper.cpp` release `b5130` (2026-09-10), the `whisper-cublas-12.4.0-bin-x64.zip`
asset — this machine's driver reports **CUDA 13.1** (`nvidia-smi`), and a driver is
backward-compatible with an older CUDA build, so the newest cuBLAS asset that is NOT
the ARM64-only `13.4` build was the right pick over the older `11.8.0` one. It started
and used the GPU on the first try, so the plain (no-GPU) fallback zip was never needed.

Installed at `%LOCALAPPDATA%\lew42\whisper\` — `bin\` (the release, `whisper-server.exe`
+ `whisper-cli.exe` + the CUDA DLLs it ships with, ~640MB) and `models\ggml-large-v3-turbo.bin`
(1.51 GiB, from `huggingface.co/ggerganov/whisper.cpp`). Nothing under the repo.

The release's zip did not ship `samples\jfk.wav` (older whisper.cpp releases did; this
one doesn't). Rather than fetching one more thing, Windows' own built-in
`System.Speech.Synthesis` (PowerShell, no install) spoke the JFK sentence straight to a
16kHz mono WAV — proof audio, made locally, fetching nothing extra.

**The numbers**, all on the RTX 4070 SUPER, `large-v3-turbo`:
- `whisper-cli` on a 7.8s clip: 1.37s total (109ms of that was the actual encode) — GPU
  confirmed by the CUDA0 log lines.
- `whisper-server`'s `POST /inference` on the same clip: 0.39s round trip over HTTP.
- The number that mattered for live partials: `POST /inference` on an exact 10.00s WAV,
  three runs: **76ms, 98ms, 89ms**. About 1% of real time — a 1.5s partial-resend tick
  finishes with roughly 1.4s to spare before the next one is due.

## CORS — checked before touching anything server-side

`whisper-server`'s response (and its `OPTIONS` preflight) carries
`Access-Control-Allow-Origin: *`. That means a page open on `http://localhost` can
`fetch()` `http://127.0.0.1:8178/inference` directly — **no dev-server change was
needed**, so `Server/**` (owned by the sibling task `server-self`) was never touched.
Checked with `curl -X OPTIONS … -H "Access-Control-Request-Method: POST"` before writing
a line of browser code, per the brief.

## Why the browser engine was silent for the owner

`ext/Ask/mic.js` already wired `SpeechRecognition.onerror` to a visible message — that
part worked. But Chrome can finish a WHOLE session firing neither a result NOR an error:
`onstart` fires, the tab's recording indicator lights up exactly as the owner described,
and `onend` fires with nothing ever having been heard or reported. No event exists to
hang a message on, so the old control had nothing to show. `Dictate.start_browser()`
adds a **watchdog**: if 6 seconds pass with no `onresult` and no `onerror`, it declares
the silent failure itself, in plain words, rather than leaving the owner staring at a
lit recording icon. This is the single most direct fix for "today's failure was silent."

Also fixed: `mic.js`'s header comment claimed the browser's recognition "keeps audio on
the machine." True for some browsers' on-device models, **false for Chrome** — Chrome's
built-in `SpeechRecognition` sends the audio to Google's servers to be recognised. The
comment now says so, and is also the reason whisper (private, and now measured fast) is
tried first rather than second.

## Why whisper isn't wired as one request per keystroke of silence

The simplest "live" design would re-run the FULL session's audio on every tick, but that
cost grows with the session length. Instead each **segment** (bounded by a ~700ms pause
or a 15s cap) is its own buffer: the buffer starts at zero when a segment opens
(`Capture.cut()`), a resend transcribes just that growing buffer, and closing the
segment transcribes it one last time and appends the result to what's already
committed. Cost per resend stays roughly proportional to ONE segment (≤15s), never the
whole dictation.

## The epoch guard — the one real concurrency trap here

A partial resend takes ~100ms but is started, awaited, and only then checked against
`this.segment_epoch`. If the segment closed WHILE that request was in flight (the owner
paused right as a resend went out), the response comes back for audio that is no longer
the current segment — painting it over the caption would show text for words already
replaced. `segment_epoch` increments the instant a segment closes; `partial_tick()`
captures the epoch before its `await` and only paints if it's unchanged after. `finish-task`
did not need a repro — this was reasoned out before writing the send, per the code skill's
"no DOM after an await" family of traps, and covered again by the headless proof (§ below).

**The addendum's other rule — skip, don't queue** — lives in one line:
`partial_tick()` returns immediately if `this.inflight` is already set, rather than
awaiting it and re-sending, so a slow tick is dropped rather than stacking up a backlog
that would fall further and further behind the live audio.

## Why the grey partial text never touches the real textarea

An earlier design (matching the old `mic.js`) considered rewriting the target
textarea's whole value on every partial tick, the way Chrome's own interim results do.
Rejected: a plain `<textarea>` cannot render one part of its value in a different
colour, so "grey" would have to be simulated by fighting the DOM, AND overwriting
`.value` every 1.5 seconds means an owner who clicks into the box to fix a word mid
-dictation gets overwritten a moment later. Instead the grey/settled split lives in the
component's OWN caption element (plain CSS, `.muted` for the grey half), and the real
target box is only ever touched once a segment is FINAL — an *append*, not a rewrite,
so it never clobbers an edit in progress. This is a genuine improvement on `mic.js`'s
behaviour, not just a port of it.

## The level meter is a starting number, not a calibrated one

`on_level()` smooths the raw RMS (`level = level*0.6 + new*0.4`) and multiplies by 6
before writing `--ux-dictate-level` — chosen by ear against one room and one
microphone, not measured against a reference. The same rough number,
`silence_at = 0.01`, decides what counts as a pause for the 700ms cut. Both are
prototype defaults (`Dictate.prototype.silence_at`, easy to override per instance) —
left un-tuned on purpose, since "does it hear the owner at all" mattered more today than
"is the meter's swing exactly right," and no wrong number here breaks a segment, only
makes the meter a little over- or under-eager.

## No separate level meter for the browser engine

Whisper's capture pipeline already reads raw samples (it has to, to build the WAV), so
the level meter is nearly free there. The browser engine does not expose the raw stream
it listens to by default, and opening a SECOND `getUserMedia` stream just to drive a
meter — for an engine that is only ever the fallback once whisper is installed — was cut
as not worth the extra permission prompt and audio graph. `.ux-dictate-btn.listening[data-engine="browser"]`
gets the same plain pulse `ext/Ask/mic.js`'s button already used.

## No "words" CSS of its own to check, but the child page exists anyway

`Dictate.css` is four rules, none of them spacing — nothing here reads `--pad`/`--gap`/
`--flow` in a way `ui-compact` would change. The `words` child page was still built
(the tier's own rule: every `ux` ships one) mostly as the tier's own regression check —
proof that wrapping the control in `ui-contrast ui-compact` breaks nothing, not proof
that anything visibly changes.

## Who starts whisper-server?

Three shapes were on the table. Task log:
[`ai/2026-09-19/whisper-autostart/`](/framework/ai/2026-09-19/whisper-autostart/).

- **(a) The dev server starts it on demand**, from a small `Server/plugins/Whisper.js`
  that checks the install exists and launches it lazily on first use. **Chosen and
  built 2026-09-19**, once `Server/**` was free of the sibling task that owned it —
  needs no separate step from anyone at all. What it does on boot, the four cases:
  not installed (one line, falls back to the browser engine), already running
  (left alone — it never kills a `whisper-server` it did not spawn itself, which is
  also what keeps exactly one process alive across the dev server's own supervisor
  restarts), spawned fresh (killed with the dev server, restarted up to 3 times if
  it crashes), or skipped (`NO_WHISPER=1`, or a second, private dev server that
  would only fight the first one over the port). Full detail:
  [`Server/plugins/Whisper.js`](/Server/plugins/Whisper.js).
- **(b) A `whisper.cmd`** the owner double-clicks or runs from a terminal. Simplest,
  fully manual, zero new code paths to reason about — kept as the fallback for
  `NO_WHISPER=1` or for running `whisper-server` outside the dev server entirely
  (readme's "Fallback: start it by hand").
- **(c) A Windows scheduled task at login.** Starts it before it's ever needed, at the
  cost of a GPU process running whether or not dictation is used that session. Not
  built — (a) already covers "no manual step" without paying that idle GPU cost.

## The keyboard shortcut: `Ctrl+Shift+M`, and why not the obvious ones

A second owner note, after trying another product's dictation: it showed live words
(good) but a pause never sent anything — a second button press was required, and there
was no keyboard shortcut to be found, "which is kind of weird." Two changes came from
that.

First, a shortcut. Checked against every global key already claimed on this site before
picking one (`rg -n "shiftKey|ctrlKey|metaKey"` across `public/framework`): `/` and
`Ctrl+K`/`Cmd+K` open the omnibox (`core/Search/Omnibox.js`), `Ctrl+\` toggles the dev
bar (`dev/DevBar/DevBar.js`), and nothing anywhere binds a key with Shift+M. `Ctrl+D`
was ruled out by the owner directly (Chrome's own bookmark shortcut — and page JS
cannot reliably override it, since bookmarking is one of the handful of shortcuts Chrome
intercepts before a page ever sees the keydown). `Ctrl+Shift+M` is not on that
non-overridable list, is not claimed by this site, and is mnemonic ("Mic"). It is
announced in the button's `title` tooltip AND the small engine line beside it, per the
ask, rather than left for someone to guess or dig through a settings page for.

**Alternative considered and rejected:** a single global shortcut that always targets
"the" dictation control. Rejected because `ext/Ask/reply.js` can have many `Dictate`
instances live on one page at once (a mic per ask card, plus the dictation box) — one
global target would be ambiguous the moment two exist. `hotkey()` instead fires on
whichever instance is already listening (so the shortcut can always stop what's
running), or otherwise only the instance the owner's focus is actually inside — pressing
it while typing in a specific reply box starts THAT box's mic, not some other card's.

## `send_on_pause`: explicit by default, an opt-in countdown, never a silent auto-submit

The same story that surfaced the shortcut gap also showed the opposite failure in
another product: a pause auto-submitted with no warning, which is its own kind of
surprising. The fix keeps ending a dictation **explicit by default** (button or
shortcut, full stop — nothing here changed that) and adds an **opt-in** middle ground: a
checkbox literally labelled "stop after a pause," off unless the owner turns it on, tied
to a *longer* silence window (2.5s, `end_pause_ms`) that is completely separate from the
700ms `pause_ms` that only closes one whisper segment for transcription and was never
about ending anything. When it's on and a silence starts, a small countdown text appears
("stopping in 1.8s — say something to keep going") and counts down every 200ms tick;
speaking again resets `last_loud_at` and the countdown disappears before it ever
reaches zero. Only once it visibly reaches zero does `stop()` actually run.

**Alternative considered and rejected:** making `pause_ms` itself configurable to double
as "end the dictation," i.e. one number for both "close this segment" and "end the whole
session." Rejected because those are different questions asked on different timescales —
700ms is barely enough to keep live partials feeling responsive between sentences, and
ending an entire dictation on that same short a gap is exactly the "auto-submitted with
no warning" behaviour the owner had just been annoyed by elsewhere. Keeping them as two
separate numbers, one silent (segment cut, whisper-only, always on) and one visible
(session end, opt-in, either engine), was the one line that made both true at once.

## `ext/Ask` importing `ux/Dictate` — checked against "imports flow down"

The brief names the exact wire: `ext/Ask/reply.js`'s `acts()` now does
`import Dictate from "../../ux/Dictate/Dictate.js"` and builds `new Dictate({...})`
where it used to build `mic()`. On its face this runs opposite the usual direction —
`ux/Tree/Tree.js` imports `ext/Draggable`, i.e. **ux imports ext**, and nothing under
`public/framework/ux` was found importing `ext/Ask` (checked with a grep of both
directions before writing the import). Flagging it rather than either silently
following the brief or silently "fixing" it against the brief's own explicit
instruction.

Landed as directed, because the actual hazard the "imports flow down" rule guards
against is a CYCLE — the CLAUDE.md trap is "a parent↔child import cycle breaks only on
deep reload" — and there is no cycle here: `ux/Dictate/Dictate.js` imports only
`core/View` and its own `capture.js`; nothing in `ux/Dictate` reaches back into
`ext/Ask` or anything that does. `ext/Ask` is also not a foundational utility other
tiers build on the way `ext/Draggable` or `ext/Panel` are — it is itself a page-facing
feature (a reply control, a Claude turn) consuming a UX component the same way a
`page.js` anywhere else in the tree already does. If a second `ext/` module later
wants a `ux/` component and a cycle risk shows up for real, that is the moment to
revisit this, not before.

## `Dictate.js` is 429 lines, not split into parts

The `code` skill's guidance is "try to keep a file under ~100 lines — a signal to look, not
a rule," and to split when "a logical piece wants to be its own class." The two engines
(`start_whisper`/`heartbeat`/`partial_tick`/`close_segment`/`transcribe`, versus
`start_browser`/`heard_browser`/`browser_error`/`stop_browser`) are a real seam and could
become `Dictate.Whisper` / `Dictate.Browser` statics the way `Reply.Dictation` sits on
`Reply`. Left as one file for now: every method here was written, then proven against the
headless fake-microphone rig in this same session (§ below) — a split is a mechanical
move but not a risk-free one this late, and the two engines already read cleanly under
clear `// ----` section breaks. If this file grows further (a third engine, more per-engine
state), that is the moment to make the split real rather than doing it speculatively today.

## Voice → log, added 2026-09-22

Task log: [`ai/2026-09-22/whisper-servex/`](/framework/ai/2026-09-22/whisper-servex/). Owner's
words that opened it: "spawn a minion to look into our Whisper system, and see if we can get
that working with Servex." Everything above still stood — `whisper-server` was already up and
transcribing correctly — but the transcript only ever reached the screen. `commit()` now also
calls `log_prompt(text)`, so every finished utterance (each committed whisper segment, or each
`isFinal` browser result — the same granularity that was already reaching the caption and the
target box) becomes one log line `{at, type: "prompt", by: "owner", text, via: "whisper"}`.

**Primary target: Servex's own log**, `POST http://127.0.0.1:8090/log/prompts` — one constant
(`Dictate.prototype.log_url`), a 1.2s timeout so a down Servex never stalls a dictation. Not up
yet as of this task (`servex-port` is still building it); the moment it answers, this starts
working with zero further changes to this file.

**Fallback, proven working today:** the dev server's own generic append route. The brief
guessed the fallback might be `Server/plugins/AILogs.js` or `Ask.js` — checked both and neither
fits: `AILogs.js` is read-only (serves Claude Code transcripts, no writer at all), and `Ask.js`'s
socket handlers only append to a `task.jsonl` whose path must contain an `ai` segment, not an
arbitrary named log. The real generic writer, found by grepping every `rpc:` handler under
`Server/`, is `Server/plugins/SocketServer/Append.js`'s `rpc:append(file, lines)` — already
wired into `server.js`, writes any `.jsonl` under `public/`. `log_prompt()` falls back to
`Socket.singleton().async_rpc("append", "framework/ai/prompts.jsonl", entry)` on any primary
failure. Proven headless: a fake-mic dictation of the JFK clip on a private server, with Servex
confirmed down by `curl`, left two real lines in `public/framework/ai/prompts.jsonl` in exactly
the brief's shape.

**Alternative considered and rejected:** logging only on `stop()` (one line per whole dictation)
instead of per committed segment. Rejected because `commit()` is already the point where text is
considered "finished" everywhere else in this file (the caption settles, the target box gets the
append) — a second, coarser definition of "finished" would need its own buffering and would lag
behind what the owner already sees on screen for no real benefit.

## What the headless proof covered, and what it could not

Playwright's fake-audio flag (`--use-file-for-fake-audio-capture`) feeds a WAV file as
if it were the microphone — real enough to prove the whole pipeline (capture → segment →
whisper → caption → textarea) end to end, including the "no 🎤 drawn" and "which engine
did it fall back to" branches with `whisper-server` stopped. It cannot prove the level
meter reacts to a human's actual voice, or that a real microphone's `NotAllowedError` /
device-not-found paths fire exactly as written — those were read against the spec and
against `ext/Ask/mic.js`'s own prior handling of `not-allowed`, not independently
observed here.

## "Thank you" — silent segments, fixed 2026-09-22

The one the owner actually hit: whisper kept answering "Thank you" no matter what they
said. The sound was never lost — the microphone, the 16kHz context, the worklet and the
WAV header all measured correct end to end. `Dictate` was simply also sending whisper the
quiet stretches (the tail after a settled sentence, and the 1.5s re-sends before the first
word), and whisper answers silence by inventing a sentence rather than returning nothing.

`Capture.loudness()` and `Dictate.worth_sending()` now refuse to send a segment carrying
less than 120ms of speech, counted in 20ms frames rather than as one average — a quiet room
with a single click in it measures 0.043 RMS, so an average cannot do this job. The full
measurement, the alternatives rejected, and the `$DICTATE_DUMP` seam that captures the exact
posted bytes: [`doc/silence.md`](/framework/ux/Dictate/doc/silence/).

## Open mic — 2026-09-22

The owner's own complaint: a segment used to land under the box, then get MOVED into it and
submitted, all at once — surprising, and wrong for a mic meant to stay on indefinitely while
a fast assistant listens to every sentence. `mode: "open"` makes both halves explicit instead
of implicit: `push_to_target()` never touches `$input` at all (the box is for typing, full
stop), and `draw_caption()` keeps every settled sentence as its own line, appended, instead of
one string capped at 240 characters. Proven against a private Servex + a concatenated 3x `jfk.wav`
clip on both `talk` and AI 2's composer: three real whisper segments, the box's `value` stayed
`""` throughout, "stop after a pause" was absent, zero console errors — `ai/2026-09-22/open-mic/`.

## The dictation box: growth, jumping, breaks and delay (2026-09-24)

- **Height.** The composer box grows with the words up to `min(40vh, 12lh)` (about twelve lines), then scrolls inside itself with the newest words in view (`ext/Chat/Chat.css`, `Mic.js`).
- **Why it jumped.** Dictate's `close_segment()` blanked the guess the instant a pause closed a segment, then waited for Whisper's final (100–300 ms): the box emptied, shrank to two lines, and grew back. `ComposerMic` now keeps the guess in `pending` until its final arrives, and never lets the box shrink while dictating (`floor_h`, released on Send). The old italic caption line sat in a fixed row, so nothing below it could move.
- **Odd breaks.** Whisper puts `\n` between its own segments mid-speech; `transcribe()` now collapses all whitespace. A paragraph break needs a 1.5 s pause **and** a finished sentence before it.
- **Delay.** Whisper's answer reaches the box in about 4 ms; the time is Whisper itself (~100 ms warm, ~300 ms first request) plus the final queueing behind an in-flight guess (whisper-server is one request at a time). No guess is now started once the speaker has been quiet 300 ms (`skip_partial_after_ms`).

## Send modes and the delay (2026-09-24)

`ComposerMic.send_mode` (in `ext/Chat/Mic.js`) decides when finished sentences leave the box: `manual` (default — only Send, so nothing can go early), `pause` (4 s of silence, only if the last sentence is finished), `sentences` (every 3 finished sentences). Send never cuts the live guess: the moving sentence is kept out of what Send reads, then redrawn into the emptied box. Try all three at [`/framework/ux/Dictate/demo/`](/framework/ux/Dictate/demo/).

Delay, measured over 20 updates: Whisper answers in about 67 ms (max 283 ms); everything after the answer — filler filter, paragraphing, setting the box — is under 0.5 ms in total. The felt delay was the wait between guesses, so `resend_ms` went from 1500 to 900. Paragraph breaks need a pause of 1.5 s AND a finished sentence before it; Whisper's own newlines are collapsed to spaces.

## Mic feedback, the "connecting" state, and a testing note (2026-09-29)

The owner's phone (`http://10.0.0.135:8137`, plain http) played the start sound with no
mic ever really on, and no error. Traced headless: off a secure context (https, or
`localhost`/`127.0.0.1`/`*.localhost`), `navigator.mediaDevices` is `undefined`, but
`window.webkitSpeechRecognition`'s CONSTRUCTOR still exists — so `detect_engine()` still
picked `"browser"`, and `Dictate.start()` was marking state `"listening"` (which is what
played the sound, in `ext/Chat/Mic.js`) **before** the engine had actually connected, not
after. Fixed: a new `"connecting"` state is set first; `set_state("listening")` — and
therefore `ext/Chat/Mic.js`'s `on_listening()` hook the start sound is wired to — now only
fires on the REAL transition, once whisper's own `capture.start()` resolves or the browser
engine's own `rec.onstart` fires. An instant, first-line `insecure_context_message()` check
in `start()` also means the insecure-LAN case now errors immediately with a plain fix,
before any engine is even asked for. Proof and every case's exact wording:
`ai/2026-09-29/mobile-nav/`.

**A real, previously-silent bug this surfaced:** `Dictate`'s own audio-capture object was
held in `this.capture` — the same name `View.prototype.capture` already uses for an
unrelated auto-append-to-captor flag (`core/View/View.js`). Any error path that ran BEFORE
`start_whisper()` had assigned a real `Capture` instance (which is exactly what the new
up-front insecure-context check does) hit `this.capture === true` (View's own default) and
`true.stop()` threw, silently eating the error message before its text ever reached
`$status`. Renamed the field to `this.mic` throughout `Dictate.js` and `ext/Chat/Mic.js`.

**Testing note — "Not supported" in a screenshot is very likely a plain-headless artefact,
not a mic bug.** A `NotSupportedError` (shown as "This browser can't run the audio pipeline
dictation needs here…") is the shape Chromium gives when `AudioContext.audioWorklet` (or
the fake/real audio backend behind it) is not usable at all — exactly what a Playwright
run WITHOUT any fake-media flags tends to hit, since default headless Chromium has no real
microphone and no synthetic one either. A proof that needs the mic to genuinely open —
reaching real `"listening"`, seeing the start sound fire, exercising a mid-session failure —
needs `chromium.launch({ args: ["--use-fake-device-for-media-stream",
"--use-fake-ui-for-media-stream", "--use-file-for-fake-audio-capture=<abs path to a real
wav>"] })` plus `context.grantPermissions?.(["microphone"])`-equivalent
(`newContext({ permissions: ["microphone"] })`); without the file-capture flag the fake
device's default tone may or may not cross the speech-loudness floor, so a real recorded
clip (`ai/2026-09-22/whisper-servex/clip.wav` was used here) is the reliable choice.

## The stop chime dropped or doubled, fixed 2026-10-01

The owner, on the Dictate Overview: "Seems like the transcription stopped and I didn't
get a sound to let me know that it stopped. It doesn't seem like the sounds are playing
properly." Both sentences traced to the same function, `beep()` in `ext/Chat/Mic.js`
(the start/stop chime — see "Mic feedback" above for where `on_listening()` wires the
START one; plain `Dictate` has no sound at all, only `ComposerMic` does):

1. **Scheduled on a frozen clock.** `beep()` called `AudioContext.resume()` but never
   *waited* for it before reading `currentTime` and scheduling its two oscillator notes.
   A brand-new (or still-suspended) context's clock is frozen at 0 until `resume()`
   actually finishes — so any chime fired with no fresh click right behind it (the very
   first beep on a page, or the STOP chime fired by `release_on_hide()` when
   `visibilitychange`/`pagehide` releases the mic — `readme.md`'s "Watch out", the
   mic-hijack feature this landed the day before) could be scheduled against that
   frozen instant and come out silent, clipped, or mistimed once the context actually
   woke up a moment later. Fixed: `beep()` is now `async` and does
   `if (beep_ctx.state !== "running") await beep_ctx.resume();` before computing `t0` —
   every call site (`on_listening()`, both `stop()`s, `set_error()`) was already
   fire-and-forget, so nothing needed to start awaiting `beep()` itself.
2. **Doubled on an error mid-stop.** `ComposerMic.stop()`'s own `finally` beeped "stop"
   whenever `was` (captured at the top, before `super.stop()` ran) was true — even when,
   moments earlier in that SAME call, whisper going unreachable while sending the last
   segment (`Dictate.close_segment()`'s own catch) had already called `set_error()`,
   whose own override beeps "stop" right there (state is still `"transcribing"` then).
   One stop produced TWO overlapping chimes — a garbled noise, not a clean tone, which
   reads as "the sounds aren't playing properly" as much as a missing sound does. Fixed:
   `stop()`'s `finally` now reads `if (was && this.state !== "error") beep("stop");` —
   skipped when `set_error()` already beeped for this same stop.

Neither case needed a live microphone to find — both are deterministic once you trace
exactly when each `beep()` call happens relative to the async chain around it. Full
reasoning: `ai/2026-10-01/dictate-stop-sound/task.jsonl`.

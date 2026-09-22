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

## What the headless proof covered, and what it could not

Playwright's fake-audio flag (`--use-file-for-fake-audio-capture`) feeds a WAV file as
if it were the microphone — real enough to prove the whole pipeline (capture → segment →
whisper → caption → textarea) end to end, including the "no 🎤 drawn" and "which engine
did it fall back to" branches with `whisper-server` stopped. It cannot prove the level
meter reacts to a human's actual voice, or that a real microphone's `NotAllowedError` /
device-not-found paths fire exactly as written — those were read against the spec and
against `ext/Ask/mic.js`'s own prior handling of `not-allowed`, not independently
observed here.

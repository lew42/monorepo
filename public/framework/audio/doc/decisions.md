# audio/ — decisions

## Extracted vs. rebuilt

`MicStream` is `ux/Dictate/capture.js` (+ `pcm-worklet.js`) copied, not imported — `ux/Dictate/`
(`Dictate.js`, `capture.js`, `pcm-worklet.js`, and the playground) was another minion's fence
while this task ran (2026-09-29, both spawned from `ai/2026-09-29/audio/`). The processor name
was changed (`lew42-pcm` vs `dictate-pcm`) so the copy never collides with the original even if
both ever load on the same page — each opens its own `AudioContext`, so it would not have
mattered either way, but a distinct name costs nothing and rules it out.

`Transcriber.Whisper`'s heartbeat/resend/silence logic mirrors `Dictate.start_whisper()` /
`heartbeat()` / `partial_tick()` / `close_segment()` / `worth_sending()` closely — same numbers
(700ms pause, 15s cap, 900ms resend, 120ms min speech), same shape, because the brief says to
keep Dictate's silence rule exactly. The difference: `Transcriber.Whisper` reads a `MicStream`
handed to it rather than owning its own `Capture`, so several transcribers (or a level meter and
a transcriber) can share one open microphone.

Phase 2 (a task the mastermind may hand out next) is expected to rebuild `ux/Dictate` on these
parts, at which point the duplication above collapses — `Dictate.js` would hold a `MicStream`
and a `Transcriber.Whisper` instead of its own `Capture`, and `capture.js`/`pcm-worklet.js` could
retire. Left as two copies for now because touching `ux/Dictate/` was out of this task's fence.

## Push-to-talk "listener": `<audio>`, not WebRTC

The brief allows either "a WebRTC loopback or a MediaStream into an `<audio>` element". A real
WebRTC `RTCPeerConnection` (even a loopback one, offer/answer against itself) is real protocol
work for a demo whose whole point is proving `PushToTalk`'s `on_start(stream)` hands out a
usable `MediaStream` — the same object dropped straight into `<audio srcObject>` proves that in
four lines and stays honest that this is LOCAL ONLY (the brief's own words), never implying a
cross-machine connection that isn't there. `push-to-talk/readme.md` says exactly what a real
cross-machine version would change (one line, not the class).

## Transcriber.Whisper / Transcriber.Browser attach via `index.js`, not `Transcriber.js`

`class Whisper extends Transcriber` needs `Transcriber` to already exist when `Whisper.js`'s
module body runs. Had `Transcriber.js` imported `Whisper.js` (to attach `Transcriber.Whisper =
Whisper` in one place), that import would need `Whisper.js` evaluated as part of resolving
`Transcriber.js`'s own dependencies — before `Transcriber.js`'s `export default class
Transcriber` line has run — and `Whisper.js`'s `extends Transcriber` would read the binding
before initialization: a real `ReferenceError`, not a maybe. `Whisper.js`/`Browser.js` instead
attach themselves onto the already-loaded `Transcriber` (their own dependency, not a cycle);
`Transcriber/index.js` is the one door that imports the base plus both engines, in an order with
no cycle at all, for a caller that wants everything without knowing this.

## `Part` (thing.view / track()) instead of repeating it five times

The brief asks for the item-ui pattern (`static View`, `thing.view`) and `track()` on every one
of the six classes. `assign()`-based construction plus `get view()` is identical code in all
six, so it is one small base class (`Part.js`) rather than five copies — the same "parts are
classes" rule the `code` skill gives for anything a module needs more than once.

## Three sizes (icon/row/panel) as one `PartView`, not per-class layouts (2026-09-29)

The owner's follow-up (relayed by task-mastermind-audio, "reread §9") asks every class for an
icon with flags, a one-line row, and a full panel. Building three layouts per class (18 total)
would be most of this task's remaining budget on markup that is the same shape every time —
`ui/item/item.js`'s row, a small flag strip, and (panel) `ux/Content/Object/DefaultView.js`'s
own property tree. `PartView` (in `Part.js`) is the one class every `Klass.View` now extends: a
`size` field picks which of `icon()`/`row()`/`panel()` runs, and a subclass overrides four small
hooks (`glyph()`, `label()`, `stat()`, `flags()`) instead of three renders. `refresh()` gives a
cheap in-place repaint (text + flag classes only) for a value that changes every audio frame —
rebuilding the whole `item()` row on every level tick would be real, needless DOM churn.

**`Klass.View` is now the STATE view, not the controls.** `Recorder`'s and `Transcriber`'s
existing buttons/transcript display kept their own names (`Recorder.Controls`,
`Transcriber.Transcript`) rather than being replaced — a demo wires both side by side. Done fully
for `MicStream`, `Recorder`, `Transcriber` (+ `Whisper.View`, which adds request latency and
in-flight state on top of `Transcriber.View`'s row). **Deferred, logged rather than rushed:**
`MicPicker`, `LevelMeter`, `PushToTalk` still carry only their original interactive `View` — no
icon/row/panel state view yet. Each is a small addition once picked up (the same four hooks), but
budget ran out here first, per the mastermind's own "if this doesn't fit, log what's left."

## Seams — a forced cut used to land mid-word; measured, mostly fixed, one new risk found

**The bug.** `Transcriber.Whisper` closes a segment either on a real pause (fine — that IS a word
boundary) or when `max_segment_ms` (15s) fires regardless of what is being said — a forced cut,
which used to call `mic.cut()` at that exact instant, mid-syllable, throwing away nothing but
splitting a word's audio across two separate whisper requests. Two isolated fragments of one word
rarely transcribe as that word.

**Try 1 (cheapest first, per the brief): (a) cut at the quietest recent instant, not the
deadline.** `MicStream` now keeps one RMS value per worklet chunk (`chunk_levels`, `cut()`
already clears it); `quietest_split(window_ms=1000)` finds the quietest chunk boundary in the
last second and returns its sample index; `cut_at(sample_count)` splits the buffer there and,
unlike `cut()`, KEEPS the remainder as the start of the next segment instead of discarding it —
so nothing is lost even when the quiet instant isn't the exact deadline. **(b) send the previous
final as whisper.cpp's `prompt`** (`Whisper.transcribe()`), so a word still straddling the split
has context on both sides. **(c) overlap + de-duplicate** was not built — (a)+(b) already needed
measuring before adding a third moving part, and the result below shows why that caution was
right.

**Measure.** A ~52s continuous monologue (five sentences, no long pauses) was synthesized with
Windows `System.Speech.SpeechSynthesizer` (`Add-Type -AssemblyName System.Speech`, hidden — no
window, no `-Redirect…` flags) and played into headless Chromium via
`--use-file-for-fake-audio-capture=<wav>` — the same trick the fake-mic proofs elsewhere in this
task use, just with real words in the file instead of a sine tone. The monologue's own sentence
pauses (~1–2s) never came close to the real 15s cap, so `max_segment_ms` was set to 5000 for the
test only (`Whisper.max_segment_ms = 5000`) to force several mid-sentence cuts reliably — a
methodological choice, not a shipped default. Two runs against the SAME file, same real
whisper-server: `seam_fix: false` (plain `cut()`, no `prompt` — today's old behaviour) and
`seam_fix: true` (a)+(b) together. Full transcripts and the run script are in this task's log
(`ai/2026-09-29/audio/a-parts/task.jsonl`, `experiment` entries).

**Result — genuinely mixed, not a clean win:**
- Two forced-cut seams that dropped whole words under the old code kept them under the fix: "the
  science project **due** at the end" (before: "science project due" LOST entirely — 3 words
  gone; after: the word survives, transcribed as "do" instead of "due" — wrong, but present) and
  "dinner and **homework**" (before: split into "…and" / "work." — "home" vanished; after: no cut
  landed there at all, "homework" came through whole).
- One seam got WORSE: a quiet point inside "lunch **boxes** while chatting…" produced a very
  short tail fragment, and with a `prompt` attached whisper.cpp hallucinated an entire invented
  sentence ("The group of children are in the same room with their friends and their friends.")
  in place of about 17 real words. This is a known whisper.cpp failure mode — a short/weak
  fragment plus a prompt can bias it into repetition or invention rather than admitting little
  was said.
- **Shipped fix**: (a)+(b) stay on by default (`seam_fix = true`), but `transcribe()` now
  withholds `prompt` when the segment being sent is under ~0.6s of audio — the cheapest guard
  against the exact shape of the failure above. **Not yet re-measured against the same
  monologue** (budget) — flagged here for whoever picks this back up.

**Recommendation:** before trusting this further, re-run the same experiment with the 0.6s guard
in place, and separately isolate (a) alone vs (a)+(b) — this run changed both at once, so which
one caused the hallucination (the short fragment `quietest_split` chose, or the `prompt` biasing
a weak fragment) is not proven, only correlated. (c) (overlap + de-dup) is still unbuilt and, given
this result, should wait until (a)+(b) are independently known-good.

See [`Transcriber/doc/streaming.md`](/framework/audio/Transcriber/doc/streaming.md) for whether a
real streaming engine would sidestep this whole family of bug instead — **superseded by the
"Rolling window" decision below**, which the owner picked over pursuing (a)/(b)/(c) further.

## Rolling window: local agreement replaces cut-and-append (2026-09-29, the owner's design)

The seam experiment above found a real, mixed result — cutting at a quiet point helped some
seams and hallucinated on one. Rather than keep patching the cut-and-append shape, the owner
specified a different one: **`Transcriber.Whisper` is now a rolling local-agreement window**
(`Whisper.js`, rewritten). No segment ever "closes"; instead, every ~1s the whole uncommitted
buffer is re-transcribed, and only the words that AGREE with the previous tick's transcript (a
longest-common-prefix comparison, `agreement_length()`) are committed as `on_final()` — the
audio behind them is dropped from the buffer (`MicStream.cut_at()`), never re-sent. The
uncommitted tail is `on_partial()`, shown but never treated as settled. The old engine is kept
reachable as `Transcriber.WhisperSegments` (v1 stays available, per the owner's own "never
destroy a viable version" rule) — same file, renamed class, nothing deleted.

**This is an approximation of "real" local agreement** (`whisper_streaming`, researched in
`streaming.md`, aligns agreement to word-level TIMESTAMPS from the model). whisper-server's plain
`/inference` here returns only joined text with no timestamps, so committed audio is dropped in
PROPORTION to how much of the text just agreed (`committed.length / text.length` of the sample
count) — an approximation, written as one in the class's own doc comment, not hidden.

**Ephemeral stays in memory only, per the owner's rule**: guesses, per-tick timings
(`this.requests`) and the raw buffer live only in the running page — nothing here writes to disk
or any log; a caller's own `on_final()` handler is the only place committed text could be logged,
and only committed text ever reaches it.

**Measured**, same method as the seam experiment (Windows TTS → WAV, hidden window, played into
headless Chromium via `--use-file-for-fake-audio-capture`, against the real local whisper-server)
— this time a single ~49s CONTINUOUS sentence (commas, no periods, so nothing closes on a natural
pause; the owner asked for "60s nonstop," 49s is what `System.Speech` actually produced from the
script used and was not re-timed to hit the number exactly — budget). `WhisperSegments` (old) vs
`Whisper` (rolling), same file, same server, `finals` compared against the known source text.

**Result — a clear improvement, not just a different trade-off:**
- `WhisperSegments` (old): two genuine hallucinations at forced-cut seams — "…hoping to get the
  warmest loaves straight from **the river**." (source: "…straight from **the old brick oven** in
  the back room…" — whisper invented "the river" at the cut, though the real words DO still
  appear correctly at the start of the next segment) and the same shape again later ("…straight
  from **the island**." at the point where the test's looping audio wrapped around). Plus one
  genuine word LOST across a seam ("…camping trip **they**." | "**All** planning to take…" —
  "are" is simply gone) and one duplicated ("...after school the **children**." | "**Children**
  usually gather…").
- `Whisper` (rolling): across the same ~49s of real content, the ONLY defect is one duplicated
  word ("…prepares fresh bread **and and** pastries…") — no hallucinated substitution, no lost
  word. (Two more artifacts appear exactly where the test's audio LOOPS back to its own start
  mid-utterance — "…for dinner and **the quick the quick** brown fox…", losing "homework" right
  at the loop point — but that is the test harness's audio restarting abruptly, not a seam either
  engine could have handled inside continuous real speech, and is excluded from the count above.)
- **Net**: 0 hallucinations / 0 lost words / 1 duplicate for the rolling window, vs. 2
  hallucinations / 1 lost word / 1 duplicate for cut-and-append, over materially the same
  content. `window_s = 12` (force-commit past 12s of unstable, unagreed audio) never triggered in
  this run — the monologue's phrasing agreed within a tick or two throughout.

Full transcripts and the run script are in this task's log
(`ai/2026-09-29/audio/a-parts/task.jsonl`, `experiment` entries) and in
[`Transcriber/doc/streaming.md`](/framework/audio/Transcriber/doc/streaming.md), which now folds
this decision in rather than only recommending it.

**Left open**: `window_s`'s force-commit path is unmeasured (never fired); the proportional
audio-trim approximation could still mis-cut on a very uneven transcript (a short agreed prefix
against a very long remaining guess); `Transcriber.WhisperSegments`' own `seam_fix` guard (the
0.6s prompt-withholding one) is unrelated to this and still itself unre-measured.

## Six classes down to three: MicPicker + LevelMeter + PushToTalk absorbed into MicStream (2026-09-30)

The owner pressed the old Push-to-talk demo, the button lit up, and there was nothing else to
see — "maybe some of these things need to be combined into a single demo," and separately, "which
of the audio tools are bloated or could be merged?" Looking at what the three small classes
actually did: `MicPicker` enumerated devices and remembered a pick (real logic, worth keeping,
just not worth its own class); `LevelMeter` and `PushToTalk` never held any logic of their own at
all — both just called methods on a `MicStream` someone handed them (`mic.on_level()`,
`mic.start()`/`mic.stop()`). A class whose entire body is "call a method on the thing I was
given" is the UI for that thing, not a separate concept — so `MicStream` grew `devices()` /
`pick()` (moved from `MicPicker`, unchanged) and `mode` (`"hold"` | `"toggle"`) +
`press()`/`release()`/`toggle()` (what `PushToTalk` used to orchestrate from outside), and a new
`MicStream.Controls` view draws the picker, the level bar and the mode button together, in one
place, off one `MicStream` instance.

**The three old classes were NOT deleted.** `MicPicker` is now a thin wrapper — `devices()` and
`pick()` call `MicStream.prototype.<method>.call(this)` rather than duplicating the browser calls
— kept working, one implementation. `LevelMeter` and `PushToTalk` needed no logic change at all
(they never had any to remove); only a deprecation note was added to each pointing at
`MicStream.Controls`. All three, plus the three old assembly pages that used them
(`sound-recorder`, `push-to-talk`, `mic-to-text`), were MOVED — not copied — to
[`v1/`](/framework/audio/v1/) (`git mv`, then every relative import inside them fixed for the new
depth), so the owner can open the old six-class version and the new three-tool one side by side.
`MicStream` and `Recorder` did not move; every `v1/` file that needs one now imports it from one
directory further up.

**The new top-level `audio/page.js`** is ONE live demo (pick a mic → see the level move → talk →
watch the transcript settle → optionally record), each part's own live-state view shown beside
it, above three tool tiles (MicStream, Recorder, Transcriber) — not a six- or three-card grid of
idle state views, which is what the owner's "no visible demo" complaint was actually about.
`MicStream.Controls` uses `mode: "toggle"` here (a click to start, a click to stop) rather than
hold — a page demo read better as "press once, talk, press again" than a button that has to stay
held down while reading this page.

**Two real bugs found while proving this, both fixed, both logged for the `code` skill (not
edited there — out of this task's fence):**

1. **A `Part` subclass field with the same name as a constructor option silently loses the
   option.** `class MicStream extends Part { mode = null; constructor(...args){ super(...args);
   … } }` — `super(...args)` runs `Part`'s `this.assign(...args)`, which correctly sets
   `this.mode`, but then (real JS class-field order, not a framework quirk) `MicStream`'s OWN
   field initializers run the instant `super()` returns, and `mode = null;` overwrites it right
   back to `null`. `new MicStream({ mode: "toggle" })` was landing with `mode: null` until
   `MicStream`'s constructor re-runs `this.assign(...args)` as its own last line. Any `Part`
   subclass with a field of the same name as an option it accepts (this codebase already had
   `device_id`/`device_label` on `MicStream` before this task, same trap, never previously hit
   because nothing constructed one with those options and then read them back immediately) has
   this bug.
2. **The exact same order problem, one layer up, inside `View` itself.** `View`'s own constructor
   (`core/View/View.js`) calls `this.render()` from INSIDE `super()` — before a `View` subclass's
   OWN field initializers have run. `MicStream.Controls` first tried `show_picker = true;` /
   `show_level = true;` as class fields read inside `render()`; both were `undefined` (falsy)
   every time, so the picker and the level bar silently never appeared — only the mode button did
   (it reads `this.subject.mode`, and `subject` IS set correctly by then, since `subject` arrives
   as an explicit constructor option, assigned in `View`'s constructor before `render()` runs).
   Fixed by testing `!== false` instead of relying on a `true` default field, which still lets an
   explicit `{ show_picker: false }` option turn a piece off (that DOES arrive before `render()`,
   for the same reason `subject` does). `PartView`'s own `size = "row";` field has this same gap
   but is accidentally safe — its `render()` falls into an `else` branch for anything that isn't
   `"icon"` or `"panel"`, and `"row"` happens to be exactly what the `else` branch does.

Both found by the fake-media Playwright proof this task's brief asked for returning an empty
`.audio-micstream-controls` div and a `mode: null` button with no console error at all — worth
naming because neither would have shown up from reading the code, only from actually pressing the
button in a real (fake-mic) browser.

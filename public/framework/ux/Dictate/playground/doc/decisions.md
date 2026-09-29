# Dictation playground — decisions

Landed 2026-09-28. Task log:
[`ai/2026-09-28/dictation-playground/playground/`](/framework/ai/2026-09-28/dictation-playground/playground/).
Owner's words opened the parent task: "for the dictation... playground, this should be
right at the... default dictation page... you just click the microphone button and it
starts transcribing just so we can test it quickly with one click."

## The current shape: one `widget()`, mounted twice, one shared session

`widget()` builds ONE self-contained unit — mic, Sample button, audio source panel, and
all three panels (Raw, Corrections, Live) — with no per-tab `Page` at all. Every panel is
built every time; clicking a tab only toggles which one is `hidden`, so nothing is ever
rebuilt and nothing is ever lost mid-session. `pg.views` is a `Set` of every mounted
widget's own DOM refs (`{$raw, $guess, $corrections, $live, $status, $tabs}`); every
pipeline method (`settle()`, `guess()`, `clean_chunk()`) loops over `this.views` and
updates ALL of them, so a chunk settled from either mounted widget shows up on both. It
is called from TWO different `page.js` files — the plain
[`ux/Dictate/page.js`](/framework/ux/Dictate/) (so the owner's "one click, right at the
default page" is literal — no navigation needed) and this module's own `page.js` (the
same widget, its own url) — and both read and write the SAME `Playground` instance,
`export const pg = new Playground()` at the bottom of `Playground.js`.

"Routed" is a plain `location.hash` (`#raw`/`#corrections`/`#live`), read once at mount
and written on every click with `history.replaceState` — a reload or the back button
lands on the same tab, without a second `Page` per tab.

**Every per-widget DOM ref is a LOCAL variable inside `widget()`/`audio_panel()`, never a
field on the shared `pg` instance** — two mounted widgets sharing one field would each
overwrite the other's reference. `refresh_devices($select)` and `pick_device($select,
id)` take the select as an argument for exactly this reason. The mic button itself (`new
Dictate(...)`, built fresh inside each `widget()` call) was never stored on `this` at
all, so it never had this problem — two independent, fully working mic buttons, sharing
one pipeline through `on_text`/`on_guess`/`on_start` closures over `this` (the pipeline),
never through a shared DOM reference. This is the shape round 1 got wrong; see the bottom
of this file.

**A new session ignores chunks still cleaning from the old one.** Every settled chunk is
stamped with `this.session` (an integer `reset()` increments); `clean_chunk()` checks the
stamp against the CURRENT `this.session` before drawing into any view, so a chunk that
was still waiting on `/api/tidy` when the mic was pressed again finishes into nothing
rather than painting the new session's Corrections/Live panels with the old session's
text.

**Corrections and Live are the same drawing, told apart by their own class.** Both
panels first shared only `ux-dictate-pg-panel ux-dictate-pg-diff`, which is functionally
harmless (each `view` object still points at the right element) but meant nothing on the
page could be selected as "the Live one" from outside — including a headless proof's own
selectors. Fixed by adding `ux-dictate-pg-live` / `ux-dictate-pg-corrections` alongside
the shared class.

**The Live fade also closes the gap a struck word leaves.** `opacity: 0` alone leaves a
struck word's own WIDTH in the flow — "we should␣␣we should" instead of "we should" once
the strike vanished. `start_fade()` also `setTimeout`s a plain `display: none` on every
struck word, timed to land exactly when the opacity transition finishes (`FADE_MS + 60`)
— CSS alone cannot collapse an inline element's width (there is no `inline-size` to
animate on a `span`), so this half is JS, not the stylesheet.

**The cleanup status is one line, not one per chunk.** `entry.source` used to print after
every settled chunk ("rules (no LLM)" × N) — noise once a session has a few sentences in
it. `update_status()` writes ONE line above the tab strip, naming the MOST RECENT chunk's
source (`"cleanup: fast assistant · <model> · <n> s"` or `"cleanup: rules (no LLM) —
Servex /api/tidy not reachable"`, or `"cleaning…"` while `/api/tidy` is still being
asked); each diff line keeps its own source as a `title` tooltip instead of inline text.

**The level meter has its own hook, `on_meter(level)`.** The mic button's own bar
(`Dictate.css`'s `.ux-dictate-level`) is 3px wide and lives beside the icon — enlarging
it with CSS still left it too small and easy to miss as "the audio source panel."
`Dictate.on_level()` also calls `this.on_meter?.(smoothed_level)` — the SAME smoothed
number already written to `--ux-dictate-level`, just also handed to a caller — so the
playground's own bigger, always-visible bar never duplicates the smoothing math, only
mirrors it.

**"Send modes" / `/framework/ux/Dictate/demo/`, investigated, not built.** A task review
said this page exists, titled "Send modes." A repo-wide search found it does — on
`michael/dev`, at `ux/Dictate/demo/page.js`, built on `ext/Chat/Mic.js`'s `ComposerMic`
(`send_mode: "pause"|"sentences"|"manual"`). **`ext/Chat/` does not exist in this
worktree at all**, and this worktree's `Dictate.js` has no `send_mode`, `arm()`, or
`held_timer` for such a page to demonstrate. Not fabricated here: a stub page with no
real mechanism behind it would be worse than the honest gap.

## The word-level diff — LCS, not a library

`word_diff(raw, clean)` tokenizes both strings on whitespace and walks the classic
longest-common-subsequence table back into a list of `{type: "keep"|"strike"|"add",
word}` — the standard `git diff --word-diff` algorithm, about 25 lines. No npm
dependency (CLAUDE.md's own rule): the alternative, a real diff library, was never
considered for something this size.

## The fallback rule pass is deliberately small

The owner's own rule, said twice: "near-verbatim," "I'm a little worried that the
assistant is going to mangle the prompt intent by doing too much correction." The local
fallback (`rule_clean()`, used whenever `/api/tidy` is down or absent) only: collapses
an immediately-doubled word, strips a fixed filler list (um, uh, ah, er, erm, hmm, you
know), and fixes capitalization at the start and after `. ! ?`. It never reorders or
moves a punctuation mark — the sample script's own "what do you think? about the
layout" (the misplaced `?`) is left exactly where it was said by the rule pass on
purpose; relocating punctuation correctly needs real language understanding, which is
exactly what `/api/tidy`'s fast assistant is for once Servex is up. "Like" and "I mean"
are deliberately NOT in the filler list — a real sentence like "I like the layout" or "I
mean what I said" would lose a real word, not a filler, so those two are left for the
assistant, which reads context, to decide.

**Known limits, acceptable for a fallback:** the doubled-word collapse also merges
correct repeats such as "had had" and "that that" — it cannot tell a stutter from a
sentence that really does repeat a word on purpose. It also never capitalises a lone
"i" typed as the pronoun, since the rule pass only capitalises after a sentence boundary,
not by part of speech.

## The paragraph-break gap — wall-clock, not a whisper signal

Whisper's own segment boundary (`Dictate.js`'s `pause_ms`, 700ms) already closes
*every* sentence — using that same number for "this deserves a blank line" would put a
blank line before nearly every chunk. `BIG_GAP_MS` (2500ms) is a second, coarser
threshold: the wall-clock time between when one chunk settles and the next settles.
It's an approximation (whisper/network latency rides along with it), acceptable for a
playground; the Sample button's own script proves the visual behavior exactly with a
`force_gap` flag rather than actually waiting 2.5 real seconds.

## `on_guess(text)` — the one new hook on `Dictate`

`Dictate` already had `on_text(chunk)` for a SETTLED chunk (reused here for the Raw
view's finished lines) but nothing fired for the still-moving GUESS — the grey text
`draw_caption()` paints into `Dictate`'s own caption, never handed to a caller. Added as
a plain optional callback, fired from the three places `partial_text` changes
(`partial_tick()`, `close_segment()` with `""`, `heard_browser()`) — does nothing when
unset, so every existing caller (`ext/Ask/reply.js`, `ai/v/3/compose.js`,
`ai2/compose.js`, `ai/talk/page.js` — checked with a repo-wide grep of every
`from ".../Dictate.js"` import) keeps its current behaviour exactly. Considered
`on_segment(text, gap_ms)` instead (a name the original brief suggested) and rejected
it: `on_text` already IS the settled-chunk hook, and this playground computes its own
gap from wall-clock time regardless (see above), so a second, overlapping "here's a
settled chunk" hook would have been one hook too many.

⚠ **The brief named `ext/Chat/Mic.js` as an existing caller to leave unbroken — it does
not exist in this worktree** (`qf-3`). A repo-wide search found it only on `michael/dev`,
tied to the older `ComposerMic`/`send_mode` design; this worktree's `Dictate.js` has
already superseded it with `ext/Ask`'s newer, whisper-first engine. Not a defect here —
flagging it because the brief was evidently written against a different branch's state
than the one this task actually built against.

## Left for later — the owner's own words

- **A structured final version** (headings, sections) waits on the structured-content
  design — card `2026/09/28/structured-content-icon-cards-outlines-b`, named directly in
  this task's brief.
- **Whisper's own revised-guess history** is not kept — only the LATEST guess is ever
  shown, replaced in place (the parent brief: "I don't think it necessarily needs to be
  useful to look at what whisper decides to change").
- **A real second-pass punctuation move** (the misplaced "?") is left to `/api/tidy`
  once Servex is up — see "the fallback rule pass" above.

## Replaced by `widget()` — round 1's `toolbar()` + routed tabs

The first landing built `Playground.toolbar()` (mic + Sample + audio panel only) called
from two pages, with a link out to a SEPARATE `/playground/` page built from
`ext/tabs` — each tab its own routed child `Page`. A review asked for the WHOLE
playground (mic, audio panel, Raw/Corrections/Live) embedded on the plain Dictate page,
which would have meant embedding that tabs shape TWICE — six routed sub-pages fighting
over the same shared containers. `widget()` (above) replaced it: one unit, all three
panels always built, a tab click only toggles `hidden`.

Round 1's own bug, found and fixed before the replacement: the device `<select>`/label
were fields on the shared `pg` instance (`this.$device_select`), so the SECOND
`toolbar()` call overwrote the field before the FIRST toolbar's own
`enumerateDevices()` promise had resolved, and the on-screen picker never filled in.
Fixed by making every per-toolbar DOM ref local — the same rule `widget()` still
follows today.

# The dictation playground — a full-bleed, live diagram of a dictation session

## Index
[`walkthrough`](./walkthrough/) — the owner's Next / Next tour of the whole pipeline, one real
screenshot and one sentence per step, for a reader who wants to see it work before reading
anything else.

## What

Everything a 🎤 session creates, as real objects you can watch update live
([`objects.js`](objects.js)): press 🎤 (or ▶ **Sample** — a scripted fake session, no mic,
no `whisper-server`), and watch Whisper's raw guess grow word by word, each finished
sentence get cleaned up, and the WHOLE session's shape — every chunk, every resend, the
audio source — redraw itself in the **Structure** panel as it happens
([`inspect()`](/framework/ux/Content/Object/Inspect.js), Part 1 of this same task).

**On a desktop screen (≥1200px) this is a full-bleed page**, Raw/Clean/Analysis/Chat/
Structure always visible side by side — no tab click needed to compare them — with
Chunks/Corrections/Live/Side (the debug detail) in their own row underneath. **On a phone
or a narrow window, it is the same nine panels as nine tabs**, exactly the shape this page
always had — **Clean** is the default:

- **Raw** — Whisper's exact words, a `Chunk` per settled sentence. Never edited here, ever
  — a note above the tabs says so plainly, because Whisper itself sometimes drops a quiet
  "um" on its own and that can look like a bug if nobody says it isn't one.
- **Clean** — the same `Chunk`'s cleaned wording, no strike-through marks: what the real
  composer (`ai2/compose.js`) shows by default now. A line starts raw and is swapped for
  the cleaned wording in place once it answers.
- **Analysis** — a real object with its own icon, but a **stub** — prompt analysis
  (investigation and planning) is a coming phase, not built yet. It exists so the diagram
  has a place for it already.
- **Chat** — a placeholder, on purpose. The real chat thread is
  [Dictate's own widget](/framework/ux/Dictate/#widget--one-compact-widget-the-same-everywhere),
  owned by a sibling task; this page is the diagram built AROUND it, never a second one.
- **Structure** — `inspect(session)`: the whole `Session` — its `Chunk`s, `Resend`s,
  `Source`, `Analysis` — as one nested, clickable card, re-drawn after every settle/guess.
  This is the "visual rendering of the hierarchy" the owner asked for.
- **Chunks (debug)** — every `Resend`, not just the final settled text, one row each: which
  segment, how long since the previous update, and the words that guess returned. A dashed
  divider marks where a segment really closed and why ("pause", "forced" at the 15s cap, or
  "manual").
- **Corrections (debug)** — the strike/add diff between Raw and the picked **level**, permanent.
- **Live (debug)** — the same diff, fading into clean text over a few seconds.
- **Side by side (debug)** — Raw and the revised result in two plain columns, one row per chunk.

The **Level** picker (Clean / Edit / Summary, from [`ux/Revise`](/framework/ux/Revise/))
decides what Clean, Corrections, Live and Side all show — Raw never changes with it.

The exact same widget mounts in three places, all reading and driving the one shared
session (`pg`, `Playground.js`'s own export): this module's own page (the full-bleed
one, its own url), [v1](/framework/ux/Dictate/v1/) (the old frozen Overview), and behind
[`Widget`](/framework/ux/Dictate/)'s own "Debug ▾" toggle, wherever a `Widget` is
mounted with `debug: true`. None of those other two pages are `classes: "full"`, so the
full-bleed grid there is only as wide as their own column lets it be — the full 2D
layout is this page's own.

## Use

Press 🎤 and talk (or press ▶ Sample first, to see it with no mic). On a narrow screen,
switch tabs the same way as always — the url's `#hash` remembers which one, so a reload or
the back button lands on the same tab. `globalThis.$dictate_pg` is the one shared pipeline
instance, for a script or a console to drive directly (`$dictate_pg.run_sample()`), and
`$dictate_pg.current` is the live `Session` the Structure panel is drawing.

## Watch out

- **The Structure panel re-renders the whole tree every time, on purpose** (the simplest
  version that works) — `render_structure()` throws away and rebuilds `inspect(session)`
  from scratch after every `settle()`/`guess()`/`clean_chunk()`. Cheap for a session with a
  few dozen chunks; a session that grows into the hundreds is the point to measure a
  diffing update instead, not before. The audio level meter (`meter()`, ~12 ticks/second)
  deliberately does NOT trigger this — only mirrors the number into `Source.level` — or the
  cost would be real; `Playground.js`'s own comment on `meter()`.
- **`cleaned_so_far`/`last_chunk_at`/`clean_queue` stay on `Playground`, not on `Session`**
  — they are the pipeline's own bookkeeping for the NEXT chunk, not something a reader
  asked to inspect. `Session` owns exactly what deliverable 1 named: `chunks`, `resends`,
  `source`, `analysis`, `partial`. Decision logged in
  [this task's log](/framework/ai/2026-10-01/inspect/minion-part2/).
- **None of `core/Layout`'s 30 approved layouts is an unequal-width row of named panels**
  (four narrow — Raw/Clean/Analysis/Chat — beside one wide Structure) — the grid here is
  explicit tracks instead (`repeat(4, minmax(12em,1fr)) minmax(20em,2fr)`), chosen over
  `auto-fit` because the panel COUNT is fixed and known, never variable — the `layout`
  skill's own rule (`auto-fit` was tried first and wrapped Structure onto an
  unpredictable second row at 1920; a real screenshot caught it). Logged as a C5
  decision rather than invented silently.
- **Cleanup goes through [`ux/Revise`](/framework/ux/Revise/)'s `Revise.run()`** — Servex's
  fast assistant, at the picked level — when it's up; when it isn't (the common case
  until Servex restarts), a small local rule pass takes over: fillers out, a doubled word
  collapsed, capitals fixed. Which one cleaned the CURRENT session is one line above the
  tabs, not repeated per chunk; each diff/side line's own source (level + model + time) is
  in its `title` tooltip. No punctuation is ever MOVED by the rule pass — a misplaced "?"
  stays exactly where it was said. `doc/decisions.md`.
- **Chunks' "time since previous update" is wall-clock time measured in THIS file**, not
  Whisper's own processing time — `ux/Dictate`'s public API doesn't expose that number.
  Said plainly in the row's own tooltip rather than implied.
- **A long pause reads as a paragraph break** (a blank line in every panel) — measured by
  wall-clock time between two settled chunks, not anything whisper itself reports.
  `doc/decisions.md`.
- **The Live tab's fade is one constant**, `FADE_MS` (`Playground.js`, currently 5
  seconds) — change it there, not in the CSS. After it finishes, the struck words are
  also taken out of layout, so the result reads as clean text with no leftover gaps.
- **Tabs are not routed `Page`s.** All three panels are built once and just shown/hidden
  — the mic keeps listening and the transcript keeps its place no matter which tab is
  open, on either widget. `doc/decisions.md` ("Round 2 — one `widget()`...") has the
  routed-tabs shape this replaced, and why.
- **`on_guess(text)`, `on_meter(level)`, and now `revise`/`on_revised`** are optional
  hooks/options on [`Dictate`](/framework/ux/Dictate/) — do nothing unless a caller sets
  them. This playground doesn't use `revise`/`on_revised` itself (it calls `Revise.run()`
  directly, so it can show Raw and revised side by side in the SAME view); see
  `ux/Dictate/readme.md` for the callers that do.

## More

- [Overview](/framework/ux/Dictate/playground/) — press 🎤 or ▶ Sample and watch it work,
  full-bleed on a desktop screen
- [`doc/decisions.md`](/framework/ux/Dictate/playground/doc/decisions.md) — the current
  one-`pg`-many-widgets shape (and the bugs an earlier shape caused, found and fixed), the
  word-diff, what's deliberately not built yet
- [`inspect()`](/framework/ux/Content/Object/Inspect.js) — the recursive card every object
  here renders with; [`ux/Content/Object/`](/framework/ux/Content/Object/) has the pattern
- [`Dictate`](/framework/ux/Dictate/) — the mic itself; `on_guess`/`on_meter`/`on_text`
  are its hooks
- Files: `objects.js` (`Chunk`, `Resend`, `Analysis`, `Source`, `Session` — the real
  classes), `Playground.js` (the pipeline + the widget), `Playground.css` (the full-bleed
  grid lives here), `page.js` (this module's own page — `classes: "full pad"`)

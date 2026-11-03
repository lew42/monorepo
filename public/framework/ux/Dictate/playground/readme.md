# The dictation playground — a full-bleed, live diagram of a dictation session

## Index
[`walkthrough`](./walkthrough/) — the owner's Next / Next tour of the whole pipeline, one real
screenshot and one sentence per step, for a reader who wants to see it work before reading
anything else.

- Moved verbatim to [doc/what.md](./doc/what.md): what the playground is.
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
  [this task's log](/framework/ai/sessions/2026/10/02/bc9e77bd-9e53-4c08-99c7-0346f2f0f5d1/inspect/minion-part2/).
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

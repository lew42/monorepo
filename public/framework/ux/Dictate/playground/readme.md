# The dictation playground — watch a mic session become clean text, live

## Index
[`walkthrough`](./walkthrough/) — the owner's Next / Next tour of the whole pipeline, one real
screenshot and one sentence per step, for a reader who wants to see it work before reading
anything else.

## What

One widget that shows the WHOLE dictation pipeline working, in order: press 🎤, watch
whisper's raw guess grow word by word, watch each finished sentence get cleaned up (a
strike/add diff), and watch that diff dissolve into plain text over a few seconds. Five
tabs show the same session five ways:

- **Raw** — Whisper's exact words. Never edited here, ever — a note above the tabs says
  so plainly, because Whisper itself sometimes drops a quiet "um" on its own and that can
  look like a bug if nobody says it isn't one.
- **Chunks** — every RESEND, not just the final settled text, one row each: which segment,
  how long since the previous update, and the words that guess returned — so you watch
  the guess actually improve instead of only seeing the end result. A dashed divider marks
  where a segment really closed and why ("pause", "forced" at the 15s cap, or "manual").
- **Corrections** — the strike/add diff between Raw and the picked **level**, permanent.
- **Live** — the same diff, fading into clean text over a few seconds.
- **Side by side** — Raw and the revised result in two plain columns, one row per chunk.

The **Level** picker above the tabs (Clean / Edit / Summary, from
[`ux/Revise`](/framework/ux/Revise/)) decides what Corrections, Live and Side show —
Raw never changes with it. A ▶ **Sample** button runs a scripted fake session — no
microphone, no `whisper-server` — so anyone, or a headless test, can see it work with
nothing plugged in.

The exact same widget is embedded in two places, both reading and driving the one
shared session: right at the top of the plain [Dictate](/framework/ux/Dictate/) page
(one click, no navigation at all) and on this module's own page (the same thing, its
own url).

## Use

Press 🎤 and talk (or press ▶ Sample first, to see it with no mic). Switch tabs with
Raw · Corrections · Live — the url's `#hash` remembers which one, so a reload or the
back button lands on the same tab. `globalThis.$dictate_pg` is the one shared pipeline
instance, for a script or a console to drive directly (`$dictate_pg.run_sample()`).

## Watch out

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

- [Overview](/framework/ux/Dictate/playground/) — press 🎤 or ▶ Sample and watch it work
- [`doc/decisions.md`](/framework/ux/Dictate/playground/doc/decisions.md) — the current
  one-`pg`-many-widgets shape (and the bugs an earlier shape caused, found and fixed), the
  word-diff, what's deliberately not built yet
- [`Dictate`](/framework/ux/Dictate/) — the mic itself; `on_guess`/`on_meter`/`on_text`
  are its hooks
- Files: `Playground.js` (the pipeline + the widget), `Playground.css`, `page.js` (this
  module's own page, embedding the same widget)

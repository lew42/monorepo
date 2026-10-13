# playground — what the playground is (moved from the readme)

<!-- moved verbatim from readme.md lines 8-56, 2026-10-12 readme audit -->
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


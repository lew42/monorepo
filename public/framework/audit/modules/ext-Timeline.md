# ext/Timeline

`ext/Timeline` is a well-built, well-isolated CSS-variable timeline view —
121 lines of JS, no dependencies beyond `core/View`, zoom/orientation as a
property write and a class swap, greedy lane packing for parallel work. It
earns its place as a piece of engineering. It does **not** currently earn its
place as a *live* module: nothing on the site renders one. It was wired into
`framework/ai/page.js` for a few hours on 2026-08-14 and was deliberately
replaced the same day by `ext/AITask`'s step/cost card rail — `ai.js`, this
module's own AI-log adapter, has zero callers today. The single most
important thing to do to it: **decide, with Mike, whether `ai.js` gets
re-wired or deleted** — a correct, unreachable adapter is a standing trap for
the next reader, who will otherwise re-derive "wait, does anything call
this?" from scratch. Second most important: a real packing bug in `lay()`
(`Timeline.js:78`) lets a still-running (`to`-less) item's lane be reused by
a later item while the first is still visually open.

## State

| | |
|---|---|
| files | 5 (`Timeline.js`, `Timeline.css`, `ai.js`, `page.js`, `readme.md`) |
| lines of JS / CSS | 338 (121 + 95 + 122) / 132 |
| callers | 1 real: `ext/page.js` (`children:` nav registration only). `ai.js`'s own export, `ai_timeline`, has **0** callers. Historical/documentation-only mentions: `framework/ai/2026-08-14/page.js` (day-log prose, unowned by me), `core/View/readme.md`'s "used by" list. |
| docs before | `readme.md` present and good (three decisions, item shape, phase-2 list) but stale — its "Next" link still implied the ai page uses this Timeline, which stopped being true the same day it was written. `page.js` was a plain `Page` with six sequential `demo()` calls in one `content()` — a wall, not a rail. Zero `doc/*.md` files. |
| docs after | `page.js` → `Doc` (`subject: Timeline`, 7 properties, 6 methods, 1 note, 5 files); readme rewritten with a "Used by" section (the module's real finding), a `doc/phase-2.md` breakout, and a Traps/Open section naming the `lay()` bug and the two-meanings-of-`lane` trap; 19 new `doc/*.md` files (5 file docs, 7 property docs, 6 method docs, 1 note) |

## What I changed

- Rewrote `page.js` as a `Doc`: `subject: Timeline`; the default + zoom demos
  stayed in `content()`, the other four (orientation/reverse, named lanes,
  window band, nested children) moved into two `overview:` rail cards so six
  demo scenarios are browsable rather than one long scroll.
- Wrote all 19 required `.md` files: 5 `doc/file/*.md` (one per module file,
  `readme.md` included), 7 `doc/property/*.md`, 6 `doc/method/*.md`, 1
  `doc/phase-2.md` note.
- Rewrote `readme.md`: kept the three positioning decisions and item shape,
  added the "Used by" section the brief's Step 2 requires (this module's
  headline finding — see State), broke the growing "Phase 2" list out to its
  own note, added Traps (the `lay()` bug, the two `lane`s, no live setters)
  and Open (should `day` skip `lay()` like `window` does) sections matching
  the skill's suggested readme shape.
- Fixed the stale claim in `page.js`'s closing "Next" line, which pointed at
  `/framework/ai/` as if this Timeline still rendered there.
- No `classdoc` references found anywhere in this directory — nothing to
  migrate.
- Verified: `node --check` clean on the rewritten `page.js`; every name in
  `properties:`/`methods:`/`notes:`/`files:` has its `.md` on disk (`ls`
  cross-checked by hand, 19/19); `files:` matches the directory's 5
  non-`doc/` files exactly; `curl` 200 on `page.js`, `readme.md`,
  `doc/phase-2.md`, and the module's own `/` route.

## Recommendations

1. **Real bug: an open item's lane frees at its own start, not "now."**
   `Timeline.js:78` — `ends[lane - names.size] = it.to !== undefined ?
   stamp(it.to) : start;` treats a still-running span (`{ from }`, no `to`)
   the same as a true instant, marking its lane free the instant it begins.
   `item()` (`Timeline.js:90`) correctly renders that same span out to
   `Date.now()`; the packer doesn't match it, so a later item starting
   anywhere after the open span's `from` can be placed in the same lane and
   visually overlap it. Fix: mirror `item()`'s end-time logic, or factor a
   shared `extent(it)` both methods call. **simple, important** — one line,
   and it's the kind of visual bug that only shows up with real,
   still-in-progress data (exactly what `ai.js`'s task bars are).
2. **Decide `ai.js`'s fate.** It's correct, current, and has zero callers —
   built into `framework/ai/page.js`, deliberately replaced the same day by
   `ext/AITask`'s card rail. Either re-wire it somewhere (a Timeline-shaped
   view of the AI log is a legitimate alternate presentation) or delete it;
   leaving it is the "module with no callers is itself a finding" case named
   in the brief, and it will keep costing every future reader of this
   directory the few minutes it cost me to trace. **simple to decide, large
   to redo the wiring if the answer is "bring it back"; important** — not a
   code fix, a product call, not mine to make.
3. **The constructor's `lane` (a number, em-per-lane) and an item's `lane`
   (a string, a named track) share a name and nothing else.** A reader
   skimming `new Timeline({ lane: … })` cannot tell which one they're
   looking at without checking the type. A rename of either — `lane_size`
   on the instance, or `track` on the item — removes the collision for
   good. **simple, important** — pure rename, zero behavior change, and I
   found myself writing "⚠" three separate times across the docs for this
   one collision.
4. **`live()`'s `setInterval` is never cleared** (`Timeline.js:117`) — a
   small per-instance leak on unmount. Harmless today (one `Timeline` per
   page load), but there's no `View`-level unmount hook to clear it against,
   so a real fix is a `core/View` change, out of this module's fences.
   **medium, useful** — worth a line in whatever future pass gives `View` a
   destroy lifecycle.
5. **Outside-the-box: let `Timeline` render its own ruler labels as real
   `<time>` elements with `datetime` attributes**, so a screen reader (or a
   test, or a future "export this view") gets machine-readable timestamps
   instead of a `toLocaleTimeString()` string with nothing backing it. Zero
   visual change, and it would make the whole class usable as more than a
   glanceable picture — right now every timestamp in the rendered DOM is
   presentation-only text. **medium, speculative** — nobody has asked for
   accessibility or data-export on this view yet, but it's a cheap
   insurance policy while the class is still under 150 lines.

## Where this module overlaps others

**`framework/ui/timeline/timeline.js` (`ui.timeline()`) is a different
component, not a duplicate — but the name collision is real and worth
fixing.** `ext/Timeline` positions items on a real, scaled time axis (hours
map to ems, zoom is a literal ruler control, lanes resolve overlap) — it is
a scheduling/Gantt-shaped instrument. `ui.timeline()` is a vertical list of
`[when, what, note]` triples with a dot-and-line connector and **no time
axis at all** — durations, overlap, and scale don't exist for it; it's the
same shape as a changelog or a resume's work history. They share zero code
and solve different problems, so **both should survive**. What shouldn't
survive as-is: both pages are titled "Timeline" (`/framework/ext/Timeline/`
and `/framework/ui/timeline/`), so nav, search, and a reader's mental model
all collide on the same word for two unrelated things. I cross-linked both
readmes and both `page.js` Overview sections to disambiguate ("not to be
confused with…"), but the real fix is a title, since a title collision isn't
something a cross-link fully solves. My call: `ui.timeline()`'s page keeps
its name (it's the older, simpler, more conventional use of the word — most
UI libraries' "Timeline" component is exactly this dot-and-line shape); this
module's page could instead lean on what actually distinguishes it —
something like "Timeline (scheduler)" or renaming the class itself. I didn't
make that call unilaterally; it's a naming decision, not a doc fix, and the
brief's fences keep me from touching `ui/timeline/` at all regardless.

Separately: `ext/Timeline`'s own "Phase 2" list explicitly assigns the
zoom/orientation control surface to `ext/layout` — so this module is itself
evidence for the standing question of whether `ext/layout`, `ext/demo`,
`ext/Panel`, `ext/editor` and `dev/DevBar` are five names for one idea. I
don't have a strong independent view beyond that data point: this module
was designed to lean on `ext/layout` for exactly the control-surface role
the five-block rule assigns it, and never built its own competing toolbar,
which is the right outcome regardless of how that larger question resolves.

## Skill feedback

The skill's biggest gap for this module: **it never says what "browsable,
not a wall" means numerically.** I had a 6-demo `page.js` and had to invent
my own threshold (split anything past ~2-3 demos into `overview:` cards) —
reasonable, I think, but another agent auditing a similar module could
just as easily have left all six in `content()` under a few `h2()`s (which
`core/Sidebar/page.js`, an already-`Doc`-converted module I read for
precedent, does with three demos and no complaint from anyone) or split
every single demo into its own card. A one-line rule of thumb — "more than
three demos in one `content()` is a wall; group by topic into `overview:`
past that" — would remove a real judgment call. Second: the skill's
"Auditing an existing module" checklist step 7 ("Who uses it… document them
in the readme") doesn't say what to do when the honest answer is **nobody,
today, though it did yesterday** — I ended up writing a small design-history
paragraph (when it was wired, when and why it was unwired) that isn't
exactly "who uses it" or "traps" or "open," and had to invent where it
belonged (I put it under "Used by," reasoning that a caller-history is still
about callers). A module that *used to* have a caller and doesn't anymore
is a meaningfully different finding from one that never had one, and the
skill has no vocabulary for it.

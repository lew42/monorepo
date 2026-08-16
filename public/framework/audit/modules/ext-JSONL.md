# ext/JSONL

`JSONL` is a small, sharp module — an append-only `.jsonl` reader that
replays one verb per line back into object state, with `TaskJSONL` wearing
that shape for the task manifest. It earns its place doubly: it's the format
`CLAUDE.md` and the `new-task` skill point at directly, and it's a real
dependency of three other modules, not a demo of itself. It already had a
`page.js`, contrary to the brief's top-suspected finding — the actual gap was
that `page.js` was a plain `Page`, not a `Doc`, so none of its seven methods,
five properties, or the `TaskJSONL` subclass had a browsable page anywhere on
the site. The single most important thing done to it: give `TaskJSONL` (the
class every real caller actually uses) a proper page of its own, since `Doc`
can only take one `subject` and `TaskJSONL`'s own members don't resolve
through the base class.

## State

| | |
|---|---|
| files | 3 (`JSONL.js`, `page.js`, `readme.md`) — no subdirectories, no `ai/` |
| lines of JS / CSS | 162 (82 `JSONL.js` + 80 `page.js`) / 0 — no stylesheet |
| callers | 4 — `ext/AITask/AITask.js`, `ext/AITask/dashboard.js`, `ext/Timeline/ai.js`, `dev/DevBar/ask.js` (all import `TaskJSONL`; no caller imports base `JSONL` directly) |
| docs before | `readme.md` existed and was already well-shaped (conceptual overview + short topic sections + a "Deferred" list) but had no "Traps" or "Who uses it" section; `page.js` was a plain `Page` with three stacked `demo()` calls (a wall, not a rail); zero `doc/*.md` files anywhere |
| docs after | `readme.md` tightened, `agent`/`chat`/progress sections consolidated into one linked paragraph, "Traps" and "Who uses it" added; `page.js` rewritten as `new Doc({...})`, `subject: JSONL`, 5 properties + 7 methods + 1 note; 13 `doc/property|method/*.md` + 1 `doc/task-jsonl.md` (new) + 3 `doc/file/*.md` (new) = 17 new files |

## What I changed

- `readme.md` — same claims, reorganized: the `agent`/`chat`/`steps`-`step`
  sections became one "`TaskJSONL` — the task manifest as a log" paragraph
  linking to the new note; added "Traps" (the `load()` SPA-fallback silent
  failure, previously only a code comment) and "Who uses it" (all 4 real
  callers, with urls).
- `page.js` — rewritten as `new Doc({...})`. `subject: JSONL` (not
  `TaskJSONL` — `Doc.member()` only reads a subject's *own* prototype, so
  `TaskJSONL` as subject would show "no member" for every inherited method).
  The original three stacked demos became: the base replay demo inline in
  `content()`, and the `TaskJSONL`-merge and live-fetch demos as two Overview
  rail cards (**TaskJSONL**, **Live**) instead of a scroll-past wall.
- `doc/task-jsonl.md` (new) — the note that gives `TaskJSONL` a real page:
  why it's a subclass, `agent`'s merge-by-task, `chat`'s append, the
  `steps`/`step` progress pair, and the trap where a subclass that adds a
  verb must restate `static verbs` in full or `apply()` silently routes it
  to `skip()`.
- `doc/property/{verbs,logs,actions,skipped,loaded}.md`,
  `doc/method/{parse,load,read,apply,log,action,skip}.md` (new, 12 files) —
  one per member in `page.js`'s lists.
- `doc/file/{JSONL.js,page.js,readme.md}.md` (new, 3 files) — one per file
  in the module, each ending in a ranked Improvements list.
- `public/framework/audit/modules/ext-JSONL.md` — this file.

No `.css` in this module, no `.js` touched beyond `page.js`, no behavior
changed — every finding below is a recommendation, not an edit.

## Recommendations

1. **A four-line `json = url => fetch(url).then(...).catch(() => null)` SPA-fallback
   guard is duplicated near-verbatim in `dev/DevBar/ask.js`, `ext/Timeline/ai.js`,
   and `ext/AITask/dashboard.js`** — `JSONL.load()` already centralizes this
   exact guard for anyone using the class; three of its four real callers
   still hand-roll it for plain JSON fetches next to their `TaskJSONL` calls.
   **medium, useful** — not a fix inside this module's fences (three other
   files), but worth a shared `util/` helper the next time one of them is
   touched.
2. **No demo shows the tolerant-parsing behavior** — both `readme.md` and
   `JSONL.js`'s own header comment claim "a torn line or an unknown verb
   loses that line, never the log," and no demo on the page proves it. One
   more line in the base demo's input text (a deliberately malformed line)
   would close the gap between claim and demonstration. **simple, important.**
3. **`TaskJSONL` has no page of its own beyond a note.** The note is a real
   fix for the `subject`-can-only-be-one-class limit, but it means
   `TaskJSONL.agent`/`.chat` show as prose with an inline code block, not a
   real member page with `Doc`'s source-plus-overrides treatment every
   `JSONL` method gets. **medium, useful** — the honest fix is a `Doc`
   feature (a secondary `subject` for API entries scoped to one note or
   section), which is a proposal for `ext/doc`, not something this module's
   fences allow.
4. **Outside-the-box: `JSONL` could be the log format for far more than AI
   tasks** — anything append-only and small (a form's edit history, a
   `Draggable` reorder trail, a build/deploy log) is the same shape: one verb
   per line, tolerant reads, `assign` for the current-state snapshot. Nothing
   about `JSONL.js` is task-specific; only `TaskJSONL` is. **large,
   speculative** — no second caller exists yet, and a second concrete use is
   worth more than the idea alone.

## Where this module overlaps others

None of the suspected five (`Editor`/`Panel`/`ext/layout`/`DevBar`/`ext/demo`)
— `JSONL` is a data format, not a UI surface, and it sits *underneath* three
of those five rather than beside them. The real overlap is narrower: **the
SPA-fallback JSON-fetch guard** appears independently in this module and in
three of its callers (see Recommendation 1) — four implementations of the
same five-line idea is the kind of duplication this module's own existence
argues against (`JSONL` exists so replay logic has exactly one home; the
fetch guard around it doesn't have one yet).

## Skill feedback

The skill was easy to follow for a module this size and shape; one real gap:

- **No guidance for a module with two classes where only one can be `subject`.**
  `ext/doc/readme.md`'s own "Decisions" section documents that `subject` is
  singular and explains *why* (only a real class gets Overrides, `member()`
  needs one prototype to search), but neither `ext/doc`'s docs nor the
  `documentation` skill says what to do when a module genuinely has two
  classes worth documenting and one extends the other. I worked out the
  answer by testing `Doc.member()`'s lookup by hand (own-properties-only,
  doesn't walk the prototype chain) rather than finding it written anywhere —
  worth one sentence in the skill: *"a subclass with its own members gets a
  `notes:` entry, not a second `subject`."* That single line would have saved
  the detour into `ext/doc/Doc.js` and `util/source/source.js` to confirm it
  by reading the lookup code.

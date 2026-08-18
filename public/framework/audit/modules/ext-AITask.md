# ext/AITask

`AITask` is the busiest small module in the framework: it renders every task
in the AI working log — hundreds of pages across nine days — through one
class and nine helper files, and it is imported by the board, both curated
day pages, three curated task pages, and a live derivation demo. It earns its
place many times over; there is no "no callers" finding here. Docs before
this pass were genuinely good (a maintained readme, an accurate wave log) but
incomplete in the specific way the `documentation` skill exists to catch: a
plain-`Page` `page.js` with zero `doc/*.md` files anywhere, so none of
`AITask`'s twelve methods had a browsable page and the readme itself ran to
186 lines — more than three screens. The single most important thing done
here: turn `page.js` into a real `Doc` and split the readme's four
over-length sections out to linked notes, so the module's own extension
contract (`report()`'s six named override points) is finally something a
reader can click through instead of grep for.

## State

| | |
|---|---|
| files | 15 (`AITask.js`, `ai.css`, `card.js`, `compose.js`, `dashboard.js`, `effort.js`, `feed.css`, `feed.js`, `message.js`, `page.js`, `prompt.js`, `readme.md`, `replay.js`, `stats.js`, `usage.js`) + `doc/waves.md` (history, pre-existing) |
| lines of JS / CSS | 1105 / 209 — `AITask.js` (148), `stats.js` (142), `dashboard.js` (133), `feed.js` (124) and `replay.js` (120) are all over the module's own "most files under 100 lines" guideline; so is `ai.css` (194) |
| callers | 9 real importers — `/app.js` (re-export), `framework/ai/page.js`, `framework/ai/2026-08-13/page.js`, `framework/ai/2026-08-14/page.js` (`dashboard`/`glance`/`AITask` fallback), `manifest-vs-log/page.js` (`stats.js` derivations, live), `panel/page.js`, `sessions/page.js`, `editor-panel-review/page.js` (`new AITask({ extra(){...} })`). Every day without its own `page.js` (`2026-08-08`…`2026-08-12`, `2026-08-15`) is *also* served entirely through this module via the two-tier `route()` fallback. `task-previews/page.js` cites the `card()` bridge in prose without importing it. |
| docs before | `readme.md` existed, well-shaped but long (186 lines, four sections over two paragraphs each); `page.js` was a plain `Page` with one `content()` and no member pages; zero `doc/*.md` beyond the pre-existing `doc/waves.md` history log |
| docs after | `readme.md` cut to ~155 lines with four sections broken out; `page.js` rewritten as `new Doc({...})` — `subject: AITask`, 1 property, 12 methods, 6 notes, 15 files, a 3-card Overview rail; 34 new `doc/*.md` files (5 breakout notes + 12 method + 1 property + 15 file + 1 audit report) |

## What I changed

- `readme.md` — rewritten. The intro/table/state/progress sections stayed
  inline (short); "The manifest", "Starting work from the board", "Pace, not
  percentage", and "The template, and its override" each broke out to
  `doc/*.md`, summarized to one paragraph, linked, and added to `notes:`.
  Added a **"Who uses this"** section (Step 2's deliverable) and folded the
  scattered "Bites" list into a **"Traps"** heading matching the skill's
  vocabulary. Added an **Open** item naming exactly what the
  `framework/ai/<date>/<slug>` → `<page>/ai/<slug>` move costs this module
  today (see below).
- `page.js` — rewritten as `new Doc({...})`. Three inline `overview:` cards
  (Task card, Usage pace, Step checklist) replace the old page's plain prose
  + one code block + three bare links — each card now runs the module's own
  render functions (`manifest_card`, `usage_rail`, `segments`+`progress`)
  through `demo()` on synthetic data, per CLAUDE.md's "one demo system, five
  blocks" rule, rather than a bespoke preview mechanism.
- `doc/manifest.md`, `doc/effort.md`, `doc/starting-work.md`, `doc/pace.md`,
  `doc/template.md` (new) — the four readme breakouts plus `effort` (borderline
  length, broken out for the same reason: it carries the `group` redefinition
  decision and deserved its own url).
- `doc/method/{content,session,legacy,base,requirements,report,head,checklist,extra,figures,chat,log}.md`
  (new, 12 files) — one per `AITask` method, all 12 the class actually has.
- `doc/property/src.md` (new) — the one ad hoc instance property
  (`this.src`) the class reads but never declares.
- `doc/file/*.md` (new, 15 files) — one per file in the module including
  `readme.md.md`, each ending in a ranked Improvements list.
- `public/framework/audit/modules/ext-AITask.md` — this file.

No `.css` touched, no `.js` touched beyond `page.js`, no behavior changed —
every finding below is a recommendation, not an edit. I did not touch
`doc/waves.md` (already accurate, already in-fences) beyond adding it to
`notes:`.

### The `<page>/ai/` move, and what it costs this module today

CLAUDE.md records the move as half-landed. Concretely, as of the `devbar-ai`
task (2026-08-15, same day as this audit): **reading** already works
anywhere — `AITask.chat()`'s `task` path and `Server/plugins/Ask.js`'s
`thread_dir()` fence both accept any `public/**/ai/<slug>`, not just
`framework/ai/…`. **Writing a new task does not** —
`Server/plugins/Start.js`'s `scaffold()` hardcodes `public/framework/ai` as
its root, so the compose box on `/framework/ai/` can only ever open a task
under a date, never beside the page it's actually about. On top of that,
every enumerator in this module — `dashboard.js`'s `tasks()`/`all_tasks()`,
`card.js`'s `day_of()` — assumes the fixed two-level shape
`ai/<date>/<slug>/`. A real `<page>/ai/` route would need a generalized
directory walk in at least three places here, not a config flag.

## Recommendations

1. **`AITask.session()` probes `task.jsonl` blind, logging one console 404
   for every legacy `session.json` task.** `dashboard.js` avoids the exact
   same call by checking the directory listing first (`manifest(base,
   files)`); the detail page (`AITask.js:44-47`) has no listing to check
   against, but could still try `session.json` first when `task.jsonl` 404s
   rather than the reverse, or accept a `files` hint the way `dashboard.js`
   already does. **simple, useful** — cosmetic (a console warning, not a
   user-visible bug) but it fires on a majority of pre-2026-08-14 tasks.
2. **The SPA-fallback content-type guard is duplicated four times** —
   `AITask.js`'s `legacy()`/`requirements()`, `dashboard.js`'s `json()`,
   `feed.js`'s `load()`, `replay.js`'s `load()` — each independently
   reimplementing `!res?.ok || headers.get("content-type")?.includes("html")`.
   A shared one-line helper (`util/`, or `ext/JSONL` itself, which already
   solves this for its own fetches) would remove ~16 duplicated lines and one
   more place a future edit could get the guard subtly wrong. **simple,
   important.**
3. **`replay.js`'s `load()`/`turns()`/`is_prompt()` are not exported, so
   `feed.js` carries ~15 lines of the same grouping logic**, tuned for
   incremental `ingest()` instead of one-shot rendering. Recorded as Open by
   the module's own readme already; still true, and now the second-most
   duplicated piece of logic in the module after #2. **medium, important —
   deferred by design until a genuine third caller shows up**, which the
   readme is honest about.
4. **Five files exceed the module's own 100-line guideline**
   (`AITask.js` 148, `stats.js` 142, `dashboard.js` 133, `feed.js` 124,
   `replay.js` 120) — none egregiously, and each is doing one coherent job
   (one class, one derivations file, one enumerator, two transcript
   renderers), so splitting any of them risks scattering a job that currently
   reads start-to-finish in one file. Worth a look only if one grows again.
   **medium, useful.**
5. **Outside-the-box: the compose box and the `chat()` panel are two
   separate ways to start work on a task from the browser, and they don't
   know about each other.** `compose.js` spawns a real `claude -p` process
   and returns a link; `AITask.chat()` forks the task's own session for one
   headless turn. A single "talk to this task" affordance that could *either*
   ask a quick question (today's chat) *or* hand off a real multi-step ask
   (today's compose, minus the separate board-only UI) would remove one of
   the two entry points rather than growing a third. **large, speculative** —
   real design work, and the two currently serve genuinely different
   durations of task (a turn vs. an hour), so collapsing them may be the
   wrong call; recorded because it's the first thing that jumped out
   comparing `compose.js` and `AITask.chat()` side by side.

## Where this module overlaps others

**`ext/AITask` and `ext/JSONL` are the tightest pair in the framework** —
`AITask` is essentially `TaskJSONL`'s *renderer*, and the manifest schema
this module's readme documents (`doc/manifest.md`, new) is the same object
`ext/JSONL`'s readme documents from the writing side. They're correctly two
modules (one is a data format usable anywhere, one is a UI over one specific
use of it — `ext/JSONL`'s own audit makes the same "could be more than AI
tasks" point) but a reader landing on either module's manifest schema section
has no link to the other's. Worth one cross-link each way, not a merge.

Of the five suspected shared identity (`Editor`/`Panel`/`ext/layout`/
`DevBar`/`ext/demo`): **`AITask` is closest to `DevBar`**, specifically
`dev/DevBar/ask.js` from the `devbar-ai` task — both now render task threads
and chat panels, `DevBar`'s scoped to "this page" via the same
`<page>/ai/<slug>/task.jsonl` shape this module reads. They aren't the same
thing yet (one is a persistent site-wide archive browser, one is a
per-page rail widget), but they're converging on one manifest format and one
`chat()`-shaped panel from two different UI containers — the `<page>/ai/`
work CLAUDE.md flags as half-landed is exactly the seam where these two
either formally share a renderer or grow apart on purpose. Not `ext/demo`,
`ext/layout`, or `Panel` — none of those touch the manifest format or a
task's lifecycle at all.

## Skill feedback

- **The Files-tab convention (`about` hook fetching `doc/file/<path>.md`)
  works well, but the skill never says what "one for EVERY file" means for a
  file this deep in subdirectory structure** — I had to infer from
  `ext/Doc/readme.md`'s own line ("mirror the module's tree") rather than
  from the `documentation` skill itself, which only shows a flat example
  (`overview/urls/page.js` → `doc/file/overview/urls/page.js.md` — that
  example *is* nested, but the skill's own prose doesn't call out the mirror
  rule explicitly; it's implied by the one example rather than stated). One
  sentence — *"the path under `doc/file/` mirrors the file's path in the
  module, subdirectories included"* — would remove the inference step.
- **No guidance on when a readme's aspect section is "short enough to stay
  inline" versus "over two paragraphs, must break out."** The rule as
  written ("any section over two paragraphs") is precise for prose, but this
  module's sections mix a paragraph, a fenced code block, and a table — does
  a schema table count as a paragraph for this test? I treated a code/table
  block as not counting toward the two-paragraph limit on its own (judging by
  *reading time*, not literal paragraph count), which is probably the right
  call but is a judgment the skill leaves entirely to the agent. Worth
  naming explicitly, since two agents auditing the same file could reach
  opposite splits and both defend it as "following the rule."
- **The six-artifact list doesn't mention what happens to a pre-existing
  `doc/*.md` that was never a `notes:` entry** (this module's `doc/waves.md`
  existed before this pass and wasn't wired into `page.js` at all). The audit
  checklist's step "every name in every list has its `.md`" checks the
  forward direction only; nothing prompts checking the *reverse* — a `.md`
  on disk with no entry in any list, which is a page that exists but isn't
  browsable from anywhere. I found it only because Step 1 said read
  everything in the directory, not because any checklist step named this
  failure mode.

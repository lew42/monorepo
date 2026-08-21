# core/Page

**`Page` is the single most load-bearing class in the framework — a url, some
content, and children, with no `Pager` subclass tier — and it earns its place as
decisively as a module can: ~160 real pages construct one, its readme is a
maintained decision log spanning a dozen reversals, and every method, property
and note already had accurate prose before this pass touched it.** The one real
gap was structural, not narrative: **the Files tab did not exist** — no `files:`
key in `page.js`, no `doc/file/*.md` for any of the 70 files — so this pass added
it, then found and fixed several docs that had gone stale in the opposite
direction: quietly wrong rather than missing, including a doc claiming a widely-
declared property is dead when the source already reads it, and a caller count
that hadn't been updated since the code it described was simplified.

## State

| | |
|---|---|
| files | 70 before this pass, 94 after (+24 `doc/file/*.md`) |
| lines of JS / CSS | 1387 / 235 |
| callers | ~160 `page.js` files via `import { Page } from "/app.js"` (the overwhelming majority); a dozen direct `Page.class.js` importers (`core/App/App.js`, `ext/Doc/Doc.js` — `class Doc extends Page` — `ext/AITask/AITask.js`, `ext/catalog`, `ext/demo/{app,demo,sample}.js`, `ext/tabs`, `styles/page.js`, `versus/page.js`, sandbox subclasses). Full table in `readme.md`'s new "Who uses this" section. |
| docs before | `readme.md` (238 lines, Decisions/Traps/Proposed/Open, three already-broken-out `doc/*.md` notes); `page.js` already a `Doc` (not `classdoc`) with `properties`/`methods`/`notes`/`overview`/`children` all present and — checked against the live class — **100% accurate**: all 26 methods, 17 properties, 3 notes, 5 declared children and 14 overview demos had a `.md`/directory on disk, no orphans, no gaps. **Zero `doc/file/*.md`, no `files:` key.** |
| docs after | added `files:` (24 entries) + 24 `doc/file/*.md`; fixed one factually-wrong property doc and 9 files' worth of stale `file:line` citations (2 of which named a caller relationship that no longer exists, not just a wrong line number); added "Who uses this" to `readme.md` |

## What I changed

- `page.js` — added `files:` listing all 24 non-`doc/` files.
- 24 new `doc/file/*.md` — one per file, each with a ranked Improvements section.
- `readme.md` — added "Who uses this" (Step 2's usage search), between the intro
  and Decisions.
- `doc/property/description.md` — **rewritten**. It said *"`Page` itself never
  reads it… nothing at all happens"* and offered three unapplied options (render
  it / carry it / delete it). `Page.class.js:194` (`nav()`) and `:250`
  (`preview_card()`) already read and render it, clamped, on any card with no
  thumb — and the module's own `readme.md` Decisions section already records this
  was resolved in Aug 2026. The property doc had simply never been told.
- `doc/method/log_label.md` — corrected. Claimed *"eight call sites… plus
  `framework/core/Router/Router.js:97`"*; the live `Router.js` calls it **zero**
  times (verified by reading the whole file — every other "8 call sites" hit a
  grep turns up lives in the dead `core/new/0`/`core/new/1`/`core/new/starter`
  sketch tiers). The real count is three, all in `Page.class.js`, matching what
  `core/App/doc/method/log_label.md` already says from the other side.
- `doc/method/previews.md` — removed `framework/page.js:44` from the caller
  list. That page moved to `walls()` when the site landing was rebuilt (recorded
  in this module's own `readme.md`), and the previews doc was never updated to
  match — a caller list, not just a line number, had gone stale.
- `doc/method/child.md` — `Router.walk()` doesn't exist in the live `Router.js`;
  the method is `load_segments()`. Fixed the name and the line.
- `doc/method/{chain,activate,deactivate}.md`, `doc/property/{loading,app}.md`,
  `doc/method/render.md`, `doc/method/nav_for.md`, `doc/property/label.md`,
  `doc/labels.md` — fixed `file:line` citations into `Router.js`, `tabs.js` and
  `framework/page.js` that had drifted 5–19 lines (confirmed against the live
  files, not guessed), and updated one quoted code snippet
  (`{ ...this.nav_for(name), label: "Overview" }`) to the shape `framework/page.js`
  actually uses now (`const entry = this.nav_for(name); { ...entry, … }`).
- Verified: `node --check` clean on `page.js`; `curl` on `page.js` returns 200;
  every `methods`/`properties`/`notes`/`children`/`overview`/`files` name has its
  `.md` or directory; `files:` matches the directory exactly, minus `doc/`; no
  `classdoc` references anywhere in the module.

## Recommendations

1. **The citation drift is systemic, and I only fixed what I happened to
   verify.** I cross-checked ~13 external `file:line` citations against live
   files (`Router.js`, `tabs.js`, `framework/page.js`) and 9 of them were wrong —
   a ~70% hit rate on a sample I picked semi-randomly while reading. Roughly 30
   more citations in this module's `doc/method/*.md`/`doc/property/*.md` point
   into `App.js`, `ext/Doc/Doc.js`, sandbox pages and others I did not re-verify.
   **The claim: this is not a handful of typos, it's a maintenance model that
   doesn't hold up** — a citation is prose, not a check, and nothing re-runs it
   when the cited file changes. *(medium, important — a script that greps every
   `` `path:N` `` pattern out of a module's `doc/` tree and confirms the line
   still contains plausible content would catch most of this cheaply; full
   verification of everything I didn't get to would be `large`.)*
2. **Files docs (this pass) are new and unvalidated by a second reader.** Being
   the first pass to write 24 of them for a 70-file module in one session is
   itself a risk: I did not get independent review the way a method doc that's
   survived several audit rounds has. *(simple, useful — flag for whoever reads
   this next to spot-check a handful against the actual files.)*
3. **`readme.md` is 260 lines after this pass, well past "most files under 100
   lines."** The "Proposed" section (4 numbered audit findings) and the
   "Decisions" section are two different registers wearing one heading level —
   Proposed reads like a second document nested inside the readme. Moving
   Proposed's content into this audit file (where 3 of its 4 items already
   overlap with my own Recommendations) would leave `readme.md` as a pure
   decision log. *(medium, useful — not applied; restructuring a readme beyond
   what Step 3 asks for is a design call for the owner, not mine to make unasked.)*
4. **Outside-the-box: publish the file:line citation problem as a lint, not a
   habit.** Every module in this codebase writes `` `Page.class.js:194` `` style
   citations by hand, and every one of them starts rotting the moment the cited
   line moves. A tiny build-time (or CI, or a `node` script run manually before
   a release) check — "does `doc/**/*.md` in this module cite a line that still
   contains a term from the sentence around the citation" — would not need to be
   perfect to be worth having; it would need to catch the `log_label.md` case
   (a citation to a call site that no longer exists at all), which is the
   expensive kind of wrong. *(medium, speculative — genuinely outside this
   audit's fence, and untested as an idea.)*

No behavioral bug found in `Page.class.js` or `Page.css` themselves — the module's
own `readme.md` Proposed/Open sections already carry the live list of real
findings (`mounts_in()`'s console-log-only body, the `View.parent`/`Page.parent`
collision, `nav_for(name)` taking a name rather than a page), and I have nothing
to add to that list that wasn't already there.

## Where this module overlaps others

**Not with Editor, Panel, ext/layout or DevBar** — those arrange widgets and
panes inside a page; `Page`'s own arrangement methods arrange **children as
pages**, at real urls. Different concern, no shared code, no confusion once you
read both.

**The real overlap is internal, and it's already been found and organized.**
`previews()` (a wall), `walls()` (a ladder of walls), `catalog()` (a persistent
rail + region, `ext/catalog`), `tabs()` (a bar + panel, `ext/tabs`), and
`Sidebar` (a whole nav component, `core/Sidebar`) are five different renderings
of the same underlying fact — *here are my children, and here is where you are*
— and `core/Page/old/nav/page.js` already has the comparison table naming exactly
this ("which one to reach for") rather than pretending they're five unrelated
features. `ext/Doc`'s `Doc extends Page` doesn't add a sixth: its Overview is a
`catalog()` and its API/Docs sections are `tabs().ac("vertical")`, so the class
this whole documentation system runs on is itself proof the five compose rather
than sprawl. The one genuinely open seam: `Sidebar.link()` and `Page.link()`
render a similar row from parallel code, kept separate on purpose after a mixed-
class row broke once (`Sidebar`'s own audit names this too) — not a bug, but the
one place a third person building a fourth "row with icon + label" component
should look at both before adding one.

## Skill feedback

**The skill has no guidance for a module that already passes the checklist.**
Every step in "Auditing an existing module" assumes gaps to close. When the real
finding — after reading all 70 files — was "the readme, the notes and all 43
member docs are already accurate; only the Files tab is structurally missing,"
the skill gave no signal for how much new prose to add versus how much restraint
to exercise. I erred toward small, verified, cited fixes over rewriting anything
that already worked; a line like *"a module that already passes steps 1–7 needs
verification and the Files tab, not more prose"* would have saved real
second-guessing, and I'd have spent more of the budget on step 7's cross-file
citation check instead.

**Second, sharper:** "`doc/file/<path>.md` — one for EVERY file... never for
`doc/` or `ai/`" does not say whether **`readme.md` itself** gets one. I inferred
yes, on the grounds that `ext/Doc`'s own module (the reference implementation)
has `doc/file/readme.md.md`, and wrote one. A sibling audit running on
`core/Sidebar` in parallel read the same sentence, inferred **no**, and said so
explicitly in its own skill feedback — two agents, same rule, opposite answers,
both defensible. That is a real ambiguity, not a comprehension failure on either
side, and it should be spelled out one way in the skill text rather than left for
the next agent to guess and the one after that to notice the site now has both.

# ext/layout

`ext/layout` is a toolbar-over-anything plus a push drawer: point at a box, get a
bar of utility-class controls; click, get the full drawer with the source line
you'd paste into a page. It earns its place — it is the live authoring surface
for the whole utility-class vocabulary the site is built from, and three other
modules (`ext/editor`, `ext/Panel`, `styles/sections`) build directly on its
`controls.js` primitives rather than reinventing them. The single most important
thing to do to it: nothing structural — the module is small, coherent and
already reused correctly. The readme was the actual problem, and this pass fixed
it: one continuous ~170-line Decisions section, covering nine unrelated design
questions, is now three linked breakouts plus a one-screen summary.

## State

| | |
|---|---|
| files | 8 (`layout.js`, `panel.js`, `body.js`, `words.js`, `controls.js`, `layout.css`, `page.js`, `readme.md`) |
| lines of JS / CSS | 367 implementation + 103 doc page (page.js) / 141 |
| callers | 7 framework-proper: `web/layout/flex,grid,flow` (guide pages), `styles/layouts/word.js`, `styles/sections/tone.js`, `ext/Panel/workspace.js`, `ext/editor/page.js` — plus 6 historical prototypes under `ai/2026-08-08`, `ai/2026-08-12/apps/*`, `ai/2026-08-14/editor-panel-review` that predate the current shape |
| docs before | `readme.md` existed, thorough but one unbroken ~170-line Decisions section; `page.js` was a plain `Page`, no `subject`/`methods`/`properties`/`notes`/`files`; **0** `doc/*.md` files |
| docs after | `page.js` rebuilt as `new Doc({ subject: layout, methods: "bar context", properties: "words", notes: "vocabulary drawer selection controls", files: … })`; `readme.md` cut to one screen with three linked breakouts + a new "Who uses this" table; **16** new `doc/*.md` (4 notes, 2 method, 1 property, 8 file) |

## What I changed

- `page.js` → `Doc`, `subject: layout`. Existing four-demo Overview kept verbatim
  (it already reads as a tutorial, not a wall) with two lines added: the
  unregistered-word trap, and pointers into the new API/Docs tabs.
- `readme.md` restructured: conceptual overview unchanged, four short new
  sections (vocabulary, drawer, selectable, `controls.js`) each linking to a
  breakout, a **Who uses this** table (Step 2's usage search), Decisions reduced
  to three one-line pointers, Traps and Open kept verbatim (already terse).
- `doc/vocabulary.md`, `doc/drawer.md`, `doc/selection.md`, `doc/controls.md` —
  the readme's former Decisions content, regrouped by topic rather than by the
  order it was written in.
- `doc/method/bar.md`, `doc/method/context.md`, `doc/property/words.md` — the
  API tab's three member pages.
- `doc/file/*.md` × 8 — one per file, each ending in a ranked improvements list.
- Verified: every list in `page.js` has its `.md` on disk (`ls` diff, exact
  match); `node --check` on a copy of `page.js` passes; `page.js`, `readme.md`
  and two `doc/*.md` all return `200` from the running dev server.

## Recommendations

1. **The bar's and panel's word lists can silently drift apart.** `words.js`
   exports `BOX`/`PAGE` (what a bar defaults to); `body.js` has its own,
   independent `CHIPS`/`ITEM` constants (what the panel offers per mode). They
   agree today only because someone edited both by hand each time; nothing
   would catch a future word added to one and not the other. Fix: a one-line
   dev-mode assertion that every name in `BOX`/`PAGE` resolves in `words`, plus
   a comment in each file pointing at its counterpart. `words.js`:12-13,
   `body.js`:9-13. *(simple, important)*
2. **An unregistered word or an unresolvable target fails with total silence.**
   "Half a bar beats no bar" (`words.js`'s `draw()`) is the right default
   behaviour, but there is currently zero signal anywhere — not even a
   `console.warn` — when a bar renders short. This is the single
   most-repeated trap across the module's own docs (flagged independently for
   `words.js`, `controls.js`, `layout.js`, and the doc page itself), which is
   itself evidence it costs real debugging time. One `console.warn` in
   `draw()` for a missing word, and one in `view_of()` for an unresolvable
   target, would remove a whole class of "why didn't my knob show up"
   sessions at near-zero cost. `words.js`:38, `layout.js`:51-53. *(simple,
   important)*
3. **`layout.context()` registrations accumulate, never replace** (`panel.js`:19,
   `contexts.set(el, [...(contexts.get(el) || []), fn])`). Not a confirmed live
   bug — every current call site registers once per page visit, and `Page`
   caches `content()` so it doesn't re-run — but it is a latent one: nothing in
   the contract stops a future redraw pattern from calling `layout.context()`
   twice on the same live element and silently doubling a chip group in the
   drawer. A `Set`, or a dedupe-by-identity filter, removes the possibility for
   one line. *(simple, useful)*
4. **Selection does not nest through the bar.** Documented already as Open in
   the readme: a nested box's own words are reachable from the panel (click it)
   but not from a bar (there is only ever one, over the outermost region). A
   second, smaller bar per selected nested box was explicitly not built; worth
   revisiting only if a real editing session needs it — the panel already
   covers the same ground at one more click. *(medium, useful)*
5. **Outside-the-box: the push-drawer mechanism is duplicated, not shared.**
   `ext/layout`'s drawer and `dev/DevBar`'s rail independently arrived at the
   identical trap (reserve space in `rem` against the shell's font-size, never
   `em`, self-limiting so a narrow window degrades to covering instead of
   pushing) and now `framework.css` manually sums `--drawer + --devbar`. A
   tiny shared primitive — `dock(el, { edge: "inline-end", token, width })`
   that both this module and `DevBar` call, writing the same custom property
   convention — would turn "two modules that happened to agree" into one
   pattern a third dockable rail could just reuse. Speculative because it's a
   cross-module refactor outside this audit's fences, and the current
   duplication is small (a few lines each) and well-documented in both
   readmes. *(large, speculative)*

No behaviour was changed and no live bug was found — the module's failure modes
are all silent-degradation-by-design (a missing word, an unresolved target),
never a crash, which is a deliberate and consistently-applied choice, not an
oversight.

## Where this module overlaps others

All four — `ext/layout`, `ext/Panel`, `dev/DevBar`, `ext/editor`'s properties
region — are "a panel of controls beside a thing," but they are not the same
thing wearing four names; they sit at three different altitudes, and two of them
already build on the third rather than duplicating it:

- **`ext/layout` is the general one, at the *element* level.** It answers "what
  utility words does this live DOM node wear, and how do I change them" for any
  box, anywhere. Its real API is smaller than the widget suggests: `words.js` +
  `controls.js` are a standalone control-vocabulary library (`pick`, `menu`,
  `toggle`, `knob`, `chips`, `btn`), and `layout.js` + `panel.js` + `body.js` are
  *one product* built from it — the floating bar and the selection-driven push
  drawer. That split is already load-bearing: `ext/editor`'s properties region
  imports `layout.words` and `chips`/`btn` **directly**, building its own
  properties UI rather than opening `layout`'s bar over a canvas node, and
  `ext/Panel`'s alignment popover is `pick()` "unmodified, and the code is the
  data" (its own readme's words).
- **`ext/Panel` is a different job — a persisted *structural* tree** (splits,
  panes, what template each leaf holds), one level up from any single element.
  It does not compete with `ext/layout`; it **hosts** it: `layout.bar($body)`
  is attached per leaf, as that leaf's own content-editing convenience, and
  Panel's own bar (split, close, alignment, tone, hug) is a second, unrelated
  vocabulary for the *panel itself*, never expressed through `layout.words`.
- **`dev/DevBar` is genuinely its own thing** — a fixed, global rail of named
  dev tools (settings, AI threads, socket status), with no target element and
  no selection at all. It overlaps `ext/layout` at exactly one point, the
  mechanism (both dock a rail at the shell's inline-end edge and push `.app`
  over), and nowhere else conceptually.

**What the unified version would be:** not a merged control-panel class — a
selection-driven CSS-class editor, a persisted layout tree, and a fixed dev
toolbar are three genuinely different data models, and forcing them through one
config object would cost more surface than the four-namespace status quo. The
one real unification left on the table is the narrow mechanical one in
Recommendation 5 above: the docked-rail-that-pushes-the-shell pattern, which
`ext/layout` and `DevBar` have now each implemented once, correctly, and
identically — a small shared primitive would make that agreement enforced
rather than coincidental.

## Skill feedback

- **`files:` and `readme.md` — the skill's own worked example disagrees with its
  own reference implementation.** The skill's `page.js` template
  (`## 1. page.js`) shows `files: "View.js View.css page.js"` — no `readme.md`.
  But `ext/Doc`'s *own* `page.js` (the thing the skill tells you to read in Step
  0) lists `files: "Doc.js Doc.css page.js readme.md overview/urls/page.js"` —
  `readme.md` included, with a `doc/file/readme.md.md` on disk to match. I
  followed the reference implementation over the worked example (readme.md is
  a real file in the module, and its own design deserves a Files-tab page like
  any other), but the skill never says which one is normative, and a future
  agent could reasonably do either and call it correct. **Fix:** either add
  `readme.md` to the worked example, or add one sentence saying whether it's
  optional.
- **"A section over two paragraphs breaks out" has no guidance on how many
  breakouts is too many.** This module's readme had one Decisions section
  covering nine questions; I split it into three topic notes. Nothing in the
  skill says whether three tightly-scoped notes are better than one longer one,
  or worse — I made the call by grouping around the module's own file
  boundaries (vocabulary / drawer / selection), which felt right but was a
  guess, not something the skill states.
- **The audit checklist's step 7 ("who uses it") doesn't say what to do with
  callers that are dead-but-present** — six of this module's thirteen importers
  are historical `ai/` task snapshots that predate the module's current shape
  (one still assumes a function, `layout.page()`, the readme itself records as
  deleted). The skill has no guidance on whether these count as "callers" for
  the "a module with no callers is itself a finding" rule, or whether they
  should be filtered out first. I listed them separately rather than folding
  them into the main table; a repo-wide policy on `ai/`-directory imports would
  remove the guesswork.

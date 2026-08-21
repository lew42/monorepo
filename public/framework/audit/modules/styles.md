# styles

`public/framework/styles/` is the framework's CSS strategy made browsable: the
ladder (stop at the first rung that works), the four-layer cascade, an element-by-
element reference, a sixteen-layout catalog built from twelve utility words, a
fifteen-band section-composition demo, and the lew42 house theme. It earns its
place — it is the single most cross-referenced module in the framework (every
theming, layout and element decision elsewhere links back here) and its actual CSS
footprint is tiny by design: 363 lines across six stylesheets back a whole site.
**The single most important thing to do to it**: none of its 95 files had a
`doc/file/*.md`, and none of its `page.js` files used `ext/Doc`'s `Doc` — this
audit wrote 43 file-docs and wired three of them into real Files tabs, but stopped
short of wiring the other 36 (covering `styles/`, `rules/`, `layers/`,
`layers/theme/`, `elements/`, `layouts/`) because doing so cascades a persistent
tab bar across every url in that subtree — a structural change, not a doc fix, and
one this audit could not visually verify without a browser. That decision is
The owner's; the content is written and waiting. See Recommendation 1.

## State

| | |
|---|---|
| files | 95 (64 JS, 24 md, 6 css, 1 `ai/…/task.jsonl` excluded from documentation per the brief) |
| lines of JS / CSS | 4,094 / 363 |
| lines of pre-existing markdown (readmes + `doc/*.md`) | 3,433 — this module was already the most heavily documented in the framework |
| callers | Not a leaf module. `app.js` (imports the `lew42` theme function and calls it in `config()`); `core/Page/old/overview/landing/` and `old/overview/site/` (import nine `sections/*.js` band functions directly); `ext/Panel/templates.js` (dynamically `import()`s every file in `sections/` by name, at runtime, for the **T** template menu); `ext/DesignTool/audit/pages.js` (~30 urls under this module in its four-width sweep corpus); `ext/catalog`, `ext/demo`, `ext/layout`, `ext/toc`, `ext/highlight` (cite pages here as their canonical worked examples); `ui/avatar`, `ui/card`, `ui/crumbs`, `ui/kbd`, `ui/stats`, `ui/tooltip` (link back for the reference behind a decision); `core/Sidebar` (links `/framework/styles/` from the site nav, cites two pages as its own demos); `web/layout/*` (the guide tier links back to every vocabulary page here); `core/Page/doc/*.md` and `core/View/doc/*.md` (cite files here as worked examples in their own member docs). Full list, with urls, in `styles/readme.md`'s new "Who uses this" section. |
| docs before | `readme.md` present at 6 levels (root, `rules/`, `elements/`, `layouts/`, `sections/`, `layers/theme/guide/`, `layers/theme/lew42/`); 24 `doc/*.md` design records already written, several thousand words, all in the question→options→weighing→verdict shape; **zero** `doc/file/*.md` anywhere; **zero** `page.js` files using `Doc` (all plain `Page`); zero `classdoc` references (already fixed upstream of this pass — confirmed by `git diff` on `doc/audits.md`, not this audit's doing) |
| docs after | 43 new `doc/file/*.md` (one per file in `rules/`, root, `layers/`, `layers/theme/`, `elements/`'s own files, `layouts/`'s own files, plus full coverage for the three directories converted to `Doc`); 3 `page.js` converted to `Doc` (`layers/theme/guide/`, `layers/theme/lew42/`, `layouts/space/` — all leaves with no `children:`, so the change is local to one page each); a new "Who uses this" section added to the root `readme.md`; the 5 root `doc/*.md` and `elements/doc/framework-css.md` and the 4 `layouts/doc/*.md` remain written but unwired (see Recommendation 1) |

## What I changed

- Converted `layers/theme/guide/page.js`, `layers/theme/lew42/page.js`, and
  `layouts/space/page.js` from `Page` to `Doc`, adding a `files:` list to each.
  All three are leaf pages with no `children:`, so each gained its own small
  Overview+Files tab bar with no effect on any other url in the framework.
- Wrote `doc/file/*.md` for those three directories' 14 files (4 + 4 + 6).
- Wrote `doc/file/*.md` for 29 more files — every file directly owned by the root
  `styles/`, `rules/`, `layers/`, `layers/theme/`, `elements/` and `layouts/`
  directories — as **prepared, currently-unwired** content (see below).
- Added a "Who uses this" section to the root `readme.md`, from the framework-wide
  grep in the table above, including one stale-link finding (see Recommendations).
- **Attempted, then reverted**: converting the six hub `page.js` files
  (`styles/page.js`, `rules/page.js`, `layers/page.js`, `layers/theme/page.js`,
  `elements/page.js`, `layouts/page.js`) to `Doc`. Reading `ext/Doc/Doc.js` and
  `ext/tabs/tabs.js` closely after making the change showed that `Doc.render()`
  mounts a persistent `.tab-bar` + `.tab-panel`, and every descendant route mounts
  *inside* that panel — so converting a hub with `children:` wraps its entire
  subtree in permanent tab chrome (Overview | *its children* | Docs | Files) that
  wasn't there before. For `styles/` (5 children) and `layouts/` (16 children,
  ~90 descendant urls) that is a framework-wide visual change I cannot verify
  without a browser, which the brief's fences forbid launching. `git diff` confirms
  all six files are back to their exact committed state. The `doc/file/*.md` and
  `doc/*.md` content written for them is still on disk, ready to be wired the
  moment someone confirms the tab bar is wanted.

## Recommendations

1. **Wire the six hub `page.js` files to `Doc` — the content is already written.**
   Each is a two-line change (`Page` → `Doc`, add `files:`/`notes:`); the 29
   file-docs and 10 note-links this audit prepared would go live immediately. The
   honest cost is the one this audit would not pay unilaterally: every url under
   `/framework/styles/`, `/framework/styles/layouts/*` (~30 urls) and
   `/framework/styles/sections/` (not yet converted, see #2) would gain a
   persistent Overview/Docs/Files tab strip it doesn't have today. Look at it on
   one hub first (`layers/` is the smallest — one file, no readme, lowest risk)
   before doing the rest. *(medium effort, important — this is the single gap the
   `documentation` skill's six-artifact checklist most wants closed here.)*
2. **`sections/page.js` was never converted, and has the same `initialize(){
   this.catalog(); }` shape rules/layouts/elements do — plus a real conflict.**
   `Doc`'s own `initialize()` is `{ this.sections(); }`; assigning a config
   object's own `initialize` (as `sections/page.js` does, to call `this.catalog()`)
   would **shadow Doc's**, silently disabling every derived tab. Converting this
   one specifically needs `initialize(){ this.sections(); this.catalog(); }`
   written by hand — flagging it now so whoever does #1 doesn't lose an afternoon
   to a blank Docs/Files tab with no error. *(simple once known, important — a
   real trap, not a style choice.)*
3. **The stale link found while tracing callers**: `core/Page/old/overview/landing/`
   (via `framework/ai/2026-08-12/unify/page.js`) links
   `/framework/styles/layouts/cards/`, which this module's own `layouts/readme.md`
   records as deleted in the 2026-08-12 merge. Outside this audit's fence (the
   link lives in `core/Page/` and `framework/ai/`) — a two-minute fix for whoever
   owns those files. *(simple, important.)*
4. **`rules/robust.md`'s nesting table is hand-written while `nesting.md`'s
   identical-shaped table is measured live via `ext/DesignTool`.** Already named
   as the module's own priority in two places (`rules/readme.md`'s Open list and
   this audit's `robust.md.md`); applying the same `analyze()`-driven pattern
   would remove the one remaining asserted-rather-than-measured claim among the
   five rule chapters. *(medium, useful.)*
5. **`elements/doc/framework-css.md`'s `kbd`/`samp` mono-font gap and the
   `audio`/`iframe` reset-list gap are both named as two-word fixes, deliberately
   left open for lack of a real call site to test against.** Neither is urgent;
   listing them together because they are the same shape of finding and the same
   reasoning for not shipping it yet. *(simple, speculative.)*
6. **Outside-the-box one, ranked last on purpose**: `layouts/space/`'s seed → spec
   generator already turns "does this layout work from mobile to mega" into
   something sampleable. Its own readme names "Score" (running `ext/DesignTool`
   over each of the five ruler shots) as an open phase-2 item. Taken further: the
   generator could become the *source* of `rules/robust.md`'s and
   `rules/nesting.md`'s live examples too — instead of eight hand-built
   `NESTS`/`padding_ladder` fixtures in `rules/demos.js`, a shared seeded
   generator could produce both the rules pages' live proofs and the layout
   catalog's samples from one address space, closing Recommendation 4 and the
   layout-generator's own "Score" item in the same stroke. Speculative and a real
   redesign, not a doc fix — flagged because the two modules are already reading
   from the same `ext/DesignTool` and the same idea of "measured, not asserted,"
   and currently do it with two separate fixture sets. *(large, speculative.)*

## Where this module overlaps others

- **`rules/` overlaps the `css-strategy` skill almost completely, on purpose** —
  the skill is described, in the module's own words, as "the compressed version
  an agent loads," and `rules/` is "the long form a human argues with." This
  audit cross-checked every claim in `css-strategy` against `rules/` and found no
  disagreement; where they could drift (the padding formula, the layer order, the
  nesting table) the module keeps a live `ext/DesignTool`-backed demo specifically
  so a drift would be visible rather than silent. Not a duplicate to merge — a
  skill and a page necessarily serve different readers (one loaded into a prompt,
  one clicked into a browser) and this module already treats the split as
  deliberate, stating it directly in `rules/readme.md`.
- **`layouts/space/` and `ext/DesignTool` are closer to being one thing than
  either module's readme quite says.** `space/` generates and renders layout
  specs and asks a human (or a future automated pass) to judge them visually;
  `ext/DesignTool` grades a rendered box numerically against named rules
  (`cramped`, `pad-scale`, `gutter`, …). `space/readme.md`'s own "What the
  analyzer said" section already runs `DesignTool` over `space/`'s output by
  hand and reports the score — the missing piece, named in both readmes
  independently (`space/readme.md`'s "Score" item, `DesignTool/readme.md`'s own
  stated ambitions) is wiring the analyzer to run automatically over every seed
  a reader generates, which would turn `space/` from a sampler into a search.
- **The five-block demo system (`Page`, `preview()`/`previews()`, the `ext/demo`
  stage, the `ext/layout` panel, the utility vocabulary) and `ext/Doc`'s `Doc`
  are two competing answers to "how does a module present its own examples,"
  and this module is the clearest evidence that the split is currently a real
  seam, not a settled decision.** Every directory here (`rules/`, `elements/`,
  `layouts/`, `sections/`) is built entirely from the five-block system —
  `catalog()`, `previews()`, `demo.exhibit()`, `demo.layout()` — and none of
  them uses `Doc` at all, while `core/View`, `Doc` itself and a growing set of
  `ext/*` modules are standardizing on `Doc`. The two systems don't fight today
  because this module never crossed into `Doc`'s territory, but this audit's
  own reversal (see "What I changed") is direct evidence that the boundary is
  load-bearing and not just historical: converting a hub here to `Doc` doesn't
  compose with `catalog()`/`previews()`, it *replaces* the top-level navigation
  those functions already built. Worth a real decision at some point about
  whether `Doc` is meant to subsume the five-block system's index pages too, or
  whether the two are permanently different tools for different content shapes
  (a class's members vs. a catalog of live examples) — this audit's read, from
  where it sits, is the latter: `Doc` documents *members*, this module mostly
  has none to document.

## Skill feedback

**The single strongest piece of feedback**: the `documentation` skill's
six-artifact checklist states "doc/file/<path>.md — one for EVERY file in the
module" as a flat, unconditional rule, but never states — anywhere in the skill,
in `ext/Doc/readme.md`, or in `Doc.js`'s own comments — that writing one only
pays off once the owning `page.js` is a `Doc`, and that becoming a `Doc` is not a
config tweak but a navigational change that cascades to every descendant url. The
skill's own worked example (`View`, a leaf-ish class page) never surfaces this,
because `View` has no rich pre-existing catalog navigation to disturb. A module
shaped like this one — several directories deep, each already using
`previews()`/`catalog()` for its own navigation — hits the cascade on the very
first hub it tries to convert, with no warning in the skill that this is coming.
One sentence in the "Auditing an existing module" section (something like: *"Doc's
tab bar is chrome that persists across every descendant route — converting a hub
with real `children:` changes navigation for its whole subtree, not just that one
page. Verify this is wanted before converting anything with more than a couple of
children."*) would have saved this audit an attempted-then-reverted change and
would meaningfully change how the next agent scopes a module like this one.

Second: the skill's "Auditing an existing module" checklist (steps 1–8) never
asks *"does this module's shape even want `Doc`?"* — it assumes the answer is yes
throughout, treating any pre-existing non-`Doc` page.js as simply not-yet-migrated
rather than as a possibly-deliberate choice. `ext/Doc/readme.md` itself states
"a module whose shape genuinely differs subclasses `Doc`... or documents itself
with `notes:` and `files:` and never passes [a subject]" — but the audit skill
never asks the auditor to weigh "should this stay a plain `Page`" as a real,
nameable option alongside "convert it."

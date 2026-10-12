# Direction — the width library

Judge pass over `census.md`, its cited files, and four live `frame()` runs.

## The direction

**The width library is a curation, not a construction.** One new child of the
existing catalog — `styles/layouts/400/` — holding five *class strings*, each a
single column at 400 that unstacks on its own as width grows. Entries render
`web.js`'s shared `site` and wear the house `demo.layout({ twin: true })` card — a
live 390 phone beside a live 3440 monitor, which *is* Mike's question. **Zero new
CSS.** `ext/LayoutTool/widths/` measures the claim at 400/1280/1920/3440.

## Why

**Q2 — one child of `styles/layouts/`. Not a top-level tier, not 5 flat siblings.**

- `space` is the precedent: a whole tier as ONE card in the rail, its own
  `/path/`, declared by one word. `styles/layouts/page.js:16`
- The rail holds 20 entries organised *by lesson*; flat width entries put two
  organising principles in one rail — the smell readme logs as Open ("Two
  pedagogies in one rail"). A top-level tier is a second "where do layouts live".

**Q3 — content-filled, and the content is `web.js`. Not new copy, not grey boxes.**

- The house already ran this: layouts render one shared `site` object, which is
  *why* the incoming tier won every contested pair — "the only difference between
  two pages is where the boxes go." `styles/layouts/readme.md:60`
- Grey boxes are served by `shape()` (`styles/layouts/preview.js`) and real *copy*
  by `styles/sections/` — rebuilding either here is the same thing twice.
- `web.js`'s parts (`topbar hero sections cards rows tiles toolbar footer`) are the
  furniture "what can we do with 400px" asks about — and its blurb is short
  *because the 390 pane sets the two-up's height*. `styles/layouts/web.js:19`

**The census's strongest claim — "zero new CSS" — HOLDS. Measured, not asserted.**

- `/framework/styles/sections/full/`, root `.layout-full`, tonight: **400 → A 100,
  zero findings, 100% used, 27.8ch**; **3440 → A 99, one `low`, 100% used,
  94.5ch.** Fifteen content-filled bands, no media query, no stylesheet of their
  own, clean at both ends. `/library/tile-wall/` at 400 → **A 100, clean**.
- That lone 3440 `low` is the known site-wide `--measure: 52em` token — not a gap
  this library can or should close. `styles/layouts/space/readme.md:69`
- After twenty layouts the catalog's own falsification list is **two lines long**
  (a full-window overlay, one hairline). `styles/layouts/readme.md:1-6`
- Seeding from `LayoutTool/library`'s 11 patterns would **copy** them: block
  arrangements, already a catalog, already measured at 400. Entries *cite* them.

**The meter, and the seam that makes it honest.** A `demo.layout` page cannot be
measured directly — the stage fakes width with `zoom`, `.demo-screen` is in
`probe.IGNORE`. `full.js` is the shipped answer: `route(name){ return name ===
"full" && full(this, () => this.layout()); }` gives every entry a bare `/full/`
url that `frame(url, w, { root: ".layout-full" })` reads in a real viewport — wired
by `styles/sections/`, unused by the layouts, exported, documented.

## Build plan for tonight

Two packages, deliberately not three: a third would have to share the tier's index
file, and shared files break a parallel run. Paths are under `public/framework/`.

### P1 — the tier (`styles/layouts/400/`) · 4 new files + 1 parent line

New: `page.js`, `entry.js`, `specs.js`, `readme.md`. Parent line: add `400` to the
children string at `styles/layouts/page.js:16` (RULE#13 — the ONE shared edit).

- `entry.js` — `spec => demo.layout({ ...spec, twin: true, route(name){ return
  name === "full" && full(this, () => this.layout()); } })`. `full` from
  `../full.js`, `demo` from `/app.js`. No stylesheet, no new class.
- `specs.js` — five `{ title, note, parts, layout(){ … } }` using ONLY
  `framework.css` words and `web.js`'s `site`; each `note` names its `library/`
  arrangement and the `bad/` trap it avoids:
  1. **Column** `page full fill flex v` — topbar · hero · sections · footer. The
     400 baseline; at 3440 it is the failure the other four fix
     (`bad/stacked-forever`).
  2. **Wrap** `flex gap wrap` — `basis` rail + article at `flex: 1 1 24em`. One
     column under ~34em, then two, then three. (`library/rail-content`.)
  3. **Wall** `grid gap auto`, `--column: 14em` — `site.cards()`. One at 400, 4+
     at 3440. (`library/tile-wall`.)
  4. **Rows** — full-row items whose INSIDE wraps at a `20em` basis: identity ·
     detail · figures wide, one column at 400. (`library/dashboard-row`.)
  5. **Bands** — full-bleed bands each holding a `.measure` column. Width becomes
     band width; reading stays a column. (`library/section-band`.)
- `page.js` — `children: specs.map(entry)`, `initialize(){ this.catalog(); }`,
  prose stating the claim, `md.details` to the readme.
- **Acceptance**: the index renders a rail of five twin cards; each entry opens on
  a stage with a layout bar and its source; each `/full/` url renders the bare
  layout; `frame(fullUrl, w, { root: ".layout-full" })` grades all four widths with
  **zero `high` findings**. A `high` no existing word clears is a **readme
  finding**, never a fix to a shipped file (fences).

### P2 — the meter (`ext/LayoutTool/widths/`) · 3 new files + 1 parent line

New: `page.js`, `urls.js`, `readme.md`. Parent line: add `widths` to the children
string at `ext/LayoutTool/page.js:11`.

- `urls.js` — `{ label, url, root }` list: the five `layouts/400/<slug>/full/` and
  `styles/sections/full/` (root `.layout-full`), plus four
  `ext/LayoutTool/library/<slug>/` (root `.lt-case-body`).
- `page.js` — four buttons (400/1280/1920/3440), each running `measured(url, width,
  root)` **sequentially** into a `ui.table` of label · grade · score · measure ·
  used · leading finding. `measured`/`finding` come from `../library/entry.js` — no
  new measurement code, no new CSS. Render inside `this.$out.empty(() => …)`.
- **Acceptance**: every row grades at all four widths, a missing url shows its
  error in its own row rather than throwing, and 400 vs 3440 is Mike's evidence.

## Parked for Mike

- `--measure: 52em` measured **94.5 characters a line at 3440** tonight — the token
  or the rule is wrong, and it is a site-wide type decision.
- The twin card's phone pane is hard-coded **390** (`ext/demo/layout.js:65`,
  `twin.js:20`) while the tier is named 400 and measured at 400. `narrow` as
  config, or accept the 10px?
- `carousel`, `hero`, `overlay`, `pricing` ship but are absent from
  `styles/layouts/readme.md`'s table — and `hero`'s comment names the 400/800/1920
  breakpoints one flex word replaced, the best evidence for this whole thesis.
  Documenting them edits a shipped file (census Q6).
- Should every `library/` entry cite the `bad/` trap it replaces? This tier does it
  by house rule; promoting it site-wide is his call (census Q10).
- `space`'s `bands()`, `gen.js` phase-2 families and Panel's `structure(seed, width)`
  are out of scope tonight — Panel's floor is broken below ~200px anyway.

# Column pages — design decisions (mastermind, 2026-08-26)

Research: 4 minion reports summarized in task.jsonl. Key facts they proved:

- Pages already mount as siblings into the nearest ancestor `$pages`, falling back to `app.$pages` (`core/Page/Page.class.js:161-173`) — the page tree is virtual; the DOM is flat unless a parent opts into its own `$pages`.
- Show/hide is CSS: `Router.mark()` sets `active-page`/`active-ancestor`; the hide-unless rule is `core/Page/Page.css:1-9` (`@layer util`).
- The Miller-columns mechanism is proven at `core/Page/overview/columns/` — `display: contents` flattens each non-root page so `.page-column-body` regions become flex peers; `scroll-snap-type: x proximity`; reveal via `row.scrollBy` (never `scrollIntoView`); first reveal needs a one-shot ResizeObserver (built detached, rAF sees zero rects).
- `Page.chain()` exists (`Page.class.js:96-100`); no live breadcrumb component — `ui/crumbs/` is a hand-typed demo that says a real one should derive from `chain()`.
- Color tokens: `--wash → --tint → --surface` is the strictly-lightening chain (`styles/layers/theme/lew42/lew42.css:38-45`). `--well` is a translucent shadow, NOT a palette color — stacking it caused the ux/* alternating bands. Never use `--well` for column surfaces.
- The space generator pattern (`styles/layouts/space/`): string DSL, mulberry32 seeded draws with a chaos dial (`draw.js`), permutations addressed by `#seed`, previews are inline scaled divs. Generated layouts have no navigation and no routes — that is the gap a PAGE generator closes.

## Decisions

### 1. Graduate columns into core/Page
`.page.columns` on a host page = its whole descendant subtree renders as full-height
columns; every non-root descendant is flattened (the proven `display: contents` pattern).
The demo at `overview/columns/` becomes a thin page USING the core shape. Host claims its
region full-height; the column row horizontally scrolls (snap proximity) when columns
overflow. Respect the demo doc's parked verdicts: keep the reveal mechanism; "columns and
tabs — do not" (no `.block` tab strip directly above full-height columns).

### 2. Width words — fixed SEMANTICS, spelling passes new-css-class
Per-page word (a class on the page's column body):
- **small** — fixed narrow track (~14em): rails, lists, item pickers.
- **default** (no word) — flexes between a floor and `--measure` (40em).
- **large** — caps around 64em: grids, wide content.
- **full** — claims the entire host viewport; the ancestor columns collapse and the
  breadcrumb strip restores them. This is the "swap into the correct area".
Exact em values are the builder's call, proven at 400 / 1280 / 1920 / 3440
(3440 especially: what does a default column holding 2-column content look like?).

### 3. Breadcrumbs
A real component deriving from `Page.chain()`, minimal, in the columns host's top strip.
Two jobs: restore collapsed ancestors under a `full` page; recover columns scrolled far
off-screen. Reuse the `ui/crumbs/` look if it fits; the demo page then imports the real one.

### 4. Colors and seams
Core default: transparent column bodies over `--wash`, seam = `1px solid var(--line)`.
Parent/child background matching uses only the `--wash → --tint → --surface` chain.
Background/padding exploration belongs to the examples wave, not core.

### 5. Generator at core/Page/generator/ (a top tab on core/Page)
Imitates space, but its output is a real virtual Page tree (no filesystem) mounted under
the generator page — so Router navigation, active-ancestor CSS, and columns all work for
free (demo.tree already proves virtual trees). String DSL: block words name building
blocks (tabs, vtabs, rail, wall, grid, flush, list, prose, crumbs) and width words
(small/large/full) attach to nodes; depth = nesting. Seeded mulberry32 (reuse or copy
space/draw.js — verify it is dependency-free first), permutations addressed by `#seed`.
LAW: any edit to a seeded generator must prove bit-identical output on unchanged inputs.
v1 renders the generated tree live on the page; a permutation wall can wait.

### 6. Overview = the palette (wave B)
core/Page Overview previews become chrome-free static miniatures — tiny CSS wireframe
pictures, one per building block ("just top tabs", "just vertical tabs", "just a wall"),
never a zoomed live app (the layout skill already rules: a preview is a picture, never a
live instance). The blocks previewed ARE the generator's words. Click → the block's page
with usage.

### 7. ux/* second row → vertical tabs
A Doc nested inside another Doc's panel renders its tab row as `.tabs.vertical` (the
inner-left API style) instead of a second `.block` row — removes the `--well`-over-`--wash`
alternating bands on /framework/ux/*. Owner's stated preference 2026-08-26.

## Waves
A (parallel, now): S1 core columns (Opus) · S3 generator (Opus) · S4 ux vertical tabs (Sonnet).
B (after A): S2 overview palette previews · examples fan-out (backgrounds, padding, flush
grids, parent/child color matching, scrollbar-aware lengths, 3440 checks).
Fences: S1 owns core/Page/Page.css, Page.class.js, overview/columns/**, crumbs;
S3 owns core/Page/generator/** + the one `children:` line in core/Page/page.js;
S4 owns ext/Doc/** (+ ext/tabs CSS if needed). No other overlaps permitted.

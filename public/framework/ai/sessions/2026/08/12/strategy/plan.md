# Master plan — employer-ready /framework/ (2026-08-12)

Synthesis of three lens docs in this directory: `layout-simplicity.md`,
`browsability.md`, `employer-audit.md`. All three converge: **the five-block
machinery is done and good; the mess is links, duplication, and stale text.**
Workers: read your task here, then the lens doc it cites. Constraints: CLAUDE.md
is law (no build step, real-URL imports, layer order restated in full, no DOM
after `await`, `node --check` any file whose `css(`…`)` you touch).

## Phase 1 — Curation wave (parallel, disjoint file ownership)

- **W1 `framework-landing`** — owns `public/framework/page.js`, new
  `public/framework/stats.js`, `public/framework/versus/page.js` (stats import
  only), `public/framework/ui/page.js` (one link), `public/framework/dev/Socket/page.js`
  (one word). Drop `ai` from `children:`; add headline + lede + stat row above
  the existing hook (stats factored into one shared module versus also imports —
  never three hand-copies); add a `/web/` pointer in closing prose; repoint
  ui/page.js's `/framework/ai/2026-08-09/` sentence; reword Socket's "session
  log" → "development log". See employer-audit Moves 1–2, browsability Moves 1, 5a.
- **W2 `homepage`** — owns `public/page.js`, `public/notes/` (memo lands there).
  Replace the "Nice work, everyone" memo with a neutral one-screen front door:
  what lew42 is, two cards (Framework, Web), one low-key team-sandboxes group.
  Preserve the memo verbatim under /notes/. See employer-audit Move 3.
- **W3 `dead-weight`** — owns deletions only: `public/path-1/`, `public/path-2/`,
  `public/test.html`, `public/framework/core/legacy/`. Grep first (imports and
  hrefs from outside the deleted tree = abort that deletion and report). Before
  deleting legacy, note its `Page.class.js:177,197` description-rendering lines
  for W4 (harvest, then delete). Do NOT touch `core/new/` — Mike's call, pending.
- **W4 `descriptions`** — owns `core/Page/Page.class.js` (nav pipeline +
  `preview_card()`), `core/Page/Page.css`, `ext/catalog/catalog.css` (hide rule
  <64em). Render `description:` as one clamped line on plain (no-thumb) preview
  cards. See browsability Move 2.
- **W5 `reveal`** — owns `ext/catalog/catalog.js`. `scrollIntoView({block:
  "nearest"})` on the lit card at activate; test the classdoc-rail variant.
  See browsability Move 3.

## Phase 2 — One layout story (staged, after Phase 1 verifies)

1. **Doctrine text + word de-collision** (safe immediately): CLAUDE.md five-block
   wording (`card()`/`wall()` → `preview()`/`previews()`); delete ext/Layout
   readme's ghost section; rename `ext/Layout/` → `ext/layout/` (case-only —
   use two-step `git mv` on Windows; ~15 import sites); `core/Page/doc/layout.md`
   → `doc/css.md`; retire `.page.pad` (2 callers → `full` + `.pad` utility);
   rename card span claim `card: "wide"` → `card: "two"` (~6 sites).
2. **Arrangement contract fails loudly**: scope `Router.mark()` wipe to its
   chain (core/Page/readme.md Proposed §7); localhost-only console.warn when an
   appended `.page` computes `display:none` with no mark.
3. **Merge layout tiers**: one catalog at `styles/layouts/` (default call —
   old `core/Page/layout/*` urls alias via `route()`); delete both per-tier
   `detail.js` by folding `parts:`/two-up/`frame()` into `demo.exhibit()`;
   rename `ext/demo/web.js` → `tree()` (3 sites); dedupe dashboard/split,
   pick sidebar-vs-shell, stack-vs-docs survivors; `/web/layout/` stays the
   prose guide, `tracks/` converted to the standard exhibit.
4. **Demo = four doors**: present `demo` / `stage` / `exhibit` / `app`
   (`page`/`tree` documented as exhibit sugar); fold `demo.responsive` into a
   stage mode (deletes its private fullscreen); give `demo.source()` its string
   form; split the 969-line readme (one-pager top, history → doc/).
5. **Zero-caller deletions** pre-argued in readmes: View `compute/replace/
   prepend/prepend_to/meta_path` (then `off/repeat/clone` w/ sandbox fix),
   `Page.go()`. Grep sandboxes first, alias on the way out.
6. **One page states the model**: the seven-sentence layout model + word table
   (layout-simplicity.md "The smallest model") at the top of the merged catalog.

## Phase 3 — Verify (after each phase)

`node --check` (as .mjs copy) every edited JS; re-crawl `/framework/` + `/notes/`
at 1600/900/400 (expect ai/ routes to drop out, zero 404s otherwise; today's
crawl harness: see `ai/2026-08-12/`); eyeball landing + homepage at 390 and 3440;
click brand logo from a deep page.

## Pending Mike (defaults chosen, all reversible)

- `core/new/` deletion (~2.8MB, 768 files; keep `new/1/readme.md` → `core/doc/`).
  Default: **not executed** — CLAUDE.md protects it; invisible to visitors anyway.
- ai/ tier: hidden from nav (default) vs a labeled "Development log" section.
- Homepage memo assumed expired; preserved verbatim in /notes/.
- Merged layout catalog lives at `styles/layouts/` — flag if you want
  `/framework/layouts/` instead; aliases make either cheap later.
- W3 found the legacy Page also wrote `<meta name="description">` in `activate()`
  (SEO) — dropped in the rewrite, restored nowhere. Cheap to revive in Phase 2 if
  wanted.
- `core/legacy/` had live consumers (`/michael/pager/{mvp,tabs}/`) — W6 vendors
  `Pager` into the sandbox, then deletes legacy.
- 2b named the layout-exhibit sugar `demo.layout()` (file `ext/demo/layout.js`) —
  one word from `ext/layout/`, the panel. Reads well at call sites; the file-tree
  adjacency is the cost. Rename is cheap now, expensive later — Mike's word.
- `.page.pad` retirement tightened six pages' insets 2em → 1em (the shape's
  `--pad: 2em` no longer inherits). Deliberate; restore per-page with
  `.style("--pad","2em")` if the old look is wanted.

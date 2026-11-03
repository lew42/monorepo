# 2026-08-09 — One demo system

> **Status: executed the same day.** The plan below shipped in four waves of
> Opus agents, each browser-verified — see *What shipped* at the bottom.

Everything on this site that shows an example grew its own machinery. The styles
and layouts look right; the system underneath them doesn't exist yet — there are
fourteen mechanisms where five blocks should be. This page is the census, the
target design, and the task list for the next autonomous session.

## The sprawl

| mechanism | where | what it is |
|---|---|---|
| `demo()` / `demo.stage()` | `ext/demo` | source + resizable render, stacked |
| `demo.responsive` | `ext/demo` | the same box, two simulated viewports |
| `preview()` | `styles/layouts/preview.js` | shape-only thumbnail — **not clickable** |
| `variant()` | `styles/layouts/variant.js` | copy-paste template + live render card |
| `recipe()` | `styles/layouts/recipe.js` | the class string, shown inside the layout |
| `Layout` | `styles/layouts/Layout.js` | a page that IS a layout |
| `full()` | `styles/layouts/full.js` | one layout, the whole window, a way out |
| `card()` / `wall()` | `styles/gallery` | the clickable preview card, three indexes |
| `catalogue` + `toned()` | `styles/sections` | a registry, and big tone-switcher buttons |
| section parts | `styles/sections/parts.js` | band / eyebrow / cta / feature / price / stat |
| `mini_app()` | `core/Page/overview/demos` | a real Page tree navigating in a box |
| `palette()` / `copy()` | `ui/parts.js` | variants side by side / code with a copy button |
| `Page.preview()` / `previews()` | core | a card per child — two shapes under one class (known bug) |
| `layout()` / `layout.bar()` | `ext/layout` | a hover toolbar steering a container |

Four of these are preview cards. Three print source next to a render. Two are
walls. That is the disease: each page invented its exhibit furniture instead of
using the house's.

## The five blocks

Everything above converges on five things. Nothing else gets built without
naming which of these it extends.

1. **A demo is a `Page`.** Declared in `children:` — as a directory when it earns
   one, as an **inline object child** (the `mini_app` form) when it doesn't. That
   one declaration buys routing, nav order, titles/icons, previews, sub-demos,
   and deep links. The parent decides *how* its children render (a wall, a rail,
   a strip, a box); the child only knows how to draw itself.
2. **`card()` / `wall()` is the only preview.** Every index is a wall of
   clickable cards — live renders, above the fold, **no code**. Walls take the
   breakout tracks (`wide`) and may go full-bleed on large screens. More than
   ~5–10 cards means categories, and a category's card can render a mini-wall of
   its own children's thumbs — which is what makes the gallery **recursive**.
3. **The stage is the only viewport.** `ext/demo`'s resizable box (drag handle,
   zoom, width readout) detaches from the code pane and becomes the chrome of a
   *leaf* demo page. `demo()` with its stacked source stays for tutorial pages
   where reading the code is the point — it stops being the default.
4. **`ext/layout` + the right contextual panel is the only control surface.**
   Select any container or item, edit its utility words and tokens, read back
   the class string. Tone and color-scheme switching live here too, as small
   chips — the big buttons go away.
5. **Utility classes + a small `.ui-*` set is the only styling.** Components are
   stacks of base things; a helper function must carry real logic to exist.

What folds away: `variant()` and `recipe()` (leaf pages + the panel do their
jobs), `preview()` as a standalone exhibit (it survives as a thumb renderer
inside cards), `toned()` (panel chips), the big scheme buttons, `palette()`
(a wall of cards), and eventually `demo()`-as-default. `Layout.js` was the
thesis all along — the page IS the layout. `mini_app()` stays: it is block 1
in a box, and the parent-child UX demos are built out of it.

## The recursive gallery

The drill-down, uniform at every level:

```
styles/                     a wall of three category cards
  elements/  layouts/  sections/
      layouts/                a wall of shape cards (clickable, no code)
          flex/               a wall of variant cards — one per word
              wrap/           THE LEAF: full-bleed render on the stage,
                              panel open on request, source below the fold
```

**The leaf shape, fixed:** render first — the band or stage at the top of the
page, full-bleed, exactly what `sections/*` pages get right. One caption line
under it. Source *below* the fold (or in the panel) — never stacked above,
because the code block pushing the render below the fold is what's wrong with
the current sections pages, and the `demo()` box has the same cost everywhere.

**Parent→child arrangements to explore** (each is itself a demo page under
`core/Page/overview/demos/`, so the demo system demonstrates itself):

- **wall** — the current gallery index.
- **catalog** — a left rail of preview cards acting as nav, the active child
  full-size in a right region. Master-detail as a page stance; `mini_app()`
  already proves the mechanics.
- **dashboard** — a mixed-size wall (`card: wide/tall`).
- **strip** — one horizontal row of cards.

`core/Page/overview/demos/` also gets re-ordered simplest→complex as one wall
of cards with no code — the progression should be legible from the wall alone.

## `demo()` vs `ext/layout` — the comparison, and the merge

- `demo()` is **presentation**: source and render locked together
  (`fn.toString()`, so they cannot drift), a resizable stage, an HTML pane.
  Costs a screen of height; right for tutorials, wrong for galleries.
- `ext/layout` is **interaction**: steer a live container's words and tokens.
  Shows no source at all.

The merge: the **stage** becomes shared chrome, and the **panel** becomes where
both the properties *and* the source live. A leaf demo is then: render on the
stage, panel on demand with Properties / Source — and the page itself is
nothing but the render.

## The right contextual panel (`ext/layout`)

The spec, ready to implement:

- **Selection.** Inside any inspectable region, hover outlines the container or
  item under the pointer; click selects (`.layout-selected`). Click-away,
  `Escape`, or the panel's ✕ deselects. Touch gets a visible affordance
  (`@media (hover: none)`, as the bar already does).
- **The panel.** One per document, `position: fixed`, right edge, ~16em,
  surface + line border, its own scroll, slides in on selection. New file
  `ext/layout/panel.js`; `layout.css` grows the rules (layer order restated in
  full; every rule in a layer).
- **Contents, contextual.** For a container: mode (`flex`/`grid`) and the word
  chips that exist in `framework.css` (`v gap wrap auto split three v-center
  h-center` — verified against the file, not assumed), plus `--gap` /
  `--column` / `--pad` knobs. For an item: `basis`, `flex-1`, and whatever item
  words the vocabulary actually has. Pressed chip = class present. At the top,
  the live readout — `div.c("flex gap auto")` — with a copy button.
- **Extensible at the call site.** `layout.context(el, fn)` registers extra
  panel controls rendered while `el` is selected — this is how sections offer
  tone chips and how a scheme switcher becomes two small chips, with no tone
  knowledge inside `ext/layout`. Explicit registration, visible where it
  happens; no markers interpreted at a distance.
- **Why it isn't a DOM inspector** (the objection recorded in
  `ext/layout/readme.md`, now overruled): the panel edits only the site's own
  vocabulary and prints the class string you paste into code. Devtools can't do
  that. The readme's verdict flips, with this reasoning recorded.
- The hover bar stays for quick hits; `layout()`, `layout.bar()`,
  `layout.page()` keep working unchanged.

## `ui/`

Direction: a minimalist base set, `.ui-*` classes over helper functions, a
helper only where there is a loop, a listener, a unique-name requirement, or a
trap. Six modules were reviewed this session by independent agents (table,
crumbs, pagination, card, stats, badge) — verdicts land in this file's
**Reviews** section below. The other ten (alert, tags, panel, tooltip, avatar,
dialog, menu, accordion, timeline, kbd) are queued for the session.

Known already: `styles/gallery`'s `card()` and `ui.card()` are two unrelated
things sharing a name — the owner confused them on the gallery page, which is
the proof it must be resolved. And `styles/sections/parts.js` `stat()` overlaps
`ui.stats()`.

## Open questions (for Mike)

1. **Source on leaf pages:** below the fold on the page, or only in the panel's
   Source tab? (Proposal: `details` below the render for copy-paste, panel for
   glancing.)
2. **Sections:** convert `catalogue.js` to inline object children so sections
   join the one system? The sections readme chose the registry deliberately —
   the session should re-read its reasons and record the verdict either way.
3. **The name collision:** gallery keeps `card()` (it is *the* card of the demo
   system) and `ui.card` demotes to a `.ui-card` class — agreed?
4. **The thumb protocol:** one blessed Page method meaning "draw yourself
   small" — currently `layout()` on Layout pages, ad-hoc elsewhere. Proposed
   name: **`thumb()`**. Needs the say-it-out-loud blessing before anything
   renames.

## Decisions (Mike, same day — these supersede the sections above)

1. **Leaf source: both.** A `details` block below the render for copy-paste,
   *and* a Source section in the panel — build both so the better one can win
   by being seen.
2. **Sections convert to inline object children.** The registry goes.
3. **The gallery system dies.** No `card()`, no `wall()`, no `.ui-card` — two
   things named card was the symptom, and the cure is neither. **Each child
   page renders its own `preview()`; each parent renders its own
   `previews()`.** Block 2 above is therefore not `styles/gallery` — it is
   `Page.preview()` / `Page.previews()`, one card shape, overridable by the
   page it belongs to. Gallery's hard-won lessons (inert thumb, the `::after`
   link cover, `--thumb-min/max`, the checkered floor) move into `Page.css`;
   the `styles/gallery/` directory is deleted once nothing imports it. This
   also settles the core shelf item — `preview()` and `previews()` emitting
   two different cards — in the direction already recommended: `previews()`
   calls `preview()`.
4. **No `thumb()`.** The override point is `preview()` itself — a page that
   wants a live thumb overrides `preview()`, and core keeps that override at
   a few lines.

## Tasks for the autonomous session

Order matters — T1 and T2 are the foundations the rest stand on. Opus minions
do the work; the orchestrator only reads results (budget protocol). Every task
ends with its readme/doc updated in the same commit.

- **T1 — the panel.** `ext/layout/panel.js` per the spec above; selection
  model; `layout.context()`; `layout.css`; readme verdict flipped; `page.js`
  demo of select-and-edit. *Done when:* clicking any box or item in
  `styles/layouts/flex/` opens the panel, edits write classes, readout copies,
  ✕/Escape/click-away dismiss, existing `layout()` call sites unchanged.
- **T2 — the stage detaches.** `ext/demo` exports the stage as a first-class
  piece; `demo()` becomes stage + optional code pane; leaf-page usage needs no
  code pane. *Done when:* a leaf page renders full-bleed on the stage with no
  source above the fold.
- **T3 — the recursive gallery.** `gallery.js` learns category cards (a card
  whose thumb is a mini-wall of its children) and full-bleed walls; `styles/`
  index becomes a three-card wall. *Done when:* styles → layouts → flex is a
  click path of walls with zero code blocks above the fold.
- **T4 — layouts convert.** `styles/layouts/` previews and flex/grid variants
  become clickable cards backed by child demo pages (inline children where a
  folder isn't earned); every rendered box is panel-inspectable. `variant()`
  and standalone `preview()` exhibits fold away. *Done when:* every shape on
  those three pages is clickable and inspectable.
- **T5 — sections reshape.** Leaf pages render-first (band on top, source
  below the fold); `toned()` becomes panel tone chips via `layout.context()`;
  scheme switcher shrinks into the panel; registry→children question answered
  and recorded in the sections readme. *Done when:* a section page opens with
  the band above the fold and tone/scheme editing lives in the panel.
- **T6 — Page demos progression.** `core/Page/overview/demos/` reordered
  simplest→complex as a wall of cards; the four parent→child arrangements
  (wall / catalog / dashboard / strip) each get a demo page; `catalog` is the
  columnar previews-as-nav pattern. *Done when:* the wall reads as a
  progression and each arrangement is a working demo.
- **T7 — finish ui.** Review the remaining ten modules against the same rubric;
  apply demotions to `.ui-*` classes + templates; resolve the `card` collision
  per the answer to open question 3.
- **T8 — verify.** Crawl `/framework/` and `/notes/` (sandbox dirs error by
  design): no console errors, no failed requests, no horizontal overflow, at
  1600 / 900 / 400. Update `CLAUDE.md`'s map only if a path it names moved.

## Reviews

One independent Opus review per ui module, judged against the bar in
`ui/readme.md` (a function must carry logic a user shouldn't have to) and the
owner's stance (`.ui-*` classes over helpers; the markup is the deliverable).

| module | verdict | the one-line case |
|---|---|---|
| table | **KEEP** | two nested loops + the `width: max-content` shrink-wrap trap; and `.ui-table { width: 100% }` was measured-and-rejected for framework.css, so a module must exist to carry the class |
| crumbs | **DEMOTE-TO-TEMPLATE** | zero call sites; three hand-rolled crumb builders exist and none use it; a trail should derive from `chain()`, not typed tuples |
| pagination | **DEMOTE-TO-TEMPLATE** | the body IS the markup; zero call sites; `current` compared by string and `pick` receives `"prev"`/`"next"` unions — callers decode strings |
| card | **DEMOTE-TO-CSS (delete)** | one `div.c()` with five classes; zero call sites; `.ui-surface` duplicates `.surface` byte-for-byte; the readme's "panel/alert/tags wear it via card" claim is false |
| tags | **DEMOTE-TO-TEMPLATE** | inert markup (× has no listener, input no handler); first real use rewrites it; keep `.ui-tags-input` (the util-layer opt-out) in parts.js |
| alert | **DEMOTE-TO-TEMPLATE** | one `if (glyph)`; `alert("msg")` fails silently as a ligature; bare export shadows `window.alert`; keep the six border/icon CSS lines |
| badge | **DEMOTE-TO-CSS** | body is one `span.c()`; two call sites, both docs; `.ui-badge` + variant rules do the whole job, one import shorter |
| panel | **DEMOTE-TO-TEMPLATE** | three optional-by-position slots (`panel(null, body, foot)`); the one page that wanted a panel (versus/) wrote its own rather than import it |
| stats | **DEMOTE-TO-TEMPLATE** | zero call sites while THREE hand-rolled copies of the tile exist (sections `stat()`, versus/); its own page abandons the function to add an icon; merge with sections' `stat()` |
| tooltip | **DEMOTE-TO-CSS** | two spans in a span; the state/relationship needs a selector, not a function; bug found: bubble hardcodes `color: white` over `var(--bg)` |
| dialog | **DEMOTE-TO-CSS** | no listener, no unique name; the trap is CSS and the wrapper's own `.c()` re-arms it (classes land on `<dialog>` and beat the UA's closed-state `display:none`) |
| avatar | **DEMOTE-TO-CSS** | both exports are one-call passthroughs; the two real call sites (sections team/testimonials) become `span.c("ui-avatar", …)`; keep the circle/ring/sibling CSS; hardcoded `color: white` flagged |
| accordion | **DEMOTE-TO-TEMPLATE** | its whole logic is a counter minting a unique `name`; the two real FAQ builders hand-rolled raw `details` and chose NON-exclusive; a visible `name="faq"` literal beats an invisible counter |
| menu | **DEMOTE-TO-TEMPLATE** | one line of logic native `popover` supplies (plus light-dismiss and the clip cure); items can't take click handlers so its own showcase renders dead links; live name collision with ext/layout's `menu()` |
| kbd | **split: `keys` KEEP, `key` DEMOTE-TO-CSS, `shortcut` DEMOTE-TO-TEMPLATE** | the interleave loop is the module's only logic; `key()` wraps two class names; the site's one real key rendering uses bare `kbd("Ctrl")` |
| timeline | **SIMPLIFY** | the loop earns the function (1 real call site: sections changelog); but "last row" is a `:last-child` selector, not JS bookkeeping — 18 lines → 8 |

**The tally: 2 keep (table, keys), 1 simplify (timeline), 13 demote.** The
recurring evidence: zero real call sites almost everywhere, and where the site
actually needed the thing (versus/'s panel and stat tiles, both FAQs, the crumb
trails), the author wrote the markup by hand rather than import the helper —
the strongest possible argument that the markup IS the deliverable. Recurring
finds: dead `.ui-*` classes styled nowhere; hardcoded `white` twice; `alert`
shadows `window.alert`; `menu` collides with ext/layout's `menu()`.

## What shipped (same day)

Every task above executed; every agent verified its scope in a real browser at
1600/400 (most also 900), and a final independent crawl closed the session.

- **core/Page** — `preview(nav)` / `preview_card(nav, thumb)` / `preview_link(nav)`
  / `nav()`; `previews()` is pure arrangement and calls `preview()`; a live-thumb
  override is one line. Gallery's lessons (inert thumb, `::after` cover,
  `--thumb-min/max`, checkered floor, active-card marking) live in `Page.css`.
  Plus the `.page.grid align-content: start` fix (a 51px h1 had painted 229px).
- **ext/demo** — the stage is first-class (`stage.js`; corner zoom + width
  readout; `.ac("bleed")` for full-bleed); `demo.source()` / `demo.source.file()`
  are the closed-details source idiom; `demo()` call sites unchanged.
- **ext/layout** — `panel.js` + `controls.js`: click-to-select with hover
  outlines, contextual word chips + token knobs, a copyable `div.c("…")`
  readout, `layout.context(el, fn)` resolving from the nearest registered
  ancestor, Escape/✕/click-away/popstate dismissal, selection surviving
  consumer re-renders. The readme's "it's a DOM inspector" objection is
  formally overruled.
- **styles/layouts** — index + flex/grid on `previews()`; twelve inline-child
  leaf pages (`word.js`), every box panel-editable; `variant.js` deleted.
- **styles/sections** — fifteen inline object children (`catalogue.js`
  deleted); leaves render-first with the band full-bleed above the fold; tones
  are panel chips (`toned()`'s button row is gone).
- **ui** — index wall via `previews()` with nineteen one-line overrides; the
  review verdicts applied: `ui.js` exports **table, timeline, keys**; sixteen
  template pages with `copy()`; nine css-only modules; four `.js` files deleted
  outright; `.ui-surface`/`.ui-muted` died as byte-for-byte duplicates of
  `.surface`/`.muted`; three hardcoded-`white` bugs fixed for dark mode.
- **Page demos** — an eleven-card progression wall (six ideas about the tree,
  four about arrangement, one capstone) with the four arrangements built:
  wall, **catalog** (previews as a left nav rail beside a live detail region —
  `container()`'s second level, no new API), dashboard, strip.
- **Deleted:** `styles/gallery/`, `ui/renders.js`, `variant.js`,
  `catalogue.js`, thirteen ui exports. `/framework/report/` became
  `framework/ai/2026-08-08/`.
- **New trap recorded in CLAUDE.md:** a backtick inside a `` css(`…`) ``
  template literal (even in a CSS comment) kills every page on the site.

### Open, for a next session

- The region's own `v` / `h-center` chips are reachable from neither the bar
  nor the panel (ext/layout readme, Open).
- `/framework/ui/`'s rail: `.page-previews` is in `toc()`'s skip list, so the
  old reason for having no `toc()` dissolved — untested, deliberately not
  re-enabled.
- `sections/parts.js` `stat()` vs the stats template — the review suggested
  merging; left because two agents shared the tree.
- `demo.source` wants a string form on its third caller (layouts' `word.js`
  builds templates from strings and emits the details itself).
- Badge's `--ok`/`--warn` "four tones, not six" finding; zoom living in two
  places (demo bar + bare-stage corner); the core shelf items from 08-08 that
  this session didn't touch (View's zero-caller set, `description:` declared
  123× read 0×, Router `root()`→`scope()`, Sidebar's dead `$props`).

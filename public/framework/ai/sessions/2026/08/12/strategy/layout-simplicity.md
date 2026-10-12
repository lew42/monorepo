# Layout simplicity — strategy

**Lens: ruthless simplification of the layout/composition system.** Written 2026-08-12
from a deep read of `core/Page/{readme.md, Page.css, Page.class.js}`,
`core/View/readme.md`, `styles/readme.md`, `styles/layouts/{readme.md, layouts.css}`,
`core/Page/layout/{readme.md, detail.js}`, `ext/demo/readme.md` (all 20 sections),
`ext/Layout/readme.md`, `ext/catalog/readme.md`, `framework.css`, `app.js`, and
`ai/2026-08-09/proposal.md`. Every path below was verified against the tree today.

The underlying machine is **good** — `.page.standard`'s three tracks, the utility
vocabulary, one stage, one panel, one card are each singly-implemented and
well-reasoned. What makes the system impossible to hold in one head is everything
*around* the machine: four overlapping teaching tiers, ten demo entry points, three
exhibit factories, and a handful of words that each mean three or four things.

---

## Diagnosis — why the layout system is hard to understand

### 1. Four tiers teach layout, with overlapping demos and duplicate scaffolding

| tier | contents | scaffolding it owns |
|---|---|---|
| `core/Page/overview/` | 14 tree/arrangement demos (wall, catalog, dashboard, strip, …) | `demo.app()` trees |
| `core/Page/layout/` | 10 whole-page layouts (chat, dashboard, docs, document, feed, gallery, landing, mail, shell, split) | its own `detail.js`, its own `web.js`, `twin.js` |
| `styles/layouts/` | 8 worked layouts (cards, centered, **dashboard**, holy-grail, masthead, sidebar, **split**, stack) + flex/grid vocab + fit | its own `detail.js`, `word.js`, `preview.js`, `full.js` |
| `web/layout/` | guide pages (flex, grid, flow, tracks) | `tracks/` still hand-rolls its exhibit (`ext/demo/readme.md` §19.6) |

`dashboard` and `split` exist in **two** tiers; `shell` vs `sidebar` and
`docs`/`document` vs `stack`/`centered` are near-duplicates. A visitor (or Mike)
asking *"where do I learn page layout?"* has four answers, and the two big tiers are
one week old each. `core/Page/layout/readme.md` itself records the seams: two
unrelated `web()`s (its own §"Recommendation: two `web()`s") and a `detail.js` that
"extends `styles/layouts/detail.js`; it does not replace it".

### 2. The demo block fissioned into ten entry points

`ext/demo` alone exports `demo()`, `demo.stage()`, `demo.source()`,
`demo.source.file()`, `demo.responsive()`, `demo.app()`, `demo.page()`,
`demo.tree()`, plus `web()` — and `demo.exhibit()` is additionally wrapped by two
per-tier factories (`styles/layouts/detail.js`, `core/Page/layout/detail.js`).
Call-site counts today: `demo.page(` ×53, `demo.exhibit(` ×44, `demo.tree(` ×44.
The module is ~1,150 lines of JS + ~480 of CSS, and its readme is **969 lines with a
same-day reversal** (§17 merged the zoom controls; §20 unmerged them hours later).
A readme that long is the module confessing it has too many parts.

### 3. Word collisions — the same word, three to five meanings

- **layout** ×4: `styles/layouts/` (the catalog), `ext/Layout/` (the control panel),
  `core/Page/layout/` (the new tier), `core/Page/doc/layout.md` (the CSS record —
  its own readme flags the url collision `/core/Page/layout/` vs
  `/core/Page/docs/layout/`).
- **wide** ×4: the page track (`.page.standard > .wide`), the card span claim
  (`card: "wide"` → `grid-column: span 2`, Page.css), the class `demo()` applies to
  itself (§14), and `demo.responsive`'s wide pane.
- **pad** ×5: `.page.pad` (a page shape, 2 callers — `styles/layouts/cards`,
  `dashboard`), the `.pad` utility, `--pad`, `--page-pad`, `--demo-pad`.
- **web** ×2: `ext/demo/web.js` (a Page *tree*) vs `core/Page/layout/web.js`
  (page *content*).
- **detail** ×2 (three counting `exhibit.js`, which is what both wrap).
- **`ext/Layout`** is capitalized; CLAUDE.md, `ai/2026-08-09/proposal.md` and the
  memory files all spell it `ext/layout`. Windows dev doesn't care; case-sensitive
  static hosting and every reader do.

### 4. The arrangement contract is invisible and never throws

`.page:not(.active-page, .active-ancestor:has(...), .default) { display: none }`
(`Page.css` @layer util) means **any `.page` rendered outside the router chain
silently disappears**. Three modules independently carry the workaround
(`demo.app()`, `styles/layouts/detail.js` `frame()`, `core/Page/layout/detail.js`),
and `Router.mark()` compounds it by wiping marks **app-wide** on every navigation
(`core/Page/readme.md` Proposed §7, recommendation already written: scope the wipe).
This is the single biggest "renders nothing, nothing throws" trap in the system.

### 5. No single reference — the model lives in CSS comments and 300-line readmes

The whole layout model is genuinely small (see below), but it is currently
reconstructable only from `Page.css`'s warning comments, `core/Page/doc/layout.md`,
`styles/readme.md`'s ladder, and `framework.css`. There is no one page that states
it. That absence is what Mike is feeling.

### 6. The doctrine text itself is stale

- CLAUDE.md's five blocks name "**the gallery `card()`/`wall()`**" — deleted
  2026-08-09 (proposal decision 3; the block is now `Page.preview()`/`previews()`).
- `ext/Layout/readme.md`'s closing section proposes renaming
  `styles/layouts/Layout.js` → `Shape.js` — that file was **deleted 2026-08-12**
  (dissolved into `detail.js`, per `styles/layouts/readme.md` §REVERSED). The
  recommendation argues about a ghost.

---

## The smallest model

Seven sentences cover layout, nesting, and responsiveness. This is the target; every
move below deletes whatever stops these from being the whole truth.

1. **A page is three tracks:** `main | wide | bleed`. Every child sits in `main`
   (52em) unless it says `wide` (breakout) or `bleed` (edge to edge). One left edge;
   slack goes right. (`Page.css` `.page.standard`)
2. **Inside a track, arrange with the utility words** — `flex grid gap auto wrap
   basis measure pad surface wash muted zoom-*` (`framework.css`); a module's own
   CSS is layout-only and rare.
3. **Responsiveness is intrinsic** — tracks, `clamp`, `auto-fill`, `flex-wrap`.
   No `@media` in content, mobile to 3440. (Already true: zero `@media` in the
   layouts; the one exception is Page.css's card-span clamp.)
4. **A page declares `children:`**; a child mounts in the nearest `$pages` region
   (`container()`); the router marks the active chain.
5. **Anything shown without being routed to wears `default`** — that is the whole
   arrangement contract.
6. **Every child draws its own `preview()`**; a parent arranges them as a wall
   (`previews()`) or a rail (`catalog()`).
7. **A detail page is one `demo.exhibit()`** — stage + layout bar + definition;
   a quoted example inside prose is `demo()`.

Names a newcomer must know: `Page`, `children`, `$pages`, `default`,
`main/wide/bleed`, ~12 utility words, `preview/previews`, `catalog`, `demo`,
`exhibit`, `stage`, the panel. That fits in a head.

---

## The moves, prioritized

### Move 1 — Merge the layout-teaching tiers into one catalog

**What.** One layout catalog, at one url. Concretely:
- Fold `styles/layouts/`'s 8 worked layouts and `core/Page/layout/`'s 10 into a
  single set of ~10–12 (delete the duplicate `dashboard` and `split`; pick one of
  `sidebar`/`shell`, one of `stack`/`docs`-style). Keep the flex/grid vocabulary
  pages and `fit/` where they are — they teach words, not layouts.
- **Delete one `web()`**: keep `core/Page/layout/web.js` (content) and rename
  `ext/demo/web.js` → `tree()` (3 call sites, the cheap direction its own readme
  already names).
- **Delete both per-tier `detail.js` factories** by folding their deltas into
  `demo.exhibit()` config: `styles/layouts/detail.js` adds `preview()` + `frame()`;
  `core/Page/layout/detail.js` adds `parts:` + the two-up. `exhibit.js` grows
  `parts:` and a `stage: "two-up"` (or similar) key; the tiers become pure config.
- `web/layout/` survives as the prose guide tier, pointing into the one catalog;
  convert `/web/layout/tracks/` to the assembly (last hand-rolled exhibit, §19.6).

**Why.** This is the direct answer to "I'm struggling to understand the page layout
system" — the system is fine; there are four of it. **Effort:** 1–2 sessions (the
two detail.js files are ~160 lines combined; the page moves are mechanical; urls
change, so the parent `children:` lists and cross-links need one sweep).
**Risk:** medium — public urls move (Mike should bless the surviving tier's url);
mitigate with `route()` aliases if wanted.

### Move 2 — Shrink `ext/demo` to four doors and say so

**What.** The public surface becomes: `demo()` (quoted box), `demo.stage()` (bare
render), `demo.exhibit()` (THE detail page), `demo.app()` (a tree in a box).
- `demo.page()` and `demo.tree()` are already "two lines of config over exhibit"
  (§13, §15) — keep them as *documented sugar* or fold them into `exhibit` keys
  (`fn:` vs `tree:`); either way the readme and `ext/demo/page.js` present **four
  concepts, not ten**. (53 + 44 call sites make a hard rename expensive; presenting
  them as exhibit-config is free.)
- `demo.responsive()` becomes a stage mode (it already shares `simulate()`/`watch()`
  from `stage.js`), which deletes its private fullscreen — the site's stated goal of
  **one** fullscreen (§20) currently has an admitted exception.
- Give `demo.source()` its string form — the open item recorded **three times**
  (`styles/layouts/readme.md` §Open, `ai/2026-08-09` §Open, demo readme) — and
  delete `word.js`'s borrowed `.demo-source` hand-roll.
- Split the 969-line readme: current-state one-pager on top, history to `doc/`.

**Why.** Ten entry points is the 08-09 census disease regrown inside the block that
was supposed to cure it. **Effort:** 1 session. **Risk:** low — mostly presentation
and two mechanical folds; `demo.responsive`'s fold is the only real code.

### Move 3 — De-collide the words; publish the model as one page

**What.**
- Rename `ext/Layout/` → `ext/layout/` (matches CLAUDE.md, the proposals, and
  case-sensitive hosting; its collision partner `styles/layouts/Layout.js` is
  already dead). Delete the stale collision section from `ext/Layout/readme.md`.
- After Move 1, exactly one directory is named `layout`-anything per meaning:
  the catalog (`layouts/`), the panel (`ext/layout/`). Rename
  `core/Page/doc/layout.md` → `doc/css.md` (its readme already proposes this).
- Retire `.page.pad` (2 callers, both expressible as `full` + the `.pad` utility) —
  the shape vocabulary becomes `standard | full | fill`, three words.
- Rename the card span claim `card: "wide"` → `card: "two"` (or Mike's word) so
  `wide` means one thing: the page track. ~6 call sites found by grep.
- Write **one page** — `/framework/layout/` or the top of the merged catalog —
  stating the seven-sentence model with a word table. One screen, no history.

**Why.** Names are the API; every collision is a tax paid on every read. The
one-page model is also the employer-facing artifact Mike asked for. **Effort:**
half a session. **Risk:** low; the `ext/Layout` rename touches ~15 import sites
(grep verified) and is mechanical.

### Move 4 — Make the arrangement contract fail loudly

**What.** (a) Scope `Router.mark()`'s wipe to the chain it owns — the fix
`core/Page/readme.md` Proposed §7 already argues for. (b) Dev-only console warn
when a `.page` is appended and ends up `display: none` with no mark — one check in
`activate()`/`append` on localhost, so the third module to hit this trap gets a
sentence instead of a blank box.

**Why.** This trap cost three independent workarounds in one week and can never be
found by testing. **Effort:** small (both are <20 lines). **Risk:** low; (a) is
the same "only what changed" discipline `activate()` already follows.

### Move 5 — Delete the shipped dead weight

**What.** `public/` is the deploy artifact; today it ships:
- `core/new/` — **2.8MB** of proving-ground sketches (`new/0/`, `new/1/`,
  `new/starter/`). Keep `new/1/readme.md` (the design record CLAUDE.md points at)
  by moving it to `core/doc/`; delete or move the rest out of `public/`.
- `core/legacy/` — 141KB of dead Pager tier, kept only as an `instanceof` footgun
  (`framework/readme.md` Traps).
- `framework/ai/` — 254KB of agent session logs. Conclusions worth keeping
  (e.g. `2026-08-09/proposal.md`) move to `framework/doc/`; process transcripts
  move out of `public/` per CLAUDE.md's own scratch-work rule. An employer clicking
  around /framework/ should not land in orchestration briefs.
- Execute the already-written zero-caller deletions: `View`'s §1 list
  (`compute/replace/prepend/prepend_to/meta_path`, then `off/repeat/clone` with the
  sandbox-page fix), `Page.go()`. All pre-argued in the readmes' Proposed sections;
  grep sandboxes first, alias on the way out.

**Why.** Half of "the mess" is simply mass that isn't the framework. Deleting it
changes zero behavior and shrinks the deploy by ~3MB. **Effort:** small.
**Risk:** low — nothing may import `new/`/`legacy/` by rule; verify with grep;
the ai/ move wants Mike's word since the daily-log convention is his.

---

## The five-block doctrine — judged

**Verdict: directionally honored, textually stale, and fissioning at one block.**
- *Page as the demo unit* — honored (inline object children everywhere).
- *One preview* — honored in code (`preview()`/`previews()`, one card shape,
  `catalog()` reuses it) — but CLAUDE.md still names the deleted `card()`/`wall()`.
  **Fix the doctrine text.** `styles/layouts/preview.js`'s `shape()` survives
  legitimately as a thumb renderer inside cards (allowed by the census).
- *One stage* — honored (`stage.js` is the only implementation; even the two-up
  cards import `simulate()`/`watch()` from it). Exception: `demo.responsive`'s
  private fullscreen (Move 2).
- *One control surface* — honored (`ext/Layout` panel + `layout.context()`;
  sections' tones and layout `parts:` both ride it).
- *Utility vocabulary* — honored (`ui.js` is down to 3 functions).
- **The violation is scaffolding multiplication around the demo block**: three
  exhibit factories, two `web()`s, ten entry points, one hand-rolled exhibit
  (`/web/layout/tracks/`). Enforcing the doctrine deletes: both per-tier
  `detail.js` files, one `web()`, `demo.responsive`'s fullscreen, and the tracks
  hand-roll — Moves 1 and 2 exactly.

## Suggested order

Move 3's doctrine-text fixes and Move 5's deletions are safe immediately. Move 4 is
small and unblocks demo work. Move 1 is the big win and wants Mike's word on which
urls survive; Move 2 rides along with it. Moves 1–3 together take the layout story
from four tiers, ten doors and five meanings of "pad" down to: one catalog, four
doors, seven sentences.

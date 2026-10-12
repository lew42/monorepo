# Layout census — overnight campaign

Read-only inventory for the layout-overnight direction pass. Sources: brief
(`requirements.md`), `CLAUDE.md`, `.claude/skills/layout-design/SKILL.md`, and
every file listed below. `styles/layouts/space` was read, never edited.

## 1. Asset table

| asset | path | url | state | offers a width-based library |
|---|---|---|---|---|
| Layouts catalog (index) | `styles/layouts/page.js` | `/framework/styles/layouts/` | shipped | rail+nav for a "twelve whole-page layouts" catalog — the obvious home for a new tier |
| 12 documented whole-page layouts | `styles/layouts/{document,docs,landing,stack,shell,dashboard,split,gallery,sidebar,feed,mail,chat}/` | `/framework/styles/layouts/<name>/` | shipped | each teaches one composition lesson at real size on a draggable stage, twin card (phone+monitor) |
| 4 undocumented layouts | `styles/layouts/{carousel,hero,overlay,pricing}/` | `/framework/styles/layouts/<name>/` | shipped, **not in readme's table** | Figma-derived; `hero`'s own comment names the exact 400/800/1920 breakpoints it replaces with one flex word — closest thing on site to "this already is width-tiered" |
| `fit` (page shapes) | `styles/layouts/fit/page.js` | `/framework/styles/layouts/fit/` | shipped | the 3 page-shape words (`standard`/`full`/`fill`) — the actual contract every page starts from |
| `flex` (9 words) | `styles/layouts/flex/page.js` | `/framework/styles/layouts/flex/` | shipped | row, gap, v, v-center, split, auto, basis, wrap, three — copy-paste class strings, width-agnostic by design |
| `grid` (3 words) | `styles/layouts/grid/page.js` | `/framework/styles/layouts/grid/` | shipped | stack, auto, three |
| **`space`** (generator) | `styles/layouts/space/{gen,ruler,spec}.js` | `/framework/styles/layouts/space/` | shipped lab, **READ-ONLY** | seed→text→layout; 2 families (`rails`, `bands`); `bands()` output is already a single fluid column of full-width sections — closest thing to "400px-first, generated" |
| `space/ruler.js` | same dir | — | shipped | renders one spec at 5 screens at once: **390×844, 720×1024, 1280×800, 1920×1080, 3440×1440** — note: 390, not 400 |
| `word.js` (inline child pages) | `styles/layouts/word.js` | n/a (mechanism) | shipped | one class string as a live, selectable stage page — the leaf shape a width-tiered entry would reuse |
| `styles/sections/` (15 bands) | `styles/sections/*.js` | `/framework/styles/sections/` | shipped | content-filled layout bands (hero, features, pricing, stats, team, changelog, contact…), each reflows with zero extra CSS, 4-tone rotation |
| `styles/rules/` (5 doctrine pages) | `styles/rules/*` | `/framework/styles/rules/` | shipped | Cascade/Nesting/Proportion/Robust/Reuse, each with a live demo LayoutTool measures as it renders |
| `framework.css` utilities | `framework.css` | n/a (loaded everywhere) | shipped | the actual vocabulary: `.flex`, `.flex.auto`/`.basis`/`.flex-1`, `.grid.auto`/`.grid.three`, `.measure`(`.start`), `--column`/`--gap`/`--basis` tokens |
| `core/Page/Page.css` `.page.standard` | `core/Page/Page.css` | n/a (core) | shipped | the width contract every page inherits: 5-track grid, `--measure: 52em`, one left edge, wide/bleed breakout |
| `core/Page` previews/cards | `core/Page/Page.css`, `Page.class.js` | n/a (core) | shipped | `--column: 14em` auto-fill wall + `.two`/`.tall`/`.big` card sizes — the browsing grid a new library would reuse per RULE#7 |
| `core/Page/overview/` | `core/Page/overview/` | `/framework/core/Page/overview/` | shipped | 14 live trees (6 building, 5 arranging, 3 whole sites), half-size cards, click-through record of the pattern |
| **ext/Panel** | `ext/Panel/*` | `/framework/ext/Panel/` | shipped, uncommitted | recursive divide/hug/fill workspace; `T` vocabulary includes `space` (draws a generated layout as a picture) and `structure(seed)` (translates a spec into real, editable panels) |
| `ext/Panel/generate.js` | same | n/a (internal) | shipped | `generate()` paints a seed; `structure(seed)` builds a real panel tree from one — the only code that turns a `space` address into something draggable |
| **ext/LayoutTool** | `ext/LayoutTool/*` | `/framework/ext/LayoutTool/` | shipped | `analyze()`/`frame()`/`sweep()` — reads the DOM, scores 0–100, no AI at runtime |
| `LayoutTool/library/` (11 patterns) | `library/patterns.js` | `/framework/ext/LayoutTool/library/` | shipped | reading column, reading grid, tile wall, gallery, stat strip, rail+content, list·detail, section band, dashboard row, wide table, toolbar — each measured live at 400/1280/1920/3440 |
| `LayoutTool/library/bad/` (10 traps) | `library/bad/traps.js` | `/framework/ext/LayoutTool/library/bad/` | shipped | fixed-track wall, prose w/ no ceiling, stacked forever, rail that never wraps, scroller-in-wrapping-row, chosen height, unbreakable child, pixel padding, band w/ no gutter, table w/ no scroller — each names the width it breaks at and its library replacement |
| `LayoutTool/knowledge/` (9 files) | `knowledge/*.md` | `/framework/ext/LayoutTool/knowledge/` | shipped | the doctrine behind every rule: bounds, widescreen, characters-per-line, responsive, thresholds, ratios, alignment-vs-padding, blind-spots, false-positives |
| `LayoutTool/tests/` (23 cases) | `tests/cases.js` | `/framework/ext/LayoutTool/tests/` | shipped | ground-truth corpus; detection only, no severity band asserted (Open) |
| `LayoutTool/audit/` | `audit/*` | `/framework/ext/LayoutTool/audit/` | shipped | whole site ranked worst-first + before/after twin frames; `findings.json` generated baseline (232 runs), `pages.js` hand-typed and drifts (Open) |
| `ext/demo` (stage) | `ext/demo/*` | `/framework/ext/demo/` | shipped | the one resizable/draggable viewport (RULE#7) — `simulate()` renders at any width with no real breakpoint |
| `ext/catalog` | `ext/catalog/*` | `/framework/ext/catalog/` | shipped | `previews()` rail + `$pages` region — "browse while reading," the arrangement a library index would want |
| `ext/layout` (control surface) | `ext/layout/*` | `/framework/ext/layout/` | shipped | click-to-select bar + push-drawer; live knobs for mode/gap/column/radius/etc — RULE#7's one interactive control surface |
| `.claude/skills/layout-design` | `.claude/skills/layout-design/SKILL.md` | n/a | doctrine | 3 sizing questions, 400/1280/1920/3440 check, floor+ceiling rule, points at `LayoutTool/library/` as "copy an entry before inventing one" |
| Sandbox mirrors (no distinct work) | `michael/layout/`, `edric/style/layout/`, `alex/styles/{flex,grid}/`, `arya/styles/{flex,grid}/` | n/a | personal | copies of the flex/grid vocabulary pages, nothing novel found |

## 2. "400px today"

- No page or spec on the site currently targets **exactly 400px**. The nearest
  standard is `space/ruler.js`'s `SCREENS[0] = [390, 844]`; the skill's own
  "check four widths" language says 400. That 10px gap is real and unexplained.
- `styles/layouts/space/gen.js`'s `bands()` family already emits mobile-shaped
  output by construction: `full fill flex v` → hero → 1–3 stacked full-width
  sections. It is a generator output, not an authored, named entry.
- `core/Page/Page.css` `.page.standard`'s main track is `min(52em, 100% -
  gutters)` — collapses to one column with no media query, by the same
  floor/ceiling technique the skill teaches. This is the *default* every page
  gets, not a mobile-specific mode.
- `framework.css` `.flex.wrap`, `.grid.auto` (`minmax(min(--column,100%),1fr)`)
  and `.measure` all degrade to one column under their own bounds — no
  breakpoint written anywhere.
- `LayoutTool/library/` entries are each measured live at 400 (among the four
  widths) and several — reading column, toolbar cluster, section band — read
  as intentionally single-column-first.
- `ext/Panel`'s workspace has a known floor problem below ~146–200px (hug
  clips under 16em, template picker stops fitting below ~146px) — the one
  place "does this survive 400" has an open, measured failure.
- Nothing on the site is *organized* by width tier today. All twenty
  `styles/layouts/` entries are organized by lesson (regions, rhythm,
  overlays), not by "starts at 400, here's what it does at 1920/3440."

## 3. Possibilities (the chaos — one line each, evidence path)

- Promote `space`'s `bands()` family into a named, authored width-tiered
  library entry — it already renders single-column-first.
  `public/framework/styles/layouts/space/gen.js`
- Treat `LayoutTool/library/`'s 11 entries as the literal seed of the new
  library — already measured at all four widths, already a catalog.
  `public/framework/ext/LayoutTool/library/patterns.js`
- Use `ext/Panel`'s `structure(seed, width)` idea (named "if ever wanted" in
  the reflow decision) as the mechanism for one seed to produce
  width-appropriate panel trees.
  `public/framework/ext/Panel/readme.md` (§ "A split holds its axis at every width")
- Ship the width library as nothing but the existing `fit`/`flex`/`grid`
  vocabulary, re-catalogued by width instead of by word — needs no new CSS,
  RULE#6's "write as little CSS as possible" made literal.
  `public/framework/styles/layouts/{fit,flex,grid}/page.js`
- Build new entries as content-filled `styles/sections/` bands rather than
  bare layouts — the sections folder already proved "layout + real content"
  is the crossing worth having.
  `public/framework/styles/sections/readme.md`
- Extend `gen.js` with a third family (overlays, splits, three-pane) — the
  generator's own readme flags this as open and currently unreachable by seed.
  `public/framework/styles/layouts/space/readme.md` (§ "Open — phase 2")
- Wire `sweep()` into every new library entry as a ship gate ("does this hold
  400→3440 with no chosen breakpoint") — currently console/tests-only.
  `public/framework/ext/LayoutTool/readme.md` (§ Open, `sweep()` not wired into audit/library)
- Make the width library editable, not just browsable, by exposing it as
  `ext/Panel` `T` vocabulary — `panel(seed)` already embeds one live layout on
  the homepage today.
  `public/framework/ext/Panel/readme.md` (§ "Who uses this")
- Reuse `core/Page` `previews()`/`--column: 14em` wall as the index UI for the
  new library itself — the demo system RULE#7 already mandates, so no new
  gallery gets invented.
  `public/framework/core/Page/Page.css` (`.page-previews`)
- Fold the 4 undocumented layouts (`carousel`, `hero`, `overlay`, `pricing`)
  into the width-based tier first — their own inline notes already name the
  exact 400/800/1920 breakpoints (from the Figma spec) that one flex/grid word
  replaced.
  `public/framework/styles/layouts/hero/page.js` (top comment)
- Use `ext/layout`'s live knob bar (`mode`, `gap`, `column`, `radius`) as the
  "how does 400 become 1920" interactive demo — turn a static catalog card
  into something a reader drags.
  `public/framework/ext/layout/readme.md`
- Score the *existing* 20 `styles/layouts/` pages with `LayoutTool` at 400
  specifically (not 390) before writing anything new — several may already
  qualify as width-tiered and just be mis-catalogued.
  `public/framework/ext/LayoutTool/LayoutTool.js` (`frame(url, 400)`)

## 4. Open questions for direction

1. Is the width library a **new top-level tier** (like `space` got its own
   tier beside the 12) or new entries folded into `styles/layouts/`?
2. "400px-first" — does that mean the site standardizes on literal 400, or
   does `space/ruler.js`'s existing 390 win by precedent? The skill says 400,
   the shipped ruler says 390.
3. Home for the catalog: `ext/LayoutTool/library/` (already measured, already
   a catalog, but named "what an author should write," not "the library") or
   `styles/layouts/` (RULE#7's actual home for shipped, browsable things)?
4. Is inventing new `gen.js` families (overlay/split/three-pane) in scope for
   this campaign, or does the width library stand on the two families that
   already exist?
5. Does `structure(seed, width)` — one seed, width-aware output — get built
   now, or does the library stay "one tree that reflows," which is the
   verdict `ext/Panel/readme.md` already recorded?
6. Build minions are additive-only per the brief's fences — does that rule out
   fixing the 4 undocumented layouts' readme gap, or is that housekeeping
   allowed alongside new entries?
7. Should new width-tiered entries be bare layouts (grey boxes, like
   `styles/layouts/`) or content-filled bands (like `styles/sections/`)? The
   brief's own phrasing ("What can we do with 400px?") reads content-first.
8. Who is the library FOR — a human copying a class string (`space`'s stated
   audience) or a Panel `T` template a user drags in? Different UIs follow.
9. Does the direction pass get to retune existing `styles/layouts/` /
   `framework.css` entries where `LayoutTool` already found a bound missing,
   or is that a separate, later cleanup?
10. Four documented "don'ts" in `library/bad/` are about width bounds
    specifically (fixed-track wall, prose w/ no ceiling, stacked forever,
    rail that never wraps) — should the new library's entries be required to
    cite which don't they replace, the way `library/bad/` already cites its
    replacement?

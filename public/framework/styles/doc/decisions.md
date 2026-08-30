# Styles — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

The strategy in one line: **`framework.css` should contain nothing you would ever
want to override.** Everything downstream is arranged so the cheapest way to build
something new is to write no CSS at all.

## The ladder — stop at the first rung that works

1. **Nothing.** The default already handles it.
2. **A utility class** — `flex gap v-center pad h2`, `surface`, `wash`, `muted`, `measure`.
3. **An existing component's class** — `.page-preview`, `.sidebar-link`.
4. **The module's own `.css` — layout only.** Where things sit, how they size. Not
   colour, not borders, not type. The test: *would this rule still be right if the
   component were dropped into a completely different site?*
5. **`/styles.css` — skin.** This site's opinion, loaded last.

**If you ever override a `framework.css` rule, that is a bug report about
`framework.css`.** Never escalate downstream — de-escalate upstream.

## The four things that fail silently

- **The `@layer` order is declared once, in `framework.css`** — `app.js` puts it
  first in `<head>` (2026-08-17; before that every stylesheet restated it). A rule
  just names its layer; a name outside the four is appended at the *end*, past
  `util`, with no warning. A hand-written html file links `/framework/framework.css`
  first (`fly/index.html`) or has no fixed order.
- **Every rule lives inside a layer.** An unlayered rule beats every layer at any
  specificity.
- **Base-theme selectors stay flat** — one element, no descendant combinators, or
  a theme's `h2` can never win.
- **Never invent a font-size.** Six levels, each also a class. Margins are rhythm
  and belong to whatever arranges the content.

## Recent, and worth knowing

**Three looks became classes.** `.surface`, `.wash` and `.muted` are in
`framework.css @layer theme` — the same three token-valued style objects every
card, band and caption in `styles/` used to spread inline from `styles/parts.js`.
`.surface` sets `color` on purpose: a box that paints its own fill owns its own
ink, or a card on a coloured band renders white on white. `parts.js` still exports
the objects, though their outside consumers are gone (`framework/report/` is now
`framework/ai/2026-08-08/` and wears the class; `framework/ui/` grew its own).

**`.measure` closed a gap this file had listed as open twice.** A centred column —
`--measure: 34em; max-width: var(--measure); margin-inline: auto` — could not be
spelled with utilities, because `margin-inline: auto` is dead inside a flex
container (`.flex > * { margin: 0 }` is in `util` and beat any component rule).
The class is declared **after** that rule in the same layer, so it wins, and
`layouts/`'s `.layout-measure` is retired. It *declares* `--measure` rather than
reading the region's, so a 34em block inside a 60em sheet is 34em; override it
inline and the inline value wins.

**`.flex.auto > *` gained `min-width: 0`**, which `.flex-1` and `.basis` have
always carried. Without it one `<pre>` or one long word floors a flexible track at
its min-content and pushes the row wider than its container.

## The long form

Reference you open when you get there, not context to pay for every session:

| | |
|---|---|
| [`doc/ownership.md`](ownership.md) | the ladder in full, class-vs-function, and the CSS dependency a module can't declare |
| [`doc/cascade.md`](cascade.md) | the escalation ratchet, the `site` layer, `:where()` tried-reverted-then-vindicated, versioned CSS (rejected), native mixins |
| [`doc/theme.md`](theme.md) | `@layer theme` **is** the base theme; the type scale; tokens; dark mode; the contrast pass |
| [`doc/audits.md`](audits.md) | the eviction list, `table { width: 100% }` rejected with measurements, the six-urls-two-widths pass, why there is no `--region-gutter` |
| [`doc/scrolling.md`](scrolling.md) | app shell vs document scroll, which region scrolls, one painted box |
| [`doc/measure.md`](measure.md) | `--measure: 52em` measured against 34/40/46em and a `ch`-based value — the token's real page-median, what a narrower column costs at 3440, and who would break. Proposal only; the token is unchanged |

Per-module records sit next to their code: [`layouts/readme.md`](layouts/readme.md),
[`sections/readme.md`](sections/readme.md), [`elements/readme.md`](elements/readme.md),
[`layers/theme/guide/readme.md`](layers/theme/guide/readme.md),
[`layers/theme/lew42/readme.md`](layers/theme/lew42/readme.md).
The preview card is core's (Aug 2026), and so is the `wide`-not-`bleed` decision
it carried — `previews()` picks the track, which is why [`doc/audits.md`](audits.md)
§6b calls that guard structural.

## Who uses this

Not a leaf module — the two token-and-layer files (`framework.css`, this
directory's `layers/theme/lew42/lew42.css`) back every page on the site, and
several modules import this directory's *content* directly rather than only
linking to it:

- **`/app.js`** imports `layers/theme/lew42/lew42.js` and calls it in
  `config()` — the house theme is wired site-wide from here, not opted into
  per page.
- **`core/Page/old/overview/landing/page.js`** and **`old/overview/site/page.js`**
  import section-band functions from `sections/*.js` (`hero`, `features`,
  `pricing`, `footer`, `contact`, `logos`, `faq`, `callout`, `team`) directly,
  to compose Page's own "what a real site looks like" demos.
  `core/Page/old/flow/page.js` and `core/Page/page.js` link to `layouts/fit/` and
  `layouts/` as the canonical next reads for rhythm and whole-page shape.
- **`ext/Panel/templates.js`** dynamically `import()`s every file in
  `sections/` by name, at runtime, to build the **T** template menu — the one
  consumer that imports this directory's files *by string*, so a section
  rename here is silent there (`ext/Panel/doc/templates.md`).
- **`ext/DesignTool/audit/pages.js`** lists roughly thirty urls under
  `/framework/styles/` in the corpus it sweeps at four widths — this is the
  module most exercised by that tool, and `rules/demos.js` calls
  `analyze()` directly to grade its own live examples.
- **`ext/catalog`, `ext/demo`, `ext/layout`, `ext/toc`** all cite pages here
  (`sections/`, `layouts/`, `elements/forms/`, `layers/util/`) as the primary
  worked examples in their own readmes and doc pages.
- **`framework/ui/`** (`avatar`, `card`, `crumbs`, `kbd`, `stats`, `tooltip`)
  and **`web/layout/*`** (the guide tier) each link back here for the
  reference behind a decision they made.
- **`core/Sidebar`** links `/framework/styles/` from the site's own nav, and
  its readme cites two pages here (`layers/theme/lew42/`, `layouts/sidebar/`)
  as the live demos its own doc page points at.

One stale link, found while tracing these: `core/Page/old/overview/landing/`
(via `framework/ai/2026-08-12/unify/page.js`) links
`/framework/styles/layouts/cards/`, a directory this module's own readme
records as deleted in the 2026-08-12 merge. Outside this directory's fence to
fix; noted in the audit report.

## Open

- **`app.css_audit()`** — a dev-only styled-vs-applied class diff. ~30 lines,
  catches renames in both directions, still unbuilt (`ownership.md`).
- **`:root { color-scheme: light }`** stands on purpose. The work that had to be
  true first is true, so flipping it is one word — but it changes what every
  visitor sees and wants a visual pass (`theme.md`).
- **`Page.css`'s hover `box-shadow: rgba(0,0,0,0.08)`** and `/styles.css`'s
  `body.theme-1` block are the last two colours with no token behind them.

## 2026-08-18 — two vocabulary gaps the Figma pilot found

Both are additive, both keep every existing caller byte-identical, and both were made by the
mastermind rather than proposed, because each blocked work already in flight. Reversible in one line.

**`.tint` — a token whose class was missing.** `--tint` has existed since the token block and is
read by `th` and the checkerboard, but there was no `.tint` rule while `.wash` had one. So
`div.c("… tint")` painted nothing and threw nothing; the `wire` pilot shipped eight invisible
wireframes before a probe read `rgba(0, 0, 0, 0)` on every box. Nothing in the repo used `tint` as
a class, so adding `.tint { background: var(--tint) }` cannot change an existing render. **The
general lesson is bigger than the fix: a token without its class is a trap that never throws.**

**`--grow` on `.flex.auto > *`.** No word in the framework could make a fluid track twice its
neighbour — `.flex.auto`, `.all-1`, `.three`, `.flex-1` and `.basis` all set `flex-grow: 1`, so
free space always split evenly. Two of the pilot's eight layouts needed a 2:1 seam and shipped an
inline `flex: 2 1 30em`, which the `css` skill forbids for a static value. The zero-CSS workaround
(a per-child `--column` under `flex auto`) works but **decays: 2.00 → 1.45 → 1.30 → 1.17** at
400/1280/1920/3440 — measured in [`layouts/wire/doc/bento.md`](/framework/styles/layouts/wire/doc/bento.md).
`flex: var(--grow, 1) 1 var(--column)` defaults to today's behaviour exactly.

⚠ **Open for the owner:** `--grow` is API surface forever ("an option is API surface forever",
`code` skill §3). If the name is wrong, now is the cheapest moment to change it — one line and
the callers in `styles/layouts/`.

### 2026-08-18, same night — `--grow` shipped false, corrected

The first `--grow` was `flex: var(--grow, 1) 1 var(--column)` and its comment claimed "a fluid
track twice its neighbour". **It was not.** `flex-grow` divides only the *free* space, and with both
tracks sharing one `--column` basis the measured ratio was **1.58 / 1.69 / 1.80** at 1280 / 1920 /
3440 — wrong, and drifting with width. Scaling the basis by the same factor —
`flex: var(--grow, 1) 1 calc(var(--column) * var(--grow, 1))` — holds exactly **2.00** at all three.

Found by the homepage minion hours after the mastermind shipped it, and it is the sharper version of
the same lesson as `.tint`: **the defect was in the sentence, not the syntax.** Nothing threw, the
page looked plausible, and only a measured ratio caught it. Default is still 1, so every caller that
does not set `--grow` remains byte-identical.

### `fill` is a claim that a layout fits one screen — 2026-08-18

The homepage shipped as `page full fill flex v`, copied from `landing`/`document`/`shell`, and its
middle region collapsed to **4549px of content inside a 284px box (16.0x)** at 1440 — nav, a
truncated hero, then the footer, with seven bands present in the DOM and invisible. Fixed to
`page full flex v`: **16.0x → 1.0x**, all ten bands reachable, verified at 400/1280/1440/1920/3440.

**The rule:** `fill` takes the region's height and hands the scroll to one designated pane. That is
right for an application shell — `shell`, `mail`, `chat`, `dashboard`, `split` — where the chrome is
fixed and the reader expects one pane to move. A **document** is taller than the viewport by design,
its footer is the end of the content and not a pinned bar, and the whole page should scroll.

⚠ **Open, `questions.md` #15:** `landing`, `document`, `docs` and `stack` all wear `fill` today and
none is broken — *because none holds enough content to collapse*. Each is one longer demo away from
this defect. Four working layouts were deliberately not changed by the minion that found this.

**Two measurement traps this exposed**, both now in `.claude/skills/layout/improvements.md`:
`scrollWidth === clientWidth` is horizontal only and cannot see a vertical collapse; and
`fullPage: true` is blind here because `.page.layout-full` is `position: fixed; inset: 0;
overflow: auto`, so the document is always exactly one viewport tall.

### Floors are opaque; fills are alpha — 2026-08-30

`framework.css` paints `.btn, button` and `.surface` from the **same token**, so a default
button on a card is a zero-delta fill — and lew42 sets `border: none` on every button at
(0,1,1), beating framework.css's hairline at (0,1,0), so nothing is left to rescue it. A
headless pass over 76 pages read 3,598 fills and found **101 distinct invisible pairs (504
elements)** on 29 pages, every one of the top ten at exactly ΔL\* 0.00.

**The rule:** a *floor* is painted on the canvas and stays opaque (a translucent `--wash`
composites over the browser's white and dark mode renders pale — `lew42.css` marks all three
`⚠ OPAQUE`). A *fill* is always painted **on** a floor and goes alpha, because a transparent
fill does not have to guess which floor it will land on: it is *n* steps from whatever is
underneath, on every floor, in both modes.

Three modules had already found this alone and each patched it locally — `blog.css` gave up
on filled chips and went outlined, `imagine.css` hovers with `color-mix(in srgb, var(--ink)
6%, transparent)`, `framework.css` bolted an inset ring onto inline `code`. The ladder is
the general form of the fix all three wrote by hand.

**Not done:** no token was flipped. The ladder lives on `.stacks-lab` in
[`stacks/stacks.css`](/framework/styles/stacks/stacks.css); the flip is two lines of
`framework.css` and its own wave. The bill and the fix list are in
[`doc/stacking.md`](./stacking.md); the lab is [`/framework/styles/stacks/`](/framework/styles/stacks/).

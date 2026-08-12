# Styles — design record

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

- **Every stylesheet restates `@layer base, theme, site, util;` in full.** The
  first `@layer` statement fixes the order and a name first seen later is appended
  at the *end*, so one short list drops `site` past `util` with no warning.
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
| [`doc/ownership.md`](doc/ownership.md) | the ladder in full, class-vs-function, and the CSS dependency a module can't declare |
| [`doc/cascade.md`](doc/cascade.md) | the escalation ratchet, the `site` layer, `:where()` tried-reverted-then-vindicated, versioned CSS (rejected), native mixins |
| [`doc/theme.md`](doc/theme.md) | `@layer theme` **is** the base theme; the type scale; tokens; dark mode; the contrast pass |
| [`doc/audits.md`](doc/audits.md) | the eviction list, `table { width: 100% }` rejected with measurements, the six-urls-two-widths pass, why there is no `--region-gutter` |
| [`doc/scrolling.md`](doc/scrolling.md) | app shell vs document scroll, which region scrolls, one painted box |

Per-module records sit next to their code: [`layouts/readme.md`](layouts/readme.md),
[`sections/readme.md`](sections/readme.md), [`elements/readme.md`](elements/readme.md),
[`layers/theme/guide/readme.md`](layers/theme/guide/readme.md),
[`layers/theme/lew42/readme.md`](layers/theme/lew42/readme.md).
The preview card is core's (Aug 2026), and so is the `wide`-not-`bleed` decision
it carried — `previews()` picks the track, which is why [`doc/audits.md`](doc/audits.md)
§6b calls that guard structural.

## Open

- **`app.css_audit()`** — a dev-only styled-vs-applied class diff. ~30 lines,
  catches renames in both directions, still unbuilt (`doc/ownership.md`).
- **`:root { color-scheme: light }`** stands on purpose. The work that had to be
  true first is true, so flipping it is one word — but it changes what every
  visitor sees and wants a visual pass (`doc/theme.md`).
- **`Page.css`'s hover `box-shadow: rgba(0,0,0,0.08)`** and `/styles.css`'s
  `body.theme-1` block are the last two colours with no token behind them.

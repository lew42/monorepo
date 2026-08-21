# Templates — the T vocabulary

Twenty-eight entries in one object, `name → { icon, tone?, draw($body, panel) }`
(`templates.js`). `draw` runs with the captor already on `$body`, which is why
a lazy import appends **a promise resolving to a function**, never a view:

```js
$body.append(import(url).then(m => () => m.default(tone)));
```

A section module builds with bare `div.c(...)`, so resolving to the view
would append it wherever the microtask's captor happened to be. The function
form routes through `append_fn`, which re-establishes `$body` — the whole
reason there is no `await` anywhere in the file.

## Five families

**Eight experiences** — `blank word wall clock haze aurora drift depth`. Each
paints in `%` of its own box and types in `em`, so it is the same drawing from a
phone sliver to a mega monitor. All eight also wear **`.panel-t-scene`**: they
have nothing to measure, so they declare their own floor (below).

**Fifteen section adapters**, one per band in `/framework/styles/sections/`,
each lazy-importing that module and rendering `default(tone)`. Icons are the
ones `styles/sections/page.js` already gives each band, so the T menu and the
sections wall read the same. `tone: true` marks the sixteen entries that read
`panel.get("tone")` — `haze` and all fifteen sections.

**One generator** — `space` — which draws a whole *generated* page rather than
a fixed one, keeps its seed on `panel.data.seed`, and is the only entry with a
file of its own (`generate.js`): [the layout generator](./generator.md).

**Three pieces of furniture** — `rail`, `toc`, `brand` — the only entries here
that exist because something asked for them: the spec parts `structure(seed)`
translates that no marketing band covers. Text at a fixed word count, so their
`em` size is derived from the widest line rather than guessed:
[the layout generator](./generator.md).

**One control surface** — `properties` — which reads the workspace instead of
drawing content: the focused panel's words as live chips, and the second entry
with a file of its own (`properties.js`): [focus](./focus.md).

## Three sizing rules (2026-08-19 — no containers anywhere)

- **The body gives the template a row to fill.** `.panel-body` is
  `display: grid; grid-auto-rows: min-content`, so a percentage height has
  nothing to resolve against — every scene with no text (`blank`, `aurora`,
  `drift`, `depth`) measured 0px and was invisible in a real panel while passing
  a standalone harness. `panel.css`'s `.panel-body:has(> .panel-t)` states
  `grid-template-rows: 100%`, and `.panel-t` takes `block-size: 100%` of it.
- **A HUGGING panel has no row to give**, because the panel measures what it
  holds now ([sizing](./sizing.md)) — so 100% falls back to the content, which is
  right for anything with content and zero for a scene. That is what
  **`.panel-t-scene`** is for: `templates.js` puts it on all eight experiences,
  and `templates.css` gives them **16em on the hugging axis only** (a filling
  panel's scene takes the slot; a floor there would only push past it).
- **What paints is `%`, what types is `em`.** A gradient extent, a gap, a pad, a
  `background-size` is a fraction of the same box a `cq` unit read. A type size is
  a plain `em`, so a template reads at the panel's own text size — scaling a whole
  page down to fit a box is `zoom` on a viewport now, done once for everything,
  which is what the Workspace is for.
  ⚠ Two properties may not take a percentage at all and became `em` instead:
  `filter: blur()` (aurora) and `perspective` (depth). A `circle` gradient's
  radius may not either, so drift's stars stayed the px they already were.

**No `cq` unit appears inside a `@keyframes`** — animations move in `%`,
`opacity` or `perspective-origin`. That was already true, and now it is true of
the whole file.

## Colour, on purpose

`word`, `wall`, `clock` and `blank` are transparent and read only `--ink` /
`--prim` / `--subtle`, so they inherit the panel's surface tone for free.
`haze` is tone-aware, built from `--prim` / `--surface` mixes over the tone.
`aurora`, `drift` and `depth` paint **literal deep colours**
(`#0b0a14`, `#05060d`, `#07060f → #1a1136`, plus a blue and a violet in
`aurora`) and are **identical in light and dark on purpose** — a night sky
that inverts with the OS theme is not a night sky. Their accents still come
from `--prim`, so a theme swap retints them.

## `wall` is two columns, full stop

Four tiles look composed at 1, 2 or 4 across and ragged at 3 — which is exactly
what `auto-fit` gives at 400px. One column under `15em` and four past a `9:5`
aspect ratio were a container query's job; the count that always read well is the
one that survived it (2026-08-19).

## Known gaps

- **A `T` pick permanently shadows `panel(fn)`'s own drawing.** `paint()` runs
  `item.data.template ? template.draw : item.draw ?? template.draw`, so the
  single-widget door holds its content until somebody picks a template — and
  from then on the pick wins, because the name is in `data` and nothing in the
  menu means "give me my content back". That an explicit choice beats the
  instance is the right way round; that it is one-way is the gap.
- **A fifth "night" tone for the scenes** — `aurora`/`drift`/`depth` ignore
  `panel.get("tone")` entirely. Would make them honest members of the
  four-tone vocabulary instead of exceptions; not built.

Worked notes from the session that wrote this file, including the
verification passes: `framework/ai/2026-08-13/panel/templates.md`.

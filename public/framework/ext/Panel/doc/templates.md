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

**Eight experiences** — `blank word wall clock haze aurora drift depth` —
written for the 3440 story, sized entirely in container-query units against
`.panel-body` (`container-type: size`), so one rule set reads from a phone
sliver to a mega monitor.

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
clamps are derived from the widest line rather than guessed:
[the layout generator](./generator.md).

**One control surface** — `properties` — which reads the workspace instead of
drawing content: the focused panel's words as live chips, and the second entry
with a file of its own (`properties.js`): [focus](./focus.md).

## Three sizing rules — and the one that already bit

- **`min-block-size: 100cqh`, never `100%`.** `.panel-body` is
  `display: grid; grid-auto-rows: min-content`, so a percentage height
  resolves against the template's *own* content — every scene with no text
  (`blank`, `aurora`, `drift`, `depth`) measured 0px and was invisible in a
  real panel while passing a standalone harness. Corollary: a hugging panel has
  no block size to offer either, so `panel.css` branches on what the body holds
  — a body holding a `.panel-t` scene gets `container-type: size` and a
  *declared* `block-size: var(--panel-hug)`, and only a body holding real
  content keeps `inline-size`. Before that branch, `cqh` in an inline-size
  container fell back to the viewport and a hugged scene was window-height.
- **Every scale is `clamp(floor, cq-expression, ceiling)`**, so a panel body
  that collapses toward zero height (a real case — three levels of nested
  splits, each spending ~30px on its own bar, can leave a leaf body at
  `clientHeight: 0`) degrades to a legible floor instead of vanishing.
- **Every radius is `max(N cqmin, M cqw)`.** `cqmin` alone leaves an
  ultra-wide panel with one lit corner and a lot of nothing; the `max()`
  hands the wide axis over past roughly 2:1.

**No `cq` unit appears inside a `@keyframes`** — animations move in `%`,
`opacity` or `perspective-origin`. Container units in keyframes are probably
fine; "probably fine" isn't shipped in a file that runs on every panel.

## Colour, on purpose

`word`, `wall`, `clock` and `blank` are transparent and read only `--ink` /
`--prim` / `--subtle`, so they inherit the panel's surface tone for free.
`haze` is tone-aware, built from `--prim` / `--surface` mixes over the tone.
`aurora`, `drift` and `depth` paint **literal deep colours**
(`#0b0a14`, `#05060d`, `#07060f → #1a1136`, plus a blue and a violet in
`aurora`) and are **identical in light and dark on purpose** — a night sky
that inverts with the OS theme is not a night sky. Their accents still come
from `--prim`, so a theme swap retints them.

## `wall` picks its column count instead of computing it

Four tiles look composed at 1, 2 or 4 across and ragged at 3 — which is
exactly what `auto-fit` gives at 400px. Two columns by default, one under
`15em`, four past a `9:5` aspect ratio, via an unnamed `@container` that
resolves to `.panel-body`.

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

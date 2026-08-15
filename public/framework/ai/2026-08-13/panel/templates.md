# ext/panel — templates (Worker 2)

`templates.js` (82 lines) + `templates.css` (161 lines). Nothing else touched.
The seam is byte-compatible with the stub: `templates = { name: { icon, draw } }`,
default export the same object, keys lowercase, `draw` never factory-calls after
an `await`.

## The roster — 23 entries

**Experiences (8).** Sized in container-query units against `.panel-body`, so one
rule set reads from a 200px sliver to a 3440 monitor.

| name | icon | what it is |
|---|---|---|
| `blank` | `check_box_outline_blank` | the neutral: the `.checkered` utility, zero new CSS |
| `word` | `title` | one wordmark, scaled to the panel — `lew` in `--ink`, `42` in `--prim` |
| `wall` | `insights` | four numbers; the column count is chosen by `@container`, never `auto-fit` |
| `clock` | `schedule` | live 24h time + long date, self-cancelling when detached |
| `haze` | `water` | **tone-aware** calm gradient: the panel's tone is the ground, two glows over it |
| `aurora` | `gradient` | three blurred lights swimming over a night ground |
| `drift` | `auto_awesome` | three parallax star sheets, `alternate` so the loop never jumps |
| `depth` | `deployed_code` | a real `perspective` floor with the camera panning |

**Sections (15).** `navbar hero logos features split stats testimonials pricing
faq team changelog contact signup callout footer` — each lazy-imports
`/framework/styles/sections/<name>.js` and renders `default(tone)`. Icons are the
ones `styles/sections/page.js` already gives each band, so the T menu and the
sections wall read the same. The band keeps its own measure and the panel body
scrolls; nothing is fought.

## Choices

**The lazy import appends a promise resolving to a *function*, not a view.**
`$body.append(import(url).then(m => () => m.default(tone)))`. Resolving to the
view would call the section factory under whatever captor the microtask lands on
— the section modules build with bare `div.c(...)`, so they auto-append to it.
The function form routes through `append_fn`, which re-establishes `$body`.
This is the whole reason there is no `await` anywhere in the file.

**`min-block-size: 100cqh`, not `100%`.** Caught in the live integration:
`.panel-body` is `display: grid; grid-auto-rows: min-content`, so a percentage
height resolves against the template's *own* content. Every scene with no text —
`blank`, `aurora`, `drift`, `depth` — measured **0px tall and was invisible in a
real panel** while passing a standalone harness. `100cqh` is the body's own
height and is immune to how the grid sizes its row. Consequence to know: on a
`hug` panel the body is `container-type: inline-size`, so `cqh` has no block
container and falls back to the small viewport — a scene inside a hugging panel
will be window-height. Scenes are a *fill* idea; hug is the opt-out. Not worth an
option.

**Every scale is `clamp(floor, cq-expression, ceiling)`.** The floor is what keeps
a template legible when a deeply-nested panel body collapses to zero height (cq
units then resolve to 0). That case is real today — see the open question below.

**Every radius is `max(N cqmin, M cqw)`.** `cqmin` alone reads well at a sliver
and leaves an ultra-wide panel with one lit corner and a lot of nothing; the
`max()` hands the wide axis over past ~2:1. Verified at 3440×1200.

**No `cq` unit appears inside a `@keyframes`.** Every animation moves in `%`,
`opacity` or `perspective-origin`. Container units in keyframes are probably
fine; "probably fine" is not a thing to ship in a file that runs on every panel.

**`tone: true` is an additive key on the 16 tone-aware entries** (`haze` + the
fifteen sections). `panel.js` currently shows the tone menu unconditionally and
records why (repainting a `<select>` from inside its own change handler destroys
the element mid-event) — that verdict is right; the flag stays as a truthful
description of the entry, available if the bar ever wants it.

**Which templates paint their own colour.** `word`, `wall`, `clock` and `blank`
are transparent and use only `--ink` / `--prim` / `--subtle`, so they inherit the
panel's surface and read in both schemes for free. `haze` is tone-aware and built
from `--prim` / `--surface` mixes over the tone. **`aurora`, `drift` and `depth`
paint literal deep colours** (`#0b0a14`, `#05060d`, `#07060f`→`#1a1136`, plus a
blue and a violet in aurora) and are identical in light and dark **on purpose**:
a night sky that inverts with the OS theme is not a night sky. Both schemes were
screenshotted; the accents in all three still come from `--prim`, so a theme swap
retints them.

**`wall` picks its column count instead of computing it.** Four tiles look
composed at 1, 2 or 4 across and ragged at 3 — which is exactly what `auto-fit`
gave at 400px. Two by default, one under 15em, four past a 9:5 aspect, via an
unnamed `@container` that resolves to `.panel-body`. Where there is no container
the two-column default stands.

**The clock is 24-hour.** `09:35:56 AM` wrapped to two lines at every panel size
under ~400px. `hour12: false` is always eight characters; the date line keeps the
locale. It also self-cancels: the `setTimeout` chain stops once the element has
been connected and then isn't, so a closed panel leaves nothing running.

## Dissents

- **`templates.css` is 161 lines, over the ~120 the brief hoped for.** Three of
  the four over-budget blocks are `aurora`, `drift` and `depth`, which are
  entirely payload — a scene *is* its CSS, and ruling 13 says so. I would cut
  `drift` before I would compress the other two.
- **I kept `blank`** from the orchestrator's stub rather than deleting it. It
  costs no CSS (the `.checkered` utility does the work) and it is the honest
  answer for a panel you are still deciding about. `random` will roll it, which
  is fine.
- **No `word` / `wall` text is configurable.** A `data.word` key would be one
  more thing in the envelope forever, and the second a panel can carry arbitrary
  text it is an editor, not chrome. `wall`'s four numbers are the site's own
  facts, same as `stats`.

## Verification

Global Playwright, dev server untouched on :80. Screenshots in the session
scratchpad only; the `.mjs` copies for `node --check` never entered the repo.

- **`node --check`** passes on `templates.js`.
- **Standalone harness**, `.panel-body` clone with `container-type: size`, every
  one of the 23 entries drawn via `$b.empty(() => entry.draw($b, panel))` — the
  identical call shape `panel.js` uses:
  - **400×250 and 200×420, light and dark:** 23/23 painted, non-zero height,
    **zero console errors and zero page errors** in all four combinations.
  - **3440×1200, light and dark:** `aurora depth drift word wall clock haze hero`
    each rendered full-bleed and centred.
  - **Tone sweep:** `hero` and `haze` at `surface / wash / prim / dark`, both
    schemes — all eight retint correctly.
- **Live page** `/framework/ext/panel/` (Worker 1's, once it landed), both
  schemes: **zero console errors**, T menu populated with exactly
  `random` + my 23 keys at 1600px and 520px viewports, and every workspace leaf's
  `.panel-t` now measures exactly its body's height (193/193, 193/193, 475/475).
  The only failing request on a cold load is `/data/panels.json` 404 — the
  saver's first read before the seed writes, not a template.

## Open questions for Mike

1. **A deeply nested panel body can reach `clientHeight: 0`.** Measured on the
   workspace before Worker 1 re-seeded: three levels of splits inside a 34em
   region, each level spending ~30px on its bar, left a leaf body at zero. Every
   cq-sized template then collapses to its clamp floor (and `blank` to nothing).
   The clamp floors mean it degrades rather than disappears, but the real fix is
   a `min-height` on `.panel` or a smaller bar — Worker 1's file, and worth a
   decision rather than a floor.
2. **`panel(fn)`'s T menu is inert.** `paint()` runs `(item.draw ?? template.draw)`,
   so the single-widget demo always redraws its own content and picking a
   template does nothing visible. Correct for the demo's purpose; surprising on a
   bar that offers the choice. Either hide `T` on a panel that carries `draw`, or
   let a template pick clear it.
3. **Is a fifth tone wanted for the scenes?** `aurora`/`drift`/`depth` ignore the
   tone entirely. A "night" tone that other bands could opt into would make them
   honest members of the four-tone vocabulary instead of exceptions.
4. **`readme.md` append.** The brief asked for "one numbered section"; the
   readme's own record is titled, not numbered, so I appended one titled section
   at the end to match. Say the word if the numbering mattered.

---
name: css
description: Invoke before writing any substantial CSS in this repo — it has you read framework.css itself (the utility vocabulary, exact definitions) and decide where the declaration belongs before you write it. Re-invoke if it has been a while since the last time (context drifts); skip it for a one-line tweak. Naming a new class → the new-css-class skill; sizing a page → layout.
---

# CSS

**1. Read the CSS that will actually cascade onto your element — exact definitions,
not summaries; this skill restates none of them.** Always `public/framework/framework.css`
(utilities, tokens, reset, base theme — most "new" needs are already a word). Then, only
what applies: the module's own `.css`; the **container's** css when the thing lives in one
(`core/Page/Page.css` for anything in a page — tracks, previews; the parent component's for
a card in a rail or a panel); the theme (`styles/layers/theme/lew42/lew42.css`) only when
colour or type is in play — and a bare `<button>` IS in play with neither written: the theme
styles every `button, .btn` from `.theme-lew42 :is(button, .btn)` in lew42.css — INSIDE `@layer theme` at (0,2,0), so it wins on specificity and load order, not on layer (corrected 2026-09-04; a component rule at (0,1,0) in the same layer loses) (CTA padding, uppercase, bold) — and HEADINGS the same way, `.theme-lew42 :is(h1, .h1)` at (0,2,0), so a single-class `font-size` on an h1/h2/h3 loses whatever the load order (two rules rendered at the skin's size until prefixed, 2026-09-17) —
beating any
component `@layer theme` rule by layer order alone — a tree toggle glyph silently got 33px of
padding (2026-08-19; the fix was a clickable span, not a fight). Most CSS doesn't interact —
parent layout and theme trickle are where it does.
⚠ The costliest miss so far was not cascade but a property already ON the box: a `container-type`
means the box may not be sized by its own contents — `size` always, and `inline-size` whenever
something else has already made the box shrink-to-fit. A flex column with `size` measured **0px
while holding 963px** of children, clipped by the parent's `overflow: hidden`, nothing thrown
(2026-08-18); `/blog/`'s `.blog-hero` declares `container: blog-hero / inline-size` AND
`align-self: start`, which never meet on the blog front (a stretched track) but did inside a flex
COLUMN — the hero measured a few px wide and set its own title one character per line, no error, no
overflow flag (2026-09-05). Before making any box content-sized — and before reusing another
module's box inside a container of yours — read back BOTH its `container-type` and whether your
container stretches it.
⚠ The other half: a `@container` rule whose subject IS the box that declares the container never
fires — a box cannot restyle its own container — and nothing throws; a three-card wall stayed at ONE
column at every width, 3440 included (2026-09-17, the third time this year). Query a DESCENDANT.
⚠ A class that does not exist paints nothing and throws nothing — verify a word by reading its rule in framework.css AND reading a computed style back, never by inference from a token: `--tint` is a real token with no `.tint` class, and `div.c("pad flex v gap tint")` shipped on eight layouts looking plausible until a probe read `rgba(0,0,0,0)` on every box.

**2. Climb the ladder, stop at the first rung that works:**
nothing → a utility class → one of the five layout words (`.page .rail .wall .stage .solo` — `styles/doc/layout-system.md`) → an existing component's class → the module's own `.css`
⚠ A CONTRACT class can hide the box you built, and nothing throws: `.page` without `default` (or a route) is `display: none` by `@layer util`'s arrangement contract at the top of `core/Page/Page.css` — a columns demo built from core's own classes measured 0×0 and its readout said 0px for both halves of an A/B test, so the failure looked exactly like success (2026-09-17). Read the component's own CSS before wearing its class.
(layout only: where things sit, how they size) → `/styles.css` (skin, `@layer site`).
**No inline styles** (`.style(…)`, `style=`) unless there is a good reason — a value only
known at runtime (a token override like `--column`, a measured size). Static styling
belongs in a stylesheet (the owner, 2026-08-17). Tiebreak inside a component: its own existing
class beats a utility that also works — the component owns its look in one place.
⚠ Except when the component's class fights the element's own default: `.ui-table { width: 100% }` is for a data table that wants the column it was given and overrides framework.css's `width: max-content` — a 6-column reference table on it stretched to 2428px at 3440 for nothing; a bare `table()` shrink-wrapped to 1391px with no stylesheet.

**3. Layers.** Every rule inside one of `base theme site util`. The order is declared
once, in framework.css — never restate it, never invent a fifth name.
⚠ The direction the layers bite: a utility sits in `@layer util`, so a module's own `@layer theme` rule cannot override it at ANY specificity — `.flex-1 { flex: 1 }` beat `.research-main { flex: 1 1 14em }` silently and the row shrank its text to 203px at 400. The fix is to drop the utility from the markup, never to fight it in the sheet.

**4. Constrain the container, not the items.** A child opts out by claiming a wider
track. Prefer a token (`--gap`, `--column`, `--measure`) to a rule — a subtree
re-declares it, no specificity war.
⚠ A spacing clamp (`--pad` / `--gap` / `--flow` / `--pad-card`) is space BETWEEN and AROUND
content — a row's gap, the rhythm between paragraphs — and never the size OF a control: a chip's,
button's or nav item's padding, its height, and the gap between its own icon and label stay in the
control's own `em`. **The one-line rule for which spacing word: a page REGION takes `.pad`
(scales with the page); a framed box takes `.card` (scales with itself, via its own `--pad-card`
— `.card` already carries it, so nothing extra to write); a control or row keeps its own `em`
(scales with its own text).** `--pad` sits pinned at its 1em floor under any containing block
narrower than ~1292px, so a card that reached for `--pad` directly measured 14–18px at every
width on the SAME word a full-page region ramped to 69.6px on (the padding audit, 2026-09-19,
`/framework/ai/2026-09-19/card-word/`). `calc(var(--gap) * 1.3)` is not "1.3em, roomier at 3440":
the clamp caps at 2.6em, so it is 3.38em there, and a homepage nav item stood 67.6px tall. A `vw`
clamp on a control is the same mistake in different clothes (the paging toolbar, 130.7px of chrome at
3440) (2026-09-06 — [the size standard](/framework/styles/system/studies/size/)).
⚠ A flex row squeezed under its content width does not overflow first — default `flex-shrink`
takes each item to min-content, and a multi-word label wraps to lower min-content further: six
toolbar buttons went two-line before the row ever scrolled, silently (2026-08-19). The fix shape:
`white-space: nowrap; flex: none` on the items, `overflow-x: auto` on the row.
⚠ The mirror image: `flex-wrap: wrap` WRAPS BEFORE IT SHRINKS. Flexbox lays every item out at its base size and only distributes shrinkage inside a line that already exists, so one `wrap` added to a row that relied on `flex: 1 1 auto; min-width: 0` ellipsising its title pushed the star, `+` and `×` of every long-titled tree row onto their own line — nothing thrown, the rule looks right in devtools (2026-09-13). Give the second line its own element outside the row; wrap only a row whose contents were replaced.

**5. A new class name → run `new-css-class`** (reserved prefixes in
`framework/styles/css-scopes.txt`; prefix with the owning module).

**6. Smoke-test, then refine.** Headless (Playwright, or `mcp__site__shot` on a claimed
tab) at 400 and 1920 — look at it; `analyze()` from `ext/DesignTool` at 400 / 1280 / 1920
/ 3440 for what is broken; `ext/DesignTool/vision/run.mjs` when you want a model's eyes on it ($0.07 a shot, logged and browsable). Rough → look → refine is the normal cycle, not a failure.
⚠ Every mcp `site` tool rides the dev server on port 80 — with it down they all answer "Unable to
connect", which reads like a sandbox problem, not "nothing is listening" (2026-08-21). Check the port
(`Get-NetTCPConnection -LocalPort 80 -State Listen`); the fallback is headless Playwright against your
own throwaway static server — which `shot` cannot reach either.

**7. Count before you add.** 47 stylesheets / 239 rules serve 274 pages (2026-08-17); the sprawl is
branching (`:has()`, width `@media`), not volume. A new sheet or a new conditional needs its reason
in the module's `doc/decisions.md`; a token or a word you already have beats both.

## Read when it applies

- [`caveats.md`](caveats.md) — what has bitten, one line each, with where the detail is.
- [`strategy.md`](strategy.md) — the five questions in full; long form `/framework/styles/rules/`.

Reminders: `layout` before sizing anything; `new-task` if you haven't opened one;
`documentation` then `finish-task` when done. Improve this skill:
[`improvements.md`](improvements.md).

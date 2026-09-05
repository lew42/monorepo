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
styles every `button, .btn` from `.theme-lew42 :is(button, .btn)` in lew42.css — INSIDE `@layer theme` at (0,2,0), so it wins on specificity and load order, not on layer (corrected 2026-09-04; a component rule at (0,1,0) in the same layer loses) (CTA padding, uppercase, bold), beating any
component `@layer theme` rule by layer order alone — a tree toggle glyph silently got 33px of
padding (2026-08-19; the fix was a clickable span, not a fight). Most CSS doesn't interact —
parent layout and theme trickle are where it does.
⚠ The costliest miss so far was not cascade but a property already ON the box: `container-type: size`
means it may not be sized by its own contents — a flex column with it measured **0px while holding
963px** of children, clipped by the parent's `overflow: hidden`, nothing thrown (2026-08-18). Before
making any box content-sized, read its own `container-type` back from computed style.
⚠ A class that does not exist paints nothing and throws nothing — verify a word by reading its rule in framework.css AND reading a computed style back, never by inference from a token: `--tint` is a real token with no `.tint` class, and `div.c("pad flex v gap tint")` shipped on eight layouts looking plausible until a probe read `rgba(0,0,0,0)` on every box.

**2. Climb the ladder, stop at the first rung that works:**
nothing → a utility class → one of the five layout words (`.page .rail .wall .stage .solo` — `styles/doc/layout-system.md`) → an existing component's class → the module's own `.css`
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
⚠ A flex row squeezed under its content width does not overflow first — default `flex-shrink`
takes each item to min-content, and a multi-word label wraps to lower min-content further: six
toolbar buttons went two-line before the row ever scrolled, silently (2026-08-19). The fix shape:
`white-space: nowrap; flex: none` on the items, `overflow-x: auto` on the row.

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

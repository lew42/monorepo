# CSS — the full rules

Long form with live, measured examples: `/framework/styles/rules/` (cascade · proportion ·
nesting · robust · reuse).

## Start from this: write as little new CSS as you can

(the owner, 2026-09-25: "we want to minimize the amount of CSS drastically; we want to reuse
classes"). Reach for an existing class, token or layout first. If something you need doesn't
exist yet and would be useful elsewhere (a progress bar, a dictate widget), build it once as a
general component rather than styling it for this one page. Page-specific selectors that
customise an existing layout are fine when they really are specific. Aim for sensible defaults,
not a class for every property (this isn't Tailwind). `.pad` means `padding: var(--pad)`: add it
to a box when you want padding in it, and leave it off for a full-bleed box whose columns carry
their own padding.

**Never destroy a viable version** (the owner, 2026-09-29). Before you restructure markup or CSS
that works, keep v1 reachable: make the template a class, and make the new version a variant that
extends it, so the owner can click back to v1. A rewrite that leaves nothing to compare against is
a loss, even when v2 is better.

## 1. Read the CSS that will actually cascade onto your element

Exact definitions, not summaries. Always `public/framework/framework.css` (utilities, tokens,
reset, base theme — most "new" needs are already a word). Then, only what applies: the module's
own `.css`; the **container's** css when the thing lives in one (`core/Page/Page.css` for
anything in a page — tracks, previews; the parent component's for a card in a rail or a panel);
the theme (`styles/layers/theme/lew42/lew42.css`) only when colour or type is in play — and a bare
`<button>` IS in play with neither written: the theme styles every `button, .btn` from
`.theme-lew42 :is(button, .btn)` in lew42.css — INSIDE `@layer theme` at (0,2,0), so it wins on
specificity and load order, not on layer — beating any component `@layer theme` rule by layer
order alone — a tree toggle glyph silently got 33px of padding (2026-08-19; the fix was a
clickable span, not a fight). Headings work the same way (`.theme-lew42 :is(h1, .h1)` at (0,2,0)),
so a single-class `font-size` on an h1/h2/h3 loses whatever the load order gives it (2026-09-17).
Most CSS doesn't interact — parent layout and theme trickle are where it does.

⚠ The costliest miss so far was not cascade but a property already ON the box: a `container-type`
means the box may not be sized by its own contents — `size` always, and `inline-size` whenever
something else has already made the box shrink-to-fit. A flex column with `size` measured **0px
while holding 963px** of children, clipped by the parent's `overflow: hidden`, nothing thrown
(2026-08-18). Before making any box content-sized — and before reusing another module's box
inside a container of yours — read back BOTH its `container-type` and whether your container
stretches it.

⚠ The other half: a `@container` rule whose subject IS the box that declares the container never
fires — a box cannot restyle its own container — and nothing throws. Put the size-changing rule on
a plain descendant wrapper, and let the container only provide the measured box.

⚠ A closed `<details>` drops everything but its `<summary>` from the render tree, and no CSS
brings it back. Keep the `<details>` empty but for its summary, put the real content as its next
sibling, and style that sibling off the open state with `~` (`details[open] ~ .body`).

## 2. Climb the ladder, stop at the first rung that works

nothing → a utility class → one of the five layout words (`.page .rail .wall .stage .solo` —
`styles/doc/layout-system.md`) → an existing component's class → the module's own `.css` (layout
only: where things sit, how they size) → `/styles.css` (skin, `@layer site`).

⚠ A CONTRACT class can hide the box you built, and nothing throws: `.page` without `default` (or
a route) is `display: none` by `@layer util`'s arrangement contract at the top of
`core/Page/Page.css` — a columns demo built from core's own classes measured 0×0 and its readout
said 0px for both halves of an A/B test, so the failure looked exactly like success (2026-09-17).
Read the component's own CSS before wearing its class.

**No inline styles** (`.style(…)`, `style=`) unless there is a good reason — a value only known at
runtime (a token override like `--column`, a measured size). Static styling belongs in a
stylesheet. Tiebreak inside a component: its own existing class beats a utility that also works —
the component owns its look in one place.

⚠ Except when the component's class fights the element's own default: `.ui-table { width: 100% }`
is for a data table that wants the column it was given and overrides framework.css's `width:
max-content` — a 6-column reference table on it stretched to 2428px at 3440 for nothing; a bare
`table()` shrink-wrapped to 1391px with no stylesheet.

## 3. Layers

Every rule inside one of `base theme site util`. The order is declared once, in framework.css —
never restate it, never invent a fifth name.

⚠ The direction the layers bite: a utility sits in `@layer util`, so a module's own `@layer theme`
rule cannot override it at ANY specificity — `.flex-1 { flex: 1 }` beat `.research-main { flex: 1
1 14em }` silently and the row shrank its text to 203px at 400. The fix is to drop the utility
from the markup, never to fight it in the sheet.

- **A layer name outside `base theme site util`** is appended last, past `util`, silently.
- **Overriding a `framework.css` rule is a bug report about `framework.css`** — de-escalate
  upstream (flatter selector, `:where()`, a token); never `!important` downstream.
- **Base-theme selectors stay flat** (one element, no descendant combinators) or a theme's `h2`
  can never win.
- Load order inside `@layer theme` follows the IMPORT graph, not the file you are editing — a fix
  aimed at another module's rule must OUT-SPECIFY it, not merely be written later.
- A `@container` (or `@media`) block is still ORDINARY CSS — specificity and layer decide inside
  it; it is not an override.

## 4. Constrain the container, not the items

A child opts out by claiming a wider track. Prefer a token (`--gap`, `--column`, `--measure`) to
a rule — a subtree re-declares it, no specificity war.

- **A `%` inside `calc()`** stays a `%` in the computed value only on a box with no layout yet
  (zero size). On a box that IS actually painted, `getComputedStyle` resolves the token to a real
  px number.
- **`em` inside a container query resolves against the CONTAINER's font size** (16px at 1920, 18px
  at 3440 here) — a threshold picked by dividing viewport widths lands wrong. Measure the
  container, or write the breakpoint in `px`.
- **A `var()` that resolves to an INVALID value does not fall back and does not throw** — the whole
  declaration computes to its INITIAL value instead. Before reading a token in a component, read
  it back on the ELEMENT itself, not the container you declared it on.
- **On this site `rem` is a CONSTANT and `em` is the one unit that tracks the viewport** —
  framework.css puts the site's whole fluid type clamp on `body`, while `html` stays fixed at
  16px. A size meant to scale with the page needs `em`, not `rem`.
- **A relative `font-size` REPLACES the cascade's answer**, and then is itself relative to the
  PARENT — `1.3em` means 1.3× the parent's already-computed size, not 1.3× what the theme gave the
  element. CSS cannot scale an element's own computed font-size; `zoom` can.
- **A component that ALSO scales its own font-size by `var(--size)` double-multiplies every
  framework CONTROL nested inside it** — framework.css already gives every button/input/select a
  `font-size: calc(1em * var(--size))`. Reset `--size` back to 1 on any subtree that holds real
  framework controls before adding a second `--size`-reading rule above it.

## 5. A new class name

Run through these steps (folded in from the old `new-css-class` skill — a class name is a step of
writing CSS, not its own separate job):

1. **Read `public/framework/styles/css-scopes.txt`.** A bare line (`flex`) reserves `.flex` and
   `.flex-*`; a trailing dash (`ui-`) reserves a namespace, and new things there are `.ui-<thing>`.
   The framework block is off limits for anything new.
   ⚠ Before naming a `-card`/`-tile`/`-box` class, check it isn't already `.card` — framework.css's
   own padded surface. 180 hand-rolled card/tile classes existed across the site before `.card`
   did, because nobody checked whether the word already existed.
2. **Census the live CSS:** `grep -rhoE "\.<name>[a-z0-9-]*" public --include=*.css --include=*.js
   | sort -u`. A hit in another module is a collision — pick another name. ⚠ Look at WHERE a hit is
   before it vetoes a name: the census includes vendored bundles (minified third-party JS with no
   stylesheet). Add `-n` and read the line.
3. **List every view class you declare** (`grep -n 'class [A-Z]' <your files>`): `classify()` mints
   a CSS class from each constructor name in the chain, so `class Stage` wears `.stage` — the
   framework's own layout word — and shrink-wraps itself unexpectedly. Check each minted name
   against the census like any other class; prefix it with the module when it collides.
4. **Prefix with the owning module** (`.panel-grip`, not `.grip`) unless the selector already
   starts with the module's own class.
   ⚠ **A modifier class built by CONCATENATING data is a class name too**, and this step catches
   only the ones you can see typed literally — put the module prefix INSIDE the string
   (`"type-anchors-" + key`, not `"...type-anchors-post " + key`) and run every possible value of
   the variable through the census, not just the literal in the source.
5. **Opening a namespace?** A new module's first class adds its prefix to `css-scopes.txt` (one
   line, `prefix-   owner`). When that file is outside your write fence, write the reservation into
   the module's own `doc/decisions.md` under Open instead, so the next agent who can write the
   file finds it.
6. ⚠ **`page--<slug>` is stamped on every page** (two dashes), so a module class must never start
   with a single `page-` unless it IS `core/Page`, whose own namespace that is. A second core
   module whose class also `extends Page` may take `page-<module>-` as its own sub-namespace,
   declared in `css-scopes.txt` like any other prefix.

## 6. Smoke-test, then refine

Headless (Playwright, or `mcp__site__shot` on a claimed tab) at 400 and 1920 — look at it;
`analyze()` from `ext/DesignTool` at 400 / 1280 / 1920 / 3440 for what is broken;
`ext/DesignTool/vision/run.mjs` when you want a model's eyes on it. Rough → look → refine is the
normal cycle, not a failure.

⚠ Every `mcp site` tool rides the dev server on port 80 — with it down they all answer "Unable to
connect", which reads like a sandbox problem, not "nothing is listening". Check the port; the
fallback is headless Playwright against your own throwaway static server.

## 7. Count before you add

47 stylesheets / 239 rules serve 274 pages (2026-08-17); the sprawl is branching (`:has()`, width
`@media`), not volume. A new sheet or a new conditional needs its reason in the module's own
`doc/decisions.md`; a token or a word you already have beats both.

## Icons

(icon-system, 2026-09-30)

- The glyph is always `icon("name")` (`span.material-icons.icon`). Material Icons are fixed width:
  every glyph is a square 1em box, so a row of icons lines up with no help.
- Inline with text: plain `.icon` (1.25em, line-height 1, vertical-align -0.15em). Never add your
  own nudge.
- Frame it only for one of three reasons: a click target, centring inside a taller box, or a grid
  of equal slots. Then use `.ui-icon-frame`, not your own width, height or padding.
- Everything is in em off `--icon-frame`, so a bigger container font-size scales icon, frame and
  padding together. A new px size or padding on an icon is a one-off: check
  [/framework/ui/icon/](/framework/ui/icon/) first.
- **The pressable-button rules** (`.ui-icon-btn`, `.ui-icon-btn-bg`, `aria-pressed` for toggle
  state, `.ui-icon-rail`, icon+label rows) are a UI/controls concern, not a CSS one — they live on
  [/framework/design/ui/](/framework/design/ui/).

## Ownership

- A module styles the classes it emits; generic elements (`pre`, `table`, `h2`) belong to
  framework.css. A theme is the inverse — generic elements only, never a component class. If your
  CSS styles a class you don't emit, `import` the module that does (the import is the loading
  edge; comment it or it gets deleted as unused).
- Never invent a font-size: `h1`–`h4` + body + `code`, each also a class. Margins are rhythm and
  belong to whatever arranges the content.

## Two one-liners

- **Padding has two floors** — the text's font size and the box's own width:
  `padding: clamp(0.75em, 3.5%, 3.5em)`. 20px is fine on a 240px card, off on a 1000px one.
- **A block in normal flow containing blocks in normal flow cannot break.** What does: a flex/grid
  item's `min-width: auto`, an unbounded `1fr` on a reading column, leaving the flow, a chosen
  `height`, `overflow: hidden` without a scrollbar, negative margins.

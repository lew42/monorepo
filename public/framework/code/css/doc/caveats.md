# CSS caveats — what has bitten

One line each. Read the one that seems to apply; the detail is where the link points. Colour and
contrast caveats (`--wash`, `--muted`, `light-dark()`) live on
[/framework/design/color/](/framework/design/color/) instead.

- **An unlayered rule beats every layer** at any specificity. Everything goes in a layer.
- **A layer name outside `base theme site util`** is appended last, past `util`, silently.
  `styles/readme.md`.
- **Overriding a `framework.css` rule is a bug report about `framework.css`** — de-escalate
  upstream (flatter selector, `:where()`, a token); never `!important` downstream.
  `styles/readme.md`.
- **Base-theme selectors stay flat** (one element, no descendant combinators) or a theme's `h2`
  can never win. `framework.css` header comment.
- **`page-<slug>` is stamped on every page**, so a module class `page-<x>` collides with any route
  slug `<x>` — `.page-catalog` broke the catalog Doc page. Guard every rule, not one.
  `ext/catalog/catalog.css`.
- **`.page.full` zeroes `--measure` and `--page-pad`**, and the title renders outside `content()`.
  `layout/caveats.md`.
- **A container query cannot restyle its own container**; the rule goes on a child. `layout`.
- **A `@container` (or `@media`) block is still ORDINARY CSS** — specificity and layer decide
  inside it; it is not an override. `.sections-hold { position: static }` inside a `@container`
  lost to `.sections-stuck .sections-hold` (0,2,0) outside it and a sidebar stayed sticky at 400,
  nothing thrown. Write the query's rules with the SAME selectors the unqueried words use
  (2026-09-05).
- **Load order inside `@layer theme` follows the IMPORT graph, not the file you are editing** —
  `blog.css` is appended by `View.stylesheet` when `Post.js` is imported, which is AFTER the
  importing module's own sheet, so `.templates-blog-hero { align-self: stretch }` at (0,1,0) lost
  to `.blog-hero` at (0,1,0). A fix aimed at another module's rule must OUT-SPECIFY it, not merely
  be written later: `.templates-blog > .blog-hero` (0,2,0) was the fix (2026-09-05).
- **framework.css's `max-width: 100%` on media** clamps an iframe you meant to be wider (it
  clamped `frame()` at 3440). `ext/DesignTool/readme.md`.
- **A util-layer `:first-child { margin-top: 0 }`** beats a component's top margin — it is the
  highest layer. Live collision worth knowing: it kills the BLOCK half of every bled block in a
  column, because `Page.css`'s theme-layer `.page-column-prose > .bleed:first-child { margin-block-start:
  -pad-y }` loses to it — measured, the `margin-inline: -30.72px` applied and the `margin-top` did
  not, while the losing rule still matches and looks correct in devtools (2026-09-05). **The
  `:last-child` half reaches just as far** — it cancelled `ext/tabs`'s `.tab { margin-bottom: -1px
  }` on the last tab of every strip, and because a `.tab-bar` stretches its items that one low tab
  made every sibling a pixel taller. It reaches a COMPONENT'S OWN CHILDREN, not just page-level
  blocks — restate the margin in `util`, since `util` is the layer that took it away
  (ui-theme, 2026-09-06).
- **A utility class on a box you also want to HIDE is the same trap in a worse costume.**
  `.omnibox-chips` styled with the `flex` utility (`@layer util`) plus a module rule
  `.omnibox:not(.open) .omnibox-chips { display: none }` (`@layer theme`) left the chips on screen
  permanently. Drop the utility from the markup and declare the three lines yourself
  (omnibox-search, 2026-09-06).
- **`el.hidden` loses to any `display` your own rule sets.** The browser's `[hidden] { display:
  none }` is a UA rule at the bottom of the cascade, so `.ai-chat-rail { display: flex }` in
  `@layer theme` beat it and the "hidden" rail measured 54px tall with `hidden` true in the DOM.
  Any box you give a `display` needs its own `.thing[hidden] { display: none }`
  (asks-critic, 2026-09-17).
- **Every measure cap on this site is a DIRECT-child selector, so anything nested inside a wrapper
  escapes all of them.** A `<details>` fold's paragraphs sit two levels past what
  `.page-column-prose > :is(p, h1…)` matches, so `max-width` computed to `none` and one ran 3,342px
  wide at 3440. After wrapping prose in ANY box, read `max-width` back off a paragraph inside it
  (polish-critic, 2026-09-17).
- **Spacing is a clamp × one knob, never a constant** — `:where(*)` sets `--pad` / `--gap` /
  `--flow` directly from framework.css's clamps × `--size`. Every `var(--pad, …)` / `var(--gap, …)`
  fallback reads that value. A THEME retunes the clamp itself, never a per-element override. Never
  a new `var(--gap, 1em)` literal; never a `%` inside a GAP token. The clamps and the ladder:
  [/framework/styles/system/studies/size/](/framework/styles/system/studies/size/).
- **`--pad` is a PERCENTAGE of the containing block, so it sits pinned at its `1em` floor until
  that block is about 1292px wide** — `clamp(1em, 2.6% - 1.1em, 4em)`. Measured 2026-09-19 at
  400/1280/1920/3440: a `.pad` box is **14 / 15 / 16 / 18px** inside a card, a rail or a column,
  and **14 / 16.7 / 32.3 / 69.6px** in a full-width page region — the same word, a 4.3× spread,
  nothing in the CSS to show it.
- **A backtick anywhere inside `` css(`…`) `` kills every page** — and where it sneaks in is a
  `/* */` comment naming a class in backticks, the way every other comment in the repo does;
  inside a `css()` template, comments use plain quotes. `.claude/hooks/syntax-guard.mjs` now
  blocks any `.js` write that stops parsing — believe it over your eyes.
- **`**/` closes a block comment** in a `.css` file too.
- **A stylesheet loaded before framework.css** in a hand-written html file: link
  `/framework/framework.css` first (`fly/index.html`).
- **A `background:` SHORTHAND on a `select` wipes the arrow** — it is a background-image; recolour
  with `background-color` only. The arrow sits `right 0.5em center` from the padding box.
  `framework.css`, at the rule (2026-08-28).
- **A `<select>` in a flex row is a flex item** — it shrinks below its own content, and writing
  `padding: 0.2em 0.4em` on it also removes the end reserve the browser draws its arrow in.
  `flex: none` and *no* width, font-size or padding shorthand — let the browser size it
  (2026-09-05).
- **An icon font's line box is its own `font-size`, not the surrounding prose's** — so in an
  `align-items: flex-start` row an icon beside a line of text sits ~5px above it. `line-height:
  inherit` on the icon is the fix; a margin nudge is not (2026-09-05).
- **A reset rule only resets what it names.** `pre > code { padding: 0; background: none }` did
  not reset the `box-shadow` later added to `code {}`, so the inline hairline drew a light
  rectangle inside every dark code block. Adding a property to a base rule? Grep for the rules that
  reset it.
- **Paint order is not the cascade — a positioned element beats a static sibling wherever they
  overlap**, whatever the source order; and a block-level child is full width even when it only
  declares `min-width`. Diagnose with `elementFromPoint(centre)`, not the cascade.
- **A `position: sticky` GRID ITEM is constrained by the grid CONTAINER, not by its own grid area**
  (Chromium) — a capped, sticky middle column still painted over the boxes below it, because those
  were rows of the same grid. The fix is structural: make the boxes siblings under the card.
- **Never split a `selectorText` on `,`** — `:is()`, `:where()`, `:not()` and `:has()` contain
  commas. Split at paren depth 0; strip `::pseudo` after, not before.
- **A block box with `aspect-ratio` AND `max-height` transfers the height cap to its WIDTH** — a
  16/9 canvas capped at 62vh sized itself 992px inside a 1279px row. Before giving a box a ratio,
  ask what caps its other axis (2026-08-29).
- **Two adjacent line-name groups in a track list (`[a-end] [b-start]`, or `[a] [b] 2em`) are a
  parse error** — the whole track list is dropped, named placements fall through to implicit
  lines, nothing is logged. Multiple names on one line are written `[a b]`, never `[a] [b]`. After
  any multi-value track list, bisect with `CSS.supports(...)` (strip `var()` first) before
  trusting `getComputedStyle`.
- `.h4` (and the heading utility classes) are uppercase and letter-spaced in this theme — a path or
  a code name never takes a heading class; use `.small.muted` or a `code` element
  (layout-study, 2026-09-06).

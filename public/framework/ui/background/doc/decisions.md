# background — the record

## 1. The host contract: `:has(> .background)`, not a class you have to remember

`.background` is `position: absolute`, so it needs a positioned ancestor to measure
`inset: 0` against. Two ways to give it one:

- **`:has(> .background)`** (chosen) — the host's CSS rule fires automatically the
  moment a `.background` div lands inside it as a direct child. Nothing for the
  caller to type beyond `background(kind)` itself — the "one line" promise in the
  brief holds literally.
- **`.has-background`** (kept, as the alternative) — an explicit class the host
  wears itself. Needed only when the layer isn't a literal direct child (built by
  a subclass, inserted after the fact) — `:has()` can't see through that. Shipped
  alongside the first, at zero extra cost (`:where(.has-background, :has(> .background))`),
  rather than picked instead of it.

`:has()` is already load-bearing elsewhere on this site (`core/Page/Page.class.js`'s
catalog rail, `ext/Doc`), so there is no browser-support reason to prefer the class.

## 2. Content needs `.background-content` — measured, not assumed

The brief's own wording treats "no wrapper" as the default that mostly works,
breaking only for "a positioned or transformed child, a negative z-index." A
Playwright probe of four real layouts says the opposite:

| host / content | who paints on top |
|---|---|
| plain block, no position on content | **`.background` wins** — content is hidden behind it |
| host is `display: flex`, content is a flex item | **`.background` still wins** — a flex item gets no automatic positioned-paint priority in Chromium |
| content has `position: relative; z-index: 1` | content wins |
| content only has a `transform` (no explicit position) | content wins |

The reason is CSS's own painting order (CSS2.1 Appendix E): non-positioned,
in-flow content paints in an EARLIER step than anything with `position` and a
real `z-index` — including `z-index: 0` — regardless of which one is later in the
HTML. `.background` was given `z-index: 0` on purpose (a kind that also wants to
sit in FRONT of the host's own flat fill needs a real level), and that same
`z-index: 0` is exactly what puts it ahead of plain content.

**So the wrapper is not a nice habit here — it's the one thing that makes "content
on top" true for ordinary markup.** `.background-content { position: relative;
z-index: 1; }` gives your content the same real stack level `.background` has,
and DOM order (content is always written after the layer) breaks the tie in its
favour. This page's own wrapper demo shows both rows side by side, live.

The padding rides on `.background-content` too, never on the host: padding on the
host is a padding-BOX inset, and `.background`'s `inset: 0` resolves against that
same padding box — so host padding would pull the layer in from the true edge
along with everything else. Padding belongs on the wrapper that wants it.

## 3. A click always reaches the content — proven with `elementFromPoint` and a real click

`.background` carries `pointer-events: none`. A Playwright probe on the
plain-content, no-wrapper case (the one row above where the layer visually covers
the content) confirms `document.elementFromPoint()` still returns the content
element, and a real `page.mouse.click()` still fires the content's own listener.
`pointer-events: none` removes an element from hit-testing entirely, so the
browser looks straight through it to whatever's next — independent of paint
order. Visibility and clickability are two different mechanisms here, and only
the first one needs the wrapper.

## 4. Texture: `em`, not a `cqi` container query

The `css` skill's own caveats flag `container-type` as a real trap — a box given
one may stop being sized by its own content, and a `@container` query can't
target the box that declares the container. Rather than add a `container-type`
to every host that wants a texture kind (a requirement `background()` cannot
enforce, and a foot-gun per that skill), the texture grid is sized in plain `em`:
`grid-template-columns: repeat(auto-fill, minmax(2.4em, 1fr))`. `auto-fill`
already asks CSS for as many columns as the host is actually wide, so the tile
COUNT grows with the box — including at 3440 — without any container query at
all. The one thing lost is per-viewport RE-sizing of the icon glyph itself (it
stays a flat `1.5em`); the brief's actual concern — "does not turn to dust at
3440" — is about density, which `auto-fill` already solves.

## 5. Contrast — the numbers, and what they did to the defaults

Body text is `--ink` on whatever ground a kind paints. Measured LIVE by the wall
page itself (`page.js`'s `measure()` — real computed colours composited on a
canvas, so the number is correct in both themes automatically, no hex copied by
hand). Light mode, read off the page 2026-09-19 — every card prints its own
current number, this is the run that shipped:

| kind | ratio | kind | ratio |
|---|---|---|---|
| ground | 14.6:1 | texture | 14.5:1 |
| gradient | 12.0:1 | scatter | 12.4:1 |
| dots | 7.8:1 | blobs | 17.4:1 |
| grid | 12.0:1 | wave | 12.0:1 |
| stripes | 14.6:1 | spotlight | 17.4:1 |

All ten clear 4.5:1 by a wide margin — `dots` is the closest at 7.8:1, still
70% over the bar. Nothing needed a "headings only" label. Why the margin is this
wide on purpose:

- `texture` and `scatter` (icons at low opacity over `--surface`) are the two
  kinds that could plausibly fail — an opaque icon glyph is the busiest pixel a
  reader will actually put text near. Both read `color: var(--ink)` at a fixed
  `opacity: 0.09` / `0.16` for exactly this reason: raise either enough to read
  as a real texture from across a room and it starts eating into the margin.
- `blobs`' three glows sit at the corners on purpose (§6 below — the FIRST size
  tried didn't respect this), so the number above is body text on the flat
  `--surface` between them, which is where this page actually puts it.
- `ground`, `gradient`, `dots`, `grid`, `stripes`, `wave`, `spotlight` all read a
  token from the `--darken-*`/`--lighten-*` ladder already rated by
  `/framework/styles/system/studies/color/` against `--ink` on five grounds — nothing
  new to measure, they inherit that page's own numbers.

## 6. Two bugs the proof pass caught — findings, not footnotes

- **`wave` rendered a solid black bar, not a wave**, on the very first shot at
  400px. `View.html()` runs the browser's Sanitizer API by default (`el.setHTML`)
  — and it silently strips a bare `class` attribute off an SVG `<path>`, so
  `.background-wave-path { fill: var(--darken-2); }` never matched anything and
  the path fell back to the SVG default fill, opaque black, across the whole
  card. Fixed with `.html_unsafe()` instead — the SVG string is 100% this
  module's own static markup, never user input, so raw is the right tool, not a
  workaround. Nothing in the brief or the `code`/`css` skills names this trap;
  logged for `skill-improvement`.
- **`blobs` was sized for a hero and swallowed an 11em demo card whole** — the
  first sizes (14/18/10em blobs, a 2.2em blur) read as one grey smear at card
  scale, not three corner glows, which quietly broke the "text sits on the flat
  surface between them" assumption section 5 measures against. Caught by
  actually looking at the 400px shot, not by any number (the OLD number was
  already a passing 17.4:1, because it was measuring the wrong thing). Shrunk to
  8/10/6em with a 1.5em blur — reads as three glows at both a card and the hero.

## 7. The kinds — kept and cut

Ten shipped: `ground` `gradient` `dots` `grid` `stripes` `texture` `scatter`
`blobs` `wave` `spotlight`. The "look at the shots as a stranger, cut what you
wouldn't ship" pass is logged in `task.jsonl`, not restated here — nothing was
cut; each kind earned its place by being a genuinely different EFFECT (a pattern,
a texture, a glow), not a different value of an existing one, and every one of
them held up once the two bugs in §6 were fixed and looked at again at 400,
1280 and 3440, light and dark.

## Open

- **`css-scopes.txt` is registered** — inside this task's own write fence, done
  directly (bare `background`, `# ui` section).
- **This page has no real link pointing INTO it yet — a fence, not an oversight.**
  `children:` on `ui/page.js` makes `/framework/ui/background/` route correctly
  (proven: it loads, its own breadcrumb back to UI works), but the fence for this
  task was "the children line only" on that file, and `ui/page.js`'s BANDS
  constant — which is what its own `browse()` wall and its visible links actually
  read — is a SEPARATE line this task was not allowed to touch. Its own comment
  says the four band sizes (six, six, six, five) are load-bearing for the wall's
  grid math, so silently adding an 11th component to a band of six was worse than
  leaving this open. A reader who does not already have the URL cannot find this
  page from `/framework/ui/` today. Two fixes, either is a one-line change by
  whoever can edit that file next: add one sentence with a link in `ui/page.js`'s
  own closing prose (cheapest), or start an actual 5th band once a natural second
  member for it exists. Logged in `task.jsonl` and in the landing report — this is
  the one deliverable that is real but not yet DISCOVERABLE from the site itself.

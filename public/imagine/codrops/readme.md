# Codrops — free web-effect demos, rebuilt on this framework

[Codrops](https://tympanus.net/codrops/) publishes free demos of web effects. This realm
ports a few of them as real pages, so a reader can see what carries over onto this
framework's own words and what does not. Round 1: a grid hover effect, a menu of hover
effects, a scroll effect. Round 2: a click-triggered reveal (this realm's own `swap`
mechanism, drawn as a circular wipe), a scroll-driven sticky stack, a text-scramble effect —
[the table is on the index page](/imagine/codrops/).

## The porting rules (read before adding a fourth)

1. **MIT only, and read the actual `LICENSE` file** on `github.com/codrops/<repo>` —
   never the license badge, which some Codrops repos wear even when their own README says
   "don't redistribute" underneath it (`MenuHoverEffects`, `PageRevealEffects` — checked
   and rejected this round for exactly that). GitHub's own filter finds the MIT ones fast:
   `api.github.com/search/repositories?q=org:codrops+license:mit`.
2. **Rebuild, don't vendor.** Nothing here is a copy-pasted file from the original repo —
   every demo is reread and rewritten as a `page.js` + its own `.css`, crediting the
   original in a comment at the top of both (repo url, what it's based on). That is also
   the answer to "no GSAP, no npm": most current Codrops demos *do* ship GSAP, Splitting.js
   or Locomotive Scroll — the MIT licence covers the idea and the markup shape, not an
   obligation to run their dependency tree. Reimplement the mechanism in plain CSS/JS and
   say so in the table's "what changed" column; that column is the point of this realm,
   not an apology.
3. **The framework's own layout words go on before any of the demo's CSS does.** A grid of
   tiles is `.grid.auto` + `--column`, not the demo's fixed `grid-template-columns`; a row
   of things is `.flex.wrap.gap`, not a bespoke flex/grid rule. Only the effect itself (the
   hover transition, the scroll math, the keyframes) is genuinely new CSS, kept minimal and
   in `@layer site`.
4. **No real photography.** These are effect demos, not photo galleries — CSS gradients
   stand in for the original's images, which sidesteps both "no images over 200KB" and the
   question of whether a stock photo credited to the original demo travels with an MIT
   licence that covers only the *code*.
5. **`prefers-reduced-motion`.** Where the whole effect *is* motion (the scroll-bend demo),
   skip starting it. Where motion is one part of a hover state (the grid, the underlines),
   the simplest correct answer used here is uniform: every transition and keyframe involved
   collapses to instant under the media query — no partial "keep the fade" tuning per
   variant, which is the fast, right-sized answer for six link styles and one card.
6. **Prove the trigger.** `ui-test` (headless Playwright) drives the actual gesture — hover,
   scroll — and screenshots before/after; the same run checks zero console errors and no
   horizontal overflow at 400/1280/1920/3440.

## Watch out

- **A GitHub license *badge* is not the license.** Read the file; three read this round,
  linked from the table's licence column.
- **A columns host has no fixed scroll container** — the scroll-bend demo reads each
  heading's own `getBoundingClientRect().top` every animation frame instead of attaching a
  scroll listener to a specific element, so it works under this site's column-row scrolling
  the same as it would under a plain page. A rAF loop started in `activate()` is cancelled
  in `deactivate()` — `Page`'s own `/framework/core/new/1/site/motion/release/` is the
  worked example this follows; the default `deactivate()` does nothing on purpose, so a
  page that starts a loop must say so itself or it runs forever after you navigate away.
- **A sticky effect needs its own scroll container, not a workaround.** `sticky-stack`
  (round 2) gives its stage `overflow-y: auto` and listens for `scroll` on that one element
  outright — legitimate because the page owns it, unlike the page-level scroll a columns
  host makes awkward.
- **`View.stylesheet()` loads its css file asynchronously.** A page that measures its own
  layout the moment it activates (`sticky-stack`'s first progress read) can run before that
  `<link>` has applied, baking a wrong value into an inline style that a later stylesheet
  load never overwrites. Fixed with a `ResizeObserver` on the stage that re-runs the same
  update once the real layout lands — cheaper than guessing a delay.
- **Not every reveal needs a new mechanism name.** `circle-reveal` (round 2) is this realm's
  own [`swap`](/imagine/paging/mechanisms/swap/) — same stage, no url change — drawn as a
  fifth visual (a circular `clip-path` wipe) alongside `mechanisms/swap/`'s tabs, card-in,
  cross-fade and flip, not a new fifth mechanism.

## More

- The table (demo · original url · licence · what it needed · what changed) is data on
  [`page.js`](/imagine/codrops/page.js) — one array, drawn twice, so the card wall and the
  table can never disagree.
- Each demo's own page names its original in a comment at the top of its `page.js` and
  `.css`.

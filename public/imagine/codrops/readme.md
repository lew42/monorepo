# Codrops — free web-effect demos, rebuilt on this framework

[Codrops](https://tympanus.net/codrops/) publishes free demos of web effects. This realm
ports a few of them as real pages, so a reader can see what carries over onto this
framework's own words and what does not. Round 1: a grid hover effect, a menu of hover
effects, a scroll effect. Round 2: a click-triggered reveal (this realm's own `swap`
mechanism, drawn as a circular wipe), a scroll-driven sticky stack, a text-scramble effect.
Round 3: a menu that grows in place (this realm's own `expand` mechanism), a click-to-zoom
grid transition (the FLIP technique, no library), a hover-driven layout where the whole
grid — not just the tile you're on — reacts to the pointer. Round 4: a page-load intro
sequence (a layered curtain wipe that fits none of the four paging words, so it keeps its
own name), a pointer-driven custom cursor (SVG turbulence, confined to its own stage), a
card-stack slideshow (a **sixth** `swap` visual, an edge-anchored iris) — and the hub itself
now groups all twelve cards by the paging mechanism each one illustrates, so the realm reads
as "Codrops effects, sorted by what a click does" —
[the table and the groups are on the index page](/imagine/codrops/).

## The porting rules (read before adding a fifth)

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
  cross-fade and flip, not a new fifth mechanism. `expand-menu` (round 3) is the same idea
  applied to a menu: its pill bar growing in place into a full nav panel IS this realm's own
  [`expand`](/imagine/paging/mechanisms/expand/) — "opens BELOW, in place; the item grows and
  nothing else moves" — imported straight from `paging.js`'s `MECHANISMS` table (one source,
  so the demo's own words and the mechanism's own words can never drift apart) rather than
  retyped.
- **A `<details>` disclosure isn't the only way to animate a height you don't know.**
  `expand-menu`'s panel goes from nothing to its full content height with one declaration,
  `grid-template-rows: 0fr → 1fr` on a wrapper around an `overflow: hidden` inner element —
  no `scrollHeight` read, no `ResizeObserver`, no JS at all for the height itself.
- **FLIP is three lines, not a library.** `grid-zoom`'s "tile becomes the detail image" is the
  textbook version: measure the tile's own rect (First), compute the `translate() scale()`
  that lands it on the target spot (Invert), let one CSS `transition: transform` ease it
  there (Play) — Last never needs its own step because the transform IS the destination.
  The original ships GSAP's Flip plugin to do exactly this maths.
- **A distance-based push needs the UNTRANSFORMED position, not the visual one.**
  `make-way` reads every tile's `offsetLeft/offsetTop/offsetWidth/offsetHeight` (the static
  layout box) rather than `getBoundingClientRect()` (the visual, transform-affected box) to
  decide how far each tile should move away from the one you're hovering — using the visual
  box would feed a tile's own in-flight `transform` back into the next tile's push distance
  the moment you move the pointer quickly across the grid, drifting the whole effect. The
  original (`utils.js`) makes the same choice for the same reason.
- **A demo's own trigger is not sacred.** `make-way`'s original fires on click; this round's
  ask was a *hover*-driven layout change, so the port moves the same maths onto
  `mouseenter`/`mouseleave` and says so in the table — the mechanism (push-by-distance) is
  what carried over, not the specific DOM event that started it.
- **Not every reveal fits one of the four paging words, and that's a fine answer.**
  `layer-reveal` (round 4) fills its whole stage like a `takeover` would, but it never
  routes and never returns to its start state — unlike every `swap`/`takeover` demo here, a
  second click *replays* it rather than undoing it. Rather than force it into a half-fit
  name, its own page says so and stays a plain intro sequence — the same honesty this
  readme already applied to `circle-reveal` and `expand-menu`, just landing on "none" this
  time.
- **A CSS `transition-delay` set on the base rule applies to EVERY future transition of that
  property, not just the first.** `layer-reveal`'s bars stagger in by `--i * 110ms` — fine
  for the opening wipe, but the SAME rule would also delay the closing "split apart" step by
  another `--i * 110ms` if left alone, pushing the visible end state ~550ms later than the
  JS timeout that reveals the mosaic expects. Fixed by re-declaring `transition-delay: 0s`
  on the closing state's own (higher-specificity) rule — the opening stagger stays, the
  closing snap doesn't inherit it.
- **`beginElement()` on an SMIL `<animate>` replaces a GSAP tween for a one-shot SVG filter
  animation, with no library and no rAF loop.** `warp-cursor`'s ring-distortion is one
  `<animate attributeName="baseFrequency" begin="indefinite" fill="freeze">`; JS only calls
  `.beginElement()` on hover and listens for the animation's own `endEvent` to clear the
  filter — the same result as the original's GSAP timeline, in three lines. `r` on an SVG
  `<circle>` is also a plain animatable CSS property in every current engine, so the ring's
  grow-on-hover is one CSS `transition: r`, no JS at all.
- **A custom cursor belongs to ITS stage, never `position: fixed` on the document.** The
  original SVG cursors in this Codrops series cover the whole page and hide the real
  pointer everywhere; `warp-cursor` scopes the mousemove listener and the cursor's own
  `position: absolute` to one bounded box, so the site's own nav and breadcrumbs keep a real
  pointer. `prefers-reduced-motion` skips starting it at all, per this readme's rule 5 — the
  whole effect here IS motion.
- **Two elements sharing a z-index fall back to DOM order, and that can un-swap your swap.**
  `shape-swap`'s incoming slide wipes over the outgoing one by outranking it on z-index only
  *during* the transition; once the transition ends both slides return to the same z-index,
  and for a **prev** click the OLDER slide is later in DOM order than the new current one —
  so resetting it with its normal `transition: clip-path` would animate it back over the top
  of the correct slide. Fixed by setting `transition: none` for that one reset (a forced
  reflow, then restoring the transition), never by leaving two elements at equal z-index to
  fight over paint order.
- **A card stack can BE `swap` even when its own page never says so.** Sorting all twelve
  cards by mechanism for this round's regroup surfaced `grid-zoom` (round 3): a click
  replaces the stage's content, the box never moves, the url never changes, and "Back to
  grid" returns it — `swap`'s own definition, missed at the time because round 3 wasn't
  asked to name it. The hub's `mech` field is corrected in `page.js`; `grid-zoom`'s own page
  text is left as it shipped.

## More

- The table (demo · original url · licence · what it needed · what changed) is data on
  [`page.js`](/imagine/codrops/page.js) — one array, drawn twice, so the card wall and the
  table can never disagree.
- Each demo's own page names its original in a comment at the top of its `page.js` and
  `.css`.

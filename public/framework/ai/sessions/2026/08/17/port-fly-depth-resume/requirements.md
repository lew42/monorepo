# Port fly, build a 3D scroll widget, ship /resume/

## The ask (verbatim, Mike, 2026-08-17)

> look in C:/Code/ for a public/fly/ directory, and try to port it to this repo.
>
> also, maybe in a different directory, look for a 3D scroll demo (grep "scroll"?),
> make a similar 3D scroll widget for this site.
>
> i'm working towards publishing my site, in order to look for work.
>
> create a `/public/resume/` page with the following rough draft:
> *(resume markdown — name, summary, experience, selected work, skills, education;
> placeholder email/phone)*
>
> there are some placeholders here, claude (web) is helping me generate the actual
> PDF version, so we'll redo the page later. However I want to try adding the 3D
> scroll effect to the resume page. It shouldn't be distracting, just show off the
> effect in a subtle way. think about which layers should be at which depth. maybe
> headings can be closer to the user. maybe add a depth slider that factors all
> depths? maybe the h1 ("Michael Lewis") should be the deepest (closest to camera)?
> maybe each h2 section can be a nested section with bg. that way, we can see the
> bg's shifting as the parallax/lean effect happens?

## Answers Mike gave when asked

- **three.js** — "just put it in `/fly/three.js`, doesn't need to be in the framework."
- **fly shape** — standalone `index.html`, not a framework Page.
- **nav** — "the 'top nav' doesn't actually render anywhere, all pages have some sort
  of hide-nav css which hides it. the home `/page.js` has its own sidebar, I believe,
  put fly and resume in there." Plus: "the resume IS the 3D scroll demo?"
  → Yes. The effect ships as a reusable ext; `/resume/` is its showcase.

## Sources found

- `C:/Code/lew42com/public/fly/` — `index.html` + `index.js` (~450 lines), three.js
  flight sim on an unpkg import, needs `assets/3D/spaceship.glb` (24 KB).
- `C:/Code/lew42com/public/test/3D-scroll/page.js` — CSS `perspective` +
  scroll-driven `perspective-origin` + mousemove `rotateX/rotateY` + per-element
  `translateZ`.

## The defect in the source demo, and the fix

The source pins `perspective-origin` to the scene box and sweeps it 0%→200% on
scroll. On a tall page that is unusable: the vanishing point sits ~2000px from the
top of a 4000px document, so an element at `translateZ(200px)` with `perspective:
1200px` is displaced `2000 × 200/1000 = 400px` from where it belongs, and every
layer renders at a different size.

The port fixes both:

- **Vanishing point tracks the reading centre** — `perspective-origin` follows
  `scrollTop + clientHeight/2`, so displacement is proportional to distance from
  where the eye already is: ~0 at the reading line, gentle toward the edges. Scroll
  still produces parallax (a layer drifts through the reading line faster than the
  page does), which is the whole effect.
- **Each layer counter-scales by `(P − z)/P`** — exactly cancels the perspective
  magnification `P/(P − z)`, so apparent size never changes with depth. This is what
  makes it subtle rather than distracting, and it is why a heading can sit "closest
  to camera" without rendering larger than its type scale says.

## Scope / file ownership

Single session, no agents. Files this task owns:

- `public/fly/**` (new)
- `public/framework/ext/depth/**` (new)
- `public/resume/**` (new)
- `public/page.js` (edit — add two entries to `sections`)
- `public/framework/ext/page.js` (edit — declare `depth`)

## Proposal (= the steps)

1. Vendor three.js + GLTFLoader into `/fly/`, rewrite the bare `three` specifier.
2. Port `/fly/index.html` + `index.js`, copy the ship model, verify it flies.
3. Build `ext/depth` — `depth.js` + `depth.css`: scene, layers, scroll tracking,
   mouse lean, depth slider, reduced-motion opt-out.
4. Document `ext/depth` — `readme.md` + `page.js`, declared in `ext`'s `children`.
5. Build `/resume/` on the draft, with the depth assignment worked out per layer.
6. Link Fly + Resume from the home page's sidebar and card wall.
7. Verify — fly runs, resume measured at 400 / 1280 / 1920 / 3440, no console errors.

## Phase 2 (deferred, not built)

- Per-layer `rotateY` face-turn on mouse (v1 leans the vanishing point only —
  rotating a 4000px-tall scene about its centre throws the far ends hundreds of px
  in z, which is the same class of bug as the one being fixed above).
- Two-column resume at wide widths. Mike is redoing this layout once the PDF lands,
  so `/resume/` ships as a reading column and the 3440 trade is stated, not solved.
- Touch/gyro lean on mobile.

# depth architecture — scroll and pointer move the layers; one slider for position, one for reaction

A 3D scene where elements wearing `.depth(n)` sit *n* steps toward the reader. As you scroll and move the pointer, the vanishing point shifts so layers drift against each other and tilt slightly. Entry: [`depth.js`](../depth.js), [`depth.css`](../depth.css).

## Two sliders, genuinely different knobs

**Decided:** Depth multiplies layer position; Motion multiplies how hard the page reacts—pointer lean, tilt, shadow, and scroll parallax speed.

**Why:** Growth and drift are both `z/(P - z)`, the same factor. Tuning perspective separates neither; only `--depth-flatten` cuts the size while leaving parallax alone. Two separate controls let each ask its own question without fighting the other.

**Instead:** One slider (grows with depth, forced to choose between motion and size) or more tokens (four independent effects, four things to tune wrong together).

**Detail:** [doc/decisions.md](./decisions.md#two-sliders-because-there-are-two-genuinely-different-knobs)

## Vanishing point rides the reading centre

**Decided:** The perspective origin pins to the reading line—`scrollTop + viewportHeight/2`—rather than the viewport top or box centre.

**Why:** Left elsewhere, a layer's displacement—(distance from origin) × z/(P - z)—throws elements hundreds of pixels off on a long page. Pinned at the eye, displacement is ~0 where the reader is and opens gently outward, preserving scroll parallax without destroying layout.

**Instead:** Static origin (throws layout off on scroll) or origin at box middle (thousands of pixels away on a long page).

**Detail:** [doc/decisions.md](./decisions.md#the-vanishing-point-rides-the-reading-centre)

## Layer depth is relative; inheritance resets at `.depth-layer`

**Decided:** `--depth` is relative to the parent layer because `preserve-3d` compounds `translateZ` values. `.depth-layer` re-declares it to prevent a card's `--depth: 2` from silently handing 2 to every child layer without its own rule.

**Why:** Custom properties inherit, and nesting without a reset compounds invisibly through multiple tiers. A heading inside a card would cast its ancestor's shadow and inherit its scale with nothing in the console.

**Instead:** Absolute depth (conflicts with preserve-3d composition) or document the compounding (shifts the trap to later).

**Detail:** [doc/decisions.md](./decisions.md#traps) — the inheritance trap

## Counter-scale separates growth from drift

**Decided:** `--depth-flatten` multiplies the scale by `(P - z)/P`. Setting it to 1 (default) cancels growth entirely; 0 lets it all through.

**Why:** Growth and drift are the same factor. Without this lever, lowering perspective to get more apparent motion magnifies layers and pushes them off the page. The flatten token makes size and displacement independent.

**Instead:** Tune perspective alone (couples size and parallax) or add an extra transform step (more moving parts to debug).

**Detail:** [doc/decisions.md](./decisions.md#growth-and-drift-are-the-same-number)

## Bare `.depth()` lets CSS retune all layers at once

**Decided:** `.depth()` without an argument adds the class and lets CSS set `--depth` per selector. `.depth(n)` writes an inline `--depth` that beats every class rule.

**Why:** A page with six layers declared in CSS can retune all headings at once. Passed the number to every `.depth(2)` call, retune needs six edits.

**Instead:** Always require `.depth(n)` (forces per-instance tuning) or always forbid it (breaks single-layer elements).

**Detail:** [doc/decisions.md](./decisions.md#preferencebare-depthand-declare-the-tier-in-css)

## Layers rotate in place; the scene translates only

**Decided:** Each layer rotates about its own centre using `rotate3d` about the axis perpendicular to the lean. The scene never rotates; only its perspective origin moves.

**Why:** A `rotateX/rotateY` about the scene's centre throws far edges hundreds of pixels in z—the same failure the reading-centre fix prevents. A small layer can rotate safely; the scene as a whole cannot.

**Instead:** Rotate the scene (breaks layout) or rotate layers in scene-space (compounds through nesting).

**Detail:** [doc/decisions.md](./decisions.md#decisions) — the slide-the-vanishing-point rule

## Motion's scroll gain floors at 1

**Decided:** Below motion value 1, the perspective origin lags the reading line, which increases drift instead of calming it. So the slider only affects pointer lean and tilt below 1; scroll parallax stays at gain 1.

**Why:** Gain 1 is exact tracking—displacement at the reading line is ~0. Lagging makes it worse. Amplifying above 1 is the only way to multiply scroll parallax without fighting its own label.

**Instead:** Let gain fall below 1 (slider contradicts what it does) or make it always affect scroll (no way to calm pointer-only without killing parallax).

**Detail:** [doc/decisions.md](./decisions.md#motions-scroll-gain-is-clamped-at-1-from-below)

## Reduced motion removes the effect; it does not soften it

**Decided:** Under `prefers-reduced-motion`, perspective becomes none, transforms are none, shadows are none, and the sliders hide.

**Why:** A user who asks for still pages is not asking for gentler parallax. Half an effect is still motion.

**Instead:** Reduce the sliders' range (still animated) or apply filter and scale reductions (still 3D).

**Detail:** [doc/decisions.md](./decisions.md#reduced-motion-removes-the-effect-it-does-not-soften-it)

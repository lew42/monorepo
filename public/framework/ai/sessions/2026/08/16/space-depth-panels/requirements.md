# Depth, panels and colour for the layout space

## The ask, verbatim (Mike, 2026-08-16)

> the detail buttons should become a Depth slider 0-10 for now, to specify
> max-nesting-depth, and the generator should choose a new random depth for each
> section, from 0 to max.
>
> are we sure this is configured to generate every possible permutation? wouldn't
> many of them look broken?
>
> set up each block to use the ext/Panel, and add this layout generator to the
> ext/Panel, so any section can be rerolled independently

> try to fix all these block's coloring. maybe use a transparent color so it
> naturally stacks? maybe the generator can randomize the color scheme for each
> section?

## The permutation question, answered

**No, and by construction.** `gen()` is a hand-written skeleton with two families
(rails, bands) and about ten draws inside a *fixed* shape — roughly 3k reachable
strings but only **two structural skeletons**. The seed varies widths, parts and
counts; it never varies the nesting. That is why nothing it rolls looks broken.

**A depth-0-10 recursive generator will reach mostly-broken layouts**, and the
reason is specific to this format: its three silent words are position-sensitive,
and depth multiplies exactly them. `scroll` one level too deep never engages,
`stick` on a stretched rail does nothing, `fluid` inverts against `flex-1` inside
a wrapping row. Rails inside rails with nothing fluid render as slivers.

So depth turns this from a *sampler of a curated region* into a *search over a
mostly-invalid space*. **Mike's call: ship the slider raw** — no score, no guard
rails. Broken rolls are the honest output of a search, and the wall is where you
see what the space actually looks like. `ext/LayoutTool` scoring stays phase 2
(it is already the readme's own open item) and gets added if the wall proves
unreadable.

## What already exists — do not rebuild it

`ext/Panel/generate.js` already holds both directions of this seam:

- `structure(seed)` — spec → a detached `Panel` tree (pure; same integer, same tree)
- `sow(item, seed)` — that panel *becomes* a rolled layout
- wired as a `space_dashboard` button on **every** panel bar, split or leaf
  (`toolbar.js:46`, `workspace.js:193`)

**Rerolling one section independently works today.** The delta is threading
`depth` through it and giving it a home on the space page — not a second copy.

## Scope

```
public/framework/styles/layouts/space/gen.js           depth, per-section
public/framework/styles/layouts/space/page.js          the slider replaces the buttons
public/framework/styles/layouts/space/space.css        the slider
public/framework/styles/layouts/space/compose/page.js  NEW — the Panel workspace
public/framework/styles/layouts/space/readme.md
public/framework/ext/Panel/generate.js                 structure(seed, depth), sow depth
```

Colour is the open question of the three — where the block tone belongs (the
spec's own vocabulary, `web.js`'s parts, or a util) is a real decision and it is
recorded in the readme before it is written, per RULE#1.

## Proposal — the steps

1. Scope: ext/Panel's generate/structure/sow, and where block colour comes from today.
2. `gen.js` — a depth axis, and a fresh random depth per section from 0 to max.
3. The Depth slider replaces the five detail buttons.
4. Transparent, stacking block colour, randomized per section.
5. `space/compose/` — a Panel workspace where every block rerolls independently.
6. Thread depth through `structure()` / `sow()`.
7. Verify at four widths; readme, docs and the file notes.

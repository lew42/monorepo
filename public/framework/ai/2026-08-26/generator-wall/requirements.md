# Generator, wave 2 — the permutation wall, a typed spec, pairing rules

Wave 2 of [`core/Page/generator/`](/framework/core/Page/generator/), built as S5 of the
column-pages run. v1 ([task](/framework/ai/2026-08-26/page-generator/)) cut three things on
purpose; the owner wants them now.

## The ask (verbatim, from the run's own brief)

> spawn minions to work in parallel, and create a library of reusable pages, similar to the
> existing layouts/space/ generator's words. maybe create a similar DSL for pages. however, we
> need navigation, which those layouts don't have. we want to be able to generate randomized
> permutations of layouts from the library. we can then try to hone the rules about which
> layouts work well with others, etc.

## What is built

1. **Permutation wall** — a grid of many seeded rolls, each a small static picture of its tree,
   linking to its `#seed`. Addressable and reproducible from a base seed.
2. **Typed spec** — the parser already takes a spec string; the textarea was missing. Typed,
   rendered live, reflected in the url.
3. **Pairing rules, first pass** — which block words work well *under* which, as DATA the
   roller consults and the page renders, so the owner can read and hone them.

## The law

A seeded generator is only an address if it proves bit-identical output on unchanged inputs.
The spec for seeds 0 / 1 / 7 / 42 / 1234 / 999999 is captured before and after every edit; a
change that moves the draw sequence is named out loud, with the seeds that moved and why.

## Fences

- `public/framework/core/Page/generator/**` only. Not `core/Page/page.js`, not `Page.css` /
  `Page.class.js`, not `overview/**`.
- Never kill or restart the dev server; never drive the owner's live tabs (headless only);
  never `git stash`; never commit.

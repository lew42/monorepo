# alpha-flip — make the invisible buttons and pills visible, site-wide

The follow-on wave to [color-stacks](../color-stacks/). That task measured and proposed; this
one flips.

## The ask, verbatim

> TASK — the alpha-fill flip: make the invisible buttons/pills visible site-wide, on the
> lab's evidence. First: run `new-task` (slug `alpha-flip`, group `pages`).
>
> THE EVIDENCE IS THE SPEC — read first: `/framework/styles/stacks/` (the lab: the
> `--shade-aNN`/`--paper-aNN`/`--fill-aNN` scale, the 72-cell matrix, the in-cell now-vs-alpha
> pairs), `styles/doc/stacking.md` (the rules: interactive + badge fills go alpha; opaque
> floors stay; the accent is a hue not a rung), `ai/2026-08-30/color-stacks/` + its `hunt.json`
> (101 invisible pairs / 504 elements / 29 pages; `.demo-btn` + `.layout-btn` carry most; 49
> fill-shaped rules in 29 files; TWO framework.css lines are the bulk). Run `code`, `css`
> skills.
>
> THE FLIP, in the lab's own order:
> 1. **Promote the scale**: move the `--shade/paper/fill-aNN` token definitions from the lab's
>    css into the theme (`styles/layers/theme/lew42/lew42.css`, beside --card-shadow — the lab
>    keeps consuming them, now from the theme). Document each rung in place.
> 2. **The two framework.css lines** that carry the bulk (the lab names them — likely the
>    button/control fill defaults): flip to `--fill-aNN` so a control always reads against ANY
>    surface, both modes. Also restore a visible edge where the theme's `border: none` (0,1,1)
>    leaves a same-fill button with nothing — the lab's mechanism finding; fix at the honest
>    level (the theme's own button rule, not per-page overrides).
> 3. **`.demo-btn` + `.layout-btn`** (the two biggest carriers): flip their fills to the scale
>    in their own files.
> 4. **The remainder of the 49 fill-shaped rules**: flip those where the stacking doc's rules
>    say alpha (interactive/badge); SKIP and list those that are deliberate opaque floors. The
>    named finding stays: `button.prim` on `--prim` is a placement error, not a token error —
>    do not "fix" the accent; add it to the doc as a placement rule.
>
> VERIFY — re-run the LAB'S OWN HUNT (its scan script; same 76 pages, same threshold): the
> number must fall from 101 pairs/504 elements to near-zero; report before → after. The matrix
> page re-shot both modes (the failing cells now pass — count them). Spot-check 8 pages
> visually at 1920 light+dark incl. a demo toolbar, the generator controls, the palette, blog,
> imagine root — screenshot pairs; nothing may LOOK broken (a flip that makes everything
> grayer is a regression — judge by eye too). Zero console errors on a 20-url sweep.
>
> FENCE — `styles/layers/theme/lew42/lew42.css`, `framework/framework.css` (the named lines +
> the button edge), `ext/demo/*.css` (.demo-btn), `ext/layout/*.css` (.layout-btn), the listed
> fill-shaped rule files (name each in your log; >32 files means stop and report), the stacks
> lab css (consume-from-theme swap), `styles/doc/stacking.md` (the placement rule + adoption
> status). TRAPS: every CSS rule in a layer; specificity ties decided by file order (the lab's
> (0,1,1) finding — match, don't escalate); `light-dark()` needs color-scheme (the theme sets
> it; islands set their own); one backtick inside css(`…`); headless Playwright global:
> `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`. Report: hunt
> before → after, cells fixed, files touched (N), the skip list size, the eye-judgment verdict,
> cuts.

## Hard rules

- Never kill or restart the owner's `:80` dev server. Private one: `$env:PORT='8097'; node
  server.js`, torn down after.
- Never drive the owner's tabs. Never stash. Never commit.
- Probes to the session scratchpad (`flip-*`); keepers here.

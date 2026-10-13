# Token sync: Figma ↔ the site (2026-10-12)

The owner's goal: one token system, so a layout drawn in Figma comes out the same on the web, without breaking the site that works today. This page is the measured comparison, the opt-in bridge that now exists, and the slow, safe path from here.

## What each side has

- **The site** (`framework.css`): colours `--prime --dark --light --ink --surface --line --wash`, status `--error --ok --warn`, and FLUID spacing: `--pad`, `--gap`, `--flow`, `--pad-card` are clamps of the container width, times `--size`. Type grows with the viewport too (body 14 → 18 px).
- **Figma** (Sept-2026): colours `prime light dark error ok warn`; schemes as Text modes (`text muted surface accent on-accent`); spacing as three FIXED modes (`Mobile / Default / Mega`): `pad-x pad-y gap radius section-pad-x section-pad-y small-pad-x small-pad-y btn-pad-x btn-pad-y h1-size`.

## Measured (`node public/framework/ext/Figma/tokens/measure.mjs`, /framework/ui/card/)

| | site 390 | Figma Mobile | site 1920 | Figma Default | site 3440 | Figma Mega |
|---|---|---|---|---|---|---|
| card padding | 16 | 24 / 16 | 25–32 | 36 / 32 | 36 | 64 / 56 |
| page pad (`--pad`) | 14 | section 16 | 32 | section 48 | 70 | section 80 |
| gap | 14 | 14 | 24 | 16 | 43 | 32 |
| body | 14 | 16 | 16 | 16 | 18 | 16 |
| h1 | 35 | 32 | 48 | 48 | 54 | 64 |
| card radius | 3.5 | 4 | 4 | 4 | 4.5 | 6 |

Read: at 1920 the two already agree on type and radius; Figma pads cards taller than wide (36/32) where the site is square, and its gaps are smaller. Mobile is close. Mega differs most (Figma 56–64 card padding against the site's 36).

## The bridge (built, opt-in)

`ext/Figma/tokens/`: `variables.json` (the Figma variables, exported by `use_figma`), `FigmaTokens.mjs` (class; `node .../FigmaTokens.mjs` regenerates), `tokens.css` (generated). It defines `--fig-*` properties, the three modes as `.fig-mobile/.fig-default/.fig-mega` (and by viewport: Mobile under 600, Mega from 2560), the schemes as `.fig-white/.fig-gray/.fig-dark/.fig-prime` (each paints its ground and ink), and the kit's patterns `.fig-card .fig-section .fig-row .fig-stack .fig-inset`. **Nothing loads it**, so nothing on the site changes; a page or component opts in with `View.stylesheet(import.meta, "/framework/ext/Figma/tokens/tokens.css")`.

## The path (slow and safe; nothing deleted)

1. **Decide the numbers once** (owner): for each row above, pick the site's value or Figma's. The cheap direction is Figma follows the site where the site is deliberate (square card padding, larger gaps, fluid type), since changing Figma variables breaks nothing that ships.
2. **New UI opts in** to `tokens.css`: a page designed in Figma and coded from the frame uses `.fig-*`, so it matches pixel for pixel at the three widths.
3. **Move old UI one component at a time**, smallest blast radius first, each in a worktree with before/after screenshots (Shots) at 400/1200/1920/3440. The style-system census (`ai/2026-10-12/style-system/css-lines.mjs`) is the meter: custom CSS lines and raw colours per module go down, never up.
4. **When a `--fig-*` token and a site token mean the same thing, alias one to the other** (`--pad-card: var(--fig-pad-x)`), measure, then retire the extra name. Only then does anything old get removed.

Open for the owner: `dark` differs (Figma `#675F56`, site `#42404B`); fluid vs fixed (the browser can interpolate between modes with `clamp()`, Figma cannot, so Figma's three modes are snapshots of a fluid site).

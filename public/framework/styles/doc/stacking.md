# Stacking — when a colour is alpha

Live, measured, both modes: [`/framework/styles/stacks/`](/framework/styles/stacks/).

## The rules

1. **Floors are opaque; fills are alpha.** A floor is painted on the canvas (`--wash`,
   `--tint`, `--surface`, `--sidebar-bg`, `--code-bg`) and has nothing to compose with —
   make one translucent and dark mode goes pale over the browser's white.
2. **Every INTERACTIVE fill goes alpha** — a button, a toggle, a hover, an active row.
3. **Every BADGE fill goes alpha** — a chip, a pill, a tag, a count, inline `code`.
4. **The word is `--fill-aNN`**, rungs `04 · 08 · 16 · 32`, each double the last. Ask *how
   many steps up*, never *which grey*.
5. **An island dark in both modes declares `color-scheme: dark`.** `light-dark()` reads
   that at the element it is *used* on, so the same `--fill-aNN` flips inside it — along
   with `--ink` and `--line`. That one line is the always-dark primitive we lacked.
6. **An accent stays opaque.** `--prim` is a hue, not a rung; it is invisible on exactly
   one floor (its own), and the fix there is a rung with white ink, not another hue.
7. **Alpha compresses on a saturated floor** — `#FF8F60`'s red channel is already 255, so
   a white rung moves only green and blue. On an accent, start one rung higher.
8. **Do not delete the hairline when you add the fill.** `max(fill, border, inset ring)`
   is what "can I see it" actually measures; `framework.css` bolted a ring onto inline
   `code` for precisely this, and lew42's `border: none` on buttons is what removed the
   only thing holding a default button visible.

```css
--shade-a08: rgba(0, 0, 0, 0.08);
--paper-a08: rgba(255, 255, 255, 0.08);
--fill-a08:  light-dark(var(--shade-a08), var(--paper-a08));
```

Literal `rgba()`, so **no interpolation space is involved** — compositing is source-over in
sRGB, arithmetic rather than a mix. Where a rung must be derived *from* a theme colour, use
`color-mix(in srgb, …)`: mixing toward `transparent` in `oklab` travels through
premultiplied oklab and the hue drifts on the way.

## What it costs

| | |
| --- | --- |
| rules reading an opaque surface token (`--surface` / `--wash` / `--tint` / `--bg`) | **202**, in 57 files |
| of those, on a **fill-shaped** selector — the ones this changes | **49**, in 29 files |
| **framework.css lines that carry most of it** | **2** — `.btn, button` and `button.bg` |

The 49 is the real bill, and it is front-loaded: one line in `framework.css`
(`.btn, button { background: var(--surface) }`) accounts for the large majority of the
flagged instances below, because every module-level button on the site inherits it.

## The fix list

From [`hunt.json`](/framework/styles/stacks/hunt.json) — 76 pages, 3,598 fills read,
**101 distinct invisible pairs (504 instances)** on 29 pages, light mode at 1440. Every one
of the top ten measures **ΔL\* 0.00**: same fill, no border, no ring. Ordered by how many
elements one fix reaches.

| n | element | page | fill = floor |
| --- | --- | --- | --- |
| 35 | `button.demo-btn` | `/framework/ext/Panel/` | `#ffffff` |
| 35 | `button.demo-btn` | `/framework/ext/highlight/` | `#ffffff` |
| 30 | `button.demo-btn` | `/framework/core/View/` | `#ffffff` |
| 30 | `button.demo-btn` | `/framework/ext/markdown/` | `#ffffff` |
| 15 | `button.demo-btn` | `/framework/faq/` | `#ffffff` |
| 15 | `button.demo-btn` | `/framework/core/Sidebar/` | `#ffffff` |
| 15 | `button.demo-btn` | `/framework/ext/Timeline/` | `#ffffff` |
| 14 | `button.layout-btn` | `/framework/ext/editor/` | `#f2f2f2` |
| 13 | `button` (bare) | `/framework/ui/` | `#ffffff` |
| 13 | `button.layout-btn.editor-layer` | `/framework/ext/editor/` | `#f2f2f2` |

Two components carry it: **`demo.css`'s toolbar** (`.demo-btn` — the source/result/html
toggles, on every demo on the site) and **`layout.css`'s `.layout-btn`**. Both would be
fixed by the `framework.css` line alone.

## The threshold

The bar is **ΔL\* 3**, and the data chose it rather than taste. Across 384 distinct pairs
the distribution is bimodal: **100 sit at exactly 0.00**, then *nothing at all* between 0.5
and 2, one pair at 2.4, and everything else at 3 or above. The nearest thing over the line
is inline `code` on a `.wash` block at **4.2** — a fill of 0.00 rescued by its inset ring,
which is exactly the case that should sit just above a bar and not below it.

## Not done here

No token was flipped. The ladder lives on `.stacks-lab` in
[`stacks.css`](/framework/styles/stacks/stacks.css), not in the theme — the flip is its own
wave, and it starts with two lines of `framework.css`. The hunt ran in **light mode only**;
a dark pass is a re-run with one flag.

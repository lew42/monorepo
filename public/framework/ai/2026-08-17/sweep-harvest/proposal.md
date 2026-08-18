# sweep-harvest — 280 findings, 14 causes

Input: [`../vision-sweep/vision.jsonl`](../vision-sweep/vision.jsonl) — 66 shots, 19 pages × 390/1280/3440, **280 findings / 86 broken**, shot at 18:43, *after* `layout-wave-2` landed at 18:29. Prior harvest: [`../vision-after/proposal.md`](../vision-after/proposal.md).
Clustered **272 + 8 residual singles = 280**; broken **86**. Read-only; nothing fixed.

## The clusters

| # | cause (file:line) | mentions | pages | class |
|---|---|---|---|---|
| 1 | **`Page.css:96` `.page > .wide` is a CHILD combinator, and `md()` wraps.** `ext/markdown/md.js:62` returns ONE `div.md.flow` for any multi-block document, `AITask.js:76` wraps in `.ai-task`, `tabs.css` adds `.tab-panel`. So every table, wall and log sits 1–3 levels too deep to claim `wide`, and `main` caps it at 40em at *every* width. `/web/`@1280: 640px of content, 538px of empty `--wash` (`shots/cb9db2e093b05c6d.png`). The word landed this morning and is unreachable on 17 of 19 pages. | 45 | 17 | **broken** |
| 2 | **`Page.css:291` `.page-preview:not(:has(> .page-preview-thumb))`** — a thumbed card goes bare, so a preview is a picture with a caption *under* it and no frame. Every reader (and the model, 8× on `/framework/ui/`@1280 alone) reads the caption as a heading for the empty row below. "floats unframed", "the Panel column is empty", "no boundary between demos" are one rule. | 38 | 15 | **broken** |
| 3 | **`framework.css:219` `.muted { color-mix(currentColor 65%, transparent) }`** = **#828282, 3.84:1** on white and **3.60:1** on `--wash` — under AA, in **253** JS call sites. ⚠ `--subtle` is NOT the mechanism: `lew42.css:18` overrides `:root` with `#6a6a6a` = **5.41:1 / 4.83:1**, so wave-2's `framework.css:66` bump **never applied to one shot in this sweep**. Pixel-sampled `cb9db2e093b05c6d.png`: ink 63,63,63 · desc 106,106,106 · ground 242,242,242. | 35 | 15 | broken (12) |
| 4 | **`tabs.css:36` the fade is RIGHT-edge only.** A strip auto-scrolls to show the active tab, then hard-cuts the LEFT: `shots/aa382c0df4fc4ee9.png` shows `ELL` where `SHELL` should be. Every bar here IS `ext/tabs` — none are foreign. Wave-2's fade fixed the right edge and left the other one. | 19 | 7 | **broken** |
| 5 | **No table rule anywhere.** `framework.css:28` gives `pre` an `overflow-x`; `table` gets none, and cannot claim `wide` (#1). `core/Page/doc/declaring.md:7`@390 wraps one word per line; `mastermind-shots`@3440 hard-clips the `outcome` column with 2,700px of empty canvas beside it (`shots/5533a1790ba0f62f.png`). | 12 | 6 | **broken** |
| 6 | **`Page.css:81` `--pad-y: 3em`** — a fixed 48px above every `h1`, added 5h earlier by `day-page-ux` at Mike's request. Right at 1280, a quarter of the fold at 390. | 10 | 9 | maybe |
| 7 | **`Page.css:189` `.wall` `auto-fill`** leaves N-mod-columns empty tracks. `/framework/styles/`@1280: 5 cards, 4 columns, 3 dead slots. This is what a grid does — see prompt feedback. | 15 | 10 | maybe |
| 8 | **`lew42.css:42` `--code-bg: #3f3f3f`** makes every inline `` `code` `` a dark filled pill; `:96` adds `font-weight: 700`. Six-per-paragraph on `/framework/core/` and `/web/` — "the heaviest visual elements on the page", drawing the eye mid-sentence. | 22 | 13 | maybe |
| 9 | **`lew42.css:13` `--prim: #FF8F60` used as TEXT** = **2.25:1**. It is the *only* active mark (`Page.css:241`, `Sidebar.css:101`, `catalog.css`), so "no visible active-state indicator" and "reads as an accidental colour leak" are the same 10 findings. | 10 | 8 | maybe |
| 10 | Affordance/label — cards with no chevron, unlabelled progress bars and status dots with no legend. Component JS, not layout. | 28 | 13 | maybe |
| 11 | Rhythm — `--flow: 2em` flat, so an `h2` gets the same air as a `<p>` (`framework.css:514`). | 13 | 7 | maybe |
| 12 | Truncation artifacts — `-webkit-line-clamp` breaks mid-word; `card.js`'s `×…` marker reads as a close button. | 11 | 9 | maybe |
| 13 | Type scale at 3440 — `.theme-lew42` sizes are `em` off a `body` clamp that stops scaling. | 10 | 6 | maybe |
| 14 | Touch targets < 44px at 390 (icon buttons, `+`, tag pills). | 4 | 4 | maybe |
| — | residual singles (nav-bar seam, one icon weight, one card border) | 8 | 6 | maybe |

## Wave 3, ranked — value ÷ cost, broken first

| # | fix | heals | deletes | cost |
|---|---|---|---|---|
| 1 | **STOP — Mike's call.** Make `wide` reach through one grouping wrapper: `md()` and `AITask` tag theirs `.thru`; `Page.css` adds `.page > .thru { display: contents }` + `.page > .thru > *` / `> .wide` / `> .bleed` placement. Four lines, one new class — arguably a sixth word, so it does not land unasked. | 45 + 12 | the `--measure: none` escapes still hiding in `ext/Doc` | M |
| 2 | Delete the `:not(:has(> .page-preview-thumb))` guard on `Page.css:291` — every card wears the surface. | 38 | one exception, one selector | S |
| 3 | `framework.css:219` `.muted` 65% → **75%** (#6f6f6f, 5.07:1 / 4.73:1). One declaration, 253 call sites. | 35 | — | S |
| 4 | `tabs.css:36` fade both edges: `linear-gradient(90deg, transparent, #000 1em, #000 calc(100% - 2em), transparent)`. 1em lands on the tab's own 1.35rem padding, so a strip that fits loses nothing. | 19 | — | S |
| 5 | `--pad-y: clamp(1.5em, 4%, 3em)` — the same idiom `--gutter-x` already uses. 24px at 390, unchanged at 1280+. | 10 | — | S |
| 6 | Table fallback until #1 lands: `:where(.md) > table { display: block; width: max-content; max-width: 100%; overflow-x: auto }`. | 12 | — | S |
| 7 | `--prim` gets a text-safe twin (`--prim-ink: #C4522A`, 4.6:1) for the active mark; the orange stays a *fill*. | 10 | the "orange = active" ambiguity | M |
| 8 | `lew42.css:42` inline `code` takes `--wash`, not `--code-bg`; the dark box stays on `pre` only. | 22 | — | S |
| 9 | `.wall` `auto-fill` → `auto-fit` outside `browse` (browse.css:34 already made this call and measured it). | 15 | one divergence between two walls | S |
| 10 | `framework.css:514` `--flow` gets a heading step (`* + :is(h2,.h2) { margin-block-start: 3em }`). | 13 | — | S |

## The `wide` preview Mike has to judge (item 1)

**Page: [`/framework/core/Page/doc/`](/framework/core/Page/doc/), the `declaring` tab.** Exactly one wrapper, so it isolates one variable.
**Nodes that claim `wide`:** the single table at `core/Page/doc/declaring.md:7-11`. Nothing else — the two `h2`s, the prose and the code block stay in `main`.
**Before/After:** 390 (the table stops wrapping one word per line) and 3440 (750px → the table takes the leftover, prose does not).
Second choice if a busier page reads better: `/framework/ai/2026-08-17/mastermind-shots/`, whose three tables are all `AITask.js:200,209,215` — but it sits under three wrappers, so it only works if #1 is recursive.

## Re-shoot these 6 to prove the wave

`/framework/core/Page/doc/` (1,4,5) · `/framework/ui/` (2) · `/framework/ai/` (3) · `/web/` (1) · `/framework/ai/2026-08-17/mastermind-shots/` (1,4,5) · `/framework/styles/layouts/` (2,7)

## Prompt feedback → `vision-fixes`

1. **Colour names are invented.** "muted salmon-orange", "warm-amber", "steel-blue", "teal-blue", "desaturated blue-grey" — 9 findings. Pixel-sampled: every one is `#3f3f3f` ink or `#6a6a6a` subtle. Ask for *light/dark/mid*, never a hue.
2. **"Low contrast" is asserted, never measured** — 35 mentions, ~12 actually under AA. Require the model to name the two surfaces it is comparing, or drop the claim to `maybe`.
3. **A caption below its thumbnail is read as a heading above nothing** — 8 of `/framework/ui/`@1280's findings are one correct layout, misread. Tell the prompt captions may sit below.
4. **The app chrome is scored on every shot** — 23 findings name the sidebar, 11 the same unlabelled circle beside the gear. Scope the prompt to the page region, or say the sidebar is out of frame.
5. **An empty grid track is not a defect** — 15 findings report N-not-divisible-by-columns as broken. Say what a `--column`-sized `auto-fill` wall is supposed to look like.

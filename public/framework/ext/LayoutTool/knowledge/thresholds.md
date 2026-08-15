# Thresholds

Every number the rules use, what it is a ratio *of*, and what it was calibrated
against. Where a threshold came from reading vision-model output, that is said
plainly — the models were the calibration, not the detector.

## The table

| Rule | Measurement | high | medium | low |
|---|---|---|---|---|
| `cramped` | text-to-frame ÷ font-size at that edge | `< 0.12` | — | `< 0.35` |
| `measure` | characters per line | `> 95` | `85–95` | — |
| `measure` (ladder) | characters per line over ≥ 5 lines | `< 12` | — | — |
| `illegible` | font-size × scale, in px | `< 7` | `< 10.5` | — |
| `line-height` | line-height ÷ font-size | — | `< 1.10` | outside `1.25–2.2` |
| `clipped` | overflow px past a non-scrolling parent | `> 24px` | `> 2px` | — |
| `escape` | overflow ÷ parent width | `> 0.15` | `> 0.02` | — |
| `doc-overflow` | right edge past the viewport | any | — | — |
| `hit-size` | min(width, height) of an interactive element | — | `< 24px` | — |
| `rhythm` | largest gap ÷ median gap in one stack | — | `> 3×` and `> 16px` apart | — |
| `collision` | overlap area ÷ the smaller element | any `> 8%` | — | — |
| `zero-size` | a box under 1px still holding text | any | — | — |
| `dead-space` | content span ÷ viewport, at ≥ 1500px | — | `< 0.40` | `< 0.55` |
| `gutter` | region edge to nearest text ÷ its font-size | `< 0.04` | `< 0.12` | `< 0.25` |

**Severity is a curve, not a line.** Each rule states three thresholds and the
magnitude picks one — 87 characters a line and 300 characters a line are not the
same bug, and a binary test reported them identically.

### The polish tier — what's OFF rather than broken

Everything here **caps at medium**, so a wobble can never outrank content that
cannot be reached.

| Rule | Measurement | med | low |
|---|---|---|---|
| `pad-scale` | side padding vs `min(3.5% of width, 3.5em)` | short by ≥ 3× | short at all |
| `double-pad` | nested insets where both boxes paint identically | `> 64px` total | `> 12px` |
| `alignment` | distance to a lane ≥ 3 other blocks share | `> 6px` | `> 1.5px` |
| `ragged-row` | tallest ÷ shortest card in one row | `≥ 2×` | `≥ 1.35×` |
| `hierarchy` | more than one h1; a level skipped; two headings adjacent | 2+ h1 | the rest |
| `whitespace` | empty space below the last child ÷ box height | `> 50%` | `> 25%` |
| `invisible` | 3+ groups of blocks with < 2 painted surfaces | — | always |

Score: `100 − Σ min(25, weight × (1 + log₂ n))` per rule, with
`high 12 · med 5 · low 1.5`. Grades A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60.

**Repeated siblings collapse onto their parent.** Eight paragraphs each running
96 characters is one mistake, and it is not in any of the paragraphs — it is the
container that never bounded them. Three or more siblings sharing a rule become
one finding on the parent, carrying the worst instance's numbers.

## Where the numbers came from

**45–85 characters** is the typographic consensus and is what this site already
documents as `--measure: 52em`. The vision run
(`ai/2026-08-14/vision-*`) is what set the *alarm* point: Sonnet and Opus
independently measured the layouts pages at **~95–130 characters** at 1920 and
both rated it high, while Haiku called the same text "comfortable (60–80
chars)" — and was simply wrong. So `> 95` is the point two independent
observers called broken, and it is the one threshold with direct external
support.

**0.35× / 0.12× for the frame gap** was derived, not observed. A card padded
`0.6em` sits at ~0.6×; the house `.pad` utility is `1em` on ~1em text, so ~1.0×.
Half the smallest deliberate padding on the site is ~0.3×, so `0.35` is "below
anything anyone chose", and `0.12` is "closer than one-eighth of a line", which
is visually touching. Both survived 116 pages without a false positive.

**24px hit targets** is the WCAG 2.2 AA minimum (2.5.8). Kept as *medium*
because it is a guideline about input devices, not a broken layout.

**10.5px illegible** is a floor, not a ratio, and is the one place a pixel is
right: it is a fact about eyes, not about layout. Matches the vision run's
complaint that 400px stage previews rendered at 9% and 24% scale "convey
nothing".

**1500px for `dead-space`** is where "the window is the constraint" stops being
true. Below it, a narrow column is the window's doing.

## Calibration result

The corpus (`tests/`) is sixteen layouts with declared verdicts — twelve broken
in one named way, four that should score clean.

**64 / 64 at 400, 1280, 1920 and 3440px.** Every `bad` case trips its named
rule at every width it applies to; no `good` case produces a single
high-severity finding at any width.

That is a detection test, not a severity test — nothing yet checks that a
score lands in the right *band*. See the readme's Open section.

## Can a model find the same things?

The corpus doubles as a vision benchmark: eight cases were screenshotted once
and handed to three models in **fresh sessions, one image each** (the
`vision-report` finding — a resumed session re-reads every prior image as
cache-read, so cost grows with the square of image count). Each was asked for a
`broken | fine` verdict and the single biggest problem, with **no ground truth
in the prompt**.

| | Haiku 4.5 | Sonnet 5 | Opus 5 | **LayoutTool** |
|---|---|---|---|---|
| correct verdicts | 6 / 8 | 7 / 8 | **8 / 8** | **8 / 8** |
| cost / time, 8 images | $0.27 · 57s | $1.45 · 41s | $0.95 · 49s | **$0 · 0.3s** |

Full write-up: `ai/2026-08-14/layout-tool/models.md`.

**The case that separates them is the one this tool was built for.**
`cramped-card` — three bordered cards with `padding: 0`, text flush against a
line it can see. Haiku and Sonnet both answered `fine`. Opus caught it. The
analyzer measures a **0.00× frame gap** and cannot miss it.

That is the general shape: **overlap, clipping and grossly long lines are
visually loud and every model got them; a missing 12px of padding is visually
quiet and two of three missed it** — while being, numerically, the least
ambiguous finding in the set. Nobody produced a false alarm on the clean pages;
the risk with models is missed findings, not invented ones.

Where vision genuinely wins is the thing no rule encodes: it reads the page's
own words and judges the layout against them, and it notices "this page is
half-empty" — which is not a geometric error at all.

## What the corpus taught, that the docs had wrong

⚠ **`auto-fill`/`auto-fit` with a `1fr` maximum is unbounded, and that breaks
reading columns.** The "Good widescreen" case was written straight from the
`layout-design` skill's advice — `.grid.auto` with `--column: 40em` — and the
analyzer failed it at 1280 with **112 characters a line**. At one column, a
`minmax(40em, 1fr)` track takes the entire width.

`1fr` is right for **tiles** (a card stretching is fine) and wrong for
**prose**, which needs a ceiling as well as a floor:

```css
/* tiles — stretch is fine */
grid-template-columns: repeat(auto-fill, minmax(min(14em, 100%), 1fr));

/* reading columns — bounded at both ends */
grid-template-columns: repeat(auto-fill, minmax(min(34em, 100%), 38em));
```

This is the clearest case so far of the tool earning its keep: a documented
recommendation, applied exactly, producing a layout the tool calls broken and a
human agrees is broken.

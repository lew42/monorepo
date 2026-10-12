# web.js prose variety

Dispatched by `mastermind-layout`. Verbatim brief:

> `public/framework/styles/layouts/web.js` is the shared content object every
> layout in `/framework/styles/layouts/` renders. Every part it exposes draws N
> identical children — `sections`, `cards`, `rows`, `tiles` and `notes` all
> repeat one `blurb`. `ext/LayoutTool/taste/`'s `repetition` band reads ~0.95
> on every layout, against a site median of 0.23 (ideal 0.10–0.45). Fix: give
> the fictional site real, varied copy — distinct headings and distinct
> paragraphs — while (1) keeping the per-item length distribution close to
> today's short `blurb`, (2) preserving `notes()`'s ~5× ragged `LENGTHS`
> ratio, (3) never randomizing — fixed-array indexing only. Keep `web(config)`
> and every part's signature exactly as-is (sixteen `page.js` files call
> them). Measure `rate()` and `analyze()` before/after, at 1280 and 3440, for
> every child of `styles/layouts/page.js`. File fence: `web.js`, this
> directory's `readme.md`, and this task dir only.

## Proposal / steps

1. Read the evidence (`ranges.js`, `read.js`, `space/readme.md`) and confirm
   the fence.
2. Measure BEFORE: every `styles/layouts/page.js` child, both widths, `rate()`
   + `analyze()`, via headless Playwright against the existing dev server.
3. Verify how `repetition` is actually computed (`probe.js`'s `label()`,
   `read.js`'s `repetition()`) before writing a word of prose.
4. Write varied, topic-matched copy for `sections()`/`rows()`/`notes()` inside
   the fixed length/ragged/no-random constraints.
5. Measure AFTER, same matrix.
6. Compare, check for `analyze()` regressions.
7. Write `measured.md` and the `readme.md` addition.
8. Land.

## Finding, ahead of the numbers

Step 3 falsified the fix's premise before step 4 was written: `taste/read.js`'s
`repetition()` groups **siblings by `probe.js`'s `label(el)`** — tag plus first
three CSS classes — never by text content. A group of 3+ divs sharing
`div.flex.v.gap` is "repeated" whatever their paragraphs say. Confirmed twice:
(a) reading the code, (b) an isolated Playwright test building six identical
vs. six textually-distinct cards of the same class and calling `rate()` on
both — both scored `repetition: 1`. **No edit to `web.js`'s strings can move
this band**; only changing which elements share a class, or how many share it,
can. This is recorded honestly rather than hidden — see `measured.md` and the
readme addition. The prose change was still made (a fictional design-system
site with one repeated sentence is worth fixing on its own merits) and
verified to cause zero `analyze()` regressions.

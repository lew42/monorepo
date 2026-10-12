# `analyze()` does not hang

**The `await import()` in front of it does.** The sweep's `page.evaluate()` was
`async () => { const m = await import("…/LayoutTool.js"); return m.analyze(…) }`
— the shape `LayoutTool/readme.md` documents — and headless Chrome's renderer
main thread wedges **permanently** after roughly 85–110 navigations in one reused
context. The module fetch stays pending, the evaluate never resolves, and
`analyze()` is never reached. Measured on its own, every accused page-width
analyzes in **10–14 ms**.

## Reproduction

Global Playwright, headless, against the dev server already on port 80,
`window.$BLOCKRELOAD = true` via `addInitScript`. Scripts:
`…/scratchpad/lt-{stage,sweep,stall,stall2,stall4,fix}-judge.mjs` (RULE#12).

| run | wedged at | index |
|---|---|---|
| faithful sweep, both widths | `styles/layouts/carousel/` | 90 (both passes) |
| staged sweep | `styles/layouts/shell/` | 108 |
| renderer probe | `styles/layouts/shell/` | 108 |
| CPU probe | `styles/layouts/shell/` | 108 |
| with the debugger attached | `styles/layers/theme/guide/` | 85 |

Not one of them is yesterday's url. Start the *same* sweep at index 100 or 110 —
`shell/` and `carousel/` included — and it is **0 stalls**. The wedge follows the
position, not the page.

## Which pass it stops in: none of them

Timed stage by stage on all three accused page-widths, isolated:

| page @ width | probe | slowest of 23 rules | total |
|---|---|---|---|
| `styles/layouts/document/` @1280 | 6.3 ms (249 nodes) | 0.3 ms | **10.3 ms** |
| `styles/layouts/document/` @3440 | 6.1 ms | 0.3 ms | **14.0 ms** |
| `ui/tooltip/` @1280 | 8.1 ms (316 nodes) | 0.5 ms | **13.1 ms** |

No depth-20 truncation, no `max`-cap truncation, nothing near quadratic. The one
container that could bite — `code.hljs` with 169 children, 14 624 `overlap()`
pairs — costs `collision` 0.2 ms. `doc/cost.md`'s trap is real and is not this.

## What was actually stuck

- **Not the server.** A Node client polling `/app.js` straight through a 57-second
  browser stall: 481 samples, p50 **2 ms**, max 301 ms, zero errors — while the
  browser held **85–109** requests pending for 15–57 s.
- **The renderer.** A `for (let i=0;i<1e6;i++)` evaluate timed out. So did
  `page.screenshot()`, so did `page.title()`. Still stuck after **120 s**; only a
  navigation frees it. `performance.memory` sat flat at 10 MB the whole way, so it
  is not a leak.
- **Why it looked page-specific.** Each width pass starts a fresh context, so a
  positional wedge lands on the *same url in both passes* — exactly the signature
  that read as "this page is broken at both widths."

## The fix, and what it costs

**No change to `probe.js`, `ratios.js`, `rules.js`, `polish.js` or `score.js`.**
Nothing there is wrong. Applied instead, both in-fence:

1. `readme.md` — the false ⚠ section replaced by this finding, and the documented
   sweep recipe corrected: **hoist the `import()` out of the timed call, and open a
   fresh context every ~40 navigations.**
2. `doc/cost.md` — the measured ceiling recorded, so the next reader has a number
   instead of a suspicion.

**Declined: a node cap or a deadline inside `analyze()`.** It would buy nothing —
there is no hang to guard against — and a truncated measurement is a wrong one,
silently (RULE#6). `frame()` already carries the timeout that a real stall needs.

**Proof it is enough:** the full corpus, 168 pages × [1280, 3440], recycling the
context every 40 navigations — **336/336 measured, 0 stalls, 145 s.**

## The real cost of `analyze()`, site-wide

p50 **11.6 ms**, p95 **40.5 ms**, max **112.2 ms** (`ext/LayoutTool/audit/`,
2843 nodes). ~40 µs/node, linear, worst page on the site under an eighth of a
second. `/web/nav/bar/`, which failed to load twice in the early runs, measures
clean at both widths under the recycling harness — same wedge, not its own bug.

## What the edit cost

No JS or CSS was touched, so no rule can have moved on any page — except the one
page that renders the prose I changed. `/framework/ext/LayoutTool/` picks up
exactly **one extra `measure:low`** at each width (stable over three runs):
**69 → 68** at 1280, **67 → 66** at 3440. One paragraph over 85 characters a
line, for a section that no longer accuses this module of a bug it does not have.
Nothing else on the page moved. (`audit/` also reads a point off its baseline,
and shifts a dozen `alignment` findings — that is today's `audit/` task landing
after the baseline was taken, not this edit.)

# What it costs

Four passes, all arithmetic, all synchronous.

| pass | what it does | share |
|---|---|---|
| **probe** | one preorder walk: `getBoundingClientRect` + `getComputedStyle` per element, then a `Range` per text block for real line boxes | **~91%** |
| **ratios** | derived geometry — spill, text bounds, gaps, overlaps — one reverse pass and one per-container pass | included above |
| **rules** | 13 structural rules, arithmetic on the flat array | ~3% |
| **polish** | 7 alignment/proportion/hierarchy rules | ~5% |
| **score** | group, weight, cap | <1% |

Measured on this site:

| page | nodes | total |
|---|---|---|
| a demo case | 238 | **4.2ms** |
| `/framework/` | 682 | **17.1ms** |
| `/framework/core/Page/` | 895 | **25.1ms** |
| the audit page | 1884 | **47.2ms** |

And across the whole corpus — 168 pages × [1280, 3440], 336 measurements,
2026-08-16:

| | ms |
|---|---|
| p50 | **11.6** |
| p95 | **40.5** |
| max | **112.2** — `ext/DesignTool/audit/`, 2843 nodes |

**≈25µs per node, near-linear.** The probe dominates because every element costs
a style resolution; the rules are free by comparison. Two things keep it linear
rather than quadratic: text bounds propagate **bottom-up in one reverse pass**
(children always have a higher index than their parent — see
[Addressing](../addressing/) for why that same index cannot be used as an
identity), and overlap is checked **per container** rather than across the
whole tree.

**Fast enough to run on resize** — `live.js` does. A demo case is 4ms, a quarter
of a frame; a 1900-node page is 47ms, which is why the panel coalesces to **one
run per animation frame and never queues**. A 40-step resize sweep produced
exactly 40 recomputes with no backlog.

⚠ The one thing that would break this is measuring text per node instead of per
text block. `read_text` in [`probe.js`](../../files/probe.js/) runs only on
elements whose every child is inline — without that filter the root's Range
spans the whole document and the walk goes quadratic.

**That trap has never fired, and a reported hang was not it.** The worst
container in the corpus is a `code.hljs` with 169 children — 14 624 `overlap()`
pairs — and `collision` still costs 0.2ms. Three page-widths were recorded as
hanging in `analyze()`; measured, they run in 10–14ms and the stall was in the
`await import()` in front of the call. Read `../readme.md`'s ⚠ before believing
the next one: `ai/2026-08-16/mastermind-layout/hang.md`.

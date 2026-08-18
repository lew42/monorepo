# `gutter: high` on two clean pages — the depth cap, not the node cap

**Cause, in one sentence:** `walk()`'s `depth = 20` silently drops the element
children of any node sitting at depth 20, so nothing marks that node *blocky*,
`read_text()` hands it a text block aggregated from every descendant's
`textContent`, and `text_bounds()` then reports **the node's own content box** as
its nearest text — a 0px gap from a box to itself.

The hypothesis **held in its mechanism and failed in its attribution**. There is
no scroll-overflow cull; there is a *depth* cull. And it is **not** the 4000-node
cap — no page on this site comes near it.

## The measurements

Both pages, `analyze()` against `.app` at 1280, headless, dev server on port 80.

| | `m.nodes.length` | cap 4000 hit | at `depth: 200` | lost | real DOM depth |
|---|---|---|---|---|---|
| `ext/editor/` | 588 | **no** | 760 | 172 (23%) | 28 |
| `ext/files/` | 523 | **no** | 557 | 34 (6%) | 23 |

**`ext/editor/` — the flagged region is itself the fabrication.**
`div.panel-body.panel-d-block`, node 276, **depth 20**, one DOM child
(`div.panel-t.panel-t-clock`, `display: grid`), **zero children in `m.nodes`**.
`read_text()` gave it `{ chars: 144, lines: 15, width: 234, per_line: 35.4 }` —
text from a subtree it never walked. `text_bounds()[276]` came back as its own
content box (`x0 1002.9`, `y0 148.4`, `x1 1236.9`); `padding_box` is `x 1002.9,
w 234`. Nearest edge: **left, gap 0.0px** against a 15px font → `ratio 0.00` →
`high`.

**`ext/files/` — same fabrication, one level down.** The flagged region (node
228) is at depth **16** and is *not* fabricated; the offender is a descendant,
`div.file-dir` at **depth 20**, two block children (`div.file-dir-name` flex,
`div.file-dir-body` block), **zero in the model**, given `{ chars: 28 }`. Its
fabricated content box (`x 599, w 151`) propagates up and lands **0.5px past**
the region's padding-box right edge — 749.5, because `padding_box` uses the
integer `clientWidth` 162 on a box that is really 162.4 wide. `ratio −0.04` →
`high`.

**Every culled child on both pages is block-level**, so at full depth `blocky`
marks the parent and the finding cannot exist. Confirmed: both pages report zero
`gutter` findings at `depth` 24, 40 and 200.

**Site census, 168 pages at 1280.** Node cap `max = 4000`: **never reached**,
largest page 1686 nodes. Pages with any cut node: **5 of 168**. Nodes lost to
`depth`: **791 of 70 121 (1.1%)** — but 566 of them (25% of its tree) on
`ext/Panel/` alone, and 172 (23%) on `ext/editor/`.

## The fix, applied

`probe.js`, three lines: the cull records itself on the container
(`nodes[parent].cut = true`, for **both** `depth` and `max`), `measure()`
declares `cut: false`, `read_text()` skips a cut node. *A container whose
children the walk dropped is not a text block, because the tool never measured
one.*

It cannot undo the bugs the surrounding comments record fixing: `read_text()`
still measures a text **block** over one range and never per text node, and
`text_bounds()` still contributes content boxes and still clamps at clipping
ancestors. The guard only decides **whether a node is a text block at all**; it
changes no measurement of one.

Full site, 168 pages × [1280, 3440], before-pass and after-pass on the same
harness: **328 of 336 rows identical.** All 8 that moved are in the affected
class, and every change is a *removal* — no row gained a finding.

| page | 1280 | 3440 |
|---|---|---|
| `ext/Panel/` | 21/F → **65/D** | 35/F → **67/D** |
| `ext/editor/` | 56/F → **73/C** | 53/F → **72/C** |
| `ext/files/` | 66/D → **78/C** | 60/D → **72/C** |
| `styles/layouts/space/compose/` | 63/D → 65/D | 62/D → 63/D |

Site-wide high findings: `gutter` **9 → 3**, `cramped` 10 → 8, `measure` 11 → 10.
`ext/editor/`, `ext/files/` and `ext/Panel/` are off the high list entirely.

⚠ The before-pass differs from `audit/findings.json` on 10 of 336 rows — every
one a LayoutTool doc or dashboard page whose prose changed after the baseline was
taken, exactly as `hang.md` predicted. All 8 rows above are identical in both, so
the comparison stands.

## What it gives up — and the RULE#1 proposal

The guard stops the tool inventing a measurement. It does not make it see.
**`ext/Panel/` still has 566 nodes — a quarter of its tree — that no audit has
ever looked at, and they are not clean:**

| @1280 | `depth: 20` | `depth: 200` |
|---|---|---|
| `ext/Panel/` | 1686 nodes, **65/D**, 0 high | 2252 nodes, **0/F**, **16 high** — `escape` ×4, `illegible` ×5, `zero-size` ×3, `gutter`, plus `alignment` ×23 |
| `ext/editor/` | 588 nodes, 73/C, 19 findings | 760 nodes, 67/D, 36 findings (`alignment` 4 → 18) |
| `ext/files/` | 523 nodes, 78/C | 557 nodes, 78/C — unchanged |

**Proposed, not applied: raise or drop `depth`.** This is the same class of call
the node cap would have been — a silent truncation constant whose value moves
every score on a deeply-nested page — so it gets a proposal, not a patch. The
evidence is that **20 is below this site's real DOM depth** (28, 28, 23 on the
three panel pages). The cost is small and bounded: 5 of 168 pages have anything
below 20, `max` is nowhere near reached, and probe on the worst page goes
**47.3ms → 66.6ms** (site p50 unmoved).

Two questions to settle together:

1. **Does `depth` earn its keep at all?** `max` already bounds the recorded work,
   and a finite DOM bounds the walk; `depth` appears to buy nothing that `max`
   does not, while costing 1.1% of the site's nodes silently.
2. **Are Panel's 16 new highs real?** They must be sampled by hand before that
   number is published — `knowledge/false-positives.md`'s own counter-rule, and
   `zero-size` and `escape` on deeply nested panel internals are exactly the
   shape that has cried wolf before.

# depth-sample — are the findings hiding below `depth: 20` real?

Dispatched by `mastermind-layout` (2026-08-16). Verbatim ask:

> `ext/LayoutTool`'s `probe.js` walks to `depth = 20` and stops. Tonight's guard
> (`nodes[parent].cut = true`) stops the cull from *inventing* a text block on
> the cut node, but does not restore the sight below depth 20.
> `ext/Panel/` still has 566 nodes — a quarter of its tree — that no audit has
> ever walked, and at `depth: 200` they are not clean: 16 high findings. Only 5
> of 168 pages are affected. Whether Panel's 16 new highs are real or the next
> crop of false positives must be sampled before that number is published.
> That sampling is this task's job. Raising the cap is Mike's decision.

## Scope

1. Derive the 5 affected pages via probe at `depth: 200` vs `depth: 20`
   (own script — no hand-typed list), with node counts.
2. For each of the 5, diff the `analyze()` issue list at `depth: 20` (guard in
   place) against `depth: 200`. Subject = findings that appear only at 200.
3. Judge every new `high` individually — screenshot (`mcp__site__shot`) and
   read the element — classify REAL / FALSE POSITIVE (naming a
   `knowledge/false-positives.md` class, or a new twelfth) / UNSURE.
4. Answer: would raising `depth` make the audit more useful or noisier? Give
   the real:false ratio among the new highs.

## Fence

- Read-only against `ext/Panel/` (owned by another session) — screenshot and
  measure it, change nothing there, no source edits anywhere.
- Write only this task dir and the session scratchpad.
- Do not touch `probe.js` (default under review), `audit/findings.json`
  (another study compares against it), or any other JSON baseline.
- Verdict on raising `depth` is explicitly Mike's — this task delivers the
  ratio, not the decision.

## Proposed steps

1. Read gutter.md + false-positives.md (done, pre-task-open)
2. Own script: sweep 168 pages at depth 20 vs 200, derive the 5 affected pages
   + hidden node counts
3. For each of the 5: `analyze()` at depth 20 and 200, diff issues
4. List every new `high` finding across the 5 pages
5. Screenshot + judge each new high individually
6. Compute real:false ratio, write findings.md
7. Land — log outcome with the findings.md path (fence forbids editing
   gutter.md or any file outside this task dir; the pointer back is this log)

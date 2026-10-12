# designtool-ui-build — the brief, verbatim

**The requirements are the sibling task's design**:
[`ai/2026-08-17/designtool-ui/design.md`](/framework/ai/2026-08-17/designtool-ui/)
(13 annotated screenshots in its `shots/`). This is the *execution* of that
design, opened as its own task because the design landed as a deliverable.

> Your requirements are `public/framework/ai/2026-08-17/designtool-ui/design.md` — a
> design written this morning specifically for you to execute, with 13 annotated
> screenshots in that task dir's `shots/`. Read it in full, plus
> `ai/2026-08-17/tier-calibration/task.jsonl`, which landed an hour ago and changed
> the module underneath that design.
>
> The task in one line: **build the single-screen DesignTool interface that design.md
> specifies, fix the remaining bad-highlight causes, and cut the devbar from 8
> controls to 2.**
>
> Four things you need to know that post-date the design:
>
> 1. **Highlight cause A is already fixed** — the `gutter` finding the devbar itself
>    manufactured is gone, verified across 53 rows. **Causes B, C and D are yours**:
>    `dead-space`/`invisible` issuing on `m.nodes[0]` with an empty path that resolves
>    to the root (fix: emit *no highlight at all* — the subject genuinely is the page,
>    and an affordance that lies is worse than an absent one); the roll-up overwriting
>    `path` with the parent's so findings ring page-tall boxes (fix: ring the exemplar,
>    name the container in the fix line); and a below-the-fold target that rings
>    off-screen where hover produces nothing.
> 2. **The rules tier's aggregate `score` and `grade` are deleted**, replaced by
>    `worst_first`/`census`/`severity`, with `report.badge()` (taste only, graded) and
>    `report.census()` deliberately separate. Don't design around a score that no
>    longer exists.
> 3. **Two bands are still knowingly broken** — `measure` and `contrast`, with their
>    real causes written up under "Open" in the calibration task. Don't fix them (that
>    needs a band re-derived, which is a separate task) but **don't let the UI present
>    them as trustworthy either.**
> 4. `dev/DevBar/layout.js` is in scope and was touched an hour ago.
>
> On the devbar: **zero of today's 8 controls show the target and zero show the
> selection**, and five states have no representation at all. The design's answer is 2
> controls with expansion itself becoming the selection indicator. **Fewer controls,
> not more labels** — clutter is the complaint, so anything that adds a legend has
> misread it.
>
> On vision: it goes *beside* the tool, not in it. Mike's "do not recompute on
> resize!!!" has an enforceable form worth honoring literally — **`ask()` may only
> ever be reached from a click handler, never a timer, an observer, or a render.**
>
> Verify at 390, 1280, 1920 and 3440, screenshot before and after, and re-run the
> module's own `tests/` (23/23 at four widths an hour ago) plus `taste/corpus/`. ⚠ If
> any measurement number moves, that's a bug — this is a UI task.
>
> Also load `code-architecture`, `layout-design` and `css-strategy`.

## Scope fence

Mine: `dev/DevBar/{layout.js,tools.js,DevBar.js,devbar.css,readme.md,doc/measuring.md}`,
`ext/DesignTool/{DesignTool.js,highlight.js,report.js,live.js,DesignTool.css,readme.md}`.

Not mine: every measurement — `probe.js`, `rules.js`, `polish.js`, `ratios.js`,
`score.js`, `taste/*`, and both regenerated baselines. **If a number moves, it is a
bug in this task.**

# shared-heading

Dispatched by the `mastermind-layout` run, off the first-ever mobile sweep
(`ai/2026-08-17/mobile-sweep/`).

## The ask, verbatim

> The site's first ever mobile sweep (169 pages at 390 and 720) found this,
> and it is the highest-leverage item it produced:
>
> 14 `ui/*` pages plus `web/layout/tracks/` all drop identically from 83–92
> down to 76 at 390, every one of them gaining the same new `heading-offset`
> finding. One shared header template. One fix.
>
> "Identical across fifteen pages" is the signature of a single shared cause
> — find the one template before touching anything; fifteen local fixes would
> be the wrong answer even if each worked.
>
> 1. Reproduce and identify the shared source. `analyze()` at 390 on two or
>    three of the affected `ui/*` pages plus `web/layout/tracks/`; read the
>    `heading-offset` finding — its selector, its `:nth-child()` address, and
>    the declaration it proposes. Name the file that emits it before editing.
> 2. Understand the rule before obeying it. Check
>    `ext/LayoutTool/knowledge/false-positives.md`'s eleven classes first — if
>    it's a false positive, say so and add the class, rather than fixing.
> 3. If real, fix it once, at the right rung of `css-strategy`'s ladder, in
>    the file that emits the header. De-escalate upstream if the owner is
>    outside the fence.
> 4. Verify across all fifteen at 390, 720, 1280, 3440: finding gone at
>    narrow, no score moved at wide, no new finding traded in. Before/after
>    screenshots at 390 and 1280 for three of them.

## Scope / file-ownership fence

Work out the owning file first, write ONLY: that file (plus its module's
readme.md), this task dir, and the generated `usage.json`. If the owner is
`ext/LayoutTool/knowledge/false-positives.md` (false positive), that file is
permitted too.

Do NOT touch: `framework.css`, `/styles.css`, `Page.css`,
`public/framework/ext/catalog/**`, `public/framework/ext/AITask/**`, or
anything under `public/framework/ext/Panel/`.

## Verdict

**False positive** — added as class 12 to `false-positives.md`. See task.jsonl
log lines for the full mechanism. No CSS/JS changed outside that file.

## Proposal / steps

1. Reproduce: `analyze()` at 390/720/1280/3440 across the 20 `ui/*` pages plus
   `web/layout/tracks/` via headless Playwright.
2. Identify the shared source: trace the flagged selector to its emitting
   file.
3. Decide real vs false positive — check `false-positives.md`'s existing
   classes, look at the rendered page.
4. If false positive: write the new class + evidence; else fix at the right
   rung and verify across all widths/pages.
5. Land: log verdict, mechanism, before/after evidence.

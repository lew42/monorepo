# ai-rail-mobile

Dispatched by mastermind-layout, verbatim brief:

> `/framework/ai/<day>/` is unreachable below 64em while routed. `ai.css`'s
> mobile media query gives `.ai-index-rail` `max-height: none` unconditionally,
> so at mobile-while-routed the `shrink: 0` rail's full natural height squeezes
> the content region to `clientHeight: 0`. Confirmed via `git stash` to predate
> today's `catalog-gutter` change — a third consequence of the earlier
> `catalog-scroll` ceiling that task's own verification missed.
>
> The recorded fix: give `.ai-index-rail` the same routed/unrouted split its
> desktop rule already has.

Full analysis already done in `ext/catalog/doc/decisions.md` ("The ceiling had
to stop at 'nothing routed', too") and `ext/catalog/readme.md` (Traps + Open).
This task verifies and applies only — it does not redo that analysis.

## Fence

Write only: `public/framework/ext/AITask/ai.css` (confirmed live location of
`.ai-index-rail`'s styling — not literally a file named `ai.css` at
`framework/ai/`), `public/framework/ext/AITask/readme.md`, and this task dir.

**Do not touch:** `public/framework/ext/catalog/**`, `framework.css`,
`/styles.css`, `Page.css`, `public/framework/ext/LayoutTool/**`,
`public/framework/ext/Panel/**`.

## Proposed steps

1. Check usage, open task
2. Reproduce at 390 width on a routed day page — confirm `clientHeight: 0`
3. Locate `.ai-index-rail`'s actual stylesheet, read the desktop routed/
   unrouted split as the template
4. Apply the same split to the `<64em` mobile rule
5. Verify with `analyze()` across widths (390/720/1280/3440) × states
   (routed/unrouted) × every `catalog()` caller
6. Confirm `unreachable`/`zero-size`/`gutter` all absent across the matrix
7. Record the fix in `ext/AITask/readme.md`
8. Land

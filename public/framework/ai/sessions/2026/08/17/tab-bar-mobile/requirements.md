# Tab bar mobile fix

Dispatched by `mastermind-layout`, following the 2026-08-17 mobile sweep
(`framework/ai/2026-08-17/mobile-sweep/`).

## The ask, verbatim

> The site's first mobile sweep found this on `/framework/ext/catalog/`,
> confirmed by `getBoundingClientRect` and by eye: `.tabs.block .tab-bar`
> measures 336px tall at 390 and 341px at 720, against a normal 57px at 1280
> — producing a large blank grey band in the screenshot. No rule in
> LayoutTool currently watches for this, so it appears in no audit at any
> width.
>
> Two things make this worth a task rather than a patch. A 336px bar is
> almost certainly tabs wrapping to five or six rows on a narrow screen —
> which may be correct behaviour badly styled, or may be a sizing bug. And
> whatever it is, `ext/tabs` is used by every Doc page on the site, so a fix
> or a mis-fix travels everywhere. Measure before you decide.
>
> Also: the page's own title spills 88px, 23% past its container at 390 —
> fix it too if in fence.

## Fence

Write-allowed: `public/framework/ext/tabs/**`, `public/framework/ext/catalog/**`,
own task dir, generated `usage.json`. Everything else read-only, most notably
`framework.css`, `Page.css`, `ext/Doc/**`, `ext/LayoutTool/**`.

## Steps

1. Reproduce and measure at 390/720/1280 — what the 336px actually is
2. Trace the root cause in the DOM/CSS
3. Decide what a tab bar should do on a phone (layout-design sizing questions)
4. Fix at the right rung, in fence
5. Verify the title escape is covered by the same fix
6. Verify across a sample of other Doc pages + real `catalog()` callers, 4 widths
7. Describe the LayoutTool rule gap (do not add it)
8. Log findings, land

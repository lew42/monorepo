# web-nav-repair

Dispatched by `mastermind-layout`, verbatim ask:

> The two worst-scoring pages on the site that are actually broken, per
> `ext/LayoutTool`'s site audit: `/web/nav/sidebar/` (7/F at 1280) and
> `/web/nav/drawer/` (8/F at 1280, 9 at 3440). Read the findings, reproduce
> live, look at the page, fix the cause at the right rung, re-measure and show
> before/after. If the real fix lives outside the fence, stop and report it
> with the exact declaration rather than working around it locally.

**Fence:** write only under `public/web/nav/` and this task dir. Do not touch
`public/framework/**`, `framework.css`, `/styles.css`, `public/web/layout/**`
(another session owns it this cycle), or `public/framework/ext/Panel/`.

## Proposal / steps

1. Read `findings.json` for both pages, reproduce `analyze()` live at 1280/3440.
2. Screenshot both pages at 390/1280/3440 — does it look broken to a human?
3. Trace every finding to its cause.
4. Fix what's fixable inside the fence, at the right CSS rung.
5. For anything outside the fence, verify precisely (DOM inspection, computed
   styles, cross-page comparison) and write the exact declaration rather than
   working around it locally.
6. Re-measure, screenshot before/after, land.

## Outcome (spoiler, filled in as work proceeds)

Every finding on both pages traces to shared framework/site components
(`ext/demo`, `ext/layout`, `ext/catalog`, `Page.css`, `/styles.css`, generic
`<pre>` styling) that render identically on **every** sibling under
`/web/nav/` and on `/web/layout/*` (the other session's tree) — nothing is
unique to sidebar/drawer's own authored content. The dominant "high" finding
(content clipped with no scrollbar) is a real, confirmed-live bug in
`ext/catalog`'s interaction with `/styles.css`'s scroll-ownership rule — see
`findings.md` in this dir for the full trace and the exact fix, reported
upstream rather than patched locally.

# catalog-demo-gutter

Dispatched by the mastermind (`mastermind-layout` run), 2026-08-16.

## The ask, verbatim

> Three tasks today fixed `ext/catalog`: its content region had no scroll
> boundary (content unreachable on 18 pages), then no gutter, then a mobile-rail
> case. While verifying the last of those, a worker found one more, out of its
> fence: a `gutter: high` on `/framework/ext/catalog/`'s own `.demo-app-pages` at
> 390 and 720. Not previously documented. The catalog module's own demo page has
> the class of defect the module just spent three tasks fixing everywhere else.
> Fix it on its merits, and because a module's own page is the first thing a
> reader sees.

## Proposal (steps)

1. Reproduce with `analyze()` at 390/720/1280/3440 via `LayoutTool.frame()`;
   confirm or refute against a real screenshot (false positive is a valid,
   valuable outcome).
2. Understand what `.demo-app-pages` is (`ext/demo/app.js`/`app.css`) — a
   miniature app region, not `.page-catalog-pages` itself — and whether it's
   standing in for the real region or its own thing.
3. Fix at the right rung, reusing the module's already-chosen answer
   (`doc/decisions.md`) rather than inventing a fourth.
4. Verify at all four widths; screenshots before/after; confirm the demo still
   demonstrates wall-vs-rail.
5. Record the footnote in `readme.md` beside the three related notes.

## Fence

May write only: `public/framework/ext/catalog/**` and this task dir.
Do NOT touch: `framework.css`, `/styles.css`, `Page.css`,
`public/framework/ext/AITask/**`, `public/framework/ext/LayoutTool/**`,
`public/web/**`, `public/framework/ext/Panel/**` (owned by another session).
`public/framework/ext/demo/**` is also out of fence — if the true cause lives
there, the fix must land inside `catalog.css`'s own scoping instead, or be
reported rather than patched.

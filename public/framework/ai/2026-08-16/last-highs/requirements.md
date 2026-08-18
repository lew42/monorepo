# last-highs

Dispatched by `mastermind-layout`. Verbatim brief:

> The last four pages on the site carrying a `high` finding (excluding
> `library/bad/*` deliberate traps and `ext/Panel/`, owned by another
> session):
>
> | page | score @1280 | leading |
> |---|---|---|
> | `/framework/ext/editor/` | 56 / F | `gutter` |
> | `/framework/ext/files/` | 66 / D | `gutter` |
> | `/framework/styles/` | 67 / D | `cramped` |
> | `/framework/styles/layers/theme/guide/` | 68 / D | `cramped` |
>
> Two `gutter`, two `cramped` — both inset rules. Look for a shared cause
> before assuming four separate bugs (per `ext/catalog/readme.md`'s story
> tonight: four pages tripping two related rules turned out to be one CSS
> contract).

## Fence

Write only:
- `public/framework/ext/editor/**`
- `public/framework/ext/files/**`
- `public/framework/styles/page.js` and `public/framework/styles/readme.md`
- `public/framework/styles/layers/theme/guide/**`
- own task dir

Do not touch: `framework.css`, `/styles.css`, `Page.css`,
`public/framework/ext/catalog/**`, `public/framework/ext/LayoutTool/**`,
anything under `public/framework/ext/Panel/`. Do not touch
`/framework/start/example/*` (already-judged false positive, `empty`).

## Proposed steps

1. Read findings.json rows for the four pages + read rules.js gutter/cramped definitions
2. Run analyze() live on each page for selector/proposed-declaration detail
3. Screenshot each page at 390/1280/3440 (before)
4. Determine shared cause vs four separate bugs
5. Fix at correct rung, inside the fence
6. Re-screenshot + re-run analyze() to verify (after)
7. Check for false positives per knowledge/false-positives.md
8. Land: report table, doc pass if needed

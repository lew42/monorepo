# catalog-scroll — requirements

Dispatched by `mastermind-layout` (group: layout). Verbatim brief:

> Another agent traced the two worst-scoring pages on the site and found
> neither page was at fault. `ext/catalog`'s content region
> (`.page-catalog-pages`) never got its own scroll boundary, while
> `/styles.css` hides the App's outer scrollport whenever the active leaf is
> not a direct child of it. So on every `catalog()` page, the bottom 55%+ of
> the content is genuinely unreachable — no wheel, no keyboard, no scrollbar,
> no visual sign. Affects 18/205 pages (`/web/nav/*`, `/web/layout/*`, and
> anything else under a `catalog()`).
>
> Proposed fix (verified live, not committed, has a residual):
> `.page-catalog-pages { flex: 1 1 0; min-width: 0; max-height: 100dvh;
> overflow-y: auto; }` — but `100dvh` overshoots the space actually available
> below the region's own header by 45–90px (still low/med clipping). Work out
> the correct bound rather than shipping the overshoot.

## Fence

Write access: `public/framework/ext/catalog/**`, `public/styles.css`, own
task dir only. Do not touch `framework.css`, `core/**`, `web/**`, `ext/Panel/**`.

## Proposal

1. Reproduce the unreachable-content bug live on ≥2 catalog() pages before
   touching anything.
2. Read Page.css / styles.css to find the house mechanism that already
   solves "bounded region below chrome, own internal scroll" — the `.topic`
   pattern (`align-self:stretch` + `overflow:hidden` + `min-height:100%`,
   i.e. `.fill`, giving a DEFINITE height that a flex/grid child can then
   stretch into) rather than a `100dvh`-minus-a-guess constant, which breaks
   the moment the nav bar wraps (390px width).
3. Implement the bound in catalog.css only (in-fence), verify it does NOT
   regress the `<64em` strip layout.
4. Enumerate every catalog() page (grep for `.catalog()` call sites /
   `children:` with catalog pages) and check reachability at 390 / 1280 / 3440
   with headless Playwright against the running dev server (port 80,
   `window.$BLOCKRELOAD = true`, scoped to `.active-page`).
5. Record the bound and why in `ext/catalog/readme.md`.

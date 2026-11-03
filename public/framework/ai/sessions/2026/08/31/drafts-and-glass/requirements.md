# drafts-and-glass — the ask, verbatim

> TASK — the last two S items on the roadmaps:
> 1. **cms/edit drafts via `page.store()`** (`public/imagine/cms/edit/**`) — the edit lab's
>    in-progress text should survive a reload: wire core's `page.store()` (get/patch on input
>    with a light debounce; clear on explicit save/discard). The draft state must be VISIBLE
>    — a quiet "draft · restored" note, discard control beside it. Prove with a real reload
>    round-trip: type → reload → text back + note shown → discard → reload → gone.
> 2. **Colstyles fourth look: Glass** (`public/imagine/vary/colstyles/**`) — ONLY if it earns
>    its place: built from the framework.css alpha ladder (--shade/paper/fill-aNN, transparent
>    black/white so stacks compose), translucent surfaces + backdrop blur, both color schemes.
>    Must remain readable: measure contrast on body text in both schemes (paste the ratios;
>    ≥4.5 or don't ship it). It joins the switcher as a fourth option, same mechanism, incl.
>    the `:is(.page-column-item, .page-gen-item)` item selector convention. If it reads as
>    decoration instead of a look, SKIP it and say why — skipping is a first-class result.
>
> FENCE — `public/imagine/cms/edit/**`, `public/imagine/vary/colstyles/**`. A read-only QA
> agent is sweeping the rest of the site concurrently — stay inside the fence.
>
> VERIFY: headless round-trip proof for drafts (screenshots restored + discarded), Glass
> screenshots ×2 schemes + contrast ratios, zero console errors, 400/1920/3440. Docs: one
> readme line each. Keepers + `links`. Report: 2 lines + proofs, cuts.

## Prior art read before the first edit

- `page.store()` already shipped today (sibling task `page-store`): `Page.class.js:552`,
  `Page.Store` class, doc at `core/Page/doc/method/store.md`. `get(fallback)` / `set(data)` /
  `patch(part)` / `clear()`, keyed `lew42:` + `store_key ?? url`.
- Colstyles' own `doc/decisions.md` already scoped Glass on 2026-08-31 ("What was cut"): a
  look stacking the alpha ladder **by nesting depth** was named a real candidate, distinct
  from Cards (opaque) and Ink (solid dark) — roadmapped, not built. This task builds it.
- Depth in the columns DOM has exactly two CSS hooks: `.page.active-ancestor` (every column
  left of the open one) and `.page.active-page` (the open leaf) — both wrap `.page-column-body`
  as a descendant, so `.page.active-ancestor .page-column-body` / `.page.active-page
  .page-column-body` is the depth selector, no JS needed.

## Fence

- `public/imagine/cms/edit/**`
- `public/imagine/vary/colstyles/**`

Scratch (probes, the contrast script) goes in the session scratchpad. Private dev server
`PORT=8099`, torn down at the end; the owner's `:80` server is never touched.

# Themes browser (design crawl, Opus minion #2)

## The ask, verbatim

> I feel like we need some alternate UI themes. how do we create a better theme browser
> for all these things? maybe column based pages can allow us to organize trees of themes?
> can we algorithmically create themes?

## Deliverable

`/imagine/design/themes/` — which must **be** the theme browser prototype, not an essay
about one. A columns page: a rail of themes, each theme a column, variants deeper.

- 4–6 hand-built alternate themes as token-override CSS classes (`theme-<name>`), each
  demoed on the same mock mini-UI (nav strip, card, two buttons, code chip, link) plus a
  swatch row.
- An algorithmic generator IN the page: seed (hue, chroma, lightness curve, contrast
  target) → the token set, via native `oklch()`. ~6 generated themes from 6 seeds.
- A Proposal column: where theme files live, how a theme is chosen/persisted
  (`page.store()`), what the 3 aliases + flat code tokens mean for authors, 3 next steps.

## Fence (never violate)

- Edits ONLY inside `public/imagine/design/themes/` and this task dir.
- MAY NOT touch `framework/styles/` or the lew42 theme. Alternate themes live as CSS
  inside my own dir, scoped under my page, applied to demo surfaces only.
- Never commit, never push, never `git stash`. Never kill the dev server (localhost:8080).

## Ground truth read first

- `public/imagine/design/color/page.js` — 29 color tokens, ONE seam (`.theme-lew42` on the
  app div), 3 pure aliases, `--card-shadow`/`--card-ring` are shape, `--code-*`/`--syn-*`
  deliberately flat.
- `public/framework/styles/layers/theme/lew42/lew42.css` — the theme itself.
- `public/imagine/design/controls/page.js` — the control kinds the mock UI must show.
- `public/imagine/page.js`, `public/imagine/vary/` — the columns convention.

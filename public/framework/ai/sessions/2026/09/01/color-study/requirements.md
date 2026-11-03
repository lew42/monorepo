# Color study (design crawl)

Verbatim ask: study color across the site — where the palette lives in CSS, whether
usage is consistent, and where color fails (contrast, sameness, accents that don't
guide the eye). Deliverable feeds a sibling minion building an "alternate UI themes"
browser tonight — they need an exact token inventory: which custom properties exist
and what each paints.

## Scope
- Read-only crawl of `public/framework/styles/`, `styles/layers/theme/lew42/`,
  `framework.css`, `core/App/mode.js`/`mode.css`.
- Measure computed colors across ~15 representative pages (light + dark).
- Contrast-check the found text/background and accent/background pairs.
- Build `public/imagine/design/color/page.js` (already declared by the hub — do not
  edit the hub or `/imagine/page.js`).
- Shots to `public/imagine/design/color/shots/`, budget 1.5MB total.

## Fences
- Never edit outside `public/imagine/design/color/` and this task dir.
- Never commit/push, never restart the dev server (already running :8080).

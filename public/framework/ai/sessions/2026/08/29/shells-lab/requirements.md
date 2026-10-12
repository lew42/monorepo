# shells-lab — app shell layouts at /imagine/shells/

## The ask (owner, verbatim, 2026-08-29)

> explore app layouts: sidebars, footers, canvas, inner sidebars/footers, etc

Program context: `../imagine-program/requirements.md`.

## Scope

`/imagine/shells/` — a browsable tree of app SHELL layouts, each its own child page
wearing `hides-nav` (the experiment brings its own chrome), each with a one-line verdict.

1. Outer chrome permutations — left rail, right rail, both, footer, header+footer,
   sidebar+footer. Same content in each, so the chrome is the only variable.
2. Canvas center — chrome around a full-bleed working surface (`fill` is the word).
3. Inner chrome — a region carrying its OWN rail / status bar; when does inner chrome
   read as belonging to the area vs echoing the outer shell?
4. Chrome x columns — a shell whose content region is a full-height columns row.

Navigation is part of every answer: the chrome hosts the nav, the content responds,
same urls, cold-loadable.

## Fence

`public/imagine/shells/**` only. Do not touch `/imagine/page.js` (`shells` is already
declared there). Do not touch ext/Playground, dev/DevBar, ext/grip.

## Verify

Headless at 400 / 1920 / 3440: every shell cold-loads at its own url with its own
chrome and the site chrome hidden; the canvas surface = viewport minus chrome exactly
(px math reported at 1920); zero console errors; no unintended scrollbars.

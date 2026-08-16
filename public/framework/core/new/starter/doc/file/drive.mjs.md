# `drive.mjs`

A Playwright driver — the replacement for a jsdom `test/` directory that had
rotted (jsdom was never installed, and it asserted on `style.display`, which is
always empty now that visibility is CSS). Runs a real headless Chromium
through named tours (`--tour=basics|layouts|smoke|reload|all`), mirrors the
browser console into the terminal with group indentation reconstructed from
Playwright's `startGroupCollapsed`/`endGroup` events, and prints the `.page`
tree after each step.

## Playwright is global, not a dependency

Resolved from `npm root -g` at runtime — `npm i -g playwright && npx
playwright install chromium` once, and nobody who just wants the dev server
has to download a browser. Nothing here is in `package.json`.

## `window.$BLOCKRELOAD`

Set on every page so a file save mid-tour can't reload one out from under the
script; the live-reload step clears the flag itself, right after its own
`goto`, which is what lets the `all` tour include that step instead of
excluding it.

## Improvements

1. **None ranked.** A finished tool for a superseded tier — if kept, it's kept
   as reference for how to drive `new/1`'s site the same way, not run as-is.

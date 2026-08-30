# demo-urls-audit

The evidence for a pending decision: should `demo.app()`'s new `urls: false` option become the
DEFAULT? First: run `new-task` (slug `demo-urls-audit`, group `pages`).

## Context

`ext/demo/app.js` gained `urls: false` today (moves an in-memory tree's link urls from `href` to
`data-demo-url` so crawlers/middle-click don't hit 404s; left-click still works). The homepage +
ext/demo's own pages use it; ~65 other `demo.app()` call sites were not audited. The open question
(from `ai/2026-08-30/critique-fixes/`): flipping the default fixes every dead-href demo at once
but would strip REAL hrefs from demos whose trees mirror actual site pages (where middle-click
SHOULD work).

## The audit

Enumerate every `demo.app()` call site (grep; count them — the two numbers: grep count vs rows in
audit.json). For each: does its tree produce hrefs that resolve on the real site (sample-verify
per distinct pattern headless — group call sites by the tree they render rather than testing 65
pages one by one; e.g. all demo.tree exhibits share a shape) or 404? Output: audit.json (call
site, page url, href kind: real/dead/none, verdict: wants urls:false / wants real hrefs), the
split (N dead vs M real), and a recommendation: flip the default (with the exception list) or
keep opt-in (with the list of sites that should opt in).

Playwright global: `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`.

## Fence

READ-ONLY except this task dir. Never kill/restart the :80 dev server (private
`$env:PORT='8096'; node server.js` if down, tear down after). Never drive owner tabs. Never
stash. Never commit.

## Report

The counts, the split, the recommendation in 2 lines, the exception list size.

# demo-urls-flip

Flip `demo.app()`'s `urls` option default to `false`, per the unanimous audit at
`ai/2026-08-30/demo-urls-audit/` (91/91 call sites want it).

## The change
1. `ext/demo/app.js` — `urls` defaults to `false` (in-memory demo trees emit `data-demo-url`, not `href`).
2. `ext/demo/shell.js:86` — the one real-href mechanism (`page.demo()`, `scope: this.page`, 3 callers) gets an explicit `urls: true`.
3. The two sites that opted IN to `urls: false` today (homepage `public/page.js` stage(), ext/demo's own doc page) drop the now-redundant option — only if removal is a pure no-op.
4. One line in `ext/demo/readme.md` documenting the default + the opt-out.

## Verify
Headless (Playwright), sample 6 pages (one per audit SHAPE group, incl. a sample()-based one):
- zero `<a href>` dead links inside demo boxes
- left-click nav inside the demo still works
- Enter-key nav still works
- the 3 shell.js callers still emit REAL hrefs that resolve
- homepage unregressed (16 hrefs, 0 dead)
- zero console errors
